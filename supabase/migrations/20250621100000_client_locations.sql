-- Lieux d'intervention par client + lien avec devis/factures
-- =============================================================================

CREATE TABLE public.client_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  label text NOT NULL,
  address_line1 text,
  address_line2 text,
  postal_code text,
  city text,
  country text NOT NULL DEFAULT 'France',
  notes text,
  is_default boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX client_locations_user_id_idx ON public.client_locations(user_id);
CREATE INDEX client_locations_client_id_idx ON public.client_locations(client_id);
CREATE INDEX client_locations_client_id_is_default_idx
  ON public.client_locations(client_id, is_default)
  WHERE is_default = true AND archived_at IS NULL;

CREATE TRIGGER client_locations_set_updated_at
  BEFORE UPDATE ON public.client_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.enforce_single_default_client_location()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default = true AND NEW.archived_at IS NULL THEN
    UPDATE public.client_locations
    SET is_default = false, updated_at = now()
    WHERE client_id = NEW.client_id
      AND id <> NEW.id
      AND is_default = true
      AND archived_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER client_locations_single_default
  BEFORE INSERT OR UPDATE OF is_default, archived_at ON public.client_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_default_client_location();

ALTER TABLE public.client_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_locations_select_own
  ON public.client_locations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY client_locations_insert_own
  ON public.client_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY client_locations_update_own
  ON public.client_locations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY client_locations_delete_own
  ON public.client_locations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS client_location_id uuid
    REFERENCES public.client_locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS client_location_snapshot jsonb;

CREATE INDEX invoices_client_location_id_idx
  ON public.invoices(client_location_id)
  WHERE client_location_id IS NOT NULL;
