-- Masquer une facture du dashboard et des stats sans supprimer la trace légale.
ALTER TABLE public.invoices
  ADD COLUMN archived_at TIMESTAMPTZ;

COMMENT ON COLUMN public.invoices.archived_at IS
  'Date d''archivage : la facture reste en base mais est exclue du dashboard et des agrégats CA.';

CREATE INDEX invoices_user_id_archived_at_idx
  ON public.invoices (user_id, archived_at);
