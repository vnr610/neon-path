import { supabase } from "@/integrations/supabase/client";

export type ExternalHandles = {
  githubUsername?: string | null;
  leetcodeUsername?: string | null;
  hacktheboxUsername?: string | null;
  hackeroneUsername?: string | null;
};

export type ExternalAchievements = {
  githubPushes30d: number | null;
  githubPublicEvents30d: number | null;
  leetcodeSolved: number | null;
  hacktheboxRank: string | null;
  hackeroneReputation: number | null;
};

function extractHandle(value: string | null | undefined, host: string): string | null {
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

async function fetchGitHubPushes30d(username: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    if (!res.ok) return null;
    const events = (await res.json()) as Array<{ type: string; created_at: string }>;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return events.filter((e) => e.type === "PushEvent" && new Date(e.created_at).getTime() >= cutoff).length;
  } catch {
    return null;
  }
}

async function fetchGitHubPublicEvents30d(username: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    if (!res.ok) return null;
    const events = (await res.json()) as Array<{ created_at: string }>;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return events.filter((e) => new Date(e.created_at).getTime() >= cutoff).length;
  } catch {
    return null;
  }
}

function parseLeetCodeSolved(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  // alfa-leetcode-api shape: { solvedProblem: number }
  if (typeof o.solvedProblem === "number") return o.solvedProblem;
  // leetcode-stats-api shape: { totalSolved: number }
  if (typeof o.totalSolved === "number") return o.totalSolved;
  // nested stats
  const stats = o.stats;
  if (stats && typeof stats === "object") {
    const s = stats as Record<string, unknown>;
    if (typeof s.totalSolved === "number") return s.totalSolved;
  }
  const qs = o.totalQuestionStats;
  if (qs && typeof qs === "object") {
    const q = qs as Record<string, unknown>;
    if (typeof q.solvedTotal === "number") return q.solvedTotal;
  }
  // acSubmissionNum array shape
  const acList = o.acSubmissionNum;
  if (Array.isArray(acList)) {
    for (const row of acList) {
      if (row && typeof row === "object") {
        const r = row as Record<string, unknown>;
        if (r.difficulty === "All" && typeof r.count === "number") return r.count;
      }
    }
  }
  const submit = o.submitStats;
  if (submit && typeof submit === "object") {
    const ac = (submit as Record<string, unknown>).acSubmissionNum;
    if (Array.isArray(ac)) {
      for (const row of ac) {
        if (row && typeof row === "object") {
          const r = row as Record<string, unknown>;
          if (r.difficulty === "All" && typeof r.count === "number") return r.count;
        }
      }
    }
  }
  return null;
}

async function fetchLeetCodeSolved(username: string): Promise<number | null> {
  const enc = encodeURIComponent(username);
  const urls = [
    // alfa-leetcode-api: returns { solvedProblem, easySolved, ... }
    `https://alfa-leetcode-api.onrender.com/${enc}/solved`,
    // leetcode-stats-api: returns { totalSolved, ... }
    `https://leetcode-stats-api.herokuapp.com/${enc}`,
    // secondary vercel proxy
    `https://leetcode-api-pied.vercel.app/user/${enc}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const n = parseLeetCodeSolved(data);
      if (n != null) return n;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function fetchHackTheBoxRank(username: string): Promise<string | null> {
  // HTB public API requires authentication — skip client-side fallback
  // The edge function handles this with HTB_APP_TOKEN
  return null;
}

async function fetchHackerOneReputation(username: string): Promise<number | null> {
  try {
    const res = await fetch(`https://hackerone.com/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { reputation?: number | null };
    return typeof data.reputation === "number" ? data.reputation : null;
  } catch {
    return null;
  }
}

export async function loadExternalAchievements(handles: ExternalHandles): Promise<ExternalAchievements> {
  try {
    const { data, error } = await supabase.functions.invoke("external-achievements", {
      body: { handles },
    });
    if (!error && data?.achievements) {
      return data.achievements as ExternalAchievements;
    }
  } catch {
    // fall back to client-side public endpoints below
  }

  const githubUsername = extractHandle(handles.githubUsername, "github.com");
  const leetcodeUsername = extractHandle(handles.leetcodeUsername, "leetcode.com");
  const hacktheboxUsername = extractHandle(handles.hacktheboxUsername, "hackthebox.com");
  const hackeroneUsername = extractHandle(handles.hackeroneUsername, "hackerone.com");

  const [githubPushes30d, githubPublicEvents30d, leetcodeSolved, hacktheboxRank, hackeroneReputation] = await Promise.all([
    githubUsername ? fetchGitHubPushes30d(githubUsername) : Promise.resolve(null),
    githubUsername ? fetchGitHubPublicEvents30d(githubUsername) : Promise.resolve(null),
    leetcodeUsername ? fetchLeetCodeSolved(leetcodeUsername) : Promise.resolve(null),
    hacktheboxUsername ? fetchHackTheBoxRank(hacktheboxUsername) : Promise.resolve(null),
    hackeroneUsername ? fetchHackerOneReputation(hackeroneUsername) : Promise.resolve(null),
  ]);

  return { githubPushes30d, githubPublicEvents30d, leetcodeSolved, hacktheboxRank, hackeroneReputation };
}

