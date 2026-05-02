import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { SaberProgress } from "@/components/saber/SaberProgress";
import { Code2, Shield, Sparkles } from "lucide-react";

const realms = ["Initiate", "Apprentice", "Knight", "Master", "Grandmaster"];

const Skills = () => {
  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Skills Dashboard" subtitle="Disciplines mapped across two realms — full stack craft and cyber defense." />

        {/* Realm legend */}
        <div className="saber-card p-6 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-saber-blue" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Realm System</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {realms.map((r, i) => (
              <LevelBadge key={r} label={r} variant={i < 2 ? "muted" : i < 4 ? "blue" : "purple"} />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FULL STACK */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-md saber-border flex items-center justify-center shadow-glow-blue">
                <Code2 className="h-5 w-5 text-saber-blue" />
              </div>
              <div>
                <h2 className="font-display text-xl">Full Stack</h2>
                <p className="text-xs text-muted-foreground tracking-wider">// front · back · infra</p>
              </div>
            </div>

            <div className="saber-card p-6 mb-4 space-y-5 opacity-60">
              <SaberProgress label="—" value={undefined} variant="blue" />
              <SaberProgress label="—" value={undefined} variant="blue" />
              <SaberProgress label="—" value={undefined} variant="blue" />
            </div>

            <EmptyState
              icon={Code2}
              title="No skills logged in this realm"
              description="Add full stack skills to see them charted here with progress and level badges."
              hint="Mastery is built one primitive at a time."
              status="realm :: full-stack/0"
            />
          </section>

          {/* CYBERSEC */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-md saber-border flex items-center justify-center shadow-glow-purple">
                <Shield className="h-5 w-5 text-saber-purple" />
              </div>
              <div>
                <h2 className="font-display text-xl">Cybersecurity</h2>
                <p className="text-xs text-muted-foreground tracking-wider">// offense · defense · forensics</p>
              </div>
            </div>

            <div className="saber-card p-6 mb-4 space-y-5 opacity-60">
              <SaberProgress label="—" value={undefined} variant="purple" />
              <SaberProgress label="—" value={undefined} variant="purple" />
              <SaberProgress label="—" value={undefined} variant="purple" />
            </div>

            <EmptyState
              icon={Shield}
              title="No skills logged in this realm"
              description="Add cybersecurity skills to track mastery across offense, defense, and forensics."
              hint="Defense begins with curiosity."
              status="realm :: cybersec/0"
            />
          </section>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Skills;
