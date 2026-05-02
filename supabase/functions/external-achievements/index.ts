import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type ExternalHandles = {
  githubUsername?: string | null;
  leetcodeUsername?: string | null;
  hacktheboxUsername?: string | null;
  hackeroneUsername?: string | null;
};

type ExternalAchievements = {
  githubPushes30d: number | null;
  githubPublicEvents30d: number | null;
  leetcodeSolved: number | null;
  hacktheboxRank: string | null;
  hackeroneReputation: number | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function handleFromInput(value: string | null | undefined, host: string): string | null {
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

async function fetchGitHubActivity30d(username: string): Promise<{ pushes: number; publicEvents: number } | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    if (!res.ok) return null;
    const events = (await res.json()) as Array<{ type: string; created_at: string }>;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const inWindow = events.filter((e) => new Date(e.created_at).getTime() >= cutoff);
    const pushes = inWindow.filter((e) => e.type === "PushEvent").length;
    return { pushes, publicEvents: inWindow.length };
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
  // acSubmissionNum array (top-level)
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
      // try next source
    }
  }
  return null;
}

async function fetchHackTheBoxRank(userId: string): Promise<string | null> {
  const token = Deno.env.get("HTB_APP_TOKEN");
  if (!token) return null;
  try {
    const res = await fetch(`https://labs.hackthebox.com/api/v4/user/profile/basic/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { profile?: { rank?: string } };
    return data.profile?.rank ?? null;
  } catch {
    return null;
  }
}

async function fetchHackerOneReputation(username: string): Promise<number | null> {
  try {
    // The /<username>.json endpoint 404s for new accounts; hit the profile URL
    // directly with an Accept: application/json header instead.
    const res = await fetch(`https://hackerone.com/${encodeURIComponent(username)}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { reputation?: number | null };
    // reputation is null when the account exists but has no reports yet — show 0
    return typeof data.reputation === "number" ? data.reputation : 0;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as { handles?: ExternalHandles };
    const handles = body?.handles ?? {};

    const github = handleFromInput(handles.githubUsername, "github.com");
    const leetcode = handleFromInput(handles.leetcodeUsername, "leetcode.com");
    const htb = handleFromInput(handles.hacktheboxUsername, "hackthebox.com");
    const h1 = handleFromInput(handles.hackeroneUsername, "hackerone.com");

    const [githubActivity, leetcodeSolved, hacktheboxRank, hackeroneReputation] = await Promise.all([
      github ? fetchGitHubActivity30d(github) : Promise.resolve(null),
      leetcode ? fetchLeetCodeSolved(leetcode) : Promise.resolve(null),
      htb ? fetchHackTheBoxRank(htb) : Promise.resolve(null),
      h1 ? fetchHackerOneReputation(h1) : Promise.resolve(null),
    ]);

    const achievements: ExternalAchievements = {
      githubPushes30d: githubActivity?.pushes ?? null,
      githubPublicEvents30d: githubActivity?.publicEvents ?? null,
      leetcodeSolved,
      hacktheboxRank,
      hackeroneReputation,
    };

    return new Response(JSON.stringify({ achievements }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
