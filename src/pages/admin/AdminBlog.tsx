import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { Button } from "@/components/ui/button";
import { Edit3, ImageUp, Trash2, Sparkles, Wand2, FileText, Loader2, FileEdit, Globe, Clock, CheckSquare, Square, Layers, Image as ImageIcon, Copy, Check } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  addBlogPost,
  deleteBlogPost,
  deleteBlogPostsBulk,
  trashBlogPost,
  trashBlogPostsBulk,
  loadAllBlogPosts,
  slugify,
  updateBlogPost,
  uploadBlogThumbnail,
  uploadBlogMedia,
  blogContentPreview,
  type BlogPost,
} from "@/lib/content";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";
import { supabase } from "@/integrations/supabase/client";

const blankBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  thumbnailUrl: "",
  author: "",
  status: "published" as "draft" | "published",
  publishAt: "",
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Media library
  const [activeTab, setActiveTab] = useState<"posts" | "media">("posts");
  const [mediaFiles, setMediaFiles] = useState<{ name: string; url: string; folder: string }[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const mediaUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAllBlogPosts().then((data) => {
      setPosts(data);
      // Auto-open edit mode if ?edit=<id> or ?edit=<slug> is in the URL
      const editParam = searchParams.get("edit");
      if (editParam) {
        const target = data.find((p) => p.id === editParam || p.slug === editParam);
        if (target) {
          setEditingId(target.id);
          setFormData({
            title: target.title,
            slug: target.slug,
            excerpt: target.excerpt,
            content: target.content,
            tags: target.tags.join(", "),
            thumbnailUrl: target.thumbnailUrl || "",
            author: target.author || "",
            status: target.status ?? "published",
            publishAt: target.publishAt ? target.publishAt.slice(0, 16) : "",
          });
          setStatus("ready");
          setStatusMessage("Editing existing writeup.");
          // Scroll to top of form
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        // Clean the param from URL without re-render loop
        setSearchParams({}, { replace: true });
      }
    });
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
      author: post.author || "",
      status: post.status ?? "published",
      publishAt: post.publishAt ? post.publishAt.slice(0, 16) : "",
    });
    setStatus("ready");
    setStatusMessage("Editing existing writeup.");
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    await trashBlogPost(id);
    const data = await loadAllBlogPosts();
    setPosts(data);
    if (editingId === id) resetForm();
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} post${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setBulkDeleting(true);
    await trashBlogPostsBulk(Array.from(selected));
    const data = await loadAllBlogPosts();
    setPosts(data);
    setSelected(new Set());
    setBulkDeleting(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.id)));
  };

  // Media library
  const loadMedia = async () => {
    setMediaLoading(true);
    // List files from all subfolders in blog-media bucket
    const folders = ["blog-thumbnails", "blog-content", "avatars", ""];
    const allFiles: { name: string; url: string; folder: string }[] = [];

    for (const folder of folders) {
      const { data } = await supabase.storage
        .from("blog-media")
        .list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (data) {
        for (const f of data) {
          if (f.name === ".emptyFolderPlaceholder" || f.id === null) continue;
          const path = folder ? `${folder}/${f.name}` : f.name;
          const { data: urlData } = supabase.storage.from("blog-media").getPublicUrl(path);
          allFiles.push({ name: f.name, url: urlData.publicUrl, folder });
        }
      }
    }

    setMediaFiles(allFiles);
    setMediaLoading(false);
  };

  const handleMediaUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await uploadBlogMedia(file);
    if (url) loadMedia();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
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

  const handleAiSlug = async () => {
    if (!formData.title.trim()) {
      setErrors(["Add a title before generating a slug."]);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setStatusMessage("AI is generating slug…");
    setErrors([]);
    const result = await ai.run({ action: "suggest-slug", title: formData.title });
    if (result) {
      // Sanitize: lowercase, hyphens only
      const clean = result.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug: clean }));
      setStatus("ready");
      setStatusMessage("Slug generated — review before publishing.");
    } else {
      setStatus("error");
      setErrors([ai.error || "AI slug generation failed."]);
    }
  };

  const handleAiTags = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      setErrors(["Add a title or content before suggesting tags."]);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setStatusMessage("AI is suggesting tags…");
    setErrors([]);
    const result = await ai.run({
      action: "suggest-tags",
      title: formData.title,
      content: formData.content,
    });
    if (result) {
      // Merge with existing tags, deduplicate
      const existing = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const suggested = result.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const merged = Array.from(new Set([...existing, ...suggested])).join(", ");
      setFormData((prev) => ({ ...prev, tags: merged }));
      setStatus("ready");
      setStatusMessage("Tags suggested — remove any that don't fit.");
    } else {
      setStatus("error");
      setErrors([ai.error || "AI tag suggestion failed."]);
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
    const author = formData.author.trim();
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
        author: author || undefined,
        status: formData.status,
        publishAt: formData.publishAt || null,
      });
      if (!updated) {
        setStatus("error");
        setErrors(["Update failed. Check browser console and ensure all writeup migrations are applied."]);
        return;
      }
      setStatus("success");
      setStatusMessage(formData.status === "draft" ? "Draft saved." : "Writeup updated successfully.");
    } else {
      const created = await addBlogPost({
        title,
        slug,
        excerpt,
        content,
        tags,
        contentFormat: "markdown",
        thumbnailUrl: thumbnailUrl || undefined,
        author: author || undefined,
        status: formData.status,
        publishAt: formData.publishAt || null,
      });
      if (!created) {
        setStatus("error");
        setErrors(["Publish failed. Check browser console and ensure all writeup migrations are applied."]);
        return;
      }
      setStatus("success");
      setStatusMessage(formData.status === "draft" ? "Draft saved." : "Writeup published successfully.");
    }

    const data = await loadAllBlogPosts();
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
              <div className="flex gap-2">
                <SaberInput
                  name="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="writeup-slug"
                  pattern="[a-z0-9-]+"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0"
                  onClick={handleAiSlug} disabled={ai.loading} title="Generate slug from title">
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>
            <FormField id="author" label="Author" optional hint="Display name shown on the post. Defaults to site owner if blank.">
              <SaberInput
                name="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="VNR610"
                maxLength={80}
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
              <div className="flex gap-2 items-start">
                <SaberTextarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  placeholder="A single line that draws the reader in…"
                  maxLength={240}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0 mt-0.5"
                  onClick={handleAiSummarize} disabled={ai.loading} title="Generate excerpt from content">
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                </Button>
              </div>
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
              <div className="flex gap-2">
                <SaberInput
                  name="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="cybersecurity, react, devlog"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0"
                  onClick={handleAiTags} disabled={ai.loading} title="Suggest tags from title and content">
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>
          </FormSection>

          <FormSection title="Publishing">
            {/* Status toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData((d) => ({ ...d, status: "published", publishAt: "" }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-xs uppercase tracking-[0.2em] font-mono transition-colors ${
                  formData.status === "published"
                    ? "border-saber-blue text-saber-blue bg-saber-blue/10"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40"
                }`}
              >
                <Globe className="h-3.5 w-3.5" /> Published
              </button>
              <button
                type="button"
                onClick={() => setFormData((d) => ({ ...d, status: "draft" }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-xs uppercase tracking-[0.2em] font-mono transition-colors ${
                  formData.status === "draft"
                    ? "border-amber-500/60 text-amber-400 bg-amber-500/10"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40"
                }`}
              >
                <FileEdit className="h-3.5 w-3.5" /> Draft
              </button>
            </div>

            {/* Schedule — only shown for drafts */}
            {formData.status === "draft" && (
              <FormField id="publishAt" label="Schedule publish" optional hint="Auto-publishes at this date/time (UTC). Leave blank to keep as draft.">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <SaberInput
                    name="publishAt"
                    type="datetime-local"
                    value={formData.publishAt}
                    onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </FormField>
            )}
          </FormSection>
        </AdminFormShell>

        <section className="space-y-4">
          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-border/60 pb-2">
            <button onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-[0.2em] font-mono transition-colors ${activeTab === "posts" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Layers className="h-3.5 w-3.5" /> Posts
            </button>
            <button onClick={() => { setActiveTab("media"); loadMedia(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-[0.2em] font-mono transition-colors ${activeTab === "media" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <ImageIcon className="h-3.5 w-3.5" /> Media
            </button>
          </div>

          {activeTab === "media" ? (
            /* ── MEDIA LIBRARY ── */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Click a URL to copy it.</p>
                <div>
                  <input ref={mediaUploadRef} type="file" accept="image/*" className="sr-only" onChange={handleMediaUpload} />
                  <Button type="button" variant="outline" size="sm" className="saber-border gap-1.5" onClick={() => mediaUploadRef.current?.click()}>
                    <ImageUp className="h-3.5 w-3.5" /> Upload
                  </Button>
                </div>
              </div>
              {mediaLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[0,1,2,3].map((i) => <div key={i} className="aspect-video rounded-md bg-muted/20 animate-pulse" />)}
                </div>
              ) : mediaFiles.length === 0 ? (
                <div className="saber-card p-6 text-center text-muted-foreground text-sm">No media uploaded yet.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {mediaFiles.map((f) => (
                    <button key={f.url} onClick={() => copyUrl(f.url)}
                      className="group relative rounded-md overflow-hidden border border-border/60 hover:border-saber-blue/40 transition-colors text-left bg-muted/20">
                      <div className="aspect-video w-full overflow-hidden bg-muted/30">
                        <img
                          src={f.url}
                          alt={f.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em]">
                        {copiedUrl === f.url ? <><Check className="h-3 w-3 text-green-500" />Copied</> : <><Copy className="h-3 w-3" />Copy URL</>}
                      </div>
                      <div className="px-2 py-1 border-t border-border/60">
                        <p className="text-[10px] text-muted-foreground truncate">{f.name}</p>
                        {f.folder && <p className="text-[9px] text-muted-foreground/50 truncate">{f.folder}/</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
          /* ── POSTS LIST ── */
          <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved writeups</p>
              <p className="text-sm text-muted-foreground">{posts.length} total · {posts.filter(p => p.status === "draft").length} drafts</p>
            </div>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={bulkDeleting} className="gap-1.5">
                  {bulkDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete {selected.size}
                </Button>
              )}
              {editingId && (
                <Button variant="ghost" size="sm" onClick={resetForm}>Cancel edit</Button>
              )}
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="saber-card p-6 text-muted-foreground text-sm">No saved writeups yet.</div>
          ) : (
            <>
              {/* Select all row */}
              <div className="flex items-center gap-2 px-1">
                <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                  {selected.size === posts.length && posts.length > 0
                    ? <CheckSquare className="h-4 w-4" />
                    : <Square className="h-4 w-4" />}
                </button>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  {selected.size > 0 ? `${selected.size} selected` : "Select all"}
                </span>
              </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <article key={post.id} className={`saber-card p-5 transition-colors ${selected.has(post.id) ? "border-saber-blue/40 bg-saber-blue/5" : ""}`}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button onClick={() => toggleSelect(post.id)} className="mt-1 shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      {selected.has(post.id) ? <CheckSquare className="h-4 w-4 text-saber-blue" /> : <Square className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                  {post.thumbnailUrl ? (
                    <img
                      src={post.thumbnailUrl}
                      alt=""
                      className="h-24 w-full object-cover rounded-md mb-3 border border-border/60"
                    />
                  ) : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground truncate">{post.slug}</p>
                        {post.status === "draft" ? (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-[0.2em] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">Draft</span>
                        ) : (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-[0.2em] font-mono bg-green-500/10 text-green-400 border border-green-500/20">Live</span>
                        )}
                        {post.publishAt && post.status === "draft" && (
                          <span className="shrink-0 flex items-center gap-1 text-[9px] font-mono text-muted-foreground">
                            <Clock className="h-3 w-3" />{new Date(post.publishAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold">{post.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{blogContentPreview(post)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(post)}>
                        <Edit3 className="h-4 w-4" /> Edit
                      </Button>
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            </>
          )}
          </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminBlog;
