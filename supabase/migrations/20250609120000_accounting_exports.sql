-- Module exports comptables — historique + planification mensuelle
-- =============================================================================

CREATE TABLE public.export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('invoices', 'clients', 'quotes', 'journal')),
  format TEXT NOT NULL CHECK (format IN ('csv', 'xlsx', 'pdf')),
  label TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  row_count INTEGER NOT NULL DEFAULT 0,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX export_history_user_id_created_at_idx
  ON public.export_history (user_id, created_at DESC);

ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY export_history_select_own ON public.export_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY export_history_insert_own ON public.export_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY export_history_delete_own ON public.export_history
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Planification export automatique (premium / future-proof)
CREATE TABLE public.export_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly')),
  format TEXT NOT NULL DEFAULT 'xlsx' CHECK (format IN ('csv', 'xlsx', 'pdf')),
  recipient_email TEXT NOT NULL,
  export_type TEXT NOT NULL DEFAULT 'invoices' CHECK (export_type IN ('invoices', 'journal')),
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX export_schedules_user_id_unique_idx
  ON public.export_schedules (user_id);

ALTER TABLE public.export_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY export_schedules_select_own ON public.export_schedules
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY export_schedules_insert_own ON public.export_schedules
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY export_schedules_update_own ON public.export_schedules
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
