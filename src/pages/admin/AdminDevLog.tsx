import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import {
  Edit3, Trash2, Eye, EyeOff, Sparkles, Wand2, FileText,
  Loader2, ImageUp, Globe, FileEdit, Clock, Tag,
} from "lucide-react";
import {
  loadDevLogs, addDevLog, updateDevLog, deleteDevLog,
  uploadDevLogThumbnail, slugify,
  type DevLog, type DevLogMood,
} from "@/lib/content";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";
import { useSearchParams } from "react-router-dom";

const MOOD_OPTIONS: { value: DevLogMood; emoji: string; label: string }[] = [
  { value: "focused",      emoji: "🎯", label: "Focused" },
  { value: "productive",   emoji: "⚡", label: "Productive" },
  { value: "learning",     emoji: "📚", label: "Learning" },
  { value: "struggling",   emoji: "🔥", label: "Struggling" },
  { value: "breakthrough", emoji: "💡", label: "Breakthrough" },
  { value: "tired",        emoji: "😴", label: "Tired" },
];

function todayDate() { return new Date().toISOString().slice(0, 10); }
function formatDisplayDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

const blankForm = {
  logDate: todayDate(),
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  author: "",
  thumbnailUrl: "",
  mood: "focused" as DevLogMood,
  isPublic: true,
  status: "published" as "draft" | "published",
  publishAt: "",
};

const AdminDevLog = () => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const ai = useAiBlogAssist();
  const [searchParams, setSearchParams] = useSearchParams();

  const load = async () => {
    const data = await loadDevLogs(false);
    setLogs(data);
  };

  useEffect(() => {
    load().then(() => {
      const editParam = searchParams.get("edit");
      if (editParam) {
        setLogs((prev) => {
          const target = prev.find((l) => l.id === editParam || l.slug === editParam);
          if (target) openEdit(target);
          return prev;
        });
        setSearchParams({}, { replace: true });
      }
    });
  }, [searchParams, setSearchParams]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      setFormData((d) => ({ ...d, slug: slugify(d.title) }));
    }
  }, [formData.title, formData.slug]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ ...blankForm, logDate: todayDate() });
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const openEdit = (log: DevLog) => {
    setEditingId(log.id);
    setFormData({
      logDate: log.logDate,
      title: log.title,
      slug: log.slug || "",
      excerpt: log.excerpt || "",
      content: log.content,
      tags: log.tags.join(", "),
      author: log.author || "",
      thumbnailUrl: log.thumbnailUrl || "",
      mood: log.mood,
      isPublic: log.isPublic,
      status: log.status,
      publishAt: "",
    });
    setStatus("ready");
    setStatusMessage("Editing existing entry.");
    setErrors([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this log entry?")) return;
    await deleteDevLog(id);
    await load();
    if (editingId === id) resetForm();
  };

  const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setStatus("submitting"); setStatusMessage("Uploading thumbnail…");
    const url = await uploadDevLogThumbnail(file);
    if (url) { setFormData((d) => ({ ...d, thumbnailUrl: url })); setStatus("ready"); setStatusMessage("Thumbnail uploaded."); }
    else { setStatus("error"); setErrors(["Thumbnail upload failed."]); }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting"); setErrors([]);

    const title = formData.title.trim();
    const content = formData.content.trim();
    const slug = formData.slug.trim() || slugify(title);
    const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (!title) { setErrors(["Title is required."]); setStatus("error"); return; }
    if (!content) { setErrors(["Content is required."]); setStatus("error"); return; }
    if (slug && !/^[a-z0-9-]+$/.test(slug)) { setErrors(["Slug: lowercase letters, numbers and hyphens only."]); setStatus("error"); return; }

    const payload = {
      logDate: formData.logDate,
      title,
      slug: slug || undefined,
      excerpt: formData.excerpt.trim() || undefined,
      content,
      contentFormat: "markdown" as const,
      thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
      author: formData.author.trim() || undefined,
      tags,
      mood: formData.mood,
      isPublic: formData.isPublic,
      status: formData.status,
    };

    let saved: DevLog | null;
    if (editingId) {
      saved = await updateDevLog(editingId, payload);
    } else {
      saved = await addDevLog(payload);
    }

    if (!saved) { setStatus("error"); setErrors(["Save failed. Check your connection."]); return; }
    setStatus("success");
    setStatusMessage(formData.status === "draft" ? "Draft saved." : editingId ? "Entry updated." : "Entry published.");
    await load();
    resetForm();
  };

  // AI helpers
  const aiEnhance = async () => {
    if (!formData.content.trim()) return;
    setStatus("submitting"); setStatusMessage("AI enhancing…");
    const r = await ai.run({ action: "enhance", content: formData.content });
    if (r) { setFormData((d) => ({ ...d, content: r })); setStatus("ready"); setStatusMessage("Enhanced."); }
    else { setStatus("error"); setErrors([ai.error || "AI failed."]); }
  };

  const aiGenerate = async () => {
    if (!formData.title.trim()) { setErrors(["Add a title first."]); setStatus("error"); return; }
    setStatus("submitting"); setStatusMessage("AI writing entry…");
    const r = await ai.run({ action: "generate", title: formData.title, tags: formData.tags });
    if (r) { setFormData((d) => ({ ...d, content: r })); setStatus("ready"); setStatusMessage("Generated — review before saving."); }
    else { setStatus("error"); setErrors([ai.error || "AI failed."]); }
  };

  const aiSummarize = async () => {
    if (!formData.content.trim()) return;
    setStatus("submitting"); setStatusMessage("AI summarizing…");
    const r = await ai.run({ action: "summarize", title: formData.title, content: formData.content });
    if (r) { setFormData((d) => ({ ...d, excerpt: r })); setStatus("ready"); setStatusMessage("Excerpt generated."); }
    else { setStatus("error"); setErrors([ai.error || "AI failed."]); }
  };

  const aiSlug = async () => {
    if (!formData.title.trim()) return;
    const r = await ai.run({ action: "suggest-slug", title: formData.title });
    if (r) {
      const clean = r.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      setFormData((d) => ({ ...d, slug: clean }));
    }
  };

  const aiTags = async () => {
    const r = await ai.run({ action: "suggest-tags", title: formData.title, content: formData.content });
    if (r) {
      const existing = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const suggested = r.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      setFormData((d) => ({ ...d, tags: Array.from(new Set([...existing, ...suggested])).join(", ") }));
    }
  };

  return (
    <AdminLayout title="Dev Diary">
      <div className="grid gap-8 lg:grid-cols-[minmax(620px,1fr)_340px]">
        <AdminFormShell
          eyebrow={editingId ? "edit entry" : "new entry"}
          title={editingId ? "Update Entry" : "New Dev Log"}
          description="Document what you coded, learned, and practiced. Write in Markdown."
          submitLabel={editingId ? "Save Entry" : formData.status === "draft" ? "Save Draft" : "Publish Entry"}
          onSubmit={handleSubmit}
          onDiscard={resetForm}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          {/* ── Identity ── */}
          <FormSection title="Identity">
            <FormField id="logDate" label="Date" required>
              <SaberInput type="date" value={formData.logDate}
                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })} />
            </FormField>

            <FormField id="title" label="Title" required hint="Keep under 80 characters.">
              <SaberInput value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What did you work on today?" maxLength={120} />
            </FormField>

            <FormField id="slug" label="Slug" optional hint="Auto-generated from title. Used for the entry URL.">
              <div className="flex gap-2">
                <SaberInput value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  placeholder="my-entry-slug" className="flex-1" />
                <Button type="button" variant="outline" size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0"
                  onClick={aiSlug} disabled={ai.loading}>
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>

            <FormField id="author" label="Author" optional>
              <SaberInput value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="VNR610" maxLength={80} />
            </FormField>

            <FormField id="thumbnailUrl" label="Thumbnail" optional hint="Upload or paste a URL.">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="saber-border"
                    onClick={() => imageInputRef.current?.click()}>
                    <ImageUp className="h-4 w-4 mr-2" />Upload thumbnail
                  </Button>
                  {formData.thumbnailUrl && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => setFormData((d) => ({ ...d, thumbnailUrl: "" }))}>Remove</Button>
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="sr-only" onChange={handleThumbnailUpload} />
                <SaberInput type="url" value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg" />
                {formData.thumbnailUrl && (
                  <img src={formData.thumbnailUrl} alt="" className="rounded-md border border-border/60 h-32 w-full object-cover" />
                )}
              </div>
            </FormField>
          </FormSection>

          {/* ── Content ── */}
          <FormSection title="Content">
            <FormField id="mood" label="Mood" required>
              <div className="flex flex-wrap gap-2">
                {MOOD_OPTIONS.map((m) => (
                  <button key={m.value} type="button"
                    onClick={() => setFormData({ ...formData, mood: m.value })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-colors ${
                      formData.mood === m.value
                        ? "border-saber-blue text-saber-blue bg-saber-blue/10"
                        : "border-border/60 text-muted-foreground hover:border-foreground/40"
                    }`}>
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField id="excerpt" label="Excerpt" optional hint="Short summary shown in the list.">
              <div className="flex gap-2 items-start">
                <SaberTextarea value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2} placeholder="What's the TL;DR of today?" maxLength={240} className="flex-1" />
                <Button type="button" variant="outline" size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0 mt-0.5"
                  onClick={aiSummarize} disabled={ai.loading}>
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>

            <FormField id="content" label="Content (Markdown)" required
              hint="What did you build, learn, struggle with? Be honest.">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm"
                    className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                    onClick={aiGenerate} disabled={ai.loading}>
                    {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Generate
                  </Button>
                  <Button type="button" variant="outline" size="sm"
                    className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                    onClick={aiEnhance} disabled={ai.loading}>
                    {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    Enhance
                  </Button>
                </div>
                <SaberTextarea value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={18}
                  placeholder={"## What I built\n\n- ...\n\n## What I learned\n\n...\n\n## Struggles\n\n..."} />
              </div>
            </FormField>
          </FormSection>

          {/* ── Taxonomy ── */}
          <FormSection title="Taxonomy">
            <FormField id="tags" label="Tags" optional hint="Comma-separated.">
              <div className="flex gap-2">
                <SaberInput value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="react, auth, debugging, ctf" className="flex-1" />
                <Button type="button" variant="outline" size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0"
                  onClick={aiTags} disabled={ai.loading}>
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>
          </FormSection>

          {/* ── Publishing ── */}
          <FormSection title="Publishing">
            <div className="flex items-center gap-3 flex-wrap">
              <button type="button"
                onClick={() => setFormData((d) => ({ ...d, status: "published", isPublic: true }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-xs uppercase tracking-[0.2em] font-mono transition-colors ${
                  formData.status === "published" && formData.isPublic
                    ? "border-saber-blue text-saber-blue bg-saber-blue/10"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40"
                }`}>
                <Globe className="h-3.5 w-3.5" /> Published
              </button>
              <button type="button"
                onClick={() => setFormData((d) => ({ ...d, status: "draft" }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-xs uppercase tracking-[0.2em] font-mono transition-colors ${
                  formData.status === "draft"
                    ? "border-amber-500/60 text-amber-400 bg-amber-500/10"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40"
                }`}>
                <FileEdit className="h-3.5 w-3.5" /> Draft
              </button>
              <button type="button"
                onClick={() => setFormData((d) => ({ ...d, status: "published", isPublic: false }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border text-xs uppercase tracking-[0.2em] font-mono transition-colors ${
                  formData.status === "published" && !formData.isPublic
                    ? "border-foreground/40 text-foreground bg-muted/40"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40"
                }`}>
                <EyeOff className="h-3.5 w-3.5" /> Private
              </button>
            </div>
          </FormSection>
        </AdminFormShell>

        {/* ── Entry list ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Saved entries</p>
              <p className="text-sm text-muted-foreground">
                {logs.length} total · {logs.filter((l) => l.status === "draft").length} drafts
              </p>
            </div>
            {editingId && <Button variant="ghost" size="sm" onClick={resetForm}>Cancel edit</Button>}
          </div>

          {logs.length === 0 ? (
            <div className="saber-card p-6 text-center text-muted-foreground text-sm">No entries yet.</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const mood = MOOD_OPTIONS.find((m) => m.value === log.mood);
                return (
                  <article key={log.id} className="saber-card p-4">
                    {log.thumbnailUrl && (
                      <img src={log.thumbnailUrl} alt="" className="h-20 w-full object-cover rounded-md mb-3 border border-border/60" />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-[10px] font-mono text-muted-foreground">{formatDisplayDate(log.logDate)}</p>
                          <span className="text-xs">{mood?.emoji}</span>
                          {log.status === "draft" && (
                            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400 border border-amber-500/30 px-1 rounded">Draft</span>
                          )}
                          {!log.isPublic && log.status !== "draft" && (
                            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted-foreground border border-border/40 px-1 rounded">Private</span>
                          )}
                        </div>
                        <p className="text-sm font-semibold line-clamp-1">{log.title}</p>
                        {log.tags.length > 0 && (
                          <p className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">
                            {log.tags.slice(0, 4).join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(log)}>
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(log.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDevLog;
