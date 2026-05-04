-- Dev diary / daily log entries
CREATE TABLE IF NOT EXISTS public.dev_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] DEFAULT '{}',
  mood text CHECK (mood IN ('focused', 'productive', 'learning', 'struggling', 'breakthrough', 'tired')) DEFAULT 'focused',
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (log_date)  -- one entry per day
);

ALTER TABLE public.dev_logs ENABLE ROW LEVEL SECURITY;

-- Public can read public entries
DROP POLICY IF EXISTS "Public dev logs are readable" ON public.dev_logs;
CREATE POLICY "Public dev logs are readable"
  ON public.dev_logs FOR SELECT
  USING (is_public = true);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can manage dev logs" ON public.dev_logs;
CREATE POLICY "Admins can manage dev logs"
  ON public.dev_logs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS dev_logs_date_idx ON public.dev_logs (log_date DESC);
CREATE INDEX IF NOT EXISTS dev_logs_public_idx ON public.dev_logs (is_public, log_date DESC);
