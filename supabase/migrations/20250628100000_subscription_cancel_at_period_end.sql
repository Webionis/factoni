-- Résiliation en fin de période (sync Stripe cancel_at_period_end)
-- =============================================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS
  'true si l''abonnement est résilié mais reste actif jusqu''à current_period_end.';
