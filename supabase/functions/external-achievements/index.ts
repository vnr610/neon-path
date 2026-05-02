import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

type ExternalHandles = {
  githubUsername?: string | null;
  leetcodeUsername?: string | null;
  hacktheboxUsername?: string | null;
  hackeroneUsername?: string | null;
};

type ExternalAchievements = {
  githubPushes30d: number | null;
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

async function fetchGitHubPushes30d(username: string): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`);
    if (!res.ok) return null;
    const events = (await res.json()) as Array<{ type: string; created_at: string; payload?: { commits?: unknown[] } }>;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return events
      .filter((e) => e.type === "PushEvent" && new Date(e.created_at).getTime() >= cutoff)
      .reduce((sum, e) => sum + (e.payload?.commits?.length ?? 1), 0);
  } catch {
    return null;
  }
}

function parseLeetCodeSolved(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (typeof o.totalSolved === "number") return o.totalSolved;
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
    `https://leetcode-stats-api.herokuapp.com/${enc}`,
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
  const apiUser = Deno.env.get("HACKERONE_API_USERNAME");
  const apiToken = Deno.env.get("HACKERONE_API_TOKEN");
  if (!apiUser || !apiToken) return null;
  try {
    const basic = btoa(`${apiUser}:${apiToken}`);
    const res = await fetch(`https://api.hackerone.com/v1/users/${encodeURIComponent(username)}`, {
      headers: {
        Authorization: `Basic ${basic}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: { attributes?: { reputation?: number | null } } };
    const rep = data?.data?.attributes?.reputation;
    return typeof rep === "number" ? rep : null;
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

    const [githubPushes30d, leetcodeSolved, hacktheboxRank, hackeroneReputation] = await Promise.all([
      github ? fetchGitHubPushes30d(github) : Promise.resolve(null),
      leetcode ? fetchLeetCodeSolved(leetcode) : Promise.resolve(null),
      htb ? fetchHackTheBoxRank(htb) : Promise.resolve(null),
      h1 ? fetchHackerOneReputation(h1) : Promise.resolve(null),
    ]);

    const achievements: ExternalAchievements = {
      githubPushes30d,
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
