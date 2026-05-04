import { useEffect, useState, type FormEvent } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { FormField, FormSection, SaberInput, SaberTextarea } from "@/components/saber/FormField";
import { AdminFormShell, type FormStatus } from "@/components/saber/AdminFormShell";
import {
  Edit3, Trash2, Eye, EyeOff, Sparkles, Wand2, FileText, Loader2, BookOpen,
} from "lucide-react";
import {
  loadDevLogs, upsertDevLog, deleteDevLog,
  type DevLog, type DevLogMood,
} from "@/lib/content";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";

const MOOD_OPTIONS: { value: DevLogMood; emoji: string; label: string }[] = [
  { value: "focused",      emoji: "🎯", label: "Focused" },
  { value: "productive",   emoji: "⚡", label: "Productive" },
  { value: "learning",     emoji: "📚", label: "Learning" },
  { value: "struggling",   emoji: "🔥", label: "Struggling" },
  { value: "breakthrough", emoji: "💡", label: "Breakthrough" },
  { value: "tired",        emoji: "😴", label: "Tired" },
];

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

const blankForm = {
  logDate: todayDate(),
  title: "",
  content: "",
  tags: "",
  mood: "focused" as DevLogMood,
  isPublic: true,
};

const AdminDevLog = () => {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(blankForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [errors, setErrors] = useState<string[]>([]);
  const ai = useAiBlogAssist();

  const load = async () => {
    const data = await loadDevLogs(false); // load all including private
    setLogs(data);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditingId(null);
    setFormData({ ...blankForm, logDate: todayDate() });
    setStatus("idle");
    setStatusMessage(undefined);
    setErrors([]);
  };

  const handleEdit = (log: DevLog) => {
    setEditingId(log.id);
    setFormData({
      logDate: log.logDate,
      title: log.title,
      content: log.content,
      tags: log.tags.join(", "),
      mood: log.mood,
      isPublic: log.isPublic,
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrors([]);

    const title = formData.title.trim();
    const content = formData.content.trim();
    const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (!title) { setErrors(["Title is required."]); setStatus("error"); return; }
    if (!content) { setErrors(["Content is required."]); setStatus("error"); return; }

    const saved = await upsertDevLog({
      logDate: formData.logDate,
      title,
      content,
      tags,
      mood: formData.mood,
      isPublic: formData.isPublic,
    });

    if (!saved) {
      setStatus("error");
      setErrors(["Save failed. Check your connection."]);
      return;
    }

    setStatus("success");
    setStatusMessage("Entry saved.");
    await load();
    resetForm();
  };

  // AI helpers
  const aiEnhance = async () => {
    if (!formData.content.trim()) return;
    setStatus("submitting"); setStatusMessage("AI is enhancing…");
    const result = await ai.run({ action: "enhance", content: formData.content });
    if (result) { setFormData((d) => ({ ...d, content: result })); setStatus("ready"); setStatusMessage("Enhanced — review before saving."); }
    else { setStatus("error"); setErrors([ai.error || "AI failed."]); }
  };

  const aiSummarize = async () => {
    if (!formData.content.trim()) return;
    setStatus("submitting"); setStatusMessage("AI is summarizing…");
    const result = await ai.run({ action: "summarize", title: formData.title, content: formData.content });
    if (result) { setFormData((d) => ({ ...d, title: result.slice(0, 100) })); setStatus("ready"); setStatusMessage("Title generated."); }
    else { setStatus("error"); setErrors([ai.error || "AI failed."]); }
  };

  const aiTags = async () => {
    setStatus("submitting"); setStatusMessage("AI is suggesting tags…");
    const result = await ai.run({ action: "suggest-tags", title: formData.title, content: formData.content });
    if (result) {
      const existing = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const suggested = result.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const merged = Array.from(new Set([...existing, ...suggested])).join(", ");
      setFormData((d) => ({ ...d, tags: merged }));
      setStatus("ready"); setStatusMessage("Tags suggested.");
    } else { setStatus("error"); setErrors([ai.error || "AI failed."]); }
  };

  return (
    <AdminLayout title="Dev Diary">
      <div className="grid gap-8 lg:grid-cols-[minmax(560px,1fr)_320px]">

        {/* ── Form ── */}
        <AdminFormShell
          eyebrow={editingId ? "edit entry" : "new entry"}
          title={editingId ? "Update Log" : "Today's Log"}
          description="Document what you coded, learned, and practiced today."
          submitLabel={editingId ? "Update Entry" : "Save Entry"}
          onSubmit={handleSubmit}
          onDiscard={resetForm}
          status={status}
          statusMessage={statusMessage}
          errors={errors}
        >
          <FormSection title="Entry">
            {/* Date */}
            <FormField id="logDate" label="Date" required>
              <SaberInput
                type="date"
                value={formData.logDate}
                onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
              />
            </FormField>

            {/* Title */}
            <FormField id="title" label="Title" required hint="What's the headline for today?">
              <div className="flex gap-2">
                <SaberInput
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Built auth flow, learned JWT internals…"
                  maxLength={120}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0"
                  onClick={aiSummarize} disabled={ai.loading} title="Generate title from content">
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>

            {/* Mood */}
            <FormField id="mood" label="Mood" required hint="How did today feel?">
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

            {/* Visibility */}
            <FormField id="isPublic" label="Visibility" required>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => setFormData({ ...formData, isPublic: true })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-mono transition-colors ${
                    formData.isPublic ? "border-green-500/60 text-green-400 bg-green-500/10" : "border-border/60 text-muted-foreground hover:border-foreground/40"
                  }`}>
                  <Eye className="h-3.5 w-3.5" /> Public
                </button>
                <button type="button"
                  onClick={() => setFormData({ ...formData, isPublic: false })}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-mono transition-colors ${
                    !formData.isPublic ? "border-amber-500/60 text-amber-400 bg-amber-500/10" : "border-border/60 text-muted-foreground hover:border-foreground/40"
                  }`}>
                  <EyeOff className="h-3.5 w-3.5" /> Private
                </button>
              </div>
            </FormField>
          </FormSection>

          <FormSection title="Content">
            {/* Tags */}
            <FormField id="tags" label="Tags" optional hint="Comma-separated — e.g. react, auth, debugging">
              <div className="flex gap-2">
                <SaberInput
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="react, supabase, ctf, python"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm"
                  className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 shrink-0"
                  onClick={aiTags} disabled={ai.loading}>
                  {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </FormField>

            {/* Content */}
            <FormField id="content" label="What did you do today?" required
              hint="Write in Markdown. Be honest — struggles count too.">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm"
                    className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                    onClick={aiEnhance} disabled={ai.loading}>
                    {ai.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                    AI enhance
                  </Button>
                </div>
                <SaberTextarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={16}
                  placeholder={"## What I built\n\n- Implemented JWT refresh logic\n- Fixed the CORS issue on the API\n\n## What I learned\n\nTokens expire for a reason...\n\n## Struggles\n\nSpent 2 hours on a missing semicolon 🤦"}
                />
              </div>
            </FormField>
          </FormSection>
        </AdminFormShell>

        {/* ── Log list ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Past entries</p>
              <p className="text-sm text-muted-foreground">{logs.length} total</p>
            </div>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>Cancel edit</Button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="saber-card p-6 text-center text-muted-foreground text-sm">
              No entries yet. Start today!
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const mood = MOOD_OPTIONS.find((m) => m.value === log.mood);
                return (
                  <article key={log.id} className="saber-card p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] font-mono text-muted-foreground">{formatDisplayDate(log.logDate)}</p>
                          <span className="text-xs">{mood?.emoji}</span>
                          {!log.isPublic && (
                            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400 border border-amber-500/30 px-1 rounded">Private</span>
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
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(log)}>
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
