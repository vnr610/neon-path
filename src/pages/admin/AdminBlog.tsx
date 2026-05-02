import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { Edit3, Trash2 } from "lucide-react";
import {
  addBlogPost,
  deleteBlogPost,
  loadBlogPosts,
  slugify,
  updateBlogPost,
  type BlogPost,
} from "@/lib/content";

const blankBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
};

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankBlogForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await loadBlogPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData(blankBlogForm);
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(", "),
    });
    setStatus("ready");
    setStatusMessage("Editing existing post.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await deleteBlogPost(id);
    const data = await loadBlogPosts();
    setPosts(data);
    if (editingId === id) resetForm();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);

    const title = formData.title.trim();
    const slugInput = formData.slug.trim();
    const excerpt = formData.excerpt.trim();
    const content = formData.content.trim();
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const slug = slugInput || slugify(title);
    const nextErrors: string[] = [];

    if (!title) nextErrors.push("Title is required.");
    if (!content) nextErrors.push("Content is required.");
    if (!slug) nextErrors.push("Slug is required.");
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      nextErrors.push("Slug may only include lowercase letters, numbers, and hyphens.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setStatus("error");
      return;
    }

    if (editingId) {
      await updateBlogPost(editingId, { title, slug, excerpt, content, tags });
      setStatus("success");
      setStatusMessage("Post updated successfully.");
    } else {
      await addBlogPost({ title, slug, excerpt, content, tags });
      setStatus("success");
      setStatusMessage("Post published successfully.");
    }

    const data = await loadBlogPosts();
    setPosts(data);
    resetForm();
  };

  return (
    <AdminLayout title="Blog Posts">
      <div className="grid gap-8 lg:grid-cols-[minmax(420px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit post" : "new post"}
          title={editingId ? "Update Blog Post" : "Compose Blog Post"}
          description="Inscribe a new entry into the journal — markdown supported, drafts auto-saved."
          submitLabel={editingId ? "Save Changes" : "Publish Post"}
          onSubmit={handleSubmit}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="Identity">
            <FormField id="title" label="Title" required hint="Keep under 60 characters for clean SEO.">
              <SaberInput
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="The title of your transmission"
                maxLength={120}
              />
            </FormField>
            <FormField id="slug" label="Slug" required hint="Lowercase, hyphen-separated. Auto-generated from title if blank.">
              <SaberInput
                name="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="post-slug"
                pattern="[a-z0-9-]+"
              />
            </FormField>
          </FormSection>

          <FormSection title="Content">
            <FormField id="excerpt" label="Excerpt" optional hint="Short summary surfaced in lists and meta tags.">
              <SaberTextarea
                name="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                placeholder="A single line that draws the reader in…"
                maxLength={240}
              />
            </FormField>
            <FormField id="content" label="Content (Markdown)" required>
              <SaberTextarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                placeholder="# Heading&#10;&#10;Begin the chronicle…"
              />
            </FormField>
          </FormSection>

          <FormSection title="Taxonomy">
            <FormField id="tags" label="Tags" optional hint="Comma-separated. Used for filtering and discovery.">
              <SaberInput
                name="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="cybersecurity, react, devlog"
              />
            </FormField>
          </FormSection>
        </AdminFormShell>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved posts</p>
              <p className="text-sm text-muted-foreground">Manage existing entries from the journal.</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground">No saved posts yet.</div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article key={post.id} className="saber-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{post.slug}</p>
                      <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{post.excerpt || `${post.content.slice(0, 120)}...`}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(post)}>
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
