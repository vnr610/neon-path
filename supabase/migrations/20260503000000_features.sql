-- ── Feature migrations ────────────────────────────────────────────────────────

-- 1. Contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can submit a contact message" on public.contact_messages;
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "Only admins can read contact messages" on public.contact_messages;
create policy "Only admins can read contact messages"
  on public.contact_messages for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Only admins can update contact messages" on public.contact_messages;
create policy "Only admins can update contact messages"
  on public.contact_messages for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Only admins can delete contact messages" on public.contact_messages;
create policy "Only admins can delete contact messages"
  on public.contact_messages for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 2. Page view analytics
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

drop policy if exists "Anyone can insert a page view" on public.page_views;
create policy "Anyone can insert a page view"
  on public.page_views for insert
  with check (true);

drop policy if exists "Only admins can read page views" on public.page_views;
create policy "Only admins can read page views"
  on public.page_views for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- 3. Blog post view counts (per-post counter)
create table if not exists public.blog_post_views (
  slug text primary key,
  views bigint not null default 0
);

alter table public.blog_post_views enable row level security;

drop policy if exists "Anyone can read blog post views" on public.blog_post_views;
create policy "Anyone can read blog post views"
  on public.blog_post_views for select
  using (true);

drop policy if exists "Anyone can upsert blog post views" on public.blog_post_views;
create policy "Anyone can upsert blog post views"
  on public.blog_post_views for insert
  with check (true);

drop policy if exists "Anyone can update blog post views" on public.blog_post_views;
create policy "Anyone can update blog post views"
  on public.blog_post_views for update
  using (true);

-- 4. Resume URL in site_home
alter table public.site_home
  add column if not exists resume_url text;

-- 5. Skill progress history (snapshot per day)
create table if not exists public.skill_progress_history (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  progress integer not null,
  recorded_at timestamptz not null default now()
);

alter table public.skill_progress_history enable row level security;

drop policy if exists "Skill history is publicly readable" on public.skill_progress_history;
create policy "Skill history is publicly readable"
  on public.skill_progress_history for select
  using (true);

drop policy if exists "Only admins can insert skill history" on public.skill_progress_history;
create policy "Only admins can insert skill history"
  on public.skill_progress_history for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
