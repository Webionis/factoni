-- FactureFlash Phase 1 — tables principales
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles (1:1 avec auth.users)
-- -----------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Profil applicatif lié à auth.users';

-- -----------------------------------------------------------------------------
-- companies (1 par utilisateur au MVP)
-- -----------------------------------------------------------------------------

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  trade_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'FR',
  email TEXT NOT NULL,
  phone TEXT,
  siren TEXT CHECK (siren IS NULL OR siren ~ '^\d{9}$'),
  siret TEXT CHECK (siret IS NULL OR siret ~ '^\d{14}$'),
  vat_number TEXT,
  vat_regime public.vat_regime NOT NULL DEFAULT 'standard',
  default_vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 20
    CHECK (default_vat_rate IN (0, 5.5, 10, 20)),
  payment_terms TEXT,
  legal_mentions TEXT,
  logo_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT companies_one_per_user UNIQUE (user_id)
);

COMMENT ON TABLE public.companies IS 'Entreprise émettrice — une par utilisateur au MVP';

-- -----------------------------------------------------------------------------
-- clients
-- -----------------------------------------------------------------------------

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  client_type public.client_type NOT NULL DEFAULT 'individual',
  name TEXT NOT NULL,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'FR',
  siren TEXT CHECK (siren IS NULL OR siren ~ '^\d{9}$'),
  siret TEXT CHECK (siret IS NULL OR siret ~ '^\d{14}$'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT clients_company_name_when_company CHECK (
    client_type <> 'company' OR company_name IS NOT NULL
  )
);

COMMENT ON TABLE public.clients IS 'Clients du professionnel';

-- -----------------------------------------------------------------------------
-- invoice_sequences (numérotation par entreprise et par année)
-- -----------------------------------------------------------------------------

CREATE TABLE public.invoice_sequences (
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  last_number INTEGER NOT NULL DEFAULT 0 CHECK (last_number >= 0),
  PRIMARY KEY (company_id, year)
);

COMMENT ON TABLE public.invoice_sequences IS 'Compteur séquentiel pour numéros légaux FF-YYYY-NNNNNN';

-- -----------------------------------------------------------------------------
-- invoices
-- -----------------------------------------------------------------------------

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies (id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES public.clients (id) ON DELETE RESTRICT,
  -- Numéro légal : NULL en brouillon, attribué au passage à sent (trigger)
  invoice_number TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  -- Remise globale uniquement (MVP)
  discount_percent NUMERIC(5, 2) CHECK (
    discount_percent IS NULL
    OR (discount_percent >= 0 AND discount_percent <= 100)
  ),
  discount_amount NUMERIC(12, 2) CHECK (
    discount_amount IS NULL OR discount_amount >= 0
  ),
  total_ht NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_vat NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_ttc NUMERIC(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  payment_terms TEXT,
  -- Snapshots figés à l''envoi (immutabilité légale)
  client_snapshot JSONB,
  company_snapshot JSONB,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invoices_discount_exclusive CHECK (
    discount_percent IS NULL OR discount_amount IS NULL
  ),
  CONSTRAINT invoices_due_after_issue CHECK (due_date >= issue_date),
  CONSTRAINT invoices_draft_has_no_legal_number CHECK (
    status <> 'draft' OR invoice_number IS NULL
  ),
  CONSTRAINT invoices_non_draft_requires_legal_number CHECK (
    status = 'draft'
    OR status = 'cancelled'
    OR invoice_number IS NOT NULL
  ),
  CONSTRAINT invoices_totals_non_negative CHECK (
    total_ht >= 0 AND total_vat >= 0 AND total_ttc >= 0
  )
);

COMMENT ON TABLE public.invoices IS 'Factures — identifiant interne = id (UUID) en brouillon';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Numéro légal FF-YYYY-NNNNNN, attribué uniquement au statut sent';

-- Numéro unique par entreprise (émetteur)
CREATE UNIQUE INDEX invoices_company_invoice_number_unique
  ON public.invoices (company_id, invoice_number)
  WHERE invoice_number IS NOT NULL;

-- -----------------------------------------------------------------------------
-- invoice_lines
-- -----------------------------------------------------------------------------

CREATE TABLE public.invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices (id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  unit_price_ht NUMERIC(12, 2) NOT NULL CHECK (unit_price_ht >= 0),
  vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 20
    CHECK (vat_rate IN (0, 5.5, 10, 20)),
  line_total_ht NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_vat NUMERIC(12, 2) NOT NULL DEFAULT 0,
  line_total_ttc NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invoice_lines_amounts_non_negative CHECK (
    line_total_ht >= 0 AND line_vat >= 0 AND line_total_ttc >= 0
  )
);

COMMENT ON TABLE public.invoice_lines IS 'Lignes de prestations/produits';

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX profiles_email_idx ON public.profiles (email);

CREATE INDEX companies_user_id_idx ON public.companies (user_id);

CREATE INDEX clients_user_id_idx ON public.clients (user_id);
CREATE INDEX clients_user_id_name_idx ON public.clients (user_id, name);

CREATE INDEX invoices_user_id_idx ON public.invoices (user_id);
CREATE INDEX invoices_company_id_idx ON public.invoices (company_id);
CREATE INDEX invoices_client_id_idx ON public.invoices (client_id);
CREATE INDEX invoices_status_idx ON public.invoices (status);
CREATE INDEX invoices_user_status_idx ON public.invoices (user_id, status);
CREATE INDEX invoices_issue_date_idx ON public.invoices (user_id, issue_date DESC);

CREATE INDEX invoice_lines_invoice_id_idx ON public.invoice_lines (invoice_id);
CREATE INDEX invoice_lines_invoice_sort_idx ON public.invoice_lines (invoice_id, sort_order);
