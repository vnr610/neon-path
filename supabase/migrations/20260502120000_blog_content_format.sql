-- Markdown vs HTML (e.g. imported from Word .docx)
alter table public.blog_posts
  add column if not exists content_format text not null default 'markdown';

alter table public.blog_posts drop constraint if exists blog_posts_content_format_check;
alter table public.blog_posts add constraint blog_posts_content_format_check
  check (content_format in ('markdown', 'html'));
