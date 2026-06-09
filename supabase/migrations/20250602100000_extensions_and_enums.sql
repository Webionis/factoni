-- FactureFlash Phase 1 — extensions & enums
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

CREATE TYPE public.invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

CREATE TYPE public.vat_regime AS ENUM (
  'standard',
  'franchise'
);

CREATE TYPE public.client_type AS ENUM (
  'individual',
  'company'
);
