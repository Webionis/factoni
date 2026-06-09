-- Relances facture par email (historique manuel, MVP bêta)
-- =============================================================================

CREATE TABLE public.invoice_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX invoice_reminders_invoice_id_sent_at_idx
  ON public.invoice_reminders (invoice_id, sent_at DESC);

CREATE INDEX invoice_reminders_user_id_idx
  ON public.invoice_reminders (user_id);

ALTER TABLE public.invoice_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_reminders_select_own"
  ON public.invoice_reminders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "invoice_reminders_insert_own"
  ON public.invoice_reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
