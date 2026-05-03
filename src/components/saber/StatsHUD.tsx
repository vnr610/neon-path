/**
 * StatsHUD — Horizontal rectangle: radar LEFT + live stats RIGHT
 *
 * Layout: wide card, radar pentagon on the left half, stat rows on the right.
 * Radar: rotating scan beam, self-drawing polygon, pulsing vertex nodes.
 * Stats: count-up numbers, animated mini bars, handle links.
 * Header: live dot + Nepal clock. Footer: source count.
 */

import { useEffect, useRef, useState } from "react";
import { Activity, Bug, Code2, Github, Shield, Wifi, WifiOff } from "lucide-react";
import { loadSiteHome } from "@/lib/content";
import { loadExternalAchievements, type ExternalAchievements } from "@/lib/externalAchievements";

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number | null, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === null) return;
    const start = performance.now() + delay;
    const run = (now: number) => {
      const elapsed = Math.max(0, now - start);
      const t = Math.min(elapsed / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, delay]);
  return value;
}

// ─── Polar → SVG cartesian ────────────────────────────────────────────────────

function polar(deg: number, r: number, cx = 50, cy = 50, size = 38): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + size * r * Math.cos(rad), cy + size * r * Math.sin(rad)];
}

// ─── Radar chart ─────────────────────────────────────────────────────────────

function RadarChart({ values, labels, loading }: { values: number[]; labels: string[]; loading: boolean }) {
  const N = values.length;
  const angles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  // Polygon draw-in
  const [drawn, setDrawn] = useState(0);
  const drawnRaf = useRef<number>(0);
  useEffect(() => {
    if (loading) return;
    const start = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - start) / 1600, 1);
      setDrawn(1 - Math.pow(1 - t, 3));
      if (t < 1) drawnRaf.current = requestAnimationFrame(run);
    };
    drawnRaf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(drawnRaf.current);
  }, [loading]);

  // Scan beam
  const [scanAngle, setScanAngle] = useState(0);
  useEffect(() => {
    let a = 0;
    const id = setInterval(() => { a = (a + 1.4) % 360; setScanAngle(a); }, 16);
    return () => clearInterval(id);
  }, []);

  const polyPoints = angles
    .map((a, i) => polar(a, (values[i] ?? 0) * drawn))
    .map(([x, y]) => `${x},${y}`)
    .join(" ");

  const [sx, sy] = polar(scanAngle, 1);
  const [sx2, sy2] = polar(scanAngle - 10, 0.9);

  return (
    <svg viewBox="-12 -12 124 124" className="w-full h-full" aria-hidden>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((r) => {
        const pts = angles.map((a) => polar(a, r)).map(([x, y]) => `${x},${y}`).join(" ");
        return <polygon key={r} points={pts} fill="none" stroke="hsl(0 0% 100% / 0.07)" strokeWidth="0.5" />;
      })}

      {/* Spokes */}
      {angles.map((a, i) => {
        const [x, y] = polar(a, 1);
        return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="hsl(0 0% 100% / 0.08)" strokeWidth="0.4" />;
      })}

      {/* Scan wedge */}
      <path d={`M 50 50 L ${sx} ${sy} L ${sx2} ${sy2} Z`} fill="hsl(0 0% 100% / 0.05)" />
      <line x1="50" y1="50" x2={sx} y2={sy} stroke="hsl(0 0% 100% / 0.22)" strokeWidth="0.7" />

      {/* Data polygon */}
      {!loading && (
        <polygon
          points={polyPoints}
          fill="hsl(0 0% 100% / 0.07)"
          stroke="hsl(0 0% 100% / 0.6)"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
      )}

      {/* Vertex nodes */}
      {!loading && angles.map((a, i) => {
        const [x, y] = polar(a, (values[i] ?? 0) * drawn);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="2.8" fill="none" stroke="hsl(0 0% 100% / 0.18)" strokeWidth="0.5">
              <animate attributeName="r" values="2;4;2" dur={`${2.2 + i * 0.25}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur={`${2.2 + i * 0.25}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r="1.6" fill="hsl(0 0% 96%)" opacity="0.9" />
          </g>
        );
      })}

      {/* Center */}
      <circle cx="50" cy="50" r="1.8" fill="hsl(0 0% 100% / 0.5)" />
      <circle cx="50" cy="50" r="3.5" fill="none" stroke="hsl(0 0% 100% / 0.12)" strokeWidth="0.5" />

      {/* Labels */}
      {angles.map((a, i) => {
        const [x, y] = polar(a, 1.32);
        // nudge anchor based on horizontal position to avoid clipping
        const anchor = x < 44 ? "end" : x > 56 ? "start" : "middle";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle"
            fontSize="4.5" fill="hsl(0 0% 100% / 0.45)" fontFamily="JetBrains Mono, monospace">
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Mini bar ─────────────────────────────────────────────────────────────────

function MiniBar({ value, max, delay }: { value: number; max: number; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(Math.min((value / max) * 100, 92)), delay);
    return () => clearTimeout(id);
  }, [value, max, delay]);
  return (
    <div className="h-px w-full bg-foreground/10 rounded-full overflow-hidden mt-1.5">
      <div className="h-full bg-gradient-to-r from-foreground/70 to-foreground/25 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${w}%` }} />
    </div>
  );
}

// ─── Stat row ─────────────────────────────────────────────────────────────────

type StatRowProps = {
  icon: React.ReactNode;
  label: string;
  value: number | null;
  max: number;
  delay: number;
  loading: boolean;
  href?: string;
  handle?: string;
  displayValue?: string;
};

function StatRow({ icon, label, value, max, delay, loading, href, handle, displayValue }: StatRowProps) {
  const counted = useCountUp(value, 900, delay);
  return (
    <div className="animate-fade-right opacity-0" style={{ animationDelay: `${delay / 1000}s` }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-muted-foreground/60 shrink-0">{icon}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground truncate">{label}</span>
        </div>
        <span className="font-display text-xs tabular-nums shrink-0">
          {loading
            ? <span className="text-muted-foreground/30 animate-pulse">…</span>
            : value === null
              ? <span className="text-muted-foreground/25">—</span>
              : displayValue ?? counted}
        </span>
      </div>
      {!loading && value !== null && <MiniBar value={value} max={max} delay={delay + 300} />}
      {href && handle && (
        <a href={href} target="_blank" rel="noreferrer"
          className="font-mono text-[8px] text-muted-foreground/30 hover:text-foreground/60 transition-colors mt-0.5 block truncate">
          {handle}
        </a>
      )}
    </div>
  );
}

// ─── Main HUD ─────────────────────────────────────────────────────────────────

export function StatsHUD() {
  const [achievements, setAchievements] = useState<ExternalAchievements | null>(null);
  const [handles, setHandles] = useState({ github: "", leetcode: "", htb: "", hackerone: "" });
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const home = await loadSiteHome();
        const ach = await loadExternalAchievements({
          githubUsername: home.githubUsername,
          leetcodeUsername: home.leetcodeUsername,
          hacktheboxUsername: home.hacktheboxUsername,
          hackeroneUsername: home.hackeroneUsername,
        });
        if (cancelled) return;
        setAchievements(ach);
        setHandles({
          github: home.githubUsername?.replace(/^@/, "") ?? "",
          leetcode: home.leetcodeUsername?.replace(/^@/, "") ?? "",
          htb: home.hacktheboxUsername ?? "",
          hackerone: home.hackeroneUsername?.replace(/^@/, "") ?? "",
        });
        setOnline(true);
      } catch {
        if (!cancelled) setOnline(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Kathmandu",
  });

  const htbRankMap: Record<string, number> = {
    noob: 5, script_kiddie: 15, hacker: 28, pro_hacker: 42,
    elite_hacker: 58, guru: 74, omniscient: 88,
  };
  const htbNum = (() => {
    const k = achievements?.hacktheboxRank?.toLowerCase().replace(/\s+/g, "_") ?? "";
    return htbRankMap[k] ?? (achievements?.hacktheboxRank ? 10 : null);
  })();

  const radarValues = [
    Math.min((achievements?.githubPushes30d ?? 0) / 50, 1),
    Math.min((achievements?.leetcodeSolved ?? 0) / 500, 1),
    Math.min((htbNum ?? 0) / 88, 1),
    Math.min((achievements?.hackeroneReputation ?? 0) / 500, 1),
    Math.min((achievements?.githubPublicEvents30d ?? 0) / 100, 1),
  ];

  const sourcesLoaded = [
    achievements?.githubPushes30d,
    achievements?.leetcodeSolved,
    htbNum,
    achievements?.hackeroneReputation,
    achievements?.githubPublicEvents30d,
  ].filter((v) => v !== null && v !== undefined).length;

  return (
    <div
      className="relative w-full animate-fade-right opacity-0 select-none"
      style={{ animationDelay: "0.7s", maxWidth: "640px" }}
    >
      {/* Outer gradient border */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-foreground/12 via-transparent to-foreground/6 pointer-events-none" />

      <div className="relative rounded-xl border border-border/60 bg-card/85 backdrop-blur-md overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-background/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-60 ${online ? "bg-foreground/70" : "bg-destructive/70"}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${online ? "bg-foreground/90" : "bg-destructive/90"}`} />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground">
              {online ? "live" : "offline"}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/30 mx-1">·</span>
            <span className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-[0.2em]">
              skill · radar · metrics
            </span>
          </div>
          <div className="flex items-center gap-2">
            {online ? <Wifi className="h-3 w-3 text-muted-foreground/40" /> : <WifiOff className="h-3 w-3 text-destructive/50" />}
            <span className="font-mono text-[9px] text-muted-foreground/40 tabular-nums">{timeStr}</span>
          </div>
        </div>

        {/* ── Body: radar LEFT + stats RIGHT ── */}
        <div className="flex gap-0">

          {/* Radar panel */}
          <div className="flex-shrink-0 w-[240px] p-4 border-r border-border/40">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
              // radar
            </p>
            <div className="w-full aspect-square">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border border-foreground/10 animate-ping opacity-20" />
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-muted-foreground/30 animate-pulse">
                      scanning
                    </span>
                  </div>
                </div>
              ) : (
                <RadarChart values={radarValues} labels={["GH", "LC", "HTB", "H1", "ACT"]} loading={loading} />
              )}
            </div>
            {/* Radar legend */}
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
              {[
                { key: "GH", label: "GitHub" },
                { key: "LC", label: "LeetCode" },
                { key: "HTB", label: "HackTheBox" },
                { key: "H1", label: "HackerOne" },
                { key: "ACT", label: "Activity" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-1">
                  <span className="h-px w-3 bg-foreground/30" />
                  <span className="font-mono text-[8px] text-muted-foreground/40">{item.key} · {item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats panel */}
          <div className="flex-1 p-4 min-w-0">
            <p className="font-mono text-[8.5px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-4">
              // live · metrics
            </p>
            <div className="space-y-4">
              <StatRow
                icon={<Github className="h-3.5 w-3.5" />}
                label="GitHub pushes · 30d"
                value={achievements?.githubPushes30d ?? null}
                max={50} delay={900} loading={loading}
                href={handles.github ? `https://github.com/${handles.github}` : undefined}
                handle={handles.github ? `@${handles.github}` : undefined}
              />
              <StatRow
                icon={<Code2 className="h-3.5 w-3.5" />}
                label="LeetCode solved"
                value={achievements?.leetcodeSolved ?? null}
                max={500} delay={1050} loading={loading}
                href={handles.leetcode ? `https://leetcode.com/u/${handles.leetcode}/` : undefined}
                handle={handles.leetcode ? `@${handles.leetcode}` : undefined}
              />
              <StatRow
                icon={<Shield className="h-3.5 w-3.5" />}
                label="HTB rank"
                value={htbNum}
                max={88} delay={1200} loading={loading}
                href={handles.htb ? `https://app.hackthebox.com/users/${handles.htb}` : undefined}
                handle={achievements?.hacktheboxRank ?? undefined}
                displayValue={achievements?.hacktheboxRank ?? undefined}
              />
              <StatRow
                icon={<Bug className="h-3.5 w-3.5" />}
                label="HackerOne rep"
                value={achievements?.hackeroneReputation ?? null}
                max={500} delay={1350} loading={loading}
                href={handles.hackerone ? `https://hackerone.com/${handles.hackerone}` : undefined}
                handle={handles.hackerone ? `@${handles.hackerone}` : undefined}
              />
              <StatRow
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Public events · 30d"
                value={achievements?.githubPublicEvents30d ?? null}
                max={100} delay={1500} loading={loading}
              />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-4 py-2 border-t border-border/40 bg-background/20 flex items-center justify-between">
          <span className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-[0.22em]">vnr610 · realm</span>
          <span className="font-mono text-[8px] text-muted-foreground/25 tabular-nums">
            {loading ? "syncing…" : `${sourcesLoaded}/5 sources`}
          </span>
        </div>

        {/* Scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/6 to-transparent animate-scan-line" />
        </div>
      </div>

      {/* Corner accents */}
      <svg className="absolute -top-2 -right-2 h-4 w-4 text-foreground/20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M16 0 H10 M16 0 V6" />
      </svg>
      <svg className="absolute -bottom-2 -left-2 h-4 w-4 text-foreground/20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 16 H6 M0 16 V10" />
      </svg>
    </div>
  );
}
