-- Draft/publish status and scheduling for blog posts
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published')),
  ADD COLUMN IF NOT EXISTS publish_at timestamptz NULL;

-- Index for efficient published post queries
CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON public.blog_posts (status);
CREATE INDEX IF NOT EXISTS blog_posts_publish_at_idx ON public.blog_posts (publish_at);

-- Scheduled publish: cron job calls this function every hour
-- to flip draft→published when publish_at has passed
CREATE OR REPLACE FUNCTION public.publish_scheduled_posts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE public.blog_posts
  SET status = 'published', publish_at = NULL
  WHERE status = 'draft'
    AND publish_at IS NOT NULL
    AND publish_at <= now();
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Schedule the function to run every hour via pg_cron
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-posts') THEN
    PERFORM cron.schedule(
      'publish-scheduled-posts',
      '0 * * * *',
      $inner$ SELECT public.publish_scheduled_posts(); $inner$
    );
  END IF;
END $$;
