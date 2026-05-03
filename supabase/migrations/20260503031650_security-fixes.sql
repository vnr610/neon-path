-- Fix: Restrict blog-media bucket to prevent public file listing
-- Previously allowed anyone to enumerate all files; now requires knowing the file path
drop policy if exists "blog_media_public_read" on "storage"."objects";

create policy "blog_media_public_read"
  on "storage"."objects"
  as permissive
  for select
  to public
  using (((bucket_id = 'blog-media'::text) AND ((storage.foldername(name))[1] IS NOT NULL)));

-- Ensure has_role() is always callable by authenticated users.
-- The app relies on this for admin checks after login.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;



