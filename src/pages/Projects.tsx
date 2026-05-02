import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { FolderGit2 } from "lucide-react";

const Projects = () => {
  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Projects" subtitle="Builds, experiments, and battle-tested artifacts from the workshop." />
        <EmptyState
          icon={FolderGit2}
          title="No projects in the vault"
          description="When projects are added they will appear here as illuminated cards with details, tech stack, and live links."
        />
      </div>
    </SiteLayout>
  );
};

export default Projects;
