-- Editor RLS policies
-- Editors can fully manage blog posts (writeups)
drop policy if exists "Editors can create blog posts" on "public"."blog_posts";
create policy "Editors can create blog posts"
  on "public"."blog_posts" as permissive for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'editor'));

drop policy if exists "Editors can update blog posts" on "public"."blog_posts";
create policy "Editors can update blog posts"
  on "public"."blog_posts" as permissive for update
  to authenticated
  using (public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'editor'));

drop policy if exists "Editors can delete blog posts" on "public"."blog_posts";
create policy "Editors can delete blog posts"
  on "public"."blog_posts" as permissive for delete
  to authenticated
  using (public.has_role(auth.uid(), 'editor'));

-- Editors can read and update contact messages (inbox management)
drop policy if exists "Editors can read contact messages" on "public"."contact_messages";
create policy "Editors can read contact messages"
  on "public"."contact_messages" as permissive for select
  to authenticated
  using (public.has_role(auth.uid(), 'editor'));

drop policy if exists "Editors can update contact messages" on "public"."contact_messages";
create policy "Editors can update contact messages"
  on "public"."contact_messages" as permissive for update
  to authenticated
  using (public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'editor'));

-- Editors can read analytics
drop policy if exists "Editors can read page views" on "public"."page_views";
create policy "Editors can read page views"
  on "public"."page_views" as permissive for select
  to authenticated
  using (public.has_role(auth.uid(), 'editor'));
