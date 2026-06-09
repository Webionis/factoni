-- Renumérote les devis (document_type = quote) ayant reçu un numéro FF- par erreur
-- (trigger assign_invoice_number_on_sent utilisait next_invoice_number avant correction).

CREATE OR REPLACE FUNCTION public.repair_misnumbered_quotes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  v_new_number TEXT;
  v_count INTEGER := 0;
BEGIN
  ALTER TABLE public.invoices DISABLE TRIGGER invoices_assign_number_before_update;
  ALTER TABLE public.invoices DISABLE TRIGGER invoices_prevent_accepted_quote_modification;

  FOR r IN
    SELECT id, company_id
    FROM public.invoices
    WHERE document_type = 'quote'
      AND invoice_number LIKE 'FF-%'
    ORDER BY created_at
  LOOP
    v_new_number := public.next_quote_number(r.company_id);
    UPDATE public.invoices
    SET invoice_number = v_new_number
    WHERE id = r.id;
    v_count := v_count + 1;
  END LOOP;

  ALTER TABLE public.invoices ENABLE TRIGGER invoices_assign_number_before_update;
  ALTER TABLE public.invoices ENABLE TRIGGER invoices_prevent_accepted_quote_modification;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.repair_misnumbered_quotes() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.repair_misnumbered_quotes() TO service_role;

SELECT public.repair_misnumbered_quotes() AS repaired_quotes;

DROP FUNCTION public.repair_misnumbered_quotes();
