/**
 * Skills Engine — Brutal Absolute Scoring
 *
 * Every skill is scored against fixed real-world benchmarks, NOT relative to
 * other skills in the set. The top score is hard-capped at 92 — nothing is
 * ever mastered. Ranks are assigned from the absolute progress value.
 *
 * Sources scanned:
 *   GitHub  — repo languages, commit frequency, repo count
 *   LeetCode — problems solved (absolute benchmark: 500 = strong)
 *   HTB     — rank tier (absolute ladder)
 *   HackerOne — reputation points (absolute benchmark: 500 = solid)
 *   Projects  — stack tokens per project
 *   Writeups  — tags + title keywords
 *   Certs     — issuer + name keywords
 */

import type { ExternalAchievements, ExternalHandles } from "./externalAchievements";
import type { BlogPost, Certification, Project } from "./content";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DerivedSkill = {
  name: string;
  category: "fullstack" | "cyber";
  level: string;
  progress: number;
  /** Human-readable explanation of how the score was built */
  evidence: string[];
};

// ─── Constants ───────────────────────────────────────────────────────────────

/** Hard ceiling — nothing is ever fully mastered */
const MAX_PROGRESS = 92;

/** Minimum score to appear in the list — filters out noise */
const MIN_PROGRESS = 8;

/**
 * Absolute score → level.
 * Thresholds are intentionally harsh: you need real evidence to rank up.
 */
export function progressToLevel(p: number): string {
  if (p >= 75) return "grandmaster";
  if (p >= 55) return "master";
  if (p >= 35) return "knight";
  if (p >= 18) return "apprentice";
  return "initiate";
}

// ─── Keyword dictionaries ────────────────────────────────────────────────────

const FULLSTACK_TECH: Record<string, string> = {
  // Languages
  javascript: "JavaScript", typescript: "TypeScript", python: "Python",
  rust: "Rust", go: "Go", golang: "Go", java: "Java", kotlin: "Kotlin",
  swift: "Swift", "c#": "C#", php: "PHP", ruby: "Ruby",
  // Frontend
  react: "React", vue: "Vue.js", angular: "Angular", svelte: "Svelte",
  "next.js": "Next.js", nextjs: "Next.js", html: "HTML/CSS", css: "HTML/CSS",
  tailwind: "Tailwind CSS", sass: "Sass/SCSS", scss: "Sass/SCSS",
  // Backend
  "node.js": "Node.js", nodejs: "Node.js", node: "Node.js",
  express: "Express", fastapi: "FastAPI", django: "Django", flask: "Flask",
  // Databases
  postgres: "PostgreSQL", postgresql: "PostgreSQL", mysql: "MySQL",
  sqlite: "SQLite", mongodb: "MongoDB", redis: "Redis", supabase: "Supabase",
  // Infra / DevOps
  docker: "Docker", kubernetes: "Kubernetes", k8s: "Kubernetes",
  aws: "AWS", gcp: "GCP", azure: "Azure", terraform: "Terraform",
  linux: "Linux", bash: "Bash/Shell", shell: "Bash/Shell", git: "Git",
  // APIs / Protocols
  graphql: "GraphQL", rest: "REST APIs", api: "REST APIs",
  websocket: "WebSockets", trpc: "tRPC",
  // Build tools
  vite: "Vite", webpack: "Webpack", prisma: "Prisma", drizzle: "Drizzle ORM",
};

const CYBER_TECH: Record<string, string> = {
  // Disciplines
  pentest: "Penetration Testing", "penetration testing": "Penetration Testing",
  "web security": "Web Security", "network security": "Network Security",
  osint: "OSINT", recon: "Reconnaissance",
  forensics: "Digital Forensics", "digital forensics": "Digital Forensics",
  "incident response": "Incident Response", "threat hunting": "Threat Hunting",
  "reverse engineering": "Reverse Engineering",
  "binary exploitation": "Binary Exploitation", pwn: "Binary Exploitation",
  cryptography: "Cryptography", crypto: "Cryptography",
  steganography: "Steganography", stego: "Steganography",
  malware: "Malware Analysis",
  // Platforms
  ctf: "CTF", "capture the flag": "CTF",
  hackthebox: "Hack The Box", "hack the box": "Hack The Box", htb: "Hack The Box",
  tryhackme: "TryHackMe", thm: "TryHackMe",
  "bug bounty": "Bug Bounty", hackerone: "Bug Bounty",
  // Techniques / Vulns
  xss: "XSS", sqli: "SQL Injection", "sql injection": "SQL Injection",
  csrf: "CSRF", ssrf: "SSRF", rce: "RCE",
  lfi: "LFI/RFI", rfi: "LFI/RFI",
  "privilege escalation": "Privilege Escalation", privesc: "Privilege Escalation",
  "active directory": "Active Directory", kerberos: "Active Directory",
  // Tools
  "burp suite": "Burp Suite", burp: "Burp Suite",
  metasploit: "Metasploit", nmap: "Nmap", wireshark: "Wireshark",
  mimikatz: "Active Directory", bloodhound: "Active Directory",
  // Languages used in security
  assembly: "Assembly/ASM", asm: "Assembly/ASM",
};

// ─── Score accumulator ───────────────────────────────────────────────────────

type Entry = {
  displayName: string;
  category: "fullstack" | "cyber";
  points: number;
  evidence: string[];
};

type ScoreMap = Map<string, Entry>;

function addPoints(
  map: ScoreMap,
  key: string,
  displayName: string,
  category: "fullstack" | "cyber",
  points: number,
  reason: string,
) {
  const existing = map.get(key);
  if (existing) {
    existing.points += points;
    if (!existing.evidence.includes(reason)) existing.evidence.push(reason);
  } else {
    map.set(key, { displayName, category, points, evidence: [reason] });
  }
}

// ─── GitHub fetch ─────────────────────────────────────────────────────────────

type GHRepo = {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  pushed_at: string;
  size: number;
};

type GHEvent = { type: string; created_at: string };

async function fetchGitHub(username: string): Promise<{
  langRepos: Map<string, { repos: number; stars: number; recentPush: boolean }>;
  pushes30d: number;
  totalRepos: number;
}> {
  const empty = { langRepos: new Map(), pushes30d: 0, totalRepos: 0 };
  try {
    const [repoRes, eventRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=100`),
    ]);

    const langRepos = new Map<string, { repos: number; stars: number; recentPush: boolean }>();
    let totalRepos = 0;

    if (repoRes.ok) {
      const repos = (await repoRes.json()) as GHRepo[];
      const cutoff30d = Date.now() - 30 * 24 * 60 * 60 * 1000;
      for (const r of repos) {
        if (r.fork || !r.language) continue;
        totalRepos++;
        const lang = r.language.toLowerCase();
        const existing = langRepos.get(lang) ?? { repos: 0, stars: 0, recentPush: false };
        existing.repos++;
        existing.stars += r.stargazers_count;
        if (new Date(r.pushed_at).getTime() >= cutoff30d) existing.recentPush = true;
        langRepos.set(lang, existing);
      }
    }

    let pushes30d = 0;
    if (eventRes.ok) {
      const events = (await eventRes.json()) as GHEvent[];
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      pushes30d = events.filter(
        (e) => e.type === "PushEvent" && new Date(e.created_at).getTime() >= cutoff,
      ).length;
    }

    return { langRepos, pushes30d, totalRepos };
  } catch {
    return empty;
  }
}

// ─── Tokeniser ───────────────────────────────────────────────────────────────

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,/|·\-_#@()\[\]{}]+/)
    .map((t) => t.replace(/[^a-z0-9.#+]/g, ""))
    .filter((t) => t.length > 1);
}

/** Try multi-word matches first, then single tokens */
function matchKeywords(
  text: string,
  dict: Record<string, string>,
): Array<{ key: string; display: string }> {
  const lower = text.toLowerCase();
  const hits: Array<{ key: string; display: string }> = [];
  const seen = new Set<string>();

  // Multi-word first
  for (const [key, display] of Object.entries(dict)) {
    if (key.includes(" ") && lower.includes(key) && !seen.has(key)) {
      hits.push({ key, display });
      seen.add(key);
    }
  }
  // Single tokens
  for (const token of tokenise(text)) {
    if (dict[token] && !seen.has(token)) {
      hits.push({ key: token, display: dict[token] });
      seen.add(token);
    }
  }
  return hits;
}

// ─── Absolute scoring benchmarks ─────────────────────────────────────────────
//
// Each source contributes a fixed number of points per unit of evidence.
// Points are NOT relative — they map to real-world effort benchmarks.
// Final progress = clamp(raw_points, 0, MAX_PROGRESS).
//
// Benchmarks (what it takes to reach ~60 points = "master"):
//   GitHub: 5 repos in a language + active pushes
//   LeetCode: ~200 problems solved
//   HTB: "Hacker" rank
//   HackerOne: ~200 reputation
//   Projects: 4+ projects using the tech
//   Writeups: 5+ writeups on the topic
//   Certs: 1 relevant cert

// ─── Main engine ─────────────────────────────────────────────────────────────

export type ScanSources = {
  handles: ExternalHandles;
  achievements: ExternalAchievements;
  projects: Project[];
  posts: BlogPost[];
  certifications: Certification[];
};

export async function deriveSkills(sources: ScanSources): Promise<DerivedSkill[]> {
  const scores: ScoreMap = new Map();

  const githubHandle = sources.handles.githubUsername?.trim().replace(/^@/, "") || null;

  // ── 1. GitHub ─────────────────────────────────────────────────────────────
  if (githubHandle) {
    const gh = await fetchGitHub(githubHandle);

    for (const [lang, data] of gh.langRepos) {
      const fsDisplay = FULLSTACK_TECH[lang];
      const cyDisplay = CYBER_TECH[lang];
      const display = fsDisplay ?? cyDisplay;
      const cat: "fullstack" | "cyber" = fsDisplay ? "fullstack" : "cyber";
      if (!display) continue;

      // Base: 6pts per repo, max 30pts from repo count alone
      const repoPoints = Math.min(data.repos * 6, 30);
      // Stars: 1pt per star, max 10pts
      const starPoints = Math.min(data.stars, 10);
      // Recent activity bonus: 8pts if pushed in last 30d
      const activityPoints = data.recentPush ? 8 : 0;

      const total = repoPoints + starPoints + activityPoints;
      if (total > 0) {
        addPoints(
          scores, lang, display, cat, total,
          `GitHub: ${data.repos} repo${data.repos > 1 ? "s" : ""}${data.recentPush ? ", active" : ""}`,
        );
      }
    }

    // Git as a skill — based on push frequency
    if (gh.pushes30d > 0) {
      // 2pts per push, max 20pts (10 pushes = solid Git usage)
      const gitPts = Math.min(gh.pushes30d * 2, 20);
      addPoints(scores, "git", "Git", "fullstack", gitPts, `GitHub: ${gh.pushes30d} pushes in 30d`);
    }
  }

  // ── 2. Projects ───────────────────────────────────────────────────────────
  for (const project of sources.projects) {
    const text = `${project.stack} ${project.name} ${project.desc}`;

    for (const { key, display } of matchKeywords(project.stack, FULLSTACK_TECH)) {
      // 7pts per project using this tech
      addPoints(scores, key, display, "fullstack", 7, `Project: ${project.name}`);
    }
    for (const { key, display } of matchKeywords(text, CYBER_TECH)) {
      addPoints(scores, key, display, "cyber", 7, `Project: ${project.name}`);
    }
  }

  // ── 3. Writeups ───────────────────────────────────────────────────────────
  for (const post of sources.posts) {
    const text = `${post.title} ${post.tags.join(" ")}`;

    for (const { key, display } of matchKeywords(text, CYBER_TECH)) {
      // 9pts per writeup — writing about a topic signals real understanding
      addPoints(scores, key, display, "cyber", 9, `Writeup: "${post.title}"`);
    }
    for (const { key, display } of matchKeywords(text, FULLSTACK_TECH)) {
      addPoints(scores, key, display, "fullstack", 6, `Writeup: "${post.title}"`);
    }
  }

  // ── 4. Certifications ─────────────────────────────────────────────────────
  for (const cert of sources.certifications) {
    const text = `${cert.name} ${cert.issuer}`;
    const lower = text.toLowerCase();

    // Detect category from cert content
    const isCyberCert =
      matchKeywords(text, CYBER_TECH).length > 0 ||
      ["offensive security", "ec-council", "comptia", "isc2", "sans", "hackthebox",
       "elearn", "tcm", "pnpt", "oscp", "ceh", "cissp", "security+"].some((k) => lower.includes(k));

    const isFullstackCert =
      matchKeywords(text, FULLSTACK_TECH).length > 0 ||
      ["aws", "gcp", "azure", "google cloud", "kubernetes", "cka", "ckad",
       "terraform", "docker"].some((k) => lower.includes(k));

    if (isCyberCert) {
      // 20pts per cert — certs are hard evidence
      addPoints(scores, `cert:${cert.name}`, cert.name, "cyber", 20, `Cert: ${cert.name} (${cert.issuer})`);
      // Also boost related skills
      for (const { key, display } of matchKeywords(text, CYBER_TECH)) {
        addPoints(scores, key, display, "cyber", 10, `Cert: ${cert.name}`);
      }
    } else if (isFullstackCert) {
      addPoints(scores, `cert:${cert.name}`, cert.name, "fullstack", 18, `Cert: ${cert.name} (${cert.issuer})`);
      for (const { key, display } of matchKeywords(text, FULLSTACK_TECH)) {
        addPoints(scores, key, display, "fullstack", 8, `Cert: ${cert.name}`);
      }
    }
  }

  // ── 5. LeetCode ───────────────────────────────────────────────────────────
  // Benchmark: 500 solved = ~60pts (master). 1 solved = ~2pts (initiate).
  // Formula: sqrt(solved) * 2.7, capped at 60. Brutal for low counts.
  const leetSolved = sources.achievements.leetcodeSolved ?? 0;
  if (leetSolved > 0) {
    const dsaPts = Math.min(Math.round(Math.sqrt(leetSolved) * 2.7), 60);
    const psPts = Math.min(Math.round(Math.sqrt(leetSolved) * 1.8), 40);
    addPoints(scores, "dsa", "Data Structures & Algorithms", "fullstack", dsaPts,
      `LeetCode: ${leetSolved} solved`);
    addPoints(scores, "problem-solving", "Problem Solving", "fullstack", psPts,
      `LeetCode: ${leetSolved} solved`);
  }

  // ── 6. HackerOne ──────────────────────────────────────────────────────────
  // Benchmark: 500 rep = ~55pts (master). 0 rep = nothing — account alone proves nothing.
  // Formula: sqrt(rep) * 2.1, capped at 55. Requires actual reputation to score.
  const h1Rep = sources.achievements.hackeroneReputation;
  if (h1Rep !== null && h1Rep > 0) {
    const repPts = Math.min(Math.round(Math.sqrt(h1Rep) * 2.1), 55);
    const webPts = Math.min(Math.round(Math.sqrt(h1Rep) * 1.4), 40);
    addPoints(scores, "bug-bounty", "Bug Bounty", "cyber", repPts,
      `HackerOne: ${h1Rep} reputation`);
    addPoints(scores, "web-security", "Web Security", "cyber", webPts,
      `HackerOne: ${h1Rep} reputation`);
  }

  // ── 7. Hack The Box ───────────────────────────────────────────────────────
  // Absolute rank ladder — Noob is excluded (no real skill proven yet).
  // Each rank above Noob maps to a fixed score.
  const htbRank = sources.achievements.hacktheboxRank?.toLowerCase().replace(/\s+/g, "_") ?? null;
  if (htbRank) {
    const HTB_RANK_POINTS: Record<string, number> = {
      // noob: intentionally omitted — having an account proves nothing
      script_kiddie: 16,
      hacker: 28,
      pro_hacker: 40,
      elite_hacker: 52,
      guru: 65,
      omniscient: 78,
    };
    const htbPts = HTB_RANK_POINTS[htbRank] ?? 0;
    if (htbPts > 0) {
      const rankLabel = sources.achievements.hacktheboxRank ?? htbRank;
      addPoints(scores, "htb", "Hack The Box", "cyber", htbPts, `HTB rank: ${rankLabel}`);
      addPoints(scores, "pentest", "Penetration Testing", "cyber",
        Math.round(htbPts * 0.75), `HTB rank: ${rankLabel}`);
      addPoints(scores, "ctf", "CTF", "cyber",
        Math.round(htbPts * 0.65), `HTB rank: ${rankLabel}`);
    }
  }

  // ── Build final list ──────────────────────────────────────────────────────
  const derived: DerivedSkill[] = [];

  for (const [, entry] of scores) {
    // Clamp: never 0, never above MAX_PROGRESS
    const progress = Math.max(MIN_PROGRESS, Math.min(entry.points, MAX_PROGRESS));
    if (entry.points < MIN_PROGRESS) continue; // not enough evidence

    derived.push({
      name: entry.displayName,
      category: entry.category,
      level: progressToLevel(progress),
      progress,
      evidence: entry.evidence,
    });
  }

  // Sort: fullstack first, then by progress desc
  derived.sort((a, b) => {
    if (a.category !== b.category) return a.category === "fullstack" ? -1 : 1;
    return b.progress - a.progress;
  });

  return derived;
}
