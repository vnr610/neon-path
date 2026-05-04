create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;

create policy "Anyone can read approved guestbook entries"
  on public.guestbook for select
  using (approved = true);

create policy "Anyone can submit a guestbook entry"
  on public.guestbook for insert
  with check (true);

create policy "Only admins can read all guestbook entries"
  on public.guestbook for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update guestbook entries"
  on public.guestbook for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete guestbook entries"
  on public.guestbook for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
