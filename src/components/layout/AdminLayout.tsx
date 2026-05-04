import { ReactNode, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Home, FileText, Sparkles, FolderGit2, GitCommitVertical, Award, LogOut, Swords, Menu, X, BarChart2, Rss, Settings, Trash2, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/home", label: "Home page", icon: Home },
  { to: "/admin/writeups", label: "Writeups", icon: FileText },
  { to: "/admin/skills", label: "Skills", icon: Sparkles },
  { to: "/admin/projects", label: "Projects", icon: FolderGit2 },
  { to: "/admin/timeline", label: "Timeline", icon: GitCommitVertical },
  { to: "/admin/certifications", label: "Certificates", icon: Award },
  { to: "/admin/newsletter", label: "Newsletter", icon: Rss },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/admin/devlog", label: "Dev Diary", icon: BookOpen },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/recycle-bin", label: "Recycle Bin", icon: Trash2 },
];

export function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-80 max-w-[85vw] border-r border-border/60 bg-background/80 backdrop-blur-xl flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-border/60">
          <Link to="/" className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-saber-blue animate-saber-pulse" />
            <span className="font-display text-xs tracking-[0.3em]">VNR610</span>
          </Link>
          <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="px-5 pt-6 pb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Console</p>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.18em] transition-all ${
                  isActive
                    ? "bg-muted text-saber-blue shadow-[inset_2px_0_0_hsl(var(--saber-blue))]"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`
              }
            >
              <it.icon className="h-4 w-4 shrink-0" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border/60">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Disengage
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl flex items-center px-6 gap-4">
          <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="h-px w-6 bg-saber-blue shadow-glow-blue" />
            <h1 className="font-display text-sm tracking-[0.25em] uppercase">{title}</h1>
          </div>
        </header>
        <main className="flex-1 p-6 sm:p-10">{children}</main>
      </div>
    </div>
  );
}
