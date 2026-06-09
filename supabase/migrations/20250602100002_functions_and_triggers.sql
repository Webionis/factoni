-- FactureFlash Phase 1 — fonctions & triggers
-- =============================================================================

-- -----------------------------------------------------------------------------
-- updated_at générique
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER companies_set_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER invoices_set_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER invoice_lines_set_updated_at
  BEFORE UPDATE ON public.invoice_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Création automatique du profil à l'inscription
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Cohérence user_id ↔ company_id sur les factures
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_invoice_company_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_user_id UUID;
  v_client_user_id UUID;
BEGIN
  SELECT user_id INTO v_company_user_id
  FROM public.companies
  WHERE id = NEW.company_id;

  IF v_company_user_id IS NULL THEN
    RAISE EXCEPTION 'Company % not found', NEW.company_id;
  END IF;

  IF v_company_user_id <> NEW.user_id THEN
    RAISE EXCEPTION 'company_id does not belong to user_id';
  END IF;

  SELECT user_id INTO v_client_user_id
  FROM public.clients
  WHERE id = NEW.client_id;

  IF v_client_user_id IS NULL THEN
    RAISE EXCEPTION 'Client % not found', NEW.client_id;
  END IF;

  IF v_client_user_id <> NEW.user_id THEN
    RAISE EXCEPTION 'client_id does not belong to user_id';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER invoices_validate_company_owner
  BEFORE INSERT OR UPDATE OF user_id, company_id, client_id ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_invoice_company_owner();

-- -----------------------------------------------------------------------------
-- Numérotation légale : FF-YYYY-000001
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.next_invoice_number(p_company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_year INTEGER;
  v_next INTEGER;
BEGIN
  SELECT user_id INTO v_owner_id
  FROM public.companies
  WHERE id = p_company_id;

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Company not found';
  END IF;

  -- Contexte utilisateur (app) : propriété obligatoire
  -- Contexte système (seed / SQL admin) : auth.uid() peut être NULL
  IF auth.uid() IS NOT NULL AND v_owner_id <> auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to company';
  END IF;

  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;

  INSERT INTO public.invoice_sequences (company_id, year, last_number)
  VALUES (p_company_id, v_year, 1)
  ON CONFLICT (company_id, year)
  DO UPDATE SET last_number = public.invoice_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  RETURN 'FF-' || v_year::TEXT || '-' || lpad(v_next::TEXT, 6, '0');
END;
$$;

COMMENT ON FUNCTION public.next_invoice_number(UUID) IS
  'Incrémente le compteur annuel et retourne un numéro FF-YYYY-NNNNNN';

REVOKE ALL ON FUNCTION public.next_invoice_number(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_invoice_number(UUID) TO authenticated;

-- -----------------------------------------------------------------------------
-- Attribution automatique du numéro légal au passage draft → sent
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.assign_invoice_number_on_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Numéro définitif uniquement au statut sent (insert direct ou draft → sent)
  IF NEW.status = 'sent' AND NEW.invoice_number IS NULL THEN
    IF TG_OP = 'INSERT' OR OLD.status = 'draft' THEN
      NEW.invoice_number := public.next_invoice_number(NEW.company_id);
      NEW.sent_at := COALESCE(NEW.sent_at, now());
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Interdire la modification du numéro une fois attribué
    IF OLD.invoice_number IS NOT NULL
      AND NEW.invoice_number IS DISTINCT FROM OLD.invoice_number
    THEN
      RAISE EXCEPTION 'invoice_number is immutable once assigned';
    END IF;

    IF OLD.invoice_number IS NOT NULL AND NEW.invoice_number IS NULL THEN
      RAISE EXCEPTION 'invoice_number cannot be removed';
    END IF;

    -- Interdire retour en brouillon après envoi
    IF OLD.status <> 'draft' AND NEW.status = 'draft' THEN
      RAISE EXCEPTION 'Cannot revert invoice to draft after it has been sent';
    END IF;

    -- Horodatages de statut
    IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM 'paid' THEN
      NEW.paid_at := COALESCE(NEW.paid_at, now());
    END IF;

    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
      NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER invoices_assign_number_before_insert
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_invoice_number_on_sent();

CREATE TRIGGER invoices_assign_number_before_update
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_invoice_number_on_sent();

-- -----------------------------------------------------------------------------
-- Lignes : uniquement sur factures brouillon
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.validate_invoice_line_editable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_status public.invoice_status;
BEGIN
  SELECT status INTO v_status
  FROM public.invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  IF v_status <> 'draft' THEN
    RAISE EXCEPTION 'Invoice lines can only be modified when invoice is draft';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER invoice_lines_editable_only_on_draft
  BEFORE INSERT OR UPDATE OR DELETE ON public.invoice_lines
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_invoice_line_editable();
