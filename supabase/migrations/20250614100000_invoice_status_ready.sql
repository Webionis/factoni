-- Statut intermédiaire « ready » — facture validée, prête à envoyer
-- =============================================================================

ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'ready' BEFORE 'sent';

-- Numéro légal à la validation (ready), sent_at à l'envoi réel (sent)
CREATE OR REPLACE FUNCTION public.assign_invoice_number_on_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.document_type = 'invoice' THEN
    IF NEW.status IN ('ready', 'sent') AND NEW.invoice_number IS NULL THEN
      IF TG_OP = 'INSERT' OR OLD.status = 'draft' THEN
        NEW.invoice_number := public.next_invoice_number(NEW.company_id);
      END IF;
    END IF;

    IF NEW.status = 'sent'
      AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'sent')
    THEN
      NEW.sent_at := COALESCE(NEW.sent_at, now());
    END IF;
  ELSE
    -- Devis : comportement inchangé (numéro au passage sent)
    IF NEW.status = 'sent' AND NEW.invoice_number IS NULL THEN
      IF TG_OP = 'INSERT' OR OLD.status = 'draft' THEN
        NEW.invoice_number := public.next_invoice_number(NEW.company_id);
        NEW.sent_at := COALESCE(NEW.sent_at, now());
      END IF;
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

    -- Brouillon autorisé depuis ready uniquement (factures)
    IF NEW.document_type = 'invoice'
      AND NEW.status = 'draft'
      AND OLD.status NOT IN ('draft', 'ready')
    THEN
      RAISE EXCEPTION 'Cannot revert invoice to draft after it has been sent';
    END IF;

    IF NEW.document_type = 'quote'
      AND OLD.status <> 'draft'
      AND NEW.status = 'draft'
    THEN
      RAISE EXCEPTION 'Cannot revert quote to draft after it has been sent';
    END IF;

    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
      NEW.paid_at := COALESCE(NEW.paid_at, now());
    END IF;

    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
      NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Consultation publique : ready (aperçu), sent, paid — jamais draft
CREATE OR REPLACE FUNCTION public.get_public_document_by_token(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc public.invoices;
  v_lines JSON;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) < 16 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_doc
  FROM public.invoices
  WHERE public_document_token = trim(p_token)
    AND public_access_enabled = true
    AND archived_at IS NULL
    AND status NOT IN ('draft', 'cancelled')
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(
    json_agg(row_to_json(l) ORDER BY l.sort_order),
    '[]'::json
  )
  INTO v_lines
  FROM public.invoice_lines l
  WHERE l.invoice_id = v_doc.id;

  RETURN json_build_object(
    'document', row_to_json(v_doc),
    'lines', v_lines
  );
END;
$$;
