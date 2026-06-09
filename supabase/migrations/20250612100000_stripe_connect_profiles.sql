-- Stripe Connect Express — profils artisan + idempotence webhooks
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN stripe_account_id TEXT,
  ADD COLUMN stripe_onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN stripe_charges_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX profiles_stripe_account_id_unique_idx
  ON public.profiles (stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

CREATE TABLE public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX stripe_webhook_events_event_type_idx
  ON public.stripe_webhook_events (event_type);

CREATE UNIQUE INDEX notifications_invoice_paid_unique_idx
  ON public.notifications (user_id, type, ((data->>'invoice_id')))
  WHERE type = 'invoice_paid';
