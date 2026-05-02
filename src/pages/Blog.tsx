import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { BookOpen, ArrowRight } from "lucide-react";
import { loadBlogPosts, type BlogPost, formatDate, blogContentPreview } from "@/lib/content";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await loadBlogPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <SiteLayout>
      <div className="container py-16 max-w-7xl">
        <PageHeader title="Writeups" subtitle="Field notes, deep dives, and lessons from the path." />

        {posts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No writeups published"
            description="Future writeups on full stack engineering and cybersecurity will appear here in chronological order."
            hint="Writing is thinking in slow motion."
            status="journal :: blank page"
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="saber-card overflow-hidden group flex flex-col">
                {post.thumbnailUrl ? (
                  <Link to={`/writeups/${post.slug}`} className="block">
                    <img src={post.thumbnailUrl} alt="" className="aspect-[21/9] w-full object-cover border-b border-border/50" />
                  </Link>
                ) : (
                  <div className="aspect-[21/9] w-full border-b border-border/50 bg-muted/30" />
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
                    <span>{formatDate(post.createdAt)}</span>
                    <span className="font-mono tracking-[0.24em]">/{post.slug}</span>
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
                        <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5">
                    <Link
                      to={`/writeups/${post.slug}`}
                      className="text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline inline-flex items-center gap-2"
                    >
                      Read writeup
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Blog;
