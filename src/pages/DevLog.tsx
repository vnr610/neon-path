import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { EmptyState } from "@/components/saber/EmptyState";
import { BookOpen, ArrowRight, Search, Clock, X, Tag } from "lucide-react";
import { loadDevLogs, type DevLog, type DevLogMood } from "@/lib/content";

const MOOD_META: Record<DevLogMood, { emoji: string; label: string }> = {
  focused:      { emoji: "🎯", label: "Focused" },
  productive:   { emoji: "⚡", label: "Productive" },
  learning:     { emoji: "📚", label: "Learning" },
  struggling:   { emoji: "🔥", label: "Struggling" },
  breakthrough: { emoji: "💡", label: "Breakthrough" },
  tired:        { emoji: "😴", label: "Tired" },
};

function formatLogDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function contentPreview(log: DevLog, maxLen = 140): string {
  const base = log.excerpt?.trim() || log.content;
  const text = base.replace(/[#*`\[\]]/g, "").replace(/\s+/g, " ").trim();
  return text.length <= maxLen ? text : text.slice(0, maxLen) + "…";
}

const PAGE_SIZE = 6;

const DevLogPage = () => {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadDevLogs(true).then((data) => { setLogs(data); setLoading(false); });
  }, []);

  useEffect(() => { setPage(1); }, [query, activeTag]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    let result = logs;
    if (activeTag) result = result.filter((l) => l.tags.includes(activeTag));
    if (!query.trim()) return result;
    const q = query.toLowerCase();
    return result.filter((l) =>
      l.title.toLowerCase().includes(q) ||
      l.excerpt?.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [logs, query, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const entryHref = (log: DevLog) =>
    log.slug ? `/devlog/${log.slug}` : `/devlog/${log.id}`;

  return (
    <SiteLayout>
      <SEO
        title="Dev Diary"
        description="Daily logs of coding practice, learning, and progress on the path."
        path="/devlog"
      />
      <div className="container py-16 max-w-7xl">
        <PageHeader title="Dev Diary" subtitle="Daily logs — what I coded, learned, and practiced. Raw and honest." />

        {/* Search */}
        {logs.length > 0 && (
          <div className="mb-6 space-y-3 animate-fade-up opacity-0" style={{ animationDelay: "0.05s" }}>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entries…"
                className="w-full rounded-md border border-border/60 bg-background/60 pl-9 pr-9 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors" />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
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
          <div className="grid gap-8 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <div key={i} className="saber-card aspect-[3/2] animate-pulse bg-muted/20" />)}
          </div>
        ) : filtered.length === 0 ? (
          query || activeTag ? (
            <div className="saber-card p-10 text-center">
              <p className="text-muted-foreground text-sm">No entries match your filter.</p>
              <button onClick={() => { setQuery(""); setActiveTag(null); }}
                className="mt-3 text-xs text-saber-blue hover:underline">Clear filters</button>
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No diary entries yet"
              description="Daily logs will appear here as they're written."
              hint="Every day is worth documenting." status="diary :: blank" />
          )
        ) : (
          <>
            {(query || activeTag) && (
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              {paginated.map((log, i) => {
                const mood = MOOD_META[log.mood];
                return (
                  <article key={log.id}
                    className="saber-card overflow-hidden group flex flex-col animate-fade-up opacity-0 hover:-translate-y-1 transition-transform duration-300"
                    style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
                    {log.thumbnailUrl ? (
                      <Link to={entryHref(log)} className="block">
                        <img src={log.thumbnailUrl} alt=""
                          className="aspect-[21/9] w-full object-cover border-b border-border/50 group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                    ) : (
                      <div className="aspect-[21/9] w-full border-b border-border/50 bg-muted/30 flex items-center justify-center">
                        <span className="text-3xl opacity-40">{mood.emoji}</span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-muted-foreground">
                        <time dateTime={log.logDate}>{formatLogDate(log.logDate)}</time>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                            <Clock className="h-3 w-3" />
                            {estimateReadTime(log.content)} min read
                          </span>
                          <span title={mood.label}>{mood.emoji}</span>
                        </div>
                      </div>

                      <h2 className="text-xl font-semibold mb-2">
                        <Link to={entryHref(log)}
                          className="hover:text-saber-blue transition-colors inline-flex items-center gap-2">
                          {log.title}
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </h2>

                      <p className="text-muted-foreground text-sm flex-1">{contentPreview(log)}</p>

                      {log.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {log.tags.slice(0, 4).map((tag) => (
                            <button key={tag} onClick={() => setActiveTag(tag)}
                              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors">
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-5">
                        <Link to={entryHref(log)}
                          className="text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline inline-flex items-center gap-2">
                          Read entry <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-md border text-xs font-mono transition-colors ${
                      p === page ? "border-foreground/60 text-foreground bg-foreground/10" : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}>{p}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
};

export default DevLogPage;
