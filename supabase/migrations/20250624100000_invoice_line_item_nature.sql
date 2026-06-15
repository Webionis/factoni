-- Nature de ligne (devis / facture) — classification comptable type Indy.

CREATE TYPE public.invoice_line_item_nature AS ENUM (
  'service',
  'merchandise',
  'finished_product',
  'artist_author',
  'disbursement'
);

ALTER TABLE public.invoice_lines
  ADD COLUMN item_nature public.invoice_line_item_nature NOT NULL DEFAULT 'service';

COMMENT ON COLUMN public.invoice_lines.item_nature IS
  'Nature de l''item : prestation, marchandise, produit fini, artiste-auteur ou frais de débours.';
