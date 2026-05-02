-- Public bucket for blog thumbnails (admin upload, public read)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media',
  'blog-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "blog_media_public_read" on storage.objects;
create policy "blog_media_public_read"
on storage.objects for select
using (bucket_id = 'blog-media');

drop policy if exists "blog_media_admin_insert" on storage.objects;
create policy "blog_media_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'blog-media'
  and public.has_role(auth.uid(), 'admin')
);

drop policy if exists "blog_media_admin_update" on storage.objects;
create policy "blog_media_admin_update"
on storage.objects for update
to authenticated
using (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'))
with check (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "blog_media_admin_delete" on storage.objects;
create policy "blog_media_admin_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'blog-media' and public.has_role(auth.uid(), 'admin'));
