import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Activity, FolderGit2, Terminal, Shield, Code2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EmptyState } from "@/components/saber/EmptyState";
import { SectionHeader } from "@/components/saber/SectionHeader";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { Button } from "@/components/ui/button";
import {
  loadFeaturedProjectsForHome,
  loadSiteHome,
  loadSkills,
  loadTimelineEntries,
  formatDate,
  type Project,
  type Skill,
  type TimelineEntry,
  type SiteHomeSettings,
} from "@/lib/content";

const slotGlow = ["blue", "purple", "blue"] as const;

type HomeState = {
  settings: SiteHomeSettings;
  featured: Project[];
  milestones: TimelineEntry[];
  skills: Skill[];
};

const Index = () => {
  const [home, setHome] = useState<HomeState | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [settings, featured, timeline, skills] = await Promise.all([
        loadSiteHome(),
        loadFeaturedProjectsForHome(),
        loadTimelineEntries(),
        loadSkills(),
      ]);
      if (cancelled) return;
      setHome({
        settings,
        featured,
        milestones: timeline.slice(0, 3),
        skills,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const focusTitle = home?.settings.focusTitle?.trim() || null;
  const focusDescription = home?.settings.focusDescription?.trim() || null;
  const topSkill =
    home?.skills && home.skills.length > 0
      ? [...home.skills].sort((a, b) => b.progress - a.progress)[0]
      : null;

  const showFocusCard = Boolean(focusTitle || focusDescription || topSkill);
  const focusHeading = focusTitle ?? (topSkill ? topSkill.name : null);
  const focusBody =
    focusDescription ??
    (topSkill
      ? `${topSkill.level} · ${topSkill.progress}% along the path (${
          topSkill.category === "fullstack" ? "Full stack" : "Cybersecurity"
        }). Set a custom message in the admin Home page panel.`
      : null);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

        <div className="container relative py-24 sm:py-32 md:py-40">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
              <span className="h-px w-10 bg-saber-blue shadow-glow-blue" />
              <span className="text-eyebrow">Initializing Realm</span>
            </div>

            <h1 className="text-display-xl mb-6 animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
              <span className="saber-text">VNR610</span>
              <span className="text-foreground">.</span>
            </h1>

            <p className="text-lead mb-3 max-w-xl animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
              Mastering <span className="text-foreground font-medium">Full Stack</span> &{" "}
              <span className="text-foreground font-medium">Cybersecurity</span>
            </p>
            <p className="text-mono mb-10 animate-fade-up opacity-0" style={{ animationDelay: "0.45s" }}>
              <span className="text-foreground">{">"}</span> vnr610@realm:~$ forging path through the code
            </p>

            <div className="flex flex-wrap items-center gap-3 animate-fade-up opacity-0" style={{ animationDelay: "0.6s" }}>
              <Button asChild size="lg" className="bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue">
                <Link to="/projects">
                  Explore Realm <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="saber-border bg-background/40">
                <Link to="/about">About Me</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="saber-border bg-background/40">
                <Link to="/writeups">Writeups</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-10 animate-fade-up opacity-0" style={{ animationDelay: "0.8s" }}>
              <LevelBadge label="Full Stack" variant="blue" />
              <LevelBadge label="Cybersecurity" variant="purple" />
              <LevelBadge label="Apprentice" variant="muted" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-saber-blue/40 to-transparent" />
      </section>

      {/* CURRENT FOCUS */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="Current Focus"
          title="What I'm forging now"
          description="The active disciplines and technologies in training — edited from the admin Home page, or inferred from your top skill."
        />
        {!home ? (
          <div className="saber-card p-10 text-sm text-muted-foreground animate-pulse">Loading focus…</div>
        ) : !showFocusCard ? (
          <EmptyState
            icon={Target}
            title="No active focus declared"
            description="Open Admin → Home page to set a headline and description, or add skills so the realm can infer your current emphasis."
            hint="Discipline begins with a single intent."
            status="focus :: undeclared"
          />
        ) : (
          <div className="saber-card p-8 md:p-10 flex gap-6 items-start">
            <div className="h-12 w-12 shrink-0 rounded-lg saber-border flex items-center justify-center shadow-glow-blue">
              <Target className="h-6 w-6 text-saber-blue" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Signal locked</p>
              <h3 className="font-display text-xl font-semibold mb-3">{focusHeading}</h3>
              {focusBody ? <p className="text-muted-foreground leading-relaxed max-w-2xl">{focusBody}</p> : null}
              <Button asChild variant="link" className="text-saber-blue mt-4 h-auto p-0">
                <Link to="/skills">View all skills →</Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* RECENT PROGRESS */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="Recent Progress"
          title="Latest milestones"
          description="Timeline entries and updates from the journey."
        />
        {!home ? (
          <div className="saber-card p-10 text-sm text-muted-foreground animate-pulse">Loading log…</div>
        ) : home.milestones.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent progress logged"
            description="New milestones and learning entries will appear here as they're recorded in the admin Timeline panel."
            hint="Small commits, compounded daily."
            status="log :: empty"
          />
        ) : (
          <div className="space-y-4">
            {home.milestones.map((entry) => (
              <article key={entry.id} className="saber-card p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="shrink-0 text-xs uppercase tracking-[0.28em] text-muted-foreground w-32">
                  {formatDate(entry.date)}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-saber-purple mb-1">{entry.realm}</p>
                  <h3 className="font-display text-lg font-semibold">{entry.title}</h3>
                  {entry.desc ? <p className="mt-2 text-sm text-muted-foreground">{entry.desc}</p> : null}
                </div>
              </article>
            ))}
            <Button asChild variant="outline" className="saber-border mt-2">
              <Link to="/timeline">
                Full timeline <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* FEATURED PROJECTS */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="Featured Projects"
          title="Selected works"
          description="Pinned in admin (Projects → Home spotlight) or the newest builds if none are pinned."
        />
        {!home ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="saber-card aspect-[4/5] animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : home.featured.length === 0 ? (
          <EmptyState
            icon={FolderGit2}
            title="No projects to display"
            description="Add projects in the admin console. Pin up to three on the home grid from each project's form."
            hint="The next build is always the most important."
            status="vault :: awaiting forge"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {home.featured.map((project, i) => {
              const glow = slotGlow[Math.min(i, 2)];
              const Icon = i % 2 === 0 ? Code2 : i === 1 ? Shield : Terminal;
              const cta =
                project.live?.trim() || project.repo?.trim()
                  ? (project.live?.trim() || project.repo)!.startsWith("http")
                    ? project.live?.trim() || project.repo!
                    : `/projects`
                  : "/projects";
              const external = typeof cta === "string" && /^https?:\/\//i.test(cta);

              return (
                <div key={project.id} className="saber-card overflow-hidden flex flex-col group">
                  {project.cover ? (
                    <img src={project.cover} alt="" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full bg-muted/30 flex items-center justify-center border-b border-border/50">
                      <div
                        className={`h-14 w-14 rounded-full border border-border/60 flex items-center justify-center transition-shadow ${
                          glow === "blue" ? "group-hover:shadow-glow-blue" : "group-hover:shadow-glow-purple"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${glow === "blue" ? "text-saber-blue" : "text-saber-purple"}`} />
                      </div>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                      {project.featuredOnHome
                        ? project.homeSlot != null
                          ? `Slot ${project.homeSlot}`
                          : "Featured"
                        : "Latest"}
                    </p>
                    <h3 className="font-display text-lg font-semibold mb-2">{project.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{project.desc}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.stack.split(",").slice(0, 4).map((tech) => (
                        <span
                          key={tech.trim()}
                          className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6">
                      {external ? (
                        <a
                          href={cta}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline inline-flex items-center gap-2"
                        >
                          Open project
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <Link
                          to={cta}
                          className="text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline inline-flex items-center gap-2"
                        >
                          View vault
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

export default Index;
