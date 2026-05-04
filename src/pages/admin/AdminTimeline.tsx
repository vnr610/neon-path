import { useCallback, useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Award, Code2, Edit3, GitCommitVertical, RefreshCw, Shield, Trash2 } from "lucide-react";
import {
  addTimelineEntry, deleteTimelineEntry, trashTimelineEntry, formatDate,
  loadBlogPosts, loadCertifications, loadProjects,
  loadSiteHome, loadSkills, loadTimelineEntries,
  updateTimelineEntry, type TimelineEntry,
} from "@/lib/content";
import { loadExternalAchievements } from "@/lib/externalAchievements";

type ScanStatus = "idle" | "scanning" | "done" | "error";
type ScannedEntry = Omit<TimelineEntry, "id" | "createdAt">;

// ─── Scan logic ───────────────────────────────────────────────────────────────

async function buildEntries(log: (m: string) => void): Promise<ScannedEntry[]> {
  const entries: ScannedEntry[] = [];

  log("Loading handles…");
  const home = await loadSiteHome();

  log("Fetching external profiles…");
  const achievements = await loadExternalAchievements({
    githubUsername: home.githubUsername,
    leetcodeUsername: home.leetcodeUsername,
    hacktheboxUsername: home.hacktheboxUsername,
    hackeroneUsername: home.hackeroneUsername,
  });

  log("Loading site content…");
  const [projects, posts, certs, skills] = await Promise.all([
    loadProjects(), loadBlogPosts(), loadCertifications(), loadSkills(),
  ]);
  log(`  ${projects.length} projects · ${posts.length} writeups · ${certs.length} certs · ${skills.length} skills`);

  // Writeups
  for (const post of posts) {
    const isCyber = post.tags.some((t) =>
      ["ctf", "pentest", "security", "hack", "exploit", "osint", "forensics",
       "xss", "sqli", "rce", "bug bounty", "hackthebox", "tryhackme"].some((k) =>
        t.toLowerCase().includes(k)));
    entries.push({
      date: post.createdAt,
      realm: isCyber ? "Cybersecurity" : "Full Stack",
      title: `Published writeup: "${post.title}"`,
      desc: post.excerpt?.trim() || undefined,
    });
  }

  // Projects
  for (const project of projects) {
    entries.push({
      date: project.createdAt,
      realm: "Full Stack",
      title: `Forged project: ${project.name}`,
      desc: project.desc?.slice(0, 200) || undefined,
    });
  }

  // Certifications
  for (const cert of certs) {
    entries.push({
      date: cert.date,
      realm: "Certification",
      title: `Earned: ${cert.name}`,
      desc: `Issued by ${cert.issuer}`,
    });
  }

  // LeetCode
  if ((achievements.leetcodeSolved ?? 0) > 0) {
    // Use start of current month — count changes slowly, re-scans stay stable
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    entries.push({
      date: monthStart.toISOString(),
      realm: "Full Stack",
      title: `${achievements.leetcodeSolved} LeetCode problem${achievements.leetcodeSolved === 1 ? "" : "s"} solved`,
      desc: "Algorithm and data structure practice on LeetCode",
    });
    log(`  LeetCode: ${achievements.leetcodeSolved} solved`);
  }

  // HackerOne — only show if there's actual reputation
  if (home.hackeroneUsername && (achievements.hackeroneReputation ?? 0) > 0) {
    const rep = achievements.hackeroneReputation!;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    entries.push({
      date: monthStart.toISOString(),
      realm: "Cybersecurity",
      title: `HackerOne reputation: ${rep} point${rep !== 1 ? "s" : ""}`,
      desc: `Bug bounty activity on HackerOne (@${home.hackeroneUsername.replace(/^@/, "")})`,
    });
    log(`  HackerOne: ${rep} rep`);
  }

  // HTB — only show if rank is above Noob
  if (achievements.hacktheboxRank) {
    const rank = achievements.hacktheboxRank.toLowerCase();
    const isNoob = rank === "noob" || rank === "script kiddie";
    if (!isNoob) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      entries.push({
        date: monthStart.toISOString(),
        realm: "Cybersecurity",
        title: `Hack The Box rank: ${achievements.hacktheboxRank}`,
        desc: "Current standing on the HTB platform",
      });
      log(`  HTB: ${achievements.hacktheboxRank}`);
    } else {
      log(`  HTB: ${achievements.hacktheboxRank} (skipped — rank too low)`);
    }
  }

  // Notable skills (knight+)
  const notable = skills.filter((s) =>
    ["knight", "master", "grandmaster"].includes(s.level.toLowerCase()));
  for (const skill of notable) {
    entries.push({
      date: skill.createdAt,
      realm: skill.category === "fullstack" ? "Full Stack" : "Cybersecurity",
      title: `Skill milestone: ${skill.name} — ${skill.level}`,
      desc: `Progress: ${skill.progress}%`,
    });
  }
  if (notable.length > 0) log(`  ${notable.length} skill milestones`);

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  log(`Total: ${entries.length} entries.`);
  return entries;
}

// ─── Icon helper ──────────────────────────────────────────────────────────────

function RealmIcon({ realm }: { realm: string }) {
  const r = realm.toLowerCase();
  if (r.includes("cyber") || r.includes("security") || r.includes("hack"))
    return <Shield className="h-4 w-4 text-muted-foreground shrink-0" />;
  if (r.includes("cert"))
    return <Award className="h-4 w-4 text-muted-foreground shrink-0" />;
  return <Code2 className="h-4 w-4 text-muted-foreground shrink-0" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminTimeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", desc: "", realm: "" });

  const appendLog = useCallback((msg: string) => {
    setScanLog((prev) => [...prev, msg]);
  }, []);

  const runScan = useCallback(async () => {
    setScanStatus("scanning");
    setScanLog([]);

    try {
      const derived = await buildEntries(appendLog);

      appendLog("Syncing to database…");
      const existing = await loadTimelineEntries();

      // Replace all — timeline is fully derived, no manual entries to preserve
      for (const e of existing) await deleteTimelineEntry(e.id);
      for (const e of derived) {
        await addTimelineEntry({ date: e.date, realm: e.realm, title: e.title, desc: e.desc });
      }

      const refreshed = await loadTimelineEntries();
      setEntries(refreshed);
      setScanStatus("done");
      appendLog(`Saved ${refreshed.length} entries.`);
    } catch (err) {
      appendLog(`Error: ${String(err)}`);
      setScanStatus("error");
    }
  }, [appendLog]);

  // Auto-scan on mount
  useEffect(() => { void runScan(); }, [runScan]);

  const handleDelete = async (id: string) => {
    await trashTimelineEntry(id);
    setEntries(await loadTimelineEntries());
    if (editingId === id) setEditingId(null);
  };

  const handleEditSave = async (id: string) => {
    await updateTimelineEntry(id, {
      title: editForm.title.trim(),
      realm: editForm.realm.trim(),
      desc: editForm.desc.trim() || undefined,
    });
    setEntries(await loadTimelineEntries());
    setEditingId(null);
  };

  return (
    <AdminLayout title="Timeline">
      {/* ── Status panel ── */}
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
               scanStatus === "done" ? `Auto-synced · ${entries.length} entries` :
               scanStatus === "error" ? "Scan failed" : "Idle"}
            </p>
          </div>
          <Button
            size="sm" variant="outline"
            className="saber-border font-mono text-[10px] uppercase tracking-[0.2em]"
            onClick={runScan}
            disabled={scanStatus === "scanning"}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${scanStatus === "scanning" ? "animate-spin" : ""}`} />
            Re-scan
          </Button>
        </div>

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

      {/* ── Saved entries ── */}
      <div className="mb-4">
        <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em]">Timeline</p>
        <p className="text-sm text-muted-foreground">
          {entries.length === 0 ? "Scanning…" : `${entries.length} entries`}
        </p>
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <article key={entry.id} className="saber-card p-4">
              {editingId === entry.id ? (
                <div className="space-y-3">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-md bg-background/40 border border-border/60 px-3 py-2 text-sm font-mono"
                    placeholder="Title"
                  />
                  <input
                    value={editForm.realm}
                    onChange={(e) => setEditForm((f) => ({ ...f, realm: e.target.value }))}
                    className="w-full rounded-md bg-background/40 border border-border/60 px-3 py-2 text-sm font-mono"
                    placeholder="Realm"
                  />
                  <textarea
                    value={editForm.desc}
                    onChange={(e) => setEditForm((f) => ({ ...f, desc: e.target.value }))}
                    className="w-full rounded-md bg-background/40 border border-border/60 px-3 py-2 text-sm font-mono resize-none"
                    rows={2}
                    placeholder="Description (optional)"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSave(entry.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <RealmIcon realm={entry.realm} />
                  <div className="flex-1 min-w-0 mt-0.5">
                    <p className="text-sm font-semibold leading-snug">{entry.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(entry.date)} · {entry.realm}
                    </p>
                    {entry.desc && <p className="text-xs text-muted-foreground/70 mt-1">{entry.desc}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      type="button" variant="ghost" size="sm"
                      onClick={() => { setEditingId(entry.id); setEditForm({ title: entry.title, realm: entry.realm, desc: entry.desc ?? "" }); }}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTimeline;
