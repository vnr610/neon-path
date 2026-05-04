-- Add detail fields to projects for individual project pages
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS long_desc text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS challenges text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}';

-- Unique slug index (partial — only enforces uniqueness when slug is set)
CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_idx ON public.projects(slug) WHERE slug IS NOT NULL;
