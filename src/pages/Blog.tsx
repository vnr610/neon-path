import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { SEO } from "@/components/saber/SEO";
import {
  BookOpen, ArrowRight, Search, Clock, X, Pencil,
  Plus, Check, Loader2, Wand2, FileText, Tag, Sparkles,
} from "lucide-react";
import {
  loadBlogPosts, addBlogPost, slugify,
  type BlogPost, formatDate, blogContentPreview, estimateReadTime,
} from "@/lib/content";
import { useAuth } from "@/hooks/useAuth";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 6;

// Common CTF/security categories for quick filtering
const CATEGORY_FILTERS = [
  { label: "All", value: null },
  { label: "CTF", value: "ctf" },
  { label: "Web", value: "web" },
  { label: "Reverse", value: "reverse" },
  { label: "Pwn", value: "pwn" },
  { label: "OSINT", value: "osint" },
  { label: "Crypto", value: "crypto" },
  { label: "Forensics", value: "forensics" },
  { label: "Misc", value: "misc" },
  { label: "Fullstack", value: "fullstack" },
  { label: "DevLog", value: "devlog" },
];

type NewDraft = {
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  content: string;
  tags: string;
};

const blankDraft: NewDraft = {
  title: "",
  slug: "",
  author: "",
  excerpt: "",
  content: "",
  tags: "",
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const navigate = useNavigate();
  const ai = useAiBlogAssist();

  /* ── New post inline form ── */
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState<NewDraft>(blankDraft);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<NewDraft>>({});

  useEffect(() => {
    loadBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => { setPage(1); }, [query, activeCategory]);

  /* Auto-generate slug from title */
  useEffect(() => {
    if (draft.title && !draft.slug) {
      setDraft((d) => ({ ...d, slug: slugify(d.title) }));
    }
  }, [draft.title]);

  const filtered = useMemo(() => {
    let result = posts;
    if (activeCategory) {
      result = result.filter((p) =>
        p.tags.some((t) => t.toLowerCase() === activeCategory.toLowerCase())
      );
    }
    if (!query.trim()) return result;
    const q = query.toLowerCase();
    return result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [posts, query, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Compose handlers ── */
  const startComposing = () => {
    setDraft(blankDraft);
    setSaveError(null);
    setErrors({});
    setComposing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const discardComposing = () => {
    setComposing(false);
    setDraft(blankDraft);
    setSaveError(null);
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Partial<NewDraft> = {};
    if (!draft.title.trim()) e.title = "Title is required";
    if (!draft.content.trim()) e.content = "Content is required";
    const slug = draft.slug.trim() || slugify(draft.title.trim());
    if (!slug) e.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) e.slug = "Lowercase letters, numbers and hyphens only";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const publishPost = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const slug = draft.slug.trim() || slugify(draft.title.trim());
    const created = await addBlogPost({
      title: draft.title.trim(),
      slug,
      excerpt: draft.excerpt.trim(),
      content: draft.content.trim(),
      tags,
      contentFormat: "markdown",
      author: draft.author.trim() || undefined,
    });
    setSaving(false);
    if (!created) {
      setSaveError("Publish failed. Check your connection and try again.");
      return;
    }
    // Refresh list and navigate to the new post
    const updated = await loadBlogPosts();
    setPosts(updated);
    setComposing(false);
    setDraft(blankDraft);
    navigate(`/writeups/${created.slug}`);
  };

  /* ── AI helpers ── */
  const aiGenerate = async () => {
    if (!draft.title.trim()) { setErrors({ title: "Add a title first" }); return; }
    const result = await ai.run({ action: "generate", title: draft.title, tags: draft.tags });
    if (result) setDraft((d) => ({ ...d, content: result }));
  };

  const aiEnhance = async () => {
    if (!draft.content.trim()) return;
    const result = await ai.run({ action: "enhance", content: draft.content });
    if (result) setDraft((d) => ({ ...d, content: result }));
  };

  const aiSummarize = async () => {
    if (!draft.content.trim()) return;
    const result = await ai.run({ action: "summarize", title: draft.title, content: draft.content });
    if (result) setDraft((d) => ({ ...d, excerpt: result }));
  };

  const aiSlug = async () => {
    if (!draft.title.trim()) return;
    const result = await ai.run({ action: "suggest-slug", title: draft.title });
    if (result) {
      const clean = result.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      setDraft((d) => ({ ...d, slug: clean }));
    }
  };

  const aiTags = async () => {
    const result = await ai.run({ action: "suggest-tags", title: draft.title, content: draft.content });
    if (result) {
      const existing = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const suggested = result.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const merged = Array.from(new Set([...existing, ...suggested])).join(", ");
      setDraft((d) => ({ ...d, tags: merged }));
    }
  };

  /* ── Shared field style ── */
  const fieldCls = "w-full bg-background/40 border border-border/60 rounded-md px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/40";
  const errCls = "border-destructive/60 bg-destructive/5";

  return (
    <SiteLayout>
      <SEO
        title="Writeups"
        description="Field notes, deep dives, and lessons from the path — full stack and cybersecurity writeups."
        path="/writeups"
      />

      {/* ── INLINE COMPOSE MODE ── */}
      {composing ? (
        <div className="container py-10 max-w-4xl mx-auto">
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border/60 flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-saber-blue animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-saber-blue">New writeup</span>
              {saveError && <span className="text-xs text-destructive font-mono">{saveError}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={discardComposing} disabled={saving} className="text-muted-foreground gap-1.5">
                <X className="h-3.5 w-3.5" /> Discard
              </Button>
              <Button size="sm" onClick={publishPost} disabled={saving}
                className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Publishing…" : "Publish"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                <span className="text-foreground/40 mr-1.5">//</span>Title <span className="text-destructive ml-1">*</span>
              </label>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className={`${fieldCls} text-2xl font-display font-bold py-3 ${errors.title ? errCls : ""}`}
                placeholder="The title of your transmission"
                maxLength={120}
              />
              {errors.title && <p className="text-xs text-destructive font-mono">{errors.title}</p>}
            </div>

            {/* Slug + Author row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                    <span className="text-foreground/40 mr-1.5">//</span>Slug <span className="text-destructive ml-1">*</span>
                  </label>
                  <button onClick={aiSlug} disabled={ai.loading}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 disabled:opacity-40 transition-opacity">
                    {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI
                  </button>
                </div>
                <input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  className={`${fieldCls} ${errors.slug ? errCls : ""}`}
                  placeholder="auto-generated-from-title"
                />
                {errors.slug && <p className="text-xs text-destructive font-mono">{errors.slug}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Author <span className="text-muted-foreground/50 ml-1">optional</span>
                </label>
                <input
                  value={draft.author}
                  onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                  className={fieldCls}
                  placeholder="VNR610"
                  maxLength={80}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Excerpt <span className="text-muted-foreground/50 ml-1">optional</span>
                </label>
                <button onClick={aiSummarize} disabled={ai.loading}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 disabled:opacity-40 transition-opacity">
                  {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  AI summarize
                </button>
              </div>
              <textarea
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                rows={2}
                maxLength={240}
                className={`${fieldCls} resize-none`}
                placeholder="A single line that draws the reader in…"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Tags <span className="text-muted-foreground/50 ml-1">comma-separated</span>
                </label>
                <button onClick={aiTags} disabled={ai.loading}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 disabled:opacity-40 transition-opacity">
                  {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Tag className="h-3 w-3" />}
                  AI suggest
                </button>
              </div>
              <input
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                className={fieldCls}
                placeholder="security, ctf, web-exploitation"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Content (Markdown) <span className="text-destructive ml-1">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={aiGenerate} disabled={ai.loading}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 disabled:opacity-40 transition-opacity">
                    {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI generate
                  </button>
                  <button onClick={aiEnhance} disabled={ai.loading}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 disabled:opacity-40 transition-opacity">
                    {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    AI enhance
                  </button>
                </div>
              </div>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                rows={28}
                className={`${fieldCls} resize-y leading-relaxed ${errors.content ? errCls : ""}`}
                placeholder={"# Heading\n\nBegin the chronicle…\n\n```bash\necho 'hello'\n```"}
              />
              {errors.content && <p className="text-xs text-destructive font-mono">{errors.content}</p>}
            </div>

            {/* Bottom publish bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={discardComposing} disabled={saving} className="text-muted-foreground">
                Discard
              </Button>
              <Button size="sm" onClick={publishPost} disabled={saving}
                className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Publishing…" : "Publish writeup"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── LIST MODE ── */
        <div className="container py-16 max-w-7xl">
          {/* Header row with New Post button */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <PageHeader title="Writeups" subtitle="Field notes, deep dives, and lessons from the path." />
            {canEdit && (
              <Button
                onClick={startComposing}
                className="shrink-0 mt-1 bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue gap-1.5"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                New post
              </Button>
            )}
          </div>

          {/* Search bar */}
          {posts.length > 0 && (
            <div className="mb-6 space-y-4 animate-fade-up opacity-0" style={{ animationDelay: "0.05s" }}>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, tag…"
                  className="w-full rounded-md border border-border/60 bg-background/60 pl-9 pr-9 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
                />
                {query && (
                  <button onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                    aria-label="Clear search">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {/* Category filter pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.25em] font-mono border transition-colors ${
                      activeCategory === cat.value
                        ? "border-saber-blue text-saber-blue bg-saber-blue/10"
                        : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
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
                <button onClick={() => setQuery("")} className="mt-3 text-xs text-saber-blue hover:underline">Clear search</button>
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
                        <img src={post.thumbnailUrl} alt=""
                          className="aspect-[21/9] w-full object-cover border-b border-border/50" />
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
                        <Link to={`/writeups/${post.slug}`}
                          className="hover:text-saber-blue transition-colors inline-flex items-center gap-2">
                          {post.title}
                          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </Link>
                      </h2>
                      <p className="mt-3 text-muted-foreground text-sm">{blogContentPreview(post)}</p>
                      {post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.slice(0, 4).map((tag) => (
                            <button key={tag} onClick={() => setQuery(tag)}
                              className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors">
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="mt-5 flex items-center gap-3">
                        <Link to={`/writeups/${post.slug}`}
                          className="text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline inline-flex items-center gap-2">
                          Read writeup <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        {canEdit && (
                          <Link to={`/admin/writeups?edit=${post.slug}`}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground hover:text-saber-blue hover:border-saber-blue/40 transition-colors"
                            title="Edit this post">
                            <Pencil className="h-3 w-3" /> Edit
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
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 rounded-md border border-border/60 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-md border text-xs font-mono transition-colors ${
                        p === page ? "border-foreground/60 text-foreground bg-foreground/10" : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      }`}>
                      {p}
                    </button>
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
      )}
    </SiteLayout>
  );
};

export default Blog;
