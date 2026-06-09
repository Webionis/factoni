-- Corrige les factures issues d'un devis mal typées + numérotation DV pour les devis

-- Les factures créées depuis un devis doivent rester document_type = invoice
UPDATE public.invoices
SET document_type = 'invoice'
WHERE source_quote_id IS NOT NULL
  AND document_type IS DISTINCT FROM 'invoice';

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
  ELSIF NEW.document_type = 'quote' THEN
    IF NEW.status IN ('ready', 'sent') AND NEW.invoice_number IS NULL THEN
      IF TG_OP = 'INSERT' OR OLD.status = 'draft' THEN
        NEW.invoice_number := public.next_quote_number(NEW.company_id);
      END IF;
    END IF;

    IF NEW.status = 'sent'
      AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'sent')
    THEN
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

    IF NEW.document_type = 'invoice'
      AND NEW.status = 'draft'
      AND OLD.status NOT IN ('draft', 'ready')
    THEN
      RAISE EXCEPTION 'Cannot revert invoice to draft after it has been sent';
    END IF;

    IF NEW.document_type = 'quote'
      AND NEW.status = 'draft'
      AND OLD.status NOT IN ('draft', 'ready')
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
