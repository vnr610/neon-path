import { Link } from "react-router-dom";
import { ArrowRight, Target, Activity, FolderGit2, Terminal, Shield, Code2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EmptyState } from "@/components/saber/EmptyState";
import { SectionHeader } from "@/components/saber/SectionHeader";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { Button } from "@/components/ui/button";

const Index = () => {
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
              M Thapa
              <br />
              <span className="saber-text">Magar</span>
              <span className="text-foreground">.</span>
            </h1>

            <p className="text-lead mb-3 max-w-xl animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
              Mastering <span className="text-foreground font-medium">Full Stack</span> & <span className="text-foreground font-medium">Cybersecurity</span>
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
        <SectionHeader eyebrow="Current Focus" title="What I'm forging now" description="The active disciplines and technologies in training." />
        <EmptyState
          icon={Target}
          title="No active focus declared"
          description="Once you set a current focus area it will appear here as a glowing beacon."
          hint="Discipline begins with a single intent."
          status="focus :: undeclared"
        />
      </section>

      {/* RECENT PROGRESS */}
      <section className="container py-20">
        <SectionHeader eyebrow="Recent Progress" title="Latest milestones" description="Timeline entries and updates from the journey." />
        <EmptyState
          icon={Activity}
          title="No recent progress logged"
          description="New milestones and learning entries will appear here as they're recorded."
          hint="Small commits, compounded daily."
          status="log :: empty"
        />
      </section>

      {/* FEATURED PROJECTS */}
      <section className="container py-20">
        <SectionHeader eyebrow="Featured Projects" title="Selected works" description="Hand-picked projects from across the realm." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Code2, title: "Slot 01", glow: "blue" as const },
            { icon: Shield, title: "Slot 02", glow: "purple" as const },
            { icon: Terminal, title: "Slot 03", glow: "blue" as const },
          ].map((s, i) => (
            <div key={i} className="saber-card aspect-[4/5] flex flex-col items-center justify-center text-center p-8 group">
              <div className={`h-14 w-14 rounded-full border border-border/60 flex items-center justify-center mb-4 group-hover:${s.glow === "blue" ? "shadow-glow-blue" : "shadow-glow-purple"} transition-shadow`}>
                <s.icon className={`h-6 w-6 ${s.glow === "blue" ? "text-saber-blue" : "text-saber-purple"}`} />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Empty Slot</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2">{s.title}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
};

export default Index;
