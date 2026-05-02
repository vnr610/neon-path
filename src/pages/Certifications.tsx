import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { Award } from "lucide-react";
import { loadCertifications, type Certification, formatDate } from "@/lib/content";

const Certifications = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);

  useEffect(() => {
    const fetchCertifications = async () => {
      const data = await loadCertifications();
      setCertifications(data);
    };
    fetchCertifications();
  }, []);

  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Certifications" subtitle="Earned credentials and verified accomplishments." />

        {certifications.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No certifications recorded"
            description="Certificates will be displayed here as glowing seals with issuer, date, and verification link."
            hint="Proof follows practice."
            status="vault :: 0 credentials"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {certifications.map((cert) => (
              <article key={cert.id} className="saber-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{cert.issuer}</p>
                    <h2 className="mt-2 text-xl font-semibold">{cert.name}</h2>
                  </div>
                  {cert.badge && (
                    <img src={cert.badge} alt={`${cert.name} badge`} className="h-14 w-14 rounded-md object-cover" />
                  )}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{formatDate(cert.date)}</span>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noreferrer" className="text-saber-blue hover:underline">
                      Verify
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Certifications;
