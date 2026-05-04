import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit3, RefreshCw, Trash2 } from "lucide-react";
import { LevelBadge } from "@/components/saber/LevelBadge";
import { SaberProgress } from "@/components/saber/SaberProgress";
import {
  addSkill, deleteSkill, trashSkill, loadBlogPosts, loadCertifications,
  loadProjects, loadSiteHome, loadSkills, updateSkill, type Skill,
} from "@/lib/content";
import { loadExternalAchievements } from "@/lib/externalAchievements";
import { deriveSkills, type DerivedSkill } from "@/lib/skillsEngine";

type ScanStatus = "idle" | "scanning" | "done" | "error";

const AdminSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [lastDerived, setLastDerived] = useState<DerivedSkill[]>([]);
  const [expandedEvidence, setExpandedEvidence] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ level: "", progress: "" });

  const appendLog = useCallback((msg: string) => {
    setScanLog((prev) => [...prev, msg]);
  }, []);

  // ── Auto-scan + sync ──────────────────────────────────────────────────────
  const runScan = useCallback(async () => {
    setScanStatus("scanning");
    setScanLog([]);
    setExpandedEvidence(null);

    try {
      appendLog("Loading handles…");
      const home = await loadSiteHome();

      if (!home.githubUsername && !home.leetcodeUsername && !home.hacktheboxUsername && !home.hackeroneUsername) {
        appendLog("⚠ No handles set — go to Admin → Home page.");
      }

      appendLog("Fetching external profiles…");
      const achievements = await loadExternalAchievements({
        githubUsername: home.githubUsername,
        leetcodeUsername: home.leetcodeUsername,
        hacktheboxUsername: home.hacktheboxUsername,
        hackeroneUsername: home.hackeroneUsername,
      });
      appendLog(`  GitHub pushes 30d : ${achievements.githubPushes30d ?? "—"}`);
      appendLog(`  LeetCode solved   : ${achievements.leetcodeSolved ?? "—"}`);
      appendLog(`  HTB rank          : ${achievements.hacktheboxRank ?? "—"}`);
      appendLog(`  HackerOne rep     : ${achievements.hackeroneReputation ?? "—"}`);

      appendLog("Loading site content…");
      const [projects, posts, certifications] = await Promise.all([
        loadProjects(), loadBlogPosts(), loadCertifications(),
      ]);
      appendLog(`  ${projects.length} projects · ${posts.length} writeups · ${certifications.length} certs`);

      appendLog("Scoring…");
      const derived = await deriveSkills({
        handles: {
          githubUsername: home.githubUsername,
          leetcodeUsername: home.leetcodeUsername,
          hacktheboxUsername: home.hacktheboxUsername,
          hackeroneUsername: home.hackeroneUsername,
        },
        achievements, projects, posts, certifications,
      });

      appendLog(`Syncing ${derived.length} skills to DB…`);

      // Diff + upsert
      const existing = await loadSkills();
      const existingByName = new Map(existing.map((s) => [s.name.toLowerCase(), s]));
      const derivedNames = new Set(derived.map((s) => s.name.toLowerCase()));

      let deleted = 0, updated = 0, inserted = 0;
      for (const skill of existing) {
        if (!derivedNames.has(skill.name.toLowerCase())) {
          await deleteSkill(skill.id);
          deleted++;
        }
      }
      for (const s of derived) {
        const match = existingByName.get(s.name.toLowerCase());
        if (match) {
          await updateSkill(match.id, { category: s.category, level: s.level, progress: s.progress });
          updated++;
        } else {
          await addSkill({ name: s.name, category: s.category, level: s.level, progress: s.progress });
          inserted++;
        }
      }

      appendLog(`Done — ${inserted} added, ${updated} updated, ${deleted} removed.`);
      const maxScore = derived.reduce((m, s) => Math.max(m, s.progress), 0);
      appendLog(`Top score: ${maxScore}% (hard cap 92%).`);

      const refreshed = await loadSkills();
      setSkills(refreshed);
      setLastDerived(derived);
      setScanStatus("done");
    } catch (err) {
      appendLog(`Error: ${String(err)}`);
      setScanStatus("error");
    }
  }, [appendLog]);

  // Auto-scan on mount
  useEffect(() => { void runScan(); }, [runScan]);

  const handleDelete = async (id: string) => {
    await trashSkill(id);
    setSkills(await loadSkills());
    if (editingId === id) setEditingId(null);
  };

  const handleEditSave = async (id: string) => {
    const progress = Number(editForm.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) return;
    await updateSkill(id, { level: editForm.level, progress });
    setSkills(await loadSkills());
    setEditingId(null);
  };

  const fullStack = skills.filter((s) => s.category === "fullstack");
  const cyber = skills.filter((s) => s.category === "cyber");

  return (
    <AdminLayout title="Skills">
      {/* ── Scan status panel ── */}
      <div className="saber-card p-5 mb-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                scanStatus === "scanning" ? "bg-foreground/60 animate-pulse" :
                scanStatus === "done" ? "bg-foreground/80" :
                scanStatus === "error" ? "bg-destructive" : "bg-muted-foreground/40"
              }`}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {scanStatus === "scanning" ? "Scanning & syncing…" :
               scanStatus === "done" ? `Auto-synced · ${fullStack.length + cyber.length} skills` :
               scanStatus === "error" ? "Scan failed" : "Idle"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="saber-border font-mono text-[10px] uppercase tracking-[0.2em]"
            onClick={runScan}
            disabled={scanStatus === "scanning"}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${scanStatus === "scanning" ? "animate-spin" : ""}`} />
            Re-scan
          </Button>
        </div>

        {/* Log */}
        <div className="rounded-md bg-background/60 border border-border/40 p-3 font-mono text-[10px] space-y-0.5 max-h-40 overflow-y-auto">
          {scanLog.length === 0 ? (
            <p className="text-muted-foreground/40">Waiting…</p>
          ) : scanLog.map((line, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              <span className="text-foreground/20 mr-2">›</span>{line}
            </p>
          ))}
        </div>
      </div>

      {/* ── Saved skills ── */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Skills</p>
          <p className="text-sm text-muted-foreground">
            {skills.length === 0
              ? "Scanning…"
              : `${fullStack.length} full stack · ${cyber.length} cyber · max ${Math.max(...skills.map((s) => s.progress), 0)}%`}
          </p>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {([
            { label: "Full Stack", items: fullStack, variant: "blue" as const },
            { label: "Cybersecurity", items: cyber, variant: "purple" as const },
          ]).map(({ label, items, variant }) => (
            <section key={label}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">{label}</p>
              <div className="space-y-2">
                {items.map((skill) => {
                  const evidence = lastDerived.find((d) => d.name.toLowerCase() === skill.name.toLowerCase())?.evidence ?? [];
                  const isExpanded = expandedEvidence === skill.id;
                  return (
                    <article key={skill.id} className="saber-card overflow-hidden">
                      {editingId === skill.id ? (
                        <div className="p-4 space-y-3">
                          <p className="text-sm font-semibold">{skill.name}</p>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={editForm.level}
                              onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))}
                              className="rounded-md bg-background/40 border border-border/60 px-3 py-2 text-sm font-mono"
                            >
                              {["initiate", "apprentice", "knight", "master", "grandmaster"].map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            <input
                              type="number" min={0} max={92}
                              value={editForm.progress}
                              onChange={(e) => setEditForm((f) => ({ ...f, progress: e.target.value }))}
                              className="rounded-md bg-background/40 border border-border/60 px-3 py-2 text-sm font-mono"
                              placeholder="0–92"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEditSave(skill.id)}>Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <p className="text-sm font-semibold truncate">{skill.name}</p>
                                <span className="font-mono text-[10px] text-muted-foreground shrink-0 tabular-nums">
                                  {skill.progress}% · {skill.level}
                                </span>
                              </div>
                              <SaberProgress label="Progress" value={skill.progress} variant={variant} />
                            </div>
                            <div className="flex gap-1 shrink-0 mt-0.5">
                              {evidence.length > 0 && (
                                <Button
                                  type="button" variant="ghost" size="sm"
                                  onClick={() => setExpandedEvidence(isExpanded ? null : skill.id)}
                                >
                                  {isExpanded
                                    ? <ChevronUp className="h-3.5 w-3.5" />
                                    : <ChevronDown className="h-3.5 w-3.5" />}
                                </Button>
                              )}
                              <Button
                                type="button" variant="ghost" size="sm"
                                onClick={() => { setEditingId(skill.id); setEditForm({ level: skill.level, progress: String(skill.progress) }); }}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button" variant="ghost" size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(skill.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          {isExpanded && evidence.length > 0 && (
                            <div className="px-4 pb-3 border-t border-border/40 pt-2 space-y-0.5">
                              {evidence.map((e, i) => (
                                <p key={i} className="font-mono text-[10px] text-muted-foreground">
                                  <span className="text-foreground/20 mr-1.5">·</span>{e}
                                </p>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSkills;
