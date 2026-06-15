-- Catalogue de prestations réutilisables (devis / factures).

CREATE TABLE public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  unit_price_ht NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (unit_price_ht >= 0),
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 20
    CHECK (vat_rate IN (0, 5.5, 10, 20)),
  item_nature public.invoice_line_item_nature NOT NULL DEFAULT 'service',
  sort_order integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX catalog_items_user_id_idx ON public.catalog_items(user_id);
CREATE INDEX catalog_items_user_id_active_idx
  ON public.catalog_items(user_id, sort_order)
  WHERE archived_at IS NULL;

CREATE TRIGGER catalog_items_set_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalog_items_select_own
  ON public.catalog_items
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY catalog_items_insert_own
  ON public.catalog_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY catalog_items_update_own
  ON public.catalog_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY catalog_items_delete_own
  ON public.catalog_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON TABLE public.catalog_items IS
  'Prestations enregistrées réutilisables sur devis et factures.';
