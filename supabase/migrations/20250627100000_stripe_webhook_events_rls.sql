-- Sécurité : RLS sur stripe_webhook_events (idempotence webhooks Stripe)
-- Accès réservé au service role côté serveur — pas d'accès anon/authenticated.
-- =============================================================================

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.stripe_webhook_events FROM anon, authenticated;
