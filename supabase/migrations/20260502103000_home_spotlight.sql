-- Landing page: hero focus copy + featured project slots
alter table public.projects
  add column if not exists featured_on_home boolean not null default false,
  add column if not exists home_slot smallint null;

alter table public.projects drop constraint if exists projects_home_slot_check;
alter table public.projects add constraint projects_home_slot_check
  check (home_slot is null or (home_slot >= 1 and home_slot <= 3));

create table if not exists public.site_home (
  id smallint primary key default 1,
  focus_title text null,
  focus_description text null,
  updated_at timestamptz not null default now(),
  constraint site_home_single_row check (id = 1)
);

alter table public.site_home enable row level security;

create policy "Site home is publicly readable"
on public.site_home for select
using (true);

create policy "Only admins can insert site home"
on public.site_home for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin') and id = 1);

create policy "Only admins can update site home"
on public.site_home for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

insert into public.site_home (id) values (1)
on conflict (id) do nothing;
