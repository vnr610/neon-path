import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { FileText, Sparkles, FolderGit2, GitCommitVertical, Award, ArrowUpRight } from "lucide-react";
import { useAdminContentCounts } from "@/hooks/useAdminContentCounts";
import { getAdminGreeting } from "@/lib/adminGreeting";
import type { AdminContentCounts } from "@/lib/content";

const stats: {
  label: string;
  icon: typeof FileText;
  to: string;
  countKey: keyof AdminContentCounts;
}[] = [
  { label: "Writeups", icon: FileText, to: "/admin/writeups", countKey: "blogPosts" },
  { label: "Skills", icon: Sparkles, to: "/admin/skills", countKey: "skills" },
  { label: "Projects", icon: FolderGit2, to: "/admin/projects", countKey: "projects" },
  { label: "Timeline", icon: GitCommitVertical, to: "/admin/timeline", countKey: "timeline" },
  { label: "Certificates", icon: Award, to: "/admin/certifications", countKey: "certifications" },
];

const AdminDashboard = () => {
  const { data, isLoading, isError } = useAdminContentCounts();
  const [greeting, setGreeting] = useState(() => getAdminGreeting());

  useEffect(() => {
    setGreeting(getAdminGreeting());
    const id = window.setInterval(() => setGreeting(getAdminGreeting()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold mb-2">
          {greeting.timeGreeting}, <span className="saber-text">Vnr610</span>
        </h2>
        {greeting.specialLines.length > 0 ? (
          <div className="text-sm text-muted-foreground space-y-1">
            {greeting.specialLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            All realms are quiet. Forge new entries from the panels below.
          </p>
        )}
        <p className="text-xs text-muted-foreground/70 mt-3">
          {greeting.kathmanduLabel} · Nepal time (Asia/Kathmandu)
        </p>
        {isError && (
          <p className="text-xs text-destructive mt-2">Counts could not be refreshed. Check your connection.</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => {
          const n = data?.[s.countKey];
          const count = typeof n === "number" ? n : null;
          return (
            <Link
              key={s.to}
              to={s.to}
              className="saber-card p-6 group flex flex-col gap-6"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-md saber-border flex items-center justify-center group-hover:shadow-glow-blue transition-shadow">
                  <s.icon className="h-4 w-4 text-saber-blue" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-saber-blue transition-colors" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">{s.label}</p>
                <p className="font-display text-3xl tabular-nums">
                  {isLoading && count === null ? "…" : count ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isLoading && count === null
                    ? "Syncing…"
                    : count === null
                      ? "—"
                      : count === 0
                        ? "No entries yet"
                        : `${count} ${count === 1 ? "entry" : "entries"}`}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
