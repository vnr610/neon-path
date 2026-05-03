import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { SEO } from "@/components/saber/SEO";
import { BookOpen, ArrowRight, Search, Clock, X, Pencil } from "lucide-react";
import { loadBlogPosts, type BlogPost, formatDate, blogContentPreview, estimateReadTime } from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 6;

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";

  useEffect(() => {
    loadBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [query]);

  const filtered = useMemo(() => {
    if (!query.trim()) return posts;
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [posts, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <SiteLayout>
      <SEO
        title="Writeups"
        description="Field notes, deep dives, and lessons from the path — full stack and cybersecurity writeups."
        path="/writeups"
      />
      <div className="container py-16 max-w-7xl">
        <PageHeader title="Writeups" subtitle="Field notes, deep dives, and lessons from the path." />

        {/* Search bar */}
        {posts.length > 0 && (
          <div className="relative mb-8 max-w-md animate-fade-up opacity-0" style={{ animationDelay: "0.05s" }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, tag…"
              className="w-full rounded-md border border-border/60 bg-background/60 pl-9 pr-9 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid gap-8 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="saber-card aspect-[3/2] animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          query ? (
            <div className="saber-card p-10 text-center">
              <p className="text-muted-foreground text-sm">No writeups match <span className="text-foreground font-mono">"{query}"</span></p>
              <button onClick={() => setQuery("")} className="mt-3 text-xs text-saber-blue hover:underline">
                Clear search
              </button>
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No writeups published"
              description="Future writeups on full stack engineering and cybersecurity will appear here in chronological order."
              hint="Writing is thinking in slow motion."
              status="journal :: blank page"
            />
          )
        ) : (
          <>
            {query && (
              <p className="text-xs text-muted-foreground mb-4 font-mono">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
              </p>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              {paginated.map((post, i) => (
                <article
                  key={post.id}
                  className="saber-card overflow-hidden group flex flex-col animate-fade-up opacity-0 hover:-translate-y-1 transition-transform duration-300"
                  style={{ animationDelay: `${0.1 + i * 0.07}s` }}
                >
                  {post.thumbnailUrl ? (
                    <Link to={`/writeups/${post.slug}`} className="block">
                      <img
                        src={post.thumbnailUrl}
                        alt=""
                        className="aspect-[21/9] w-full object-cover border-b border-border/50"
                      />
                    </Link>
                  ) : (
                    <div className="aspect-[21/9] w-full border-b border-border/50 bg-muted/30" />
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
                      <span>{formatDate(post.createdAt)}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          {estimateReadTime(post.content, post.contentFormat)} min read
                        </span>
                        <span className="font-mono tracking-[0.24em] text-xs">/{post.slug}</span>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold">
                      <Link
                        to={`/writeups/${post.slug}`}
                        className="hover:text-saber-blue transition-colors inline-flex items-center gap-2"
                      >
                        {post.title}
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </h2>
                    <p className="mt-3 text-muted-foreground text-sm">{blogContentPreview(post)}</p>
                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setQuery(tag)}
                            className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-5 flex items-center gap-3">
                      <Link
                        to={`/writeups/${post.slug}`}
                        className="text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline inline-flex items-center gap-2"
                      >
                        Read writeup
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      {canEdit && (
                        <Link
                          to={`/admin/writeups?edit=${post.slug}`}
                          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground hover:text-saber-blue hover:border-saber-blue/40 transition-colors"
                          title="Edit this post"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded-md border text-xs font-mono transition-colors ${
                      p === page
                        ? "border-foreground/60 text-foreground bg-foreground/10"
                        : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
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

export default Blog;
