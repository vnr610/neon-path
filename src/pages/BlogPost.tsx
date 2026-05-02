import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { BlogPostBody } from "@/components/saber/BlogPostBody";
import { Button } from "@/components/ui/button";
import {
  loadBlogPostBySlug,
  loadBlogNeighborsBySlug,
  type BlogPost,
  type BlogNeighbor,
  formatDate,
} from "@/lib/content";

const BlogArticleView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [neighbors, setNeighbors] = useState<{ older: BlogNeighbor | null; newer: BlogNeighbor | null } | null>(null);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setNeighbors(null);
      return;
    }
    let cancelled = false;
    Promise.all([loadBlogPostBySlug(slug), loadBlogNeighborsBySlug(slug)]).then(([p, n]) => {
      if (!cancelled) {
        setPost(p);
        setNeighbors(n);
      }
    });
    return () => {
      cancelled = true;
    };
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
            <Link to="/writeups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to writeups
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="container py-16 max-w-5xl">
        <Button asChild variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground hover:text-saber-blue animate-fade-in opacity-0" style={{ animationDelay: "0.05s" }}>
          <Link to="/writeups">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All writeups
          </Link>
        </Button>

        <header className="mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          {post.thumbnailUrl ? (
            <img src={post.thumbnailUrl} alt="" className="w-full aspect-[16/8] object-cover rounded-lg border border-border/60 mb-7" />
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            <span className="font-mono tracking-[0.24em]">/{post.slug}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">{post.title}</h1>
          {(post.excerpt || post.tags.length > 0) && (
            <div className="mt-6 space-y-4">
              {post.excerpt ? <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p> : null}
              {post.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </header>

        <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
          <BlogPostBody content={post.content} contentFormat={post.contentFormat} />
        </div>

        {neighbors && (neighbors.older || neighbors.newer) && (
          <nav
            className="mt-16 pt-10 border-t border-border/60 grid gap-4 sm:grid-cols-2"
            aria-label="Adjacent writeups"
          >
            <div className="min-w-0">
              {neighbors.older ? (
                <Button
                  asChild
                  variant="outline"
                  className="saber-border h-auto w-full py-4 px-4 flex flex-col items-stretch gap-1 whitespace-normal"
                >
                  <Link to={`/writeups/${neighbors.older.slug}`}>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Older
                    </span>
                    <span className="font-display text-sm font-medium text-left line-clamp-2">{neighbors.older.title}</span>
                  </Link>
                </Button>
              ) : (
                <div />
              )}
            </div>
            <div className="min-w-0 sm:text-right">
              {neighbors.newer ? (
                <Button
                  asChild
                  variant="outline"
                  className="saber-border h-auto w-full py-4 px-4 flex flex-col items-stretch gap-1 whitespace-normal sm:items-end"
                >
                  <Link to={`/writeups/${neighbors.newer.slug}`}>
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground sm:flex-row-reverse">
                      Newer
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-display text-sm font-medium text-right line-clamp-2">{neighbors.newer.title}</span>
                  </Link>
                </Button>
              ) : null}
            </div>
          </nav>
        )}
      </article>
    </SiteLayout>
  );
};

export default BlogArticleView;
