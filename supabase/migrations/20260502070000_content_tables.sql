-- Blog Posts Table
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "Blog posts are publicly readable"
on public.blog_posts
for select
using (true);

create policy "Only admins can create blog posts"
on public.blog_posts
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update blog posts"
on public.blog_posts
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete blog posts"
on public.blog_posts
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Skills Table
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('fullstack', 'cyber')),
  level text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.skills enable row level security;

create policy "Skills are publicly readable"
on public.skills
for select
using (true);

create policy "Only admins can create skills"
on public.skills
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update skills"
on public.skills
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete skills"
on public.skills
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Projects Table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  "desc" text not null,
  repo text,
  live text,
  stack text not null,
  cover text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Projects are publicly readable"
on public.projects
for select
using (true);

create policy "Only admins can create projects"
on public.projects
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update projects"
on public.projects
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete projects"
on public.projects
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Timeline Entries Table
create table public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  date timestamptz not null,
  realm text not null,
  title text not null,
  "desc" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.timeline_entries enable row level security;

create policy "Timeline entries are publicly readable"
on public.timeline_entries
for select
using (true);

create policy "Only admins can create timeline entries"
on public.timeline_entries
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update timeline entries"
on public.timeline_entries
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete timeline entries"
on public.timeline_entries
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Certifications Table
create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  date timestamptz not null,
  url text,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certifications enable row level security;

create policy "Certifications are publicly readable"
on public.certifications
for select
using (true);

create policy "Only admins can create certifications"
on public.certifications
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update certifications"
on public.certifications
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete certifications"
on public.certifications
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));
