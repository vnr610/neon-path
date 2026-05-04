-- Recycle bin: stores soft-deleted items as JSON snapshots
CREATE TABLE IF NOT EXISTS public.recycle_bin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL CHECK (item_type IN ('blog_post', 'project', 'skill', 'certification', 'timeline_entry', 'media')),
  item_id text NOT NULL,          -- original row id
  item_title text NOT NULL,       -- human-readable label for the UI
  data jsonb NOT NULL,            -- full row snapshot for restoration
  deleted_at timestamptz NOT NULL DEFAULT now(),
  -- Auto-purge after 30 days (enforced by cron)
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.recycle_bin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage recycle bin" ON public.recycle_bin;
CREATE POLICY "Admins can manage recycle bin"
  ON public.recycle_bin
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS recycle_bin_item_type_idx ON public.recycle_bin (item_type);
CREATE INDEX IF NOT EXISTS recycle_bin_deleted_at_idx ON public.recycle_bin (deleted_at DESC);

-- Auto-purge expired items via pg_cron (daily at 2am UTC)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-recycle-bin') THEN
    PERFORM cron.schedule(
      'purge-recycle-bin',
      '0 2 * * *',
      $inner$ DELETE FROM public.recycle_bin WHERE expires_at < now(); $inner$
    );
  END IF;
END $$;
