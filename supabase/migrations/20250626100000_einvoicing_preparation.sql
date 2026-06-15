-- Préparation transmission Plateforme Agréée (réforme 2026–2027).

CREATE TYPE public.einvoicing_transmission_status AS ENUM (
  'pending',
  'submitted',
  'accepted',
  'rejected',
  'failed'
);

CREATE TABLE public.company_einvoicing_settings (
  company_id uuid PRIMARY KEY REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug text,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER company_einvoicing_settings_set_updated_at
  BEFORE UPDATE ON public.company_einvoicing_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.company_einvoicing_settings IS
  'Configuration future de la Plateforme Agréée par entreprise.';

CREATE TABLE public.invoice_einvoicing_transmissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.einvoicing_transmission_status NOT NULL DEFAULT 'pending',
  provider_slug text,
  external_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invoice_einvoicing_transmissions_invoice_id_idx
  ON public.invoice_einvoicing_transmissions(invoice_id, created_at DESC);

CREATE TRIGGER invoice_einvoicing_transmissions_set_updated_at
  BEFORE UPDATE ON public.invoice_einvoicing_transmissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.invoice_einvoicing_transmissions IS
  'Historique des tentatives de transmission vers une Plateforme Agréée.';

ALTER TABLE public.company_einvoicing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_einvoicing_transmissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_einvoicing_settings_select_own
  ON public.company_einvoicing_settings
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY company_einvoicing_settings_insert_own
  ON public.company_einvoicing_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY company_einvoicing_settings_update_own
  ON public.company_einvoicing_settings
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

CREATE POLICY invoice_einvoicing_transmissions_select_own
  ON public.invoice_einvoicing_transmissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY invoice_einvoicing_transmissions_insert_own
  ON public.invoice_einvoicing_transmissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY invoice_einvoicing_transmissions_update_own
  ON public.invoice_einvoicing_transmissions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
