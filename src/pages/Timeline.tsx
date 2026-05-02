import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHeader } from "@/components/saber/PageHeader";
import { EmptyState } from "@/components/saber/EmptyState";
import { GitCommitVertical } from "lucide-react";
import { loadTimelineEntries, type TimelineEntry, formatDate } from "@/lib/content";

const Timeline = () => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const data = await loadTimelineEntries();
      setEntries(data);
    };
    fetchEntries();
  }, []);

  return (
    <SiteLayout>
      <div className="container py-16 max-w-4xl">
        <PageHeader title="Progress Timeline" subtitle="The chronological journey — every milestone, ignited." />

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-saber-blue/0 via-saber-blue/50 to-saber-purple/0 shadow-[0_0_8px_hsl(var(--saber-blue)/0.6)]" />

          <div className="pl-12 space-y-10">
            {entries.length === 0 ? (
              <EmptyState
                icon={GitCommitVertical}
                title="No timeline entries yet"
                description="Each new milestone will be plotted along the saber spine with date, realm, and description."
                hint="The path forms only as you walk it."
                status="timeline :: t = 0"
              />
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="relative pl-8">
                  <span className="absolute left-0 top-4 h-3.5 w-3.5 rounded-full bg-saber-blue shadow-[0_0_10px_hsl(var(--saber-blue)/0.5)]" />
                  <div className="saber-card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span>{formatDate(entry.date)}</span>
                      <span className="font-mono uppercase tracking-[0.2em] text-saber-purple">{entry.realm}</span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold">{entry.title}</h2>
                    {entry.desc && <p className="mt-3 text-muted-foreground">{entry.desc}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Timeline;
