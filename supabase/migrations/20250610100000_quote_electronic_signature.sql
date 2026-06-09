-- Factoni — signature électronique devis (MVP)

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS accepted_by_name TEXT,
  ADD COLUMN IF NOT EXISTS accepted_signature_url TEXT,
  ADD COLUMN IF NOT EXISTS accepted_ip TEXT,
  ADD COLUMN IF NOT EXISTS accepted_user_agent TEXT,
  ADD COLUMN IF NOT EXISTS signature_hash TEXT,
  ADD COLUMN IF NOT EXISTS acceptance_snapshot JSONB;

COMMENT ON COLUMN public.invoices.accepted_by_name IS
  'Nom du signataire client lors de l''acceptation du devis';
COMMENT ON COLUMN public.invoices.accepted_signature_url IS
  'Chemin Storage de l''image signature (bucket signatures)';
COMMENT ON COLUMN public.invoices.accepted_ip IS
  'Adresse IP du signataire à l''acceptation';
COMMENT ON COLUMN public.invoices.accepted_user_agent IS
  'User-Agent du navigateur du signataire';
COMMENT ON COLUMN public.invoices.signature_hash IS
  'Empreinte SHA-256 de la preuve d''acceptation';
COMMENT ON COLUMN public.invoices.acceptance_snapshot IS
  'Snapshot montants et métadonnées au moment de l''acceptation';

-- Bucket Storage signatures (privé)
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'signatures',
  'signatures',
  false,
  1048576,
  ARRAY['image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lecture signatures : propriétaire du devis via chemin {quoteId}/...
CREATE POLICY "signatures_select_own_quote"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'signatures'
    AND EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id::text = (storage.foldername(name))[1]
        AND i.user_id = auth.uid()
    )
  );

-- Signature devis via token public (RPC SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.sign_quote_by_public_token(
  p_token TEXT,
  p_signer_name TEXT,
  p_signature_path TEXT,
  p_ip TEXT,
  p_user_agent TEXT,
  p_signature_hash TEXT,
  p_acceptance_snapshot JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_doc public.invoices;
BEGIN
  IF p_token IS NULL OR length(trim(p_token)) < 16 THEN
    RETURN FALSE;
  END IF;

  IF p_signer_name IS NULL OR length(trim(p_signer_name)) < 2 THEN
    RETURN FALSE;
  END IF;

  IF p_signature_path IS NULL OR length(trim(p_signature_path)) < 8 THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO v_doc
  FROM public.invoices
  WHERE public_document_token = trim(p_token)
    AND document_type = 'quote'
    AND public_access_enabled = true
    AND archived_at IS NULL
    AND converted_to_invoice_id IS NULL
    AND status IN ('sent', 'viewed')
    AND due_date >= CURRENT_DATE
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.invoices
  SET
    status = 'accepted',
    accepted_at = now(),
    accepted_by_name = trim(p_signer_name),
    accepted_signature_url = trim(p_signature_path),
    accepted_ip = NULLIF(trim(p_ip), ''),
    accepted_user_agent = NULLIF(trim(p_user_agent), ''),
    signature_hash = NULLIF(trim(p_signature_hash), ''),
    acceptance_snapshot = p_acceptance_snapshot,
    updated_at = now()
  WHERE id = v_doc.id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sign_quote_by_public_token(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO anon, authenticated;

-- Verrouillage contenu après acceptation (sauf conversion facture)
CREATE OR REPLACE FUNCTION public.prevent_accepted_quote_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.document_type = 'quote' AND OLD.status = 'accepted' THEN
    IF NEW.converted_to_invoice_id IS DISTINCT FROM OLD.converted_to_invoice_id
       AND NEW.converted_to_invoice_id IS NOT NULL
       AND NEW.status = OLD.status
       AND NEW.total_ht = OLD.total_ht
       AND NEW.total_ttc = OLD.total_ttc
       AND NEW.total_vat = OLD.total_vat
       AND NEW.client_snapshot IS NOT DISTINCT FROM OLD.client_snapshot
       AND NEW.company_snapshot IS NOT DISTINCT FROM OLD.company_snapshot
    THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'accepted_quote_locked';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS invoices_prevent_accepted_quote_modification ON public.invoices;

CREATE TRIGGER invoices_prevent_accepted_quote_modification
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_accepted_quote_modification();
