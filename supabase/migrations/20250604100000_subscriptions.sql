-- FactureFlash — abonnements SaaS (fondations, bêta gratuite)
-- =============================================================================

CREATE TYPE public.subscription_plan AS ENUM (
  'beta',
  'free',
  'starter',
  'pro'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active',
  'cancelled',
  'past_due',
  'trialing'
);

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL DEFAULT 'beta',
  status public.subscription_status NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_one_per_user UNIQUE (user_id),
  CONSTRAINT subscriptions_stripe_customer_id_unique UNIQUE (stripe_customer_id),
  CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id)
);

COMMENT ON TABLE public.subscriptions IS
  'Abonnement utilisateur — bêta : plan beta, tout débloqué, sans Stripe';

CREATE INDEX subscriptions_user_id_idx ON public.subscriptions (user_id);
CREATE INDEX subscriptions_plan_status_idx ON public.subscriptions (plan, status);

CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Profil + abonnement bêta à l'inscription
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

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'beta', 'active');

  RETURN NEW;
END;
$$;

-- Comptes existants avant migration
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT u.id, 'beta', 'active'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = u.id
);

-- -----------------------------------------------------------------------------
-- RLS — lecture seule côté app (mises à jour via webhooks Stripe / service role)
-- -----------------------------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
