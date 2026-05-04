-- Blog post comments (public submit, admin/editor read)
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  author_name text NOT NULL,
  author_email text,
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a comment
DROP POLICY IF EXISTS "Anyone can submit a comment" ON public.blog_comments;
CREATE POLICY "Anyone can submit a comment"
  ON public.blog_comments FOR INSERT
  WITH CHECK (true);

-- Only approved comments are publicly readable
DROP POLICY IF EXISTS "Approved comments are public" ON public.blog_comments;
CREATE POLICY "Approved comments are public"
  ON public.blog_comments FOR SELECT
  USING (approved = true);

-- Admins and editors can read all comments
DROP POLICY IF EXISTS "Admins can read all comments" ON public.blog_comments;
CREATE POLICY "Admins can read all comments"
  ON public.blog_comments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Admins and editors can update (approve/reject)
DROP POLICY IF EXISTS "Admins can update comments" ON public.blog_comments;
CREATE POLICY "Admins can update comments"
  ON public.blog_comments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'));

-- Admins can delete
DROP POLICY IF EXISTS "Admins can delete comments" ON public.blog_comments;
CREATE POLICY "Admins can delete comments"
  ON public.blog_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS blog_comments_post_slug_idx ON public.blog_comments (post_slug);
CREATE INDEX IF NOT EXISTS blog_comments_created_at_idx ON public.blog_comments (created_at DESC);
