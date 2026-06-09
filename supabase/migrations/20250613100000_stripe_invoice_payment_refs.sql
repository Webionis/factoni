-- Références Stripe sur factures payées en ligne
-- =============================================================================

ALTER TABLE public.invoices
  ADD COLUMN stripe_payment_intent_id TEXT,
  ADD COLUMN stripe_checkout_session_id TEXT;

CREATE INDEX invoices_stripe_checkout_session_id_idx
  ON public.invoices (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;
