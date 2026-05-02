import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { BookOpen } from "lucide-react";

const Blog = () => {
  return (
    <SiteLayout>
      <div className="container py-16 max-w-4xl">
        <PageHeader title="Blog" subtitle="Field notes, deep dives, and lessons from the path." />
        <EmptyState
          icon={BookOpen}
          title="No posts published"
          description="Future writings on full stack engineering and cybersecurity will appear here in chronological order."
          glow="purple"
        />
      </div>
    </SiteLayout>
  );
};

export default Blog;
