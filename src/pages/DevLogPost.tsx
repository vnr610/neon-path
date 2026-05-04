import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, User, ArrowUp } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BlogPostBody } from "@/components/saber/BlogPostBody";
import { SEO } from "@/components/saber/SEO";
import { ReadingProgress } from "@/components/saber/ReadingProgress";
import { Button } from "@/components/ui/button";
import { loadDevLogBySlug, loadDevLogByDate, type DevLog, type DevLogMood } from "@/lib/content";

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
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const DevLogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [log, setLog] = useState<DevLog | null | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!slug) { setLog(null); return; }
    // Try slug first, then treat as date (YYYY-MM-DD), then as ID
    loadDevLogBySlug(slug).then((found) => {
      if (found) { setLog(found); return; }
      // Try as date
      if (/^\d{4}-\d{2}-\d{2}$/.test(slug)) {
        loadDevLogByDate(slug).then((byDate) => setLog(byDate));
      } else {
        setLog(null);
      }
    });
  }, [slug]);

  if (log === undefined) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-3xl">
          <p className="text-muted-foreground text-sm animate-pulse">Loading entry…</p>
        </div>
      </SiteLayout>
    );
  }

  if (!log) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-3xl space-y-6">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Entry not found</h1>
          <Button asChild variant="outline" className="saber-border">
            <Link to="/devlog"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dev Diary</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const mood = MOOD_META[log.mood];

  return (
    <SiteLayout>
      <SEO
        title={log.title}
        description={log.excerpt}
        image={log.thumbnailUrl}
        path={`/devlog/${log.slug || log.id}`}
        tags={log.tags}
      />
      <ReadingProgress />

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full saber-border bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-saber-blue hover:shadow-glow-blue transition-all"
          aria-label="Scroll to top">
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      <div className="container py-16 max-w-3xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground hover:text-saber-blue animate-fade-in opacity-0" style={{ animationDelay: "0.05s" }}>
          <Link to="/devlog"><ArrowLeft className="h-4 w-4 mr-2" />All entries</Link>
        </Button>

        <article>
          <header className="mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
            {log.thumbnailUrl && (
              <img src={log.thumbnailUrl} alt={log.title}
                className="w-full aspect-[16/8] object-cover rounded-lg border border-border/60 mb-7" />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
              <time dateTime={log.logDate}>{formatLogDate(log.logDate)}</time>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3" />
                  {Math.max(1, Math.ceil(log.content.split(/\s+/).length / 200))} min read
                </span>
                <span title={mood.label} className="text-base">{mood.emoji}</span>
                <span className="text-xs text-muted-foreground/60">{mood.label}</span>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold">{log.title}</h1>

            {log.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{log.excerpt}</p>
            )}

            {log.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {log.tags.map((tag) => (
                  <Link key={tag} to={`/devlog?tag=${tag}`}
                    className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {log.author && (
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{log.author}</span>
              </div>
            )}
          </header>

          <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
            <BlogPostBody content={log.content} contentFormat={log.contentFormat} />
          </div>

          <div className="mt-12 pt-8 border-t border-border/60">
            <Button asChild variant="outline" className="saber-border">
              <Link to="/devlog"><ArrowLeft className="h-4 w-4 mr-2" />Back to Dev Diary</Link>
            </Button>
          </div>
        </article>
      </div>
    </SiteLayout>
  );
};

export default DevLogPost;
