import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { FileText, Sparkles, FolderGit2, GitCommitVertical, Award, ArrowUpRight } from "lucide-react";

const stats = [
  { label: "Blog Posts", icon: FileText, to: "/admin/blog" },
  { label: "Skills", icon: Sparkles, to: "/admin/skills" },
  { label: "Projects", icon: FolderGit2, to: "/admin/projects" },
  { label: "Timeline", icon: GitCommitVertical, to: "/admin/timeline" },
  { label: "Certificates", icon: Award, to: "/admin/certifications" },
];

const AdminDashboard = () => {
  return (
    <AdminLayout title="Dashboard">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold mb-2">Welcome back, <span className="saber-text">Vnr610</span></h2>
        <p className="text-sm text-muted-foreground">All realms are quiet. Forge new entries from the panels below.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
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
              <p className="font-display text-3xl">—</p>
              <p className="text-xs text-muted-foreground mt-1">No entries</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
