-- Coordonnées bancaires (RIB) — affichage optionnel sur devis / factures PDF

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_iban TEXT,
  ADD COLUMN IF NOT EXISTS bank_bic TEXT,
  ADD COLUMN IF NOT EXISTS bank_show_on_invoices BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS bank_show_on_quotes BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.companies.bank_iban IS
  'IBAN affiché sur les PDF si renseigné et option activée.';
COMMENT ON COLUMN public.companies.bank_show_on_invoices IS
  'Afficher le RIB sur les factures PDF (si IBAN renseigné).';
COMMENT ON COLUMN public.companies.bank_show_on_quotes IS
  'Afficher le RIB sur les devis PDF (si IBAN renseigné).';
