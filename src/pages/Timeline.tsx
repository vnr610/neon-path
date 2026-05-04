import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { Award, Code2, GitCommitVertical, Shield, Terminal, Trophy, Zap } from "lucide-react";
import { SEO } from "@/components/saber/SEO";
import { loadTimelineEntries, type TimelineEntry, formatDate } from "@/lib/content";
import { type LucideIcon } from "lucide-react";

// ─── Realm → icon + colour ────────────────────────────────────────────────────

type RealmStyle = {
  Icon: LucideIcon;
  dot: string;
  label: string;
  ring: string;
};

function realmStyle(realm: string): RealmStyle {
  const r = realm.toLowerCase();
  if (r.includes("cyber") || r.includes("security") || r.includes("hack") || r.includes("pentest")) {
    return {
      Icon: Shield,
      dot: "bg-saber-purple shadow-[0_0_12px_hsl(var(--saber-purple)/0.8)]",
      label: "text-saber-purple",
      ring: "border-saber-purple/40 shadow-[0_0_8px_hsl(var(--saber-purple)/0.3)]",
    };
  }
  if (r.includes("cert")) {
    return {
      Icon: Award,
      dot: "bg-foreground/80 shadow-[0_0_12px_hsl(0_0%_100%/0.4)]",
      label: "text-foreground/80",
      ring: "border-foreground/30 shadow-[0_0_8px_hsl(0_0%_100%/0.15)]",
    };
  }
  if (r.includes("ctf") || r.includes("challenge")) {
    return {
      Icon: Trophy,
      dot: "bg-saber-purple shadow-[0_0_12px_hsl(var(--saber-purple)/0.8)]",
      label: "text-saber-purple",
      ring: "border-saber-purple/40 shadow-[0_0_8px_hsl(var(--saber-purple)/0.3)]",
    };
  }
  if (r.includes("infra") || r.includes("devops") || r.includes("cloud")) {
    return {
      Icon: Terminal,
      dot: "bg-saber-blue shadow-[0_0_12px_hsl(var(--saber-blue)/0.8)]",
      label: "text-saber-blue",
      ring: "border-saber-blue/40 shadow-[0_0_8px_hsl(var(--saber-blue)/0.3)]",
    };
  }
  if (r.includes("milestone") || r.includes("skill")) {
    return {
      Icon: Zap,
      dot: "bg-saber-blue shadow-[0_0_12px_hsl(var(--saber-blue)/0.8)]",
      label: "text-saber-blue",
      ring: "border-saber-blue/40 shadow-[0_0_8px_hsl(var(--saber-blue)/0.3)]",
    };
  }
  return {
    Icon: Code2,
    dot: "bg-saber-blue shadow-[0_0_12px_hsl(var(--saber-blue)/0.8)]",
    label: "text-saber-blue",
    ring: "border-saber-blue/40 shadow-[0_0_8px_hsl(var(--saber-blue)/0.3)]",
  };
}

// ─── Center node ──────────────────────────────────────────────────────────────

function TimelineNode({ style, index }: { style: RealmStyle; index: number }) {
  const { Icon, dot, ring } = style;
  return (
    <div className="relative flex items-center justify-center z-10">
      {/* Pulse ring */}
      <span
        className={`absolute h-10 w-10 rounded-full border ${ring} animate-ping opacity-20`}
        style={{ animationDuration: `${3 + (index % 3)}s` }}
      />
      {/* Icon circle */}
      <span className={`relative h-9 w-9 rounded-full border-2 ${ring} bg-background flex items-center justify-center`}>
        <Icon className="h-4 w-4 text-foreground/80" strokeWidth={1.5} />
        <span className={`absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full ${dot} animate-pulse`} />
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Timeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimelineEntries().then((data) => {
      // Sort latest first, secondary by createdAt for same-date entries
      const sorted = [...data].sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setEntries(sorted);
      setLoading(false);
    });
  }, []);

  // Group by year (latest year first)
  const grouped: { year: string; items: TimelineEntry[] }[] = [];
  for (const entry of entries) {
    const year = new Date(entry.date).getFullYear().toString();
    const last = grouped[grouped.length - 1];
    if (last && last.year === year) {
      last.items.push(entry);
    } else {
      grouped.push({ year, items: [entry] });
    }
  }

  // Flatten all items with a global index for alternating sides
  const allItems: { entry: TimelineEntry; globalIndex: number }[] = [];
  grouped.forEach(({ items }) => {
    items.forEach((entry) => {
      allItems.push({ entry, globalIndex: allItems.length });
    });
  });

  return (
    <SiteLayout>
      <SEO
        title="Progress Timeline"
        description="Every move tracked — writeups, projects, certs, platform activity."
        path="/timeline"
      />
      <div className="container py-16 max-w-5xl">
        <PageHeader
          title="Progress Timeline"
          subtitle="Every move tracked — writeups, projects, certs, platform activity. Auto-scanned, no fabrication."
        />

        {loading ? (
          <div className="space-y-6 max-w-3xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div key={i} className="saber-card h-24 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={GitCommitVertical}
            title="No timeline entries yet"
            description="Run the auto-scan in Admin → Timeline to populate this from your real activity."
            hint="The path forms only as you walk it."
            status="timeline :: t = 0"
          />
        ) : (
          <div className="relative mt-10">

            {/* ── Center vertical spine ── */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-saber-blue/60 via-foreground/20 to-saber-purple/60" />

            {grouped.map(({ year, items }) => {
              const yearGlobalStart = allItems.findIndex(({ entry }) =>
                new Date(entry.date).getFullYear().toString() === year
              );

              return (
                <div key={year} className="mb-2">
                  {/* Year marker — centered on the spine */}
                  <div className="relative flex items-center justify-center mb-8 mt-10 first:mt-0">
                    <div className="absolute left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full border border-border/60 bg-background font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground/70">
                      {year}
                    </div>
                    {/* Horizontal tick marks */}
                    <div className="w-full h-px bg-border/30" />
                  </div>

                  <div className="space-y-8">
                    {items.map((entry, i) => {
                      const globalIdx = yearGlobalStart + i;
                      const isLeft = globalIdx % 2 === 0; // even = left, odd = right
                      const rs = realmStyle(entry.realm);

                      return (
                        <div
                          key={entry.id}
                          className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-0 animate-fade-up opacity-0"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          {/* Left card or spacer */}
                          {isLeft ? (
                            <div className="pr-6 flex justify-end">
                              <div className="saber-card p-5 w-full max-w-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                  <span className={`font-mono text-[10px] uppercase tracking-[0.28em] ${rs.label}`}>
                                    {entry.realm}
                                  </span>
                                  <span className="font-mono text-[10px] text-muted-foreground/60">
                                    {formatDate(entry.date)}
                                  </span>
                                </div>
                                <h2 className="text-base font-semibold leading-snug">{entry.title}</h2>
                                {entry.desc && (
                                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{entry.desc}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div /> /* spacer */
                          )}

                          {/* Center node */}
                          <TimelineNode style={rs} index={globalIdx} />

                          {/* Right card or spacer */}
                          {!isLeft ? (
                            <div className="pl-6 flex justify-start">
                              <div className="saber-card p-5 w-full max-w-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                  <span className={`font-mono text-[10px] uppercase tracking-[0.28em] ${rs.label}`}>
                                    {entry.realm}
                                  </span>
                                  <span className="font-mono text-[10px] text-muted-foreground/60">
                                    {formatDate(entry.date)}
                                  </span>
                                </div>
                                <h2 className="text-base font-semibold leading-snug">{entry.title}</h2>
                                {entry.desc && (
                                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{entry.desc}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div /> /* spacer */
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Timeline;
