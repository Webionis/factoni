-- Relances automatiques intelligentes factures
-- =============================================================================

-- Préférences entreprise
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS auto_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_reminder_day_3 BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_reminder_day_7 BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_reminder_day_14 BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_email_subject TEXT,
  ADD COLUMN IF NOT EXISTS reminder_email_message TEXT;

-- Désactivation par facture
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS auto_reminders_disabled BOOLEAN NOT NULL DEFAULT false;

-- Type de relance (manuelle ou automatique J+3/J+7/J+14)
ALTER TABLE public.invoice_reminders
  ADD COLUMN IF NOT EXISTS reminder_type TEXT;

UPDATE public.invoice_reminders
SET reminder_type = 'manual'
WHERE reminder_type IS NULL;

ALTER TABLE public.invoice_reminders
  ALTER COLUMN reminder_type SET NOT NULL;

ALTER TABLE public.invoice_reminders
  DROP CONSTRAINT IF EXISTS invoice_reminders_reminder_type_check;

ALTER TABLE public.invoice_reminders
  ADD CONSTRAINT invoice_reminders_reminder_type_check
  CHECK (reminder_type IN ('manual', 'auto_3', 'auto_7', 'auto_14'));

ALTER TABLE public.invoice_reminders
  ADD COLUMN IF NOT EXISTS sent_by_name TEXT;

-- Anti-doublon : une seule relance auto par palier et par facture
CREATE UNIQUE INDEX IF NOT EXISTS invoice_reminders_auto_unique_idx
  ON public.invoice_reminders (invoice_id, reminder_type)
  WHERE reminder_type IN ('auto_3', 'auto_7', 'auto_14');

CREATE INDEX IF NOT EXISTS invoice_reminders_reminder_type_idx
  ON public.invoice_reminders (reminder_type);

-- Notifications relance (plusieurs par facture autorisées)
CREATE INDEX IF NOT EXISTS notifications_invoice_reminder_sent_idx
  ON public.notifications (user_id, created_at DESC)
  WHERE type = 'invoice_reminder_sent';
