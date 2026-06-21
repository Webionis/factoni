-- Lancement commercial : nouveaux comptes en offre gratuite (gating Starter/Pro).
-- Les comptes existants en plan « beta » conservent l'accès fondateur.

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

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Crée profil + abonnement free à l''inscription (beta réservé aux comptes fondateurs existants).';

ALTER TABLE public.subscriptions
  ALTER COLUMN plan SET DEFAULT 'free';

COMMENT ON TABLE public.subscriptions IS
  'Abonnement utilisateur — free par défaut ; beta = fondateurs ; starter/pro via Stripe Billing.';
