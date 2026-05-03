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
  dot: string;       // tailwind classes for the animated dot
  label: string;     // colour class for the realm label
  ring: string;      // ring glow class
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
  // Default: Full Stack / general
  return {
    Icon: Code2,
    dot: "bg-saber-blue shadow-[0_0_12px_hsl(var(--saber-blue)/0.8)]",
    label: "text-saber-blue",
    ring: "border-saber-blue/40 shadow-[0_0_8px_hsl(var(--saber-blue)/0.3)]",
  };
}

// ─── Animated node dot ────────────────────────────────────────────────────────

function TimelineNode({ style, index }: { style: RealmStyle; index: number }) {
  const { Icon, dot, ring } = style;
  return (
    <div
      className="absolute -left-[1.85rem] top-5 flex items-center justify-center"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Outer pulse ring */}
      <span
        className={`absolute h-8 w-8 rounded-full border ${ring} animate-ping opacity-20`}
        style={{ animationDuration: `${3 + (index % 3)}s` }}
      />
      {/* Icon container */}
      <span
        className={`relative h-7 w-7 rounded-full border ${ring} bg-background flex items-center justify-center`}
      >
        <Icon className="h-3.5 w-3.5 text-foreground/80" strokeWidth={1.5} />
        {/* Inner glow dot */}
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
      setEntries(data);
      setLoading(false);
    });
  }, []);

  // Group entries by year for section headers
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

  return (
    <SiteLayout>
      <SEO
        title="Progress Timeline"
        description="Every move tracked — writeups, projects, certs, platform activity."
        path="/timeline"
      />
      <div className="container py-16 max-w-3xl">
        <PageHeader
          title="Progress Timeline"
          subtitle="Every move tracked — writeups, projects, certs, platform activity. Auto-scanned, no fabrication."
        />

        {loading ? (
          <div className="space-y-6">
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
          <div className="relative">
            {/* Spine */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-saber-blue/0 via-foreground/20 to-saber-purple/0" />

            <div className="pl-10 space-y-0">
              {grouped.map(({ year, items }) => (
                <div key={year}>
                  {/* Year marker */}
                  <div className="relative mb-6 mt-10 first:mt-0">
                    <span className="absolute -left-[2.6rem] top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-foreground/40" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground/60">{year}</p>
                  </div>

                  <div className="space-y-5">
                    {items.map((entry, i) => {
                      const rs = realmStyle(entry.realm);
                      return (
                        <div
                          key={entry.id}
                          className="relative animate-fade-up opacity-0"
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                          <TimelineNode style={rs} index={i} />

                          <div className="saber-card p-5 ml-2">
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
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Timeline;
