import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Clock, Eye, User, ArrowUp, Github, Linkedin, Twitter, Pencil } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BlogPostBody } from "@/components/saber/BlogPostBody";
import { SEO } from "@/components/saber/SEO";
import { ReadingProgress } from "@/components/saber/ReadingProgress";
import { TableOfContents, extractTocFromMarkdown, extractTocFromHtml, type TocItem } from "@/components/saber/TableOfContents";
import { ShareButtons } from "@/components/saber/ShareButtons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  loadBlogPostBySlug,
  loadBlogNeighborsBySlug,
  loadBlogPosts,
  incrementBlogPostViews,
  loadBlogPostViews,
  loadSiteHome,
  estimateReadTime,
  type BlogPost,
  type BlogNeighbor,
  type SiteHomeSettings,
  formatDate,
} from "@/lib/content";

const BlogArticleView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "editor";
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [neighbors, setNeighbors] = useState<{ older: BlogNeighbor | null; newer: BlogNeighbor | null } | null>(null);
  const [views, setViews] = useState<number | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [siteProfile, setSiteProfile] = useState<SiteHomeSettings | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
        // Load related posts by shared tags
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

  // JSON-LD structured data
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

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Reading progress bar */}
      <ReadingProgress />

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full saber-border bg-background/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-saber-blue hover:shadow-glow-blue transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      <div className="container py-16">
        {/* Layout: article + sticky ToC sidebar */}
        <div className="flex gap-12 items-start max-w-6xl mx-auto">

          {/* ── Main article ── */}
          <article className="flex-1 min-w-0 max-w-3xl">
            <div className="mb-8 flex items-center justify-between animate-fade-in opacity-0" style={{ animationDelay: "0.05s" }}>
              <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-saber-blue">
                <Link to="/writeups"><ArrowLeft className="h-4 w-4 mr-2" />All writeups</Link>
              </Button>
              {canEdit && post && (
                <Button asChild variant="outline" size="sm" className="saber-border text-saber-blue border-saber-blue/40 hover:bg-saber-blue/10 gap-1.5">
                  <Link to={`/admin/writeups?edit=${post.slug}`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit post
                  </Link>
                </Button>
              )}
            </div>

            <header className="mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
              {post.thumbnailUrl && (
                <img
                  src={post.thumbnailUrl}
                  alt={post.title}
                  className="w-full aspect-[16/8] object-cover rounded-lg border border-border/60 mb-7"
                />
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

            {/* Share + nav */}
            <div className="mt-12 pt-8 border-t border-border/60 flex items-center justify-between flex-wrap gap-4">
              <ShareButtons title={post.title} url={shareUrl} />
              <span className="font-mono text-[9px] text-muted-foreground/30 uppercase tracking-[0.24em]">
                {formatDate(post.createdAt)}
              </span>
            </div>

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

            {/* ── AUTHOR CARD ── */}
            <div className="mt-12 saber-card p-6 flex gap-5 items-start">
              {siteProfile?.avatarUrl ? (
                <img
                  src={siteProfile.avatarUrl}
                  alt={authorName}
                  className="h-14 w-14 rounded-full border border-border/60 object-cover shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-full saber-border flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">Written by</p>
                <p className="font-display text-base font-semibold">{authorName}</p>
                {siteProfile?.bio && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3">{siteProfile.bio}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {siteProfile?.githubUsername && (
                    <a href={`https://github.com/${siteProfile.githubUsername}`} target="_blank" rel="noopener noreferrer"
                      className="h-7 w-7 rounded saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="GitHub">
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {siteProfile?.twitterUrl && (
                    <a href={siteProfile.twitterUrl} target="_blank" rel="noopener noreferrer"
                      className="h-7 w-7 rounded saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Twitter / X">
                      <Twitter className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {siteProfile?.linkedinUrl && (
                    <a href={siteProfile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="h-7 w-7 rounded saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="LinkedIn">
                      <Linkedin className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── RELATED POSTS ── */}
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

          {/* ── Sticky ToC sidebar ── */}
          {toc.length >= 2 && (
            <aside className="hidden xl:block w-56 shrink-0 sticky top-24 self-start">
              <div className="saber-card p-4">
                <TableOfContents items={toc} />
              </div>
            </aside>
          )}
        </div>
      </div>
    </SiteLayout>
  );
};

export default BlogArticleView;
