-- Portail client public sécurisé par token
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS portal_token TEXT,
  ADD COLUMN IF NOT EXISTS portal_token_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS portal_access_enabled BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS clients_portal_token_uq
  ON public.clients (portal_token)
  WHERE portal_token IS NOT NULL;

COMMENT ON COLUMN public.clients.portal_token IS
  'Token URL-safe pour accès portail client /client/{token}';
COMMENT ON COLUMN public.clients.portal_access_enabled IS
  'Accès portail client actif pour ce client';

-- Backfill tokens pour clients existants
DO $$
DECLARE
  r RECORD;
  v_token TEXT;
  v_attempt INT;
BEGIN
  FOR r IN
    SELECT id FROM public.clients WHERE portal_token IS NULL
  LOOP
    v_attempt := 0;
    LOOP
      v_attempt := v_attempt + 1;
      IF v_attempt > 8 THEN
        EXIT;
      END IF;
      -- gen_random_uuid() : natif PG, sans dépendance au search_path pgcrypto
      v_token := replace(
        gen_random_uuid()::text || gen_random_uuid()::text,
        '-',
        ''
      );
      BEGIN
        UPDATE public.clients
        SET
          portal_token = v_token,
          portal_token_created_at = now()
        WHERE id = r.id AND portal_token IS NULL;
        EXIT;
      EXCEPTION
        WHEN unique_violation THEN
          CONTINUE;
      END;
    END LOOP;
  END LOOP;
END $$;
