import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { SaberProgress } from "@/components/saber/SaberProgress";
import { Code2, Shield, Sparkles } from "lucide-react";
import { loadSkills, type Skill } from "@/lib/content";

const realms = ["Initiate", "Apprentice", "Knight", "Master", "Grandmaster"];

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      const data = await loadSkills();
      setSkills(data);
    };
    fetchSkills();
  }, []);

  const fullStackSkills = skills.filter((skill) => skill.category === "fullstack");
  const cyberSkills = skills.filter((skill) => skill.category === "cyber");

  const badgeVariant = (category: string) => (category === "fullstack" ? "blue" : "purple");

  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Skills Dashboard" subtitle="Disciplines mapped across two realms — full stack craft and cyber defense." />

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

            {fullStackSkills.length === 0 ? (
              <EmptyState
                icon={Code2}
                title="No skills logged in this realm"
                description="Add full stack skills to see them charted here with progress and level badges."
                hint="Mastery is built one primitive at a time."
                status="realm :: full-stack/0"
              />
            ) : (
              <div className="space-y-5">
                {fullStackSkills.map((skill) => (
                  <div key={skill.id} className="saber-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{skill.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{skill.level}</p>
                      </div>
                      <LevelBadge label={skill.category === "fullstack" ? "Full Stack" : skill.category} variant={badgeVariant(skill.category)} />
                    </div>
                    <div className="mt-5">
                      <SaberProgress label="Progress" value={skill.progress} variant="blue" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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

            {cyberSkills.length === 0 ? (
              <EmptyState
                icon={Shield}
                title="No skills logged in this realm"
                description="Add cybersecurity skills to track mastery across offense, defense, and forensics."
                hint="Defense begins with curiosity."
                status="realm :: cybersec/0"
              />
            ) : (
              <div className="space-y-5">
                {cyberSkills.map((skill) => (
                  <div key={skill.id} className="saber-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{skill.name}</p>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{skill.level}</p>
                      </div>
                      <LevelBadge label="Cybersecurity" variant={badgeVariant(skill.category)} />
                    </div>
                    <div className="mt-5">
                      <SaberProgress label="Progress" value={skill.progress} variant="purple" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Skills;
