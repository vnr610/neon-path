import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { Award } from "lucide-react";

const Certifications = () => {
  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Certifications" subtitle="Earned credentials and verified accomplishments." />
        <EmptyState
          icon={Award}
          title="No certifications recorded"
          description="Certificates will be displayed here as glowing seals with issuer, date, and verification link."
          glow="purple"
        />
      </div>
    </SiteLayout>
  );
};

export default Certifications;
