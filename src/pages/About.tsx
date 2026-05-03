import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyGlyph } from "@/components/saber/EmptyGlyph";
import { SEO } from "@/components/saber/SEO";
import { Button } from "@/components/ui/button";
import { Download, User } from "lucide-react";
import { loadSiteHome } from "@/lib/content";

const About = () => {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSiteHome().then((s) => setResumeUrl(s.resumeUrl ?? null));
  }, []);

  return (
    <SiteLayout>
      <SEO
        title="About"
        description="The path, the discipline, the philosophy — about VNR610."
        path="/about"
      />
      <div className="container py-16 max-w-4xl">
        <PageHeader title="About" subtitle="The path, the discipline, the philosophy." />

        <div className="grid md:grid-cols-[200px_1fr] gap-10">
          {/* Profile avatar */}
          <div>
            <div className="aspect-square saber-card flex items-center justify-center overflow-hidden">
              <EmptyGlyph icon={User} />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Handle</p>
              <p className="font-display text-sm">VNR610</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">Realm</p>
              <p className="font-mono text-xs text-saber-blue">Full Stack · Cybersec</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-3">Location</p>
              <p className="font-mono text-xs text-muted-foreground">Nepal · Asia/Kathmandu</p>

              {resumeUrl ? (
                <div className="pt-4">
                  <Button asChild size="sm" className="saber-border w-full bg-gradient-saber hover:opacity-90 text-primary-foreground border-0">
                    <a href={resumeUrl} target="_blank" rel="noreferrer" download>
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Download CV
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="pt-4">
                  <div className="rounded-md border border-dashed border-border/60 px-3 py-2.5 text-center">
                    <Download className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground/40 font-mono leading-snug">
                      CV not set.<br />
                      <span className="text-muted-foreground/60">Admin → Home → Resume URL</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <article className="prose prose-invert max-w-none">
            <div className="saber-card p-8 sm:p-10 space-y-4 not-prose">
              <p className="text-xs uppercase tracking-[0.3em] text-saber-blue mb-2">// bio.md</p>
              <p className="text-muted-foreground leading-relaxed italic">
                Bio content awaits inscription. This space will hold the story, the journey, and the
                guiding principles.
              </p>
              <div className="border-t border-border/60 pt-4 mt-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                <p className="text-sm font-mono mt-1">
                  <span className="text-saber-blue animate-pulse">●</span> Forging the path
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </SiteLayout>
  );
};

export default About;
