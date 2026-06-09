-- Notifications in-app (activité récente dashboard)
-- =============================================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_id_idx
  ON public.notifications (user_id);

CREATE INDEX notifications_user_id_created_at_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX notifications_user_id_read_at_idx
  ON public.notifications (user_id, read_at);

CREATE UNIQUE INDEX notifications_quote_signed_unique_idx
  ON public.notifications (user_id, type, ((data->>'quote_id')))
  WHERE type = 'quote_signed';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
