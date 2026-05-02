import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { BookOpen } from "lucide-react";
import { loadBlogPosts, type BlogPost, formatDate } from "@/lib/content";

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
      <div className="container py-16 max-w-4xl">
        <PageHeader title="Blog" subtitle="Field notes, deep dives, and lessons from the path." />

        {posts.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No posts published"
            description="Future writings on full stack engineering and cybersecurity will appear here in chronological order."
            hint="Writing is thinking in slow motion."
            status="journal :: blank page"
          />
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="saber-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-sm text-muted-foreground">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="font-mono tracking-[0.24em]">/{post.slug}</span>
                </div>
                <h2 className="text-2xl font-semibold">{post.title}</h2>
                <p className="mt-4 text-muted-foreground">{post.excerpt || post.content.slice(0, 140) + "..."}</p>
                {post.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Blog;
