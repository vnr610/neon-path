import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import DOMPurify from "dompurify";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bold, Edit3, FileUp, Heading1, Heading2, ImagePlus, ImageUp, Italic, List, ListOrdered, Pilcrow, Plus, Trash2 } from "lucide-react";
import {
  addBlogPost,
  deleteBlogPost,
  loadBlogPosts,
  slugify,
  updateBlogPost,
  uploadBlogMedia,
  uploadBlogThumbnail,
  blogContentPreview,
  type BlogContentFormat,
  type BlogPost,
} from "@/lib/content";

const blankBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  contentFormat: "markdown" as BlogContentFormat,
  thumbnailUrl: "",
};

const AdminBlog = () => {
  const docxInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const htmlEditorRef = useRef<HTMLDivElement>(null);
  const syncingEditorRef = useRef(false);
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

  const syncEditorFromDom = () => {
    const el = htmlEditorRef.current;
    if (!el) return;
    syncingEditorRef.current = true;
    setFormData((prev) => ({ ...prev, content: el.innerHTML }));
  };

  const runEditorCommand = (command: string, value?: string) => {
    const el = htmlEditorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, value);
    syncEditorFromDom();
  };

  const increaseFontSize = () => runEditorCommand("fontSize", "5");
  const decreaseFontSize = () => runEditorCommand("fontSize", "3");

  const handleInsertImageUrl = () => {
    const url = window.prompt("Paste image URL");
    if (!url) return;
    runEditorCommand("insertImage", url.trim());
    setFormData((prev) => ({ ...prev, contentFormat: "html" }));
  };

  useEffect(() => {
    if (formData.contentFormat !== "html") return;
    const el = htmlEditorRef.current;
    if (!el) return;
    if (syncingEditorRef.current) {
      syncingEditorRef.current = false;
      return;
    }
    if (el.innerHTML !== formData.content) {
      el.innerHTML = formData.content || "<p></p>";
    }
  }, [formData.content, formData.contentFormat, editingId]);

  const handleEditorImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setErrors(["Please upload an image file for writeup content."]);
      return;
    }
    setStatus("submitting");
    setStatusMessage(undefined);
    const url = await uploadBlogMedia(file, "blog-content");
    if (!url) {
      setStatus("error");
      setErrors(["Image upload failed. Make sure Supabase Storage bucket `blog-media` exists and is public."]);
      return;
    }
    runEditorCommand("insertImage", url);
    setFormData((prev) => ({ ...prev, contentFormat: "html" }));
    setStatus("ready");
    setStatusMessage("Image uploaded into writeup.");
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(", "),
      contentFormat: post.contentFormat,
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
      const updated = await updateBlogPost(editingId, {
        title,
        slug,
        excerpt,
        content,
        tags,
        contentFormat: formData.contentFormat,
        thumbnailUrl: thumbnailUrl || undefined,
      });
      if (!updated) {
        setStatus("error");
        setErrors([
          "Update failed. Check browser console and ensure all writeup migrations are applied (content_format, thumbnail_url).",
        ]);
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
        contentFormat: formData.contentFormat,
        thumbnailUrl: thumbnailUrl || undefined,
      });
      if (!created) {
        setStatus("error");
        setErrors([
          "Publish failed. Check browser console and ensure all writeup migrations are applied (content_format, thumbnail_url).",
        ]);
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
          description="Write in Markdown or import a Word .docx file, add tags, and attach a thumbnail. Word imports are stored as safe HTML."
          submitLabel={editingId ? "Save Writeup" : "Publish Writeup"}
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
                placeholder="writeup-slug"
                pattern="[a-z0-9-]+"
              />
            </FormField>
            <FormField
              id="thumbnailUrl"
              label="Thumbnail"
              optional
              hint="Paste an image URL, or upload to Supabase Storage (`blog-media` bucket) for your writeup cover."
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => imageInputRef.current?.click()}>
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
                  <img src={formData.thumbnailUrl} alt="" className="rounded-md border border-border/60 h-32 w-full object-cover" />
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

            <input
              ref={docxInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                if (!file.name.toLowerCase().endsWith(".docx")) {
                  setErrors(["Choose a .docx file exported from Word, Google Docs, or LibreOffice."]);
                  setStatus("error");
                  return;
                }
                setErrors([]);
                setStatus("submitting");
                setStatusMessage(undefined);
                try {
                  const arrayBuffer = await file.arrayBuffer();
                  const mammoth = await import("mammoth");
                  const { value, messages } = await mammoth.convertToHtml({ arrayBuffer });
                  if (messages.length) console.warn("mammoth:", messages);
                  const clean = DOMPurify.sanitize(value, { USE_PROFILES: { html: true } });
                  setFormData((prev) => ({ ...prev, content: clean, contentFormat: "html" }));
                  setStatus("ready");
                  setStatusMessage(`Imported “${file.name}”. Body is HTML — publish writeup to save.`);
                } catch {
                  setStatus("error");
                  setErrors(["Could not read that file. Re-save as .docx and try again."]);
                }
              }}
            />

            <div className="flex flex-wrap items-end gap-4 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="saber-border"
                onClick={() => docxInputRef.current?.click()}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload Word (.docx)
              </Button>
              <div className="space-y-2 flex-1 min-w-[220px] max-w-sm">
                <label
                  htmlFor="contentFormat"
                  className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground block"
                >
                  <span className="text-foreground/40 mr-1.5">//</span>
                  Storage format
                </label>
                <select
                  id="contentFormat"
                  value={formData.contentFormat}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contentFormat: e.target.value as BlogContentFormat,
                    })
                  }
                  className={cn(
                    "w-full rounded-md bg-background/40 border border-border/60 px-3.5 py-2.5 text-sm font-mono",
                    "hover:border-foreground/30 focus:border-foreground/70 outline-none transition-all",
                  )}
                >
                  <option value="markdown">Markdown (typed)</option>
                  <option value="html">HTML (Word import)</option>
                </select>
              </div>
            </div>

            <FormField
              id="content"
              label={formData.contentFormat === "html" ? "Content (Rich text / HTML)" : "Content (Markdown)"}
              required
              hint={
                formData.contentFormat === "html"
                  ? "Word-like editor: bold/italic, heading/paragraph, font size, bullets/numbering, and images from URL or upload."
                  : "Headings, lists, links, and code fences work on the public site."
              }
            >
              {formData.contentFormat === "html" ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("bold")}>
                      <Bold className="h-4 w-4 mr-2" /> Bold
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("italic")}>
                      <Italic className="h-4 w-4 mr-2" /> Italic
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("formatBlock", "H1")}>
                      <Heading1 className="h-4 w-4 mr-2" /> H1
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("formatBlock", "H2")}>
                      <Heading2 className="h-4 w-4 mr-2" /> H2
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("formatBlock", "P")}>
                      <Pilcrow className="h-4 w-4 mr-2" /> Paragraph
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("insertUnorderedList")}>
                      <List className="h-4 w-4 mr-2" /> Bullets
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => runEditorCommand("insertOrderedList")}>
                      <ListOrdered className="h-4 w-4 mr-2" /> Numbering
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={decreaseFontSize}>
                      <Plus className="h-4 w-4 mr-2 rotate-45" /> Size -
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={increaseFontSize}>
                      <Plus className="h-4 w-4 mr-2" /> Size +
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={handleInsertImageUrl}>
                      <ImagePlus className="h-4 w-4 mr-2" /> Image URL
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="saber-border" onClick={() => contentImageInputRef.current?.click()}>
                      <ImageUp className="h-4 w-4 mr-2" /> Upload image
                    </Button>
                  </div>
                  <input
                    ref={contentImageInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleEditorImageUpload}
                  />
                  <div
                    ref={htmlEditorRef}
                    className={cn(
                      "min-h-[420px] w-full rounded-md bg-background/40 border border-border/60 px-3.5 py-3 text-sm",
                      "hover:border-foreground/30 focus-within:border-foreground/70 outline-none transition-all",
                    )}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncEditorFromDom}
                  />
                </div>
              ) : (
                <SaberTextarea
                  name="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={14}
                  placeholder="# Heading\n\nBegin the chronicle…"
                />
              )}
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
                    <img src={post.thumbnailUrl} alt="" className="h-32 w-full object-cover rounded-md mb-4 border border-border/60" />
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
