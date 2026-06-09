-- Modèle de relance utilisé à l'envoi
-- =============================================================================

ALTER TABLE public.invoice_reminders
  ADD COLUMN IF NOT EXISTS template_id TEXT;

ALTER TABLE public.invoice_reminders
  ADD CONSTRAINT invoice_reminders_template_id_check
  CHECK (
    template_id IS NULL
    OR template_id IN (
      'unpaid_invoice',
      'quote_expiring',
      'quote_expired',
      'quote_validation_reminder'
    )
  );
