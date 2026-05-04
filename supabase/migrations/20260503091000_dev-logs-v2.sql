-- Upgrade dev_logs to match blog_posts feature set
ALTER TABLE public.dev_logs
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS excerpt text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS content_format text NOT NULL DEFAULT 'markdown'
    CHECK (content_format IN ('markdown', 'html')),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published'));

-- Drop the one-entry-per-day unique constraint so multiple entries per day are allowed
ALTER TABLE public.dev_logs DROP CONSTRAINT IF EXISTS dev_logs_log_date_key;

-- Add slug unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS dev_logs_slug_idx ON public.dev_logs (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS dev_logs_status_idx ON public.dev_logs (status);
