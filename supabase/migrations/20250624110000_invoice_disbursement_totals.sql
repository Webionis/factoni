-- Totaux de frais de débours (hors CA imposable) sur les documents.

ALTER TABLE public.invoices
  ADD COLUMN disbursement_total_ht NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (disbursement_total_ht >= 0),
  ADD COLUMN disbursement_total_ttc NUMERIC(12, 2) NOT NULL DEFAULT 0
    CHECK (disbursement_total_ttc >= 0);

COMMENT ON COLUMN public.invoices.disbursement_total_ht IS
  'Somme HT des lignes « frais de débours » (hors chiffre d''affaires imposable).';
COMMENT ON COLUMN public.invoices.disbursement_total_ttc IS
  'Somme TTC des frais de débours refacturés au client.';
