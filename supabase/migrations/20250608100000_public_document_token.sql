-- Factoni — liens publics sécurisés pour devis / factures (/d/{token})

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS public_document_token TEXT,
  ADD COLUMN IF NOT EXISTS public_document_token_created_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS invoices_public_document_token_uq
  ON public.invoices (public_document_token)
  WHERE public_document_token IS NOT NULL;

COMMENT ON COLUMN public.invoices.public_document_token IS
  'Token opaque pour consultation publique via /d/{token}';

-- Lecture document public (anon + authenticated) — SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION public.get_public_document_by_token(TEXT) TO anon, authenticated;

-- Acceptation devis via lien public
CREATE OR REPLACE FUNCTION public.accept_quote_by_public_token(p_token TEXT)
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

  SELECT * INTO v_doc
  FROM public.invoices
  WHERE public_document_token = trim(p_token)
    AND document_type = 'quote'
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
    updated_at = now()
  WHERE id = v_doc.id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_quote_by_public_token(TEXT) TO anon, authenticated;

-- Marquer devis comme consulté (première visite publique)
CREATE OR REPLACE FUNCTION public.mark_quote_viewed_by_public_token(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id
  FROM public.invoices
  WHERE public_document_token = trim(p_token)
    AND document_type = 'quote'
    AND status = 'sent'
    AND archived_at IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.invoices
  SET status = 'viewed', updated_at = now()
  WHERE id = v_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_quote_viewed_by_public_token(TEXT) TO anon, authenticated;
