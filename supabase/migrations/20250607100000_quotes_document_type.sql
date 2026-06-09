-- Factoni — Devis (quotes) : document_type, statuts, numérotation DV-YYYY-NNNNNN
-- =============================================================================

CREATE TYPE public.document_type AS ENUM ('invoice', 'quote');

ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'expired';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'viewed';

ALTER TABLE public.invoices
  ADD COLUMN document_type public.document_type NOT NULL DEFAULT 'invoice',
  ADD COLUMN source_quote_id UUID REFERENCES public.invoices (id) ON DELETE SET NULL,
  ADD COLUMN converted_to_invoice_id UUID REFERENCES public.invoices (id) ON DELETE SET NULL,
  ADD COLUMN accepted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.invoices.document_type IS 'invoice = facture, quote = devis';
COMMENT ON COLUMN public.invoices.source_quote_id IS 'Facture créée depuis ce devis';
COMMENT ON COLUMN public.invoices.converted_to_invoice_id IS 'Facture générée depuis ce devis (côté devis)';
COMMENT ON COLUMN public.invoices.due_date IS 'Échéance facture ou date de validité devis';

CREATE INDEX invoices_document_type_idx ON public.invoices (user_id, document_type);
CREATE INDEX invoices_source_quote_id_idx ON public.invoices (source_quote_id)
  WHERE source_quote_id IS NOT NULL;
CREATE INDEX invoices_converted_to_invoice_id_idx ON public.invoices (converted_to_invoice_id)
  WHERE converted_to_invoice_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Séquence devis DV-YYYY-NNNNNN
-- -----------------------------------------------------------------------------

CREATE TABLE public.quote_sequences (
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  last_number INTEGER NOT NULL DEFAULT 0 CHECK (last_number >= 0),
  PRIMARY KEY (company_id, year)
);

COMMENT ON TABLE public.quote_sequences IS 'Compteur séquentiel pour numéros devis DV-YYYY-NNNNNN';

CREATE OR REPLACE FUNCTION public.next_quote_number(p_company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_year INTEGER;
  v_next INTEGER;
BEGIN
  SELECT user_id INTO v_owner_id
  FROM public.companies
  WHERE id = p_company_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  IF auth.uid() IS NOT NULL AND v_owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to company';
  END IF;

  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  INSERT INTO public.quote_sequences (company_id, year, last_number)
  VALUES (p_company_id, v_year, 1)
  ON CONFLICT (company_id, year)
  DO UPDATE SET last_number = public.quote_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  RETURN 'DV-' || v_year::TEXT || '-' || lpad(v_next::TEXT, 6, '0');
END;
$$;

REVOKE ALL ON FUNCTION public.next_quote_number(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_quote_number(UUID) TO authenticated;

-- -----------------------------------------------------------------------------
-- Numérotation : FF pour factures, DV pour devis
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.assign_invoice_number_on_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'sent' AND NEW.invoice_number IS NULL THEN
    IF TG_OP = 'INSERT' OR OLD.status = 'draft' THEN
      IF NEW.document_type = 'quote' THEN
        NEW.invoice_number := public.next_quote_number(NEW.company_id);
      ELSE
        NEW.invoice_number := public.next_invoice_number(NEW.company_id);
      END IF;
      NEW.sent_at := COALESCE(NEW.sent_at, now());
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.invoice_number IS NOT NULL
      AND NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
    THEN
      RAISE EXCEPTION 'invoice_number is immutable once assigned';
    END IF;

    IF OLD.invoice_number IS NOT NULL AND NEW.invoice_number IS NULL THEN
      RAISE EXCEPTION 'invoice_number cannot be removed';
    END IF;

    IF OLD.status <> 'draft' AND NEW.status = 'draft' THEN
      RAISE EXCEPTION 'Cannot revert document to draft after it has been sent';
    END IF;

    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
      NEW.paid_at := COALESCE(NEW.paid_at, now());
    END IF;

    IF NEW.status = 'accepted' AND OLD.status IS DISTINCT FROM 'accepted' THEN
      NEW.accepted_at := COALESCE(NEW.accepted_at, now());
    END IF;

    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
      NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- RLS quote_sequences
-- -----------------------------------------------------------------------------

ALTER TABLE public.quote_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY quote_sequences_select_own ON public.quote_sequences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = quote_sequences.company_id
        AND c.user_id = auth.uid()
    )
  );

GRANT SELECT ON public.quote_sequences TO authenticated;
