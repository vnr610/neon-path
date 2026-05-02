import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { GitCommitVertical } from "lucide-react";

const Timeline = () => {
  return (
    <SiteLayout>
      <div className="container py-16 max-w-4xl">
        <PageHeader title="Progress Timeline" subtitle="The chronological journey — every milestone, ignited." />

        <div className="relative">
          {/* Saber spine */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-saber-blue/0 via-saber-blue/50 to-saber-purple/0 shadow-[0_0_8px_hsl(var(--saber-blue)/0.6)]" />

          <div className="pl-12">
            <EmptyState
              icon={GitCommitVertical}
              title="No timeline entries yet"
              description="Each new milestone will be plotted along the saber spine with date, realm, and description."
            />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Timeline;
