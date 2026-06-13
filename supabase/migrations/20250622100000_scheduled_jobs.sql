-- Agenda chantiers / travaux planifiés
-- =============================================================================

CREATE TYPE public.scheduled_job_status AS ENUM (
  'planned',
  'in_progress',
  'done',
  'cancelled'
);

CREATE TABLE public.scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_location_id uuid REFERENCES public.client_locations(id) ON DELETE SET NULL,
  title text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  status public.scheduled_job_status NOT NULL DEFAULT 'planned',
  notes text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scheduled_jobs_user_id_idx ON public.scheduled_jobs(user_id);
CREATE INDEX scheduled_jobs_user_date_idx
  ON public.scheduled_jobs(user_id, scheduled_date)
  WHERE archived_at IS NULL;
CREATE INDEX scheduled_jobs_client_id_idx
  ON public.scheduled_jobs(client_id)
  WHERE client_id IS NOT NULL;

CREATE TRIGGER scheduled_jobs_set_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY scheduled_jobs_select_own
  ON public.scheduled_jobs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY scheduled_jobs_insert_own
  ON public.scheduled_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY scheduled_jobs_update_own
  ON public.scheduled_jobs
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY scheduled_jobs_delete_own
  ON public.scheduled_jobs
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
