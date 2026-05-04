import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { EmptyState } from "@/components/saber/EmptyState";
import { BlogMarkdown } from "@/components/saber/BlogMarkdown";
import { BookOpen, ChevronDown, ChevronUp, Tag, Calendar } from "lucide-react";
import { loadDevLogs, type DevLog, type DevLogMood } from "@/lib/content";

const MOOD_META: Record<DevLogMood, { emoji: string; label: string; color: string }> = {
  focused:      { emoji: "🎯", label: "Focused",      color: "text-saber-blue" },
  productive:   { emoji: "⚡", label: "Productive",   color: "text-green-400" },
  learning:     { emoji: "📚", label: "Learning",     color: "text-amber-400" },
  struggling:   { emoji: "🔥", label: "Struggling",   color: "text-orange-400" },
  breakthrough: { emoji: "💡", label: "Breakthrough", color: "text-saber-purple" },
  tired:        { emoji: "😴", label: "Tired",        color: "text-muted-foreground" },
};

function formatLogDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function LogEntry({ log }: { log: DevLog }) {
  const [expanded, setExpanded] = useState(false);
  const mood = MOOD_META[log.mood] ?? MOOD_META.focused;
  const preview = log.content.split("\n").slice(0, 3).join("\n");
  const hasMore = log.content.split("\n").length > 3;

  return (
    <article className="saber-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={log.logDate}>{formatLogDate(log.logDate)}</time>
          </div>
          <span className={`text-sm ${mood.color} shrink-0`} title={mood.label}>
            {mood.emoji} {mood.label}
          </span>
        </div>

        <h2 className="font-display text-lg font-semibold mb-3">{log.title}</h2>

        {log.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {log.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <Tag className="h-2.5 w-2.5" />{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pb-2">
        <div className={`overflow-hidden transition-all duration-300 ${expanded ? "" : "max-h-40"}`}>
          <BlogMarkdown>{expanded ? log.content : preview}</BlogMarkdown>
        </div>
      </div>

      {/* Expand toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground border-t border-border/40 transition-colors"
        >
          {expanded ? <><ChevronUp className="h-3.5 w-3.5" />Show less</> : <><ChevronDown className="h-3.5 w-3.5" />Read more</>}
        </button>
      )}
    </article>
  );
}

const DevLogPage = () => {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeMood, setActiveMood] = useState<DevLogMood | null>(null);

  useEffect(() => {
    loadDevLogs(true).then((data) => { setLogs(data); setLoading(false); });
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (activeTag && !l.tags.includes(activeTag)) return false;
      if (activeMood && l.mood !== activeMood) return false;
      return true;
    });
  }, [logs, activeTag, activeMood]);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, DevLog[]>();
    for (const log of filtered) {
      const key = log.logDate.slice(0, 7); // YYYY-MM
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    }
    return Array.from(map.entries()).map(([month, items]) => ({
      month,
      label: new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      items,
    }));
  }, [filtered]);

  return (
    <SiteLayout>
      <SEO
        title="Dev Diary"
        description="Daily logs of coding practice, learning, and progress on the path."
        path="/devlog"
      />
      <div className="container py-16 max-w-3xl">
        <PageHeader
          title="Dev Diary"
          subtitle="Daily logs — what I coded, learned, and practiced. Raw and honest."
        />

        {/* Filters */}
        {!loading && logs.length > 0 && (
          <div className="space-y-3 mb-8">
            {/* Mood filter */}
            <div className="flex flex-wrap gap-2">
              {(Object.entries(MOOD_META) as [DevLogMood, typeof MOOD_META[DevLogMood]][]).map(([mood, meta]) => {
                const count = logs.filter((l) => l.mood === mood).length;
                if (count === 0) return null;
                return (
                  <button key={mood} onClick={() => setActiveMood(activeMood === mood ? null : mood)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${
                      activeMood === mood
                        ? `border-current ${meta.color} bg-current/10`
                        : "border-border/60 text-muted-foreground hover:border-foreground/40"
                    }`}>
                    {meta.emoji} {meta.label}
                    <span className="opacity-50">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] uppercase tracking-[0.25em] font-mono transition-colors ${
                      activeTag === tag
                        ? "border-saber-blue text-saber-blue bg-saber-blue/10"
                        : "border-border/60 text-muted-foreground hover:border-foreground/40"
                    }`}>
                    <Tag className="h-2.5 w-2.5" />{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => <div key={i} className="saber-card h-40 animate-pulse bg-muted/20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No diary entries yet"
            description="Daily logs will appear here as they're written."
            hint="Every day is worth documenting."
            status="diary :: blank"
          />
        ) : (
          <div className="space-y-10">
            {grouped.map(({ month, label, items }) => (
              <section key={month}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="h-px flex-1 bg-border/40" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/60 shrink-0">
                    {label}
                  </p>
                  <span className="h-px flex-1 bg-border/40" />
                </div>
                <div className="space-y-4">
                  {items.map((log) => <LogEntry key={log.id} log={log} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default DevLogPage;
