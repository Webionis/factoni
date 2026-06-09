-- FactureFlash — seed développement
-- =============================================================================
-- Ce fichier s'exécute sur `supabase db reset` (local) uniquement.
--
-- PRÉREQUIS : un utilisateur doit exister dans auth.users (inscription via l'app
-- ou Supabase Studio → Authentication → Add user).
--
-- ÉTAPE 1 : récupérer l'UUID utilisateur
--   SELECT id, email FROM auth.users;
--
-- ÉTAPE 2 : remplacer la variable ci-dessous puis exécuter ce script
--   (ou décommenter le bloc en bas de ce fichier)

-- =============================================================================
-- Fonction utilitaire de seed (idempotent pour un user_id donné)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.seed_dev_data(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_client_id UUID;
  v_invoice_draft_id UUID;
  v_invoice_sent_id UUID;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'p_user_id is required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User % does not exist in auth.users', p_user_id;
  END IF;

  -- Profil (créé normalement par handle_new_user ; upsert au cas où)
  INSERT INTO public.profiles (id, email, full_name, onboarding_completed)
  SELECT id, email, 'Compte démo', TRUE
  FROM auth.users
  WHERE id = p_user_id
  ON CONFLICT (id) DO UPDATE SET
    onboarding_completed = EXCLUDED.onboarding_completed,
    full_name = EXCLUDED.full_name;

  -- Entreprise
  INSERT INTO public.companies (
    user_id,
    trade_name,
    legal_name,
    address_line1,
    postal_code,
    city,
    email,
    phone,
    siren,
    siret,
    vat_regime,
    default_vat_rate,
    payment_terms
  )
  VALUES (
    p_user_id,
    'Électricité Martin',
    'Martin Jean EI',
    '12 rue des Artisans',
    '75011',
    'Paris',
    'contact@elec-martin.fr',
    '06 12 34 56 78',
    '123456789',
    '12345678901234',
    'standard',
    20,
    'Paiement à 30 jours fin de mois'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    trade_name = EXCLUDED.trade_name,
    updated_at = now()
  RETURNING id INTO v_company_id;

  IF v_company_id IS NULL THEN
    SELECT id INTO v_company_id FROM public.companies WHERE user_id = p_user_id;
  END IF;

  -- Client professionnel
  SELECT id INTO v_client_id
  FROM public.clients
  WHERE user_id = p_user_id AND company_name = 'Leroy Rénovation SAS'
  LIMIT 1;

  IF v_client_id IS NULL THEN
    INSERT INTO public.clients (
      user_id,
      client_type,
      name,
      company_name,
      email,
      address_line1,
      postal_code,
      city,
      siren,
      siret
    )
    VALUES (
      p_user_id,
      'company',
      'Sophie Leroy',
      'Leroy Rénovation SAS',
      'facturation@leroy-renovation.fr',
      '8 avenue de la Gare',
      '69002',
      'Lyon',
      '987654321',
      '98765432100011'
    )
    RETURNING id INTO v_client_id;
  END IF;

  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Client seed insert failed';
  END IF;

  -- Facture brouillon (pas de numéro légal)
  INSERT INTO public.invoices (
    user_id,
    company_id,
    client_id,
    issue_date,
    due_date,
    status,
    total_ht,
    total_vat,
    total_ttc,
    notes
  )
  SELECT
    p_user_id,
    v_company_id,
    v_client_id,
    CURRENT_DATE,
    CURRENT_DATE + 30,
    'draft',
    500,
    100,
    600,
    'Intervention tableau électrique — brouillon'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.invoices
    WHERE user_id = p_user_id
      AND status = 'draft'
      AND notes = 'Intervention tableau électrique — brouillon'
  )
  RETURNING id INTO v_invoice_draft_id;

  IF v_invoice_draft_id IS NOT NULL THEN
    INSERT INTO public.invoice_lines (
      invoice_id,
      sort_order,
      description,
      quantity,
      unit_price_ht,
      vat_rate,
      line_total_ht,
      line_vat,
      line_total_ttc
    ) VALUES (
      v_invoice_draft_id,
      0,
      'Mise aux normes tableau électrique',
      1,
      500,
      20,
      500,
      100,
      600
    );
  END IF;

  -- Facture envoyée (numéro FF-YYYY-NNNNNN attribué par trigger BEFORE INSERT)
  INSERT INTO public.invoices (
    user_id,
    company_id,
    client_id,
    issue_date,
    due_date,
    status,
    total_ht,
    total_vat,
    total_ttc,
    notes,
    client_snapshot,
    company_snapshot
  )
  SELECT
    p_user_id,
    v_company_id,
    v_client_id,
    CURRENT_DATE - 7,
    CURRENT_DATE + 23,
    'sent',
    200,
    40,
    240,
    'Dépannage urgent — envoyée',
    jsonb_build_object('name', 'Sophie Leroy', 'company_name', 'Leroy Rénovation SAS'),
    jsonb_build_object('trade_name', 'Électricité Martin', 'legal_name', 'Martin Jean EI')
  WHERE NOT EXISTS (
    SELECT 1 FROM public.invoices
    WHERE user_id = p_user_id
      AND notes = 'Dépannage urgent — envoyée'
  )
  RETURNING id INTO v_invoice_sent_id;

  RAISE NOTICE 'Seed OK for user % — company %', p_user_id, v_company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_dev_data(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_dev_data(UUID) TO authenticated;

-- =============================================================================
-- Exécution automatique : UNIQUEMENT si la variable de session est définie
-- (évite erreur sur reset sans utilisateur)
--
-- Dans le SQL Editor Supabase, après création d'un compte :
--   SELECT public.seed_dev_data('VOTRE-UUID-ICI');
-- =============================================================================

-- Décommenter et remplacer l'UUID pour seed automatique au db reset :
-- SELECT public.seed_dev_data('00000000-0000-0000-0000-000000000000');
