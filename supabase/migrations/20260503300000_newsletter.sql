create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (insert their own email)
create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only admins can read subscriber list
create policy "Only admins can read subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Only admins can update (confirm/unsubscribe)
create policy "Only admins can update subscribers"
  on public.newsletter_subscribers for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
create policy "Only admins can delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
