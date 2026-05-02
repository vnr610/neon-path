create table if not exists public.site_home (
  id smallint primary key default 1,
  focus_title text null,
  focus_description text null,
  updated_at timestamptz not null default now(),
  constraint site_home_single_row check (id = 1)
);

insert into public.site_home (id) values (1)
on conflict (id) do nothing;

alter table public.site_home
  add column if not exists github_username text,
  add column if not exists leetcode_username text,
  add column if not exists hackthebox_username text,
  add column if not exists hackerone_username text;

alter table public.site_home enable row level security;

grant select on public.site_home to anon, authenticated;
grant insert, update on public.site_home to authenticated;

drop policy if exists "Site home is publicly readable" on public.site_home;
create policy "Site home is publicly readable"
on public.site_home for select
using (true);

drop policy if exists "Only admins can insert site home" on public.site_home;
create policy "Only admins can insert site home"
on public.site_home for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin') and id = 1);

drop policy if exists "Only admins can update site home" on public.site_home;
create policy "Only admins can update site home"
on public.site_home for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

