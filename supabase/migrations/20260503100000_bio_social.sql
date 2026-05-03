-- Add bio and social links to site_home
alter table public.site_home
  add column if not exists bio text,
  add column if not exists linkedin_url text,
  add column if not exists twitter_url text,
  add column if not exists avatar_url text;
