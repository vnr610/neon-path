-- GitHub webhook events log
CREATE TABLE IF NOT EXISTS public.github_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  repo text,
  repo_url text,
  sender text,
  summary text,
  payload jsonb,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.github_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read github events" ON public.github_events;
CREATE POLICY "Admins can read github events"
  ON public.github_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete github events" ON public.github_events;
CREATE POLICY "Admins can delete github events"
  ON public.github_events FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS github_events_received_at_idx ON public.github_events (received_at DESC);
CREATE INDEX IF NOT EXISTS github_events_event_type_idx ON public.github_events (event_type);
