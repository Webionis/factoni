-- Corrige la référence à public_access_enabled dans ensure_public_document_token

CREATE OR REPLACE FUNCTION public.ensure_public_document_token(p_document_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_token TEXT;
  v_access_enabled BOOLEAN;
  v_attempt INT := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT public_document_token, public_access_enabled
  INTO v_token, v_access_enabled
  FROM public.invoices
  WHERE id = p_document_id
    AND user_id = v_user_id
    AND archived_at IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'document_not_found';
  END IF;

  IF v_token IS NOT NULL AND length(trim(v_token)) >= 16 THEN
    IF NOT v_access_enabled THEN
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
