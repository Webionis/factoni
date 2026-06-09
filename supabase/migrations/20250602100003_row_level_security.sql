-- FactureFlash Phase 1 — Row Level Security
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------

CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- -----------------------------------------------------------------------------
-- companies
-- -----------------------------------------------------------------------------

CREATE POLICY "companies_select_own"
  ON public.companies
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "companies_insert_own"
  ON public.companies
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "companies_update_own"
  ON public.companies
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "companies_delete_own"
  ON public.companies
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

CREATE POLICY "clients_select_own"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "clients_insert_own"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_update_own"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_delete_own"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- invoices
-- -----------------------------------------------------------------------------

CREATE POLICY "invoices_select_own"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "invoices_insert_own"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_update_own"
  ON public.invoices
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_delete_draft_only"
  ON public.invoices
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'draft');

-- -----------------------------------------------------------------------------
-- invoice_lines (via facture parente)
-- -----------------------------------------------------------------------------

CREATE POLICY "invoice_lines_select_own"
  ON public.invoice_lines
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_id AND i.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_lines_insert_own"
  ON public.invoice_lines
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_id
        AND i.user_id = auth.uid()
        AND i.status = 'draft'
    )
  );

CREATE POLICY "invoice_lines_update_own"
  ON public.invoice_lines
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_id
        AND i.user_id = auth.uid()
        AND i.status = 'draft'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_id
        AND i.user_id = auth.uid()
        AND i.status = 'draft'
    )
  );

CREATE POLICY "invoice_lines_delete_own"
  ON public.invoice_lines
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.invoices i
      WHERE i.id = invoice_id
        AND i.user_id = auth.uid()
        AND i.status = 'draft'
    )
  );

-- -----------------------------------------------------------------------------
-- invoice_sequences (lecture seule ; écriture via next_invoice_number SECURITY DEFINER)
-- -----------------------------------------------------------------------------

CREATE POLICY "invoice_sequences_select_own"
  ON public.invoice_sequences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.companies c
      WHERE c.id = company_id AND c.user_id = auth.uid()
    )
  );

-- Pas de INSERT/UPDATE/DELETE direct pour authenticated

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_lines TO authenticated;
GRANT SELECT ON public.invoice_sequences TO authenticated;

GRANT USAGE ON TYPE public.invoice_status TO authenticated;
GRANT USAGE ON TYPE public.vat_regime TO authenticated;
GRANT USAGE ON TYPE public.client_type TO authenticated;
