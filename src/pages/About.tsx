import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { SEO } from "@/components/saber/SEO";
import { Button } from "@/components/ui/button";
import { Download, Github, Linkedin, Twitter, User } from "lucide-react";
import { loadSiteHome, type SiteHomeSettings } from "@/lib/content";

/* ── Platform SVG icons ── */
function HackTheBoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.996 0L3 4.8v9.6l8.996 4.8L21 14.4V4.8L11.996 0zm0 1.92l7.2 3.84v7.68l-7.2 3.84-7.2-3.84V5.76l7.2-3.84zm0 3.36L7.2 7.68v4.8l4.796 2.4 4.804-2.4V7.68L11.996 5.28zm0 1.44l3.204 1.68v3.36l-3.204 1.68-3.196-1.68V8.4l3.196-1.68z"/>
    </svg>
  );
}

function HackerOneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M7.2 0v24h3.6v-9.6h2.4V24h3.6V0h-3.6v9.6h-2.4V0z"/>
    </svg>
  );
}

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
    </svg>
  );
}

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
                <a href={githubUrl} target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="GitHub">
                  <Github className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.linkedinUrl && (
                <a href={site.linkedinUrl} target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="LinkedIn">
                  <Linkedin className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.twitterUrl && (
                <a href={site.twitterUrl} target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Twitter / X">
                  <Twitter className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.hacktheboxUsername && (
                <a href={`https://app.hackthebox.com/users/${site.hacktheboxUsername.replace(/^@/, "")}`}
                  target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-[#9fef00] transition-colors"
                  aria-label="Hack The Box">
                  <HackTheBoxIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.hackeroneUsername && (
                <a href={`https://hackerone.com/${site.hackeroneUsername.replace(/^@/, "")}`}
                  target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-[#e93c3c] transition-colors"
                  aria-label="HackerOne">
                  <HackerOneIcon className="h-3.5 w-3.5" />
                </a>
              )}
              {site?.leetcodeUsername && (
                <a href={`https://leetcode.com/u/${site.leetcodeUsername.replace(/^@/, "")}`}
                  target="_blank" rel="noreferrer"
                  className="h-8 w-8 rounded-md saber-border flex items-center justify-center text-muted-foreground hover:text-[#ffa116] transition-colors"
                  aria-label="LeetCode">
                  <LeetCodeIcon className="h-3.5 w-3.5" />
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
