-- Factoni — public_access_enabled + RPC ensure_public_document_token

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS public_access_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.invoices.public_access_enabled IS
  'Accès public actif via /d/{token}';

UPDATE public.invoices
SET public_access_enabled = true
WHERE public_document_token IS NOT NULL
  AND public_access_enabled = false;

CREATE OR REPLACE FUNCTION public.ensure_public_document_token(p_document_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_token TEXT;
  v_attempt INT := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT public_document_token INTO v_token
  FROM public.invoices
  WHERE id = p_document_id
    AND user_id = v_user_id
    AND archived_at IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'document_not_found';
  END IF;

  IF v_token IS NOT NULL AND length(trim(v_token)) >= 16 THEN
    IF NOT public_access_enabled THEN
      UPDATE public.invoices
      SET public_access_enabled = true, updated_at = now()
      WHERE id = p_document_id AND user_id = v_user_id;
    END IF;
    RETURN v_token;
  END IF;

  LOOP
    v_attempt := v_attempt + 1;
    IF v_attempt > 5 THEN
      RAISE EXCEPTION 'token_generation_failed';
    END IF;

    v_token := translate(encode(gen_random_bytes(24), 'base64'), '+/', '-_');
    v_token := replace(v_token, '=', '');

    BEGIN
      UPDATE public.invoices
      SET
        public_document_token = v_token,
        public_document_token_created_at = now(),
        public_access_enabled = true,
        updated_at = now()
      WHERE id = p_document_id
        AND user_id = v_user_id
      RETURNING public_document_token INTO v_token;

      RETURN v_token;
    EXCEPTION
      WHEN unique_violation THEN
        CONTINUE;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_public_document_token(UUID) TO authenticated;

-- Respecte public_access_enabled pour la consultation publique
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
