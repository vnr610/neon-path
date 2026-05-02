import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { SaberProgress } from "@/components/saber/SaberProgress";
import { Code2, Shield, Sparkles, Trophy } from "lucide-react";
import { loadSiteHome, loadSkills, type Skill, type SiteHomeSettings } from "@/lib/content";
import { loadExternalAchievements, type ExternalAchievements } from "@/lib/externalAchievements";

const realms = ["Initiate", "Apprentice", "Knight", "Master", "Grandmaster"];

function toHandle(value: string | null | undefined, host: string): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  if (!/^https?:\/\//i.test(v)) return v.replace(/^@+/, "");
  try {
    const u = new URL(v);
    if (!u.hostname.includes(host)) return v.replace(/^@+/, "");
    const parts = u.pathname.split("/").filter(Boolean);
    if (host.includes("leetcode.com")) {
      const idx = parts.findIndex((p) => p.toLowerCase() === "u");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    if (host.includes("hackthebox.com")) {
      const idx = parts.findIndex((p) => p.toLowerCase() === "users");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
    return parts[0] ?? null;
  } catch {
    return v.replace(/^@+/, "");
  }
}

const Skills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [siteHome, setSiteHome] = useState<SiteHomeSettings | null>(null);
  const [achievements, setAchievements] = useState<ExternalAchievements | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [data, home] = await Promise.all([loadSkills(), loadSiteHome()]);
      setSkills(data);
      setSiteHome(home);
      const synced = await loadExternalAchievements({
        githubUsername: home.githubUsername,
        leetcodeUsername: home.leetcodeUsername,
        hacktheboxUsername: home.hacktheboxUsername,
        hackeroneUsername: home.hackeroneUsername,
      });
      setAchievements(synced);
    };
    fetchData();
  }, []);

  const fullStackSkills = skills.filter((skill) => skill.category === "fullstack");
  const cyberSkills = skills.filter((skill) => skill.category === "cyber");
  const githubHandle = toHandle(siteHome?.githubUsername, "github.com");
  const leetcodeHandle = toHandle(siteHome?.leetcodeUsername, "leetcode.com");
  const htbHandle = toHandle(siteHome?.hacktheboxUsername, "hackthebox.com");
  const hackeroneHandle = toHandle(siteHome?.hackeroneUsername, "hackerone.com");

  const badgeVariant = (category: string) => (category === "fullstack" ? "blue" : "purple");

  return (
    <SiteLayout>
      <div className="container py-16">
        <PageHeader title="Skills Dashboard" subtitle="Disciplines mapped across two realms — full stack craft and cyber defense." />

        <div className="saber-card p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-saber-purple" />
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Synced achievements</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-border/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">GitHub pushes (30d)</p>
              <p className="font-display text-2xl mt-2">{achievements?.githubPushes30d ?? "—"}</p>
              {githubHandle ? (
                <a className="text-xs text-saber-blue hover:underline" href={`https://github.com/${githubHandle}`} target="_blank" rel="noreferrer">
                  @{githubHandle}
                </a>
              ) : null}
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">LeetCode solved</p>
              <p className="font-display text-2xl mt-2">{achievements?.leetcodeSolved ?? "—"}</p>
              {leetcodeHandle ? (
                <a
                  className="text-xs text-saber-blue hover:underline"
                  href={`https://leetcode.com/u/${encodeURIComponent(leetcodeHandle)}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{leetcodeHandle}
                </a>
              ) : null}
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Hack The Box rank</p>
              <p className="font-display text-2xl mt-2">{achievements?.hacktheboxRank ?? "—"}</p>
              {htbHandle ? (
                <a className="text-xs text-saber-blue hover:underline" href={`https://app.hackthebox.com/users/${htbHandle}`} target="_blank" rel="noreferrer">
                  {htbHandle}
                </a>
              ) : null}
            </div>
            <div className="rounded-md border border-border/60 p-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">HackerOne reputation</p>
              <p className="font-display text-2xl mt-2">{achievements?.hackeroneReputation ?? "—"}</p>
              {hackeroneHandle ? (
                <a className="text-xs text-saber-blue hover:underline" href={`https://hackerone.com/${hackeroneHandle}`} target="_blank" rel="noreferrer">
                  @{hackeroneHandle}
                </a>
              ) : null}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Live stats come from public endpoints; if you see dashes, the service may be down, blocked, or the handle may not match what that API expects.
          </p>
        </div>

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
