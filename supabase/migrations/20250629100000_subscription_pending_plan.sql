-- Rétrogradation planifiée (ex. Pro → Starter en fin de période)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS pending_plan public.subscription_plan,
  ADD COLUMN IF NOT EXISTS pending_plan_effective_at TIMESTAMPTZ;

COMMENT ON COLUMN public.subscriptions.pending_plan IS
  'Offre vers laquelle l''abonnement basculera à pending_plan_effective_at.';
COMMENT ON COLUMN public.subscriptions.pending_plan_effective_at IS
  'Date effective du changement d''offre programmé (généralement current_period_end).';
