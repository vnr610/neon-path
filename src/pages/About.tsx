import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { Button } from "@/components/ui/button";
import { Download, Github, Linkedin, Twitter, User } from "lucide-react";
import { loadSiteHome, type SiteHomeSettings } from "@/lib/content";

const About = () => {
  const [site, setSite] = useState<SiteHomeSettings | null>(null);

  useEffect(() => {
    loadSiteHome().then(setSite);
  }, []);

  const githubUrl = site?.githubUsername
    ? `https://github.com/${site.githubUsername.replace(/^@/, "").trim()}`
    : null;

  return (
    <SiteLayout>
      <SEO
        title="About"
        description="The path, the discipline, the philosophy — about VNR610."
        path="/about"
      />
      <div className="container py-16 max-w-4xl">
        <PageHeader title="About" subtitle="The path, the discipline, the philosophy." />

        <div className="grid md:grid-cols-[220px_1fr] gap-10">

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            {/* Avatar */}
            <div className="aspect-square saber-card flex items-center justify-center overflow-hidden rounded-lg">
              {site?.avatarUrl ? (
                <img
                  src={site.avatarUrl}
                  alt="VNR610 avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-muted-foreground/20" strokeWidth={1} />
              )}
            </div>

            {/* Meta */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Handle</p>
                <p className="font-display text-sm mt-0.5">VNR610</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Realm</p>
                <p className="font-mono text-xs text-saber-blue mt-0.5">Full Stack · Cybersec</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Location</p>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">Nepal · Asia/Kathmandu</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                <p className="text-sm font-mono mt-0.5">
                  <span className="text-saber-blue animate-pulse">●</span> Forging the path
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-2">
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.linkedinUrl && (
                <a
                  href={site.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.twitterUrl && (
                <a
                  href={site.twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter / X"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {/* CV download */}
            {site?.resumeUrl ? (
              <Button
                asChild
                size="sm"
                className="w-full bg-gradient-saber hover:opacity-90 text-primary-foreground border-0"
              >
                <a href={site.resumeUrl} target="_blank" rel="noreferrer" download>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Download CV
                </a>
              </Button>
            ) : (
              <div className="rounded-md border border-dashed border-border/60 px-3 py-2.5 text-center">
                <Download className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground/40 font-mono leading-snug">
                  CV not set.<br />
                  <span className="text-muted-foreground/60">Admin → Home → Resume URL</span>
                </p>
              </div>
            )}
          </div>

          {/* ── Bio ── */}
          <div className="space-y-6">
            <div className="saber-card p-8 sm:p-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-saber-blue mb-4">// bio.md</p>

              {site?.bio ? (
                <div className="space-y-4">
                  {site.bio.split("\n\n").map((para, i) => (
                    <p key={i} className="text-foreground/85 leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed italic">
                  Bio content awaits inscription. Go to{" "}
                  <span className="text-foreground/60 not-italic">Admin → Home → Bio</span>{" "}
                  to write your story.
                </p>
              )}
            </div>

            {/* Skills snapshot */}
            <div className="saber-card p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">
                // current · focus
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Full Stack Development",
                  "Cybersecurity",
                  "Penetration Testing",
                  "React / TypeScript",
                  "Node.js",
                  "CTF Challenges",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 px-3 py-1 text-xs font-mono text-muted-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default About;
