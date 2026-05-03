import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { Edit3, ImageUp, Trash2, Sparkles, Wand2, FileText, Loader2 } from "lucide-react";
import {
  addBlogPost,
  deleteBlogPost,
  loadBlogPosts,
  slugify,
  updateBlogPost,
  uploadBlogThumbnail,
  blogContentPreview,
  type BlogPost,
} from "@/lib/content";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";

const blankBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  thumbnailUrl: "",
};

const AdminBlog = () => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankBlogForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<string[]>([]);
  const ai = useAiBlogAssist();

  useEffect(() => {
    loadBlogPosts().then(setPosts);
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
      thumbnailUrl: post.thumbnailUrl || "",
    });
    setStatus("ready");
    setStatusMessage("Editing existing writeup.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await deleteBlogPost(id);
    const data = await loadBlogPosts();
    setPosts(data);
    if (editingId === id) resetForm();
  };

  const handleThumbnailUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrors(["Please upload an image file for the writeup thumbnail."]);
      return;
    }
    setStatus("submitting");
    setStatusMessage(undefined);
    setErrors([]);
    const url = await uploadBlogThumbnail(file);
    if (!url) {
      setStatus("error");
      setErrors(["Thumbnail upload failed. Make sure Supabase Storage bucket `blog-media` exists and is public."]);
      return;
    }
    setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
    setStatus("ready");
    setStatusMessage("Thumbnail uploaded and linked.");
  };

  const handleAiGenerate = async () => {
    if (!formData.title.trim()) {
      setErrors(["Add a title before generating content."]);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setStatusMessage("AI is writing your post…");
    setErrors([]);
    const result = await ai.run({
      action: "generate",
      title: formData.title,
      tags: formData.tags,
    });
    if (result) {
      setFormData((prev) => ({ ...prev, content: result }));
      setStatus("ready");
      setStatusMessage("Content generated — review and edit before publishing.");
    } else {
      setStatus("error");
      setErrors([ai.error || "AI generation failed."]);
    }
  };

  const handleAiEnhance = async () => {
    if (!formData.content.trim()) {
      setErrors(["Add some content before enhancing."]);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setStatusMessage("AI is enhancing your content…");
    setErrors([]);
    const result = await ai.run({
      action: "enhance",
      content: formData.content,
    });
    if (result) {
      setFormData((prev) => ({ ...prev, content: result }));
      setStatus("ready");
      setStatusMessage("Content enhanced — review changes before publishing.");
    } else {
      setStatus("error");
      setErrors([ai.error || "AI enhancement failed."]);
    }
  };

  const handleAiSummarize = async () => {
    if (!formData.content.trim()) {
      setErrors(["Add some content before generating an excerpt."]);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setStatusMessage("AI is generating excerpt…");
    setErrors([]);
    const result = await ai.run({
      action: "summarize",
      title: formData.title,
      content: formData.content,
    });
    if (result) {
      setFormData((prev) => ({ ...prev, excerpt: result }));
      setStatus("ready");
      setStatusMessage("Excerpt generated — review before publishing.");
    } else {
      setStatus("error");
      setErrors([ai.error || "AI summarization failed."]);
    }
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
    const thumbnailUrl = formData.thumbnailUrl.trim();
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
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
      const updated = await updateBlogPost(editingId, {
        title,
        slug,
        excerpt,
        content,
        tags,
        contentFormat: "markdown",
        thumbnailUrl: thumbnailUrl || undefined,
      });
      if (!updated) {
        setStatus("error");
        setErrors(["Update failed. Check browser console and ensure all writeup migrations are applied."]);
        return;
      }
      setStatus("success");
      setStatusMessage("Writeup updated successfully.");
    } else {
      const created = await addBlogPost({
        title,
        slug,
        excerpt,
        content,
        tags,
        contentFormat: "markdown",
        thumbnailUrl: thumbnailUrl || undefined,
      });
      if (!created) {
        setStatus("error");
        setErrors(["Publish failed. Check browser console and ensure all writeup migrations are applied."]);
        return;
      }
      setStatus("success");
      setStatusMessage("Writeup published successfully.");
    }

    const data = await loadBlogPosts();
    setPosts(data);
    resetForm();
  };

  return (
    <AdminLayout title="Writeups">
      <div className="grid gap-8 lg:grid-cols-[minmax(620px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit writeup" : "new writeup"}
          title={editingId ? "Update Writeup" : "Compose Writeup"}
          description="Write in Markdown. Add tags and attach a thumbnail for the post card."
          submitLabel={editingId ? "Save Writeup" : "Publish Writeup"}
          onSubmit={handleSubmit}
          onDiscard={resetForm}
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
                placeholder="writeup-slug"
                pattern="[a-z0-9-]+"
              />
            </FormField>
            <FormField
              id="thumbnailUrl"
              label="Thumbnail"
              optional
              hint="Upload an image or paste a URL for the writeup cover card."
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="saber-border"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageUp className="h-4 w-4 mr-2" />
                    Upload thumbnail
                  </Button>
                  {formData.thumbnailUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleThumbnailUpload}
                />
                <SaberInput
                  name="thumbnailUrl"
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  inputMode="url"
                />
                {formData.thumbnailUrl && (
                  <img
                    src={formData.thumbnailUrl}
                    alt=""
                    className="rounded-md border border-border/60 h-32 w-full object-cover"
                  />
                )}
              </div>
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
            <FormField
              id="content"
              label="Content (Markdown)"
              required
              hint="Headings, lists, links, code fences, and inline code all render on the public site."
            >
              {/* AI Toolbar */}
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                  onClick={handleAiGenerate}
                  disabled={ai.loading}
                  title="Generate full post from title and tags"
                >
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  Generate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                  onClick={handleAiEnhance}
                  disabled={ai.loading}
                  title="Improve grammar, clarity and formatting"
                >
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                  Enhance
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                  onClick={handleAiSummarize}
                  disabled={ai.loading}
                  title="Auto-generate excerpt from content"
                >
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                  Summarize
                </Button>
              </div>
              <SaberTextarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={18}
                placeholder={"# Heading\n\nBegin the chronicle…\n\n```bash\necho 'hello'\n```"}
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
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved writeups</p>
              <p className="text-sm text-muted-foreground">Manage existing technical writeups.</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          {posts.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground">No saved writeups yet.</div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article key={post.id} className="saber-card p-5">
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt=""
                      className="h-32 w-full object-cover rounded-md mb-4 border border-border/60"
                    />
                  ) : null}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{post.slug}</p>
                      <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{blogContentPreview(post)}</p>
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
