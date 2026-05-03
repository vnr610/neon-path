import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Clock, Eye,
  User, ArrowUp, Github, Linkedin, Twitter, Pencil, X, Check,
  Loader2, Sparkles, Wand2, FileText, Tag,
} from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BlogPostBody } from "@/components/saber/BlogPostBody";
import { SEO } from "@/components/saber/SEO";
import { ReadingProgress } from "@/components/saber/ReadingProgress";
import { TableOfContents, extractTocFromMarkdown, extractTocFromHtml, type TocItem } from "@/components/saber/TableOfContents";
import { ShareButtons } from "@/components/saber/ShareButtons";
import { NewsletterForm } from "@/components/saber/NewsletterForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAiBlogAssist } from "@/hooks/useAiBlogAssist";
import {
  loadBlogPostBySlug,
  loadBlogNeighborsBySlug,
  loadBlogPosts,
  incrementBlogPostViews,
  loadBlogPostViews,
  loadSiteHome,
  updateBlogPost,
  estimateReadTime,
  type BlogPost,
  type BlogNeighbor,
  type SiteHomeSettings,
  formatDate,
} from "@/lib/content";

/* ── Inline edit form state ── */
type EditDraft = {
  title: string;
  excerpt: string;
  content: string;
  tags: string;
  author: string;
};

const BlogArticleView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const ai = useAiBlogAssist();

  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [neighbors, setNeighbors] = useState<{ older: BlogNeighbor | null; newer: BlogNeighbor | null } | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [siteProfile, setSiteProfile] = useState<SiteHomeSettings | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  /* ── Edit mode state ── */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!slug) { setPost(null); setNeighbors(null); return; }
    let cancelled = false;
    Promise.all([
      loadBlogPostBySlug(slug),
      loadBlogNeighborsBySlug(slug),
      loadBlogPostViews(slug),
      loadSiteHome(),
    ]).then(([p, n, v, profile]) => {
      if (cancelled) return;
      setPost(p);
      setNeighbors(n);
      setViews(v);
      setSiteProfile(profile);
      if (p) {
        const items = p.contentFormat === "html"
          ? extractTocFromHtml(p.content)
          : extractTocFromMarkdown(p.content);
        setToc(items);
        if (p.tags.length > 0) {
          loadBlogPosts().then((all) => {
            if (cancelled) return;
            const rel = all
              .filter((other) => other.id !== p.id && other.tags.some((t) => p.tags.includes(t)))
              .slice(0, 3);
            setRelated(rel);
          });
        }
      }
    });
    incrementBlogPostViews(slug);
    return () => { cancelled = true; };
  }, [slug]);

  /* ── Edit mode handlers ── */
  const startEditing = () => {
    if (!post) return;
    setDraft({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      tags: post.tags.join(", "),
      author: post.author || "",
    });
    setSaveError(null);
    setSaveSuccess(false);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const discardEditing = () => {
    setEditing(false);
    setDraft(null);
    setSaveError(null);
  };

  const saveEditing = async () => {
    if (!post || !draft) return;
    setSaving(true);
    setSaveError(null);
    const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const updated = await updateBlogPost(post.id, {
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim(),
      content: draft.content.trim(),
      tags,
      author: draft.author.trim() || undefined,
    });
    setSaving(false);
    if (!updated) {
      setSaveError("Save failed. Check your connection and try again.");
      return;
    }
    setPost(updated);
    // Rebuild ToC from new content
    const items = updated.contentFormat === "html"
      ? extractTocFromHtml(updated.content)
      : extractTocFromMarkdown(updated.content);
    setToc(items);
    setSaveSuccess(true);
    setEditing(false);
    setDraft(null);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  /* ── AI helpers in edit mode ── */
  const aiSummarize = async () => {
    if (!draft) return;
    const result = await ai.run({ action: "summarize", title: draft.title, content: draft.content });
    if (result) setDraft((d) => d ? { ...d, excerpt: result } : d);
  };

  const aiTags = async () => {
    if (!draft) return;
    const result = await ai.run({ action: "suggest-tags", title: draft.title, content: draft.content });
    if (result) {
      const existing = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const suggested = result.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      const merged = Array.from(new Set([...existing, ...suggested])).join(", ");
      setDraft((d) => d ? { ...d, tags: merged } : d);
    }
  };

  const aiEnhance = async () => {
    if (!draft) return;
    const result = await ai.run({ action: "enhance", content: draft.content });
    if (result) setDraft((d) => d ? { ...d, content: result } : d);
  };

  /* ── Loading / not found states ── */
  if (post === undefined) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-5xl">
          <p className="text-muted-foreground text-sm animate-pulse">Loading writeup…</p>
        </div>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout>
        <div className="container py-24 max-w-5xl space-y-6">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold">Writeup not found</h1>
          <p className="text-muted-foreground">This slug does not match a published entry.</p>
          <Button asChild variant="outline" className="saber-border">
            <Link to="/writeups"><ArrowLeft className="h-4 w-4 mr-2" />Back to writeups</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const authorName = post.author || siteProfile?.focusTitle || "VNR610";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.thumbnailUrl || undefined,
    datePublished: post.createdAt,
    author: { "@type": "Person", name: authorName },
    keywords: post.tags.join(", "),
    url: shareUrl,
  };

  return (
    <SiteLayout>
      <SEO
        title={post.title}
        description={post.excerpt || undefined}
        image={post.thumbnailUrl}
        path={`/writeups/${post.slug}`}
        tags={post.tags}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ReadingProgress />

      {/* Scroll to top */}
      {showScrollTop && !editing && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full saber-border bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-saber-blue hover:shadow-glow-blue transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* ── INLINE EDIT MODE ── */}
      {editing && draft ? (
        <div className="container py-10 max-w-4xl mx-auto">
          {/* Edit toolbar */}
          <div className="sticky top-0 z-40 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border/60 flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-saber-blue animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-saber-blue">Edit mode</span>
              {saveError && (
                <span className="text-xs text-destructive font-mono">{saveError}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={discardEditing} disabled={saving} className="text-muted-foreground gap-1.5">
                <X className="h-3.5 w-3.5" /> Discard
              </Button>
              <Button size="sm" onClick={saveEditing} disabled={saving}
                className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                <span className="text-foreground/40 mr-1.5">//</span>Title
              </label>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full bg-background/40 border border-border/60 rounded-md px-4 py-3 font-display text-2xl font-bold focus:outline-none focus:border-foreground/40 transition-colors"
                placeholder="Post title"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                <span className="text-foreground/40 mr-1.5">//</span>Author <span className="text-muted-foreground/50 ml-1">optional</span>
              </label>
              <input
                value={draft.author}
                onChange={(e) => setDraft({ ...draft, author: e.target.value })}
                className="w-full bg-background/40 border border-border/60 rounded-md px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground/40 transition-colors"
                placeholder="VNR610"
                maxLength={80}
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Excerpt <span className="text-muted-foreground/50 ml-1">optional</span>
                </label>
                <button onClick={aiSummarize} disabled={ai.loading}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 transition-opacity disabled:opacity-40">
                  {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  AI summarize
                </button>
              </div>
              <textarea
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                rows={2}
                maxLength={240}
                className="w-full bg-background/40 border border-border/60 rounded-md px-4 py-2.5 text-sm font-mono resize-none focus:outline-none focus:border-foreground/40 transition-colors"
                placeholder="A short summary shown in post lists and meta tags…"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Tags <span className="text-muted-foreground/50 ml-1">comma-separated</span>
                </label>
                <button onClick={aiTags} disabled={ai.loading}
                  className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 transition-opacity disabled:opacity-40">
                  {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Tag className="h-3 w-3" />}
                  AI suggest
                </button>
              </div>
              <input
                value={draft.tags}
                onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                className="w-full bg-background/40 border border-border/60 rounded-md px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-foreground/40 transition-colors"
                placeholder="security, ctf, web"
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                  <span className="text-foreground/40 mr-1.5">//</span>Content (Markdown)
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={aiEnhance} disabled={ai.loading}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-saber-blue hover:opacity-80 transition-opacity disabled:opacity-40">
                    {ai.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    AI enhance
                  </button>
                </div>
              </div>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                rows={28}
                className="w-full bg-background/40 border border-border/60 rounded-md px-4 py-3 text-sm font-mono resize-y focus:outline-none focus:border-foreground/40 transition-colors leading-relaxed"
                placeholder={"# Heading\n\nBegin the chronicle…"}
              />
            </div>

            {/* Bottom save bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
              <Button variant="ghost" size="sm" onClick={discardEditing} disabled={saving} className="text-muted-foreground">
                Discard changes
              </Button>
              <Button size="sm" onClick={saveEditing} disabled={saving}
                className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── READ MODE ── */
        <div className="container py-16">
          <div className="flex gap-12 items-start max-w-6xl mx-auto">
            <article className="flex-1 min-w-0 max-w-3xl">

              {/* Top nav bar */}
              <div className="mb-8 flex items-center justify-between animate-fade-in opacity-0" style={{ animationDelay: "0.05s" }}>
                <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-saber-blue">
                  <Link to="/writeups"><ArrowLeft className="h-4 w-4 mr-2" />All writeups</Link>
                </Button>
                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-foreground/60">
                      <Check className="h-3.5 w-3.5 text-green-500" /> Saved
                    </span>
                  )}
                  {canEdit && (
                    <Button variant="outline" size="sm"
                      className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5"
                      onClick={startEditing}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit post
                    </Button>
                  )}
                </div>
              </div>

              <header className="mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
                {post.thumbnailUrl && (
                  <img src={post.thumbnailUrl} alt={post.title}
                    className="w-full aspect-[16/8] object-cover rounded-lg border border-border/60 mb-7" />
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
                  <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {estimateReadTime(post.content, post.contentFormat)} min read
                    </span>
                    {views !== null && (
                      <span className="flex items-center gap-1 text-xs">
                        <Eye className="h-3 w-3" />
                        {(views + 1).toLocaleString()} view{views + 1 !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="font-mono tracking-[0.24em] text-xs">/{post.slug}</span>
                  </div>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold">{post.title}</h1>
                {(post.excerpt || post.tags.length > 0) && (
                  <div className="mt-6 space-y-4">
                    {post.excerpt && (
                      <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </header>

              <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
                <BlogPostBody content={post.content} contentFormat={post.contentFormat} />
              </div>

              {/* Share + date */}
              <div className="mt-12 pt-8 border-t border-border/60 flex items-center justify-between flex-wrap gap-4">
                <ShareButtons title={post.title} url={shareUrl} />
                <span className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-[0.24em]">
                  {formatDate(post.createdAt)}
                </span>
              </div>

              {/* Newsletter CTA */}
              <div className="mt-8">
                <NewsletterForm variant="inline" />
              </div>

              {/* Prev / Next */}
              {neighbors && (neighbors.older || neighbors.newer) && (
                <nav className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Adjacent writeups">
                  <div className="min-w-0">
                    {neighbors.older ? (
                      <Button asChild variant="outline" className="saber-border h-auto w-full py-4 px-4 flex flex-col items-stretch gap-1 whitespace-normal">
                        <Link to={`/writeups/${neighbors.older.slug}`}>
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                            <ChevronLeft className="h-3.5 w-3.5" />Older
                          </span>
                          <span className="font-display text-sm font-medium text-left line-clamp-2">{neighbors.older.title}</span>
                        </Link>
                      </Button>
                    ) : <div />}
                  </div>
                  <div className="min-w-0 sm:text-right">
                    {neighbors.newer ? (
                      <Button asChild variant="outline" className="saber-border h-auto w-full py-4 px-4 flex flex-col items-stretch gap-1 whitespace-normal sm:items-end">
                        <Link to={`/writeups/${neighbors.newer.slug}`}>
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:flex-row-reverse">
                            Newer<ChevronRight className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-display text-sm font-medium text-right line-clamp-2">{neighbors.newer.title}</span>
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </nav>
              )}

              {/* Author card */}
              <div className="mt-12 saber-card p-6 flex gap-5 items-start">
                {siteProfile?.avatarUrl ? (
                  <img src={siteProfile.avatarUrl} alt={authorName}
                    className="h-14 w-14 rounded-full border border-border/60 object-cover shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-full saber-border flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Written by</p>
                  <p className="font-display text-base font-semibold">{authorName}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {siteProfile?.githubUsername && (
                      <a href={`https://github.com/${siteProfile.githubUsername}`} target="_blank" rel="noopener noreferrer"
                        className="h-7 w-7 rounded saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                        <Github className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {siteProfile?.twitterUrl && (
                      <a href={siteProfile.twitterUrl} target="_blank" rel="noopener noreferrer"
                        className="h-7 w-7 rounded saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter / X">
                        <Twitter className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {siteProfile?.linkedinUrl && (
                      <a href={siteProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                        className="h-7 w-7 rounded saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" aria-label="LinkedIn">
                        <Linkedin className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div className="mt-12">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">Related writeups</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((rel) => (
                      <Link key={rel.id} to={`/writeups/${rel.slug}`}
                        className="saber-card p-5 group hover:-translate-y-0.5 transition-transform duration-200">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground mb-2">{formatDate(rel.createdAt)}</p>
                        <h4 className="font-display text-sm font-semibold group-hover:text-saber-blue transition-colors line-clamp-2">{rel.title}</h4>
                        {rel.excerpt && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{rel.excerpt}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sticky ToC sidebar — hidden in edit mode */}
            {toc.length >= 2 && (
              <aside className="hidden xl:block w-56 shrink-0 sticky top-24 self-start">
                <div className="saber-card p-4">
                  <TableOfContents items={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>
      )}
    </SiteLayout>
  );
};

export default BlogArticleView;
