import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search, X, Swords, Terminal, ShieldAlert, LayoutGrid, FolderGit2, GitCommitVertical, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommandPalette } from "@/components/saber/CommandPalette";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/skills", label: "Skills" },
  { to: "/writeups", label: "Writeups" },
  { to: "/contact", label: "Contact" },
];

const moreLinks = [
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/timeline", label: "Timeline", icon: GitCommitVertical },
  { to: "/certifications", label: "Certifications", icon: Award },
];

const allLinks = [...primaryLinks, ...moreLinks];

/** Animated admin entry point — pulsing terminal icon when logged in as admin */
function AdminButton({ mobile = false }: { mobile?: boolean }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (isAdmin) {
    return (
      <Link
        to="/admin"
        className={`group relative flex items-center gap-2 ${
          mobile
            ? "px-3 py-2.5 mt-2 border-t border-border/60 pt-4 text-xs uppercase tracking-[0.3em]"
            : "text-[10px] uppercase tracking-[0.3em]"
        } text-muted-foreground hover:text-foreground transition-colors`}
        aria-label="Admin console"
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/20 animate-ping opacity-60" />
          <ShieldAlert className="relative h-3.5 w-3.5 text-foreground/70 group-hover:text-foreground transition-colors animate-saber-pulse" />
        </span>
        <span className="hidden sm:inline">Console</span>
      </Link>
    );
  }

  return (
    <Link
      to="/admin/login"
      className={`group flex items-center gap-1.5 ${
        mobile
          ? "px-3 py-2.5 mt-2 border-t border-border/60 pt-4 text-xs uppercase tracking-[0.3em]"
          : "text-[10px] uppercase tracking-[0.3em]"
      } text-muted-foreground/50 hover:text-muted-foreground transition-colors`}
      aria-label="Admin login"
    >
      <Terminal className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  );
}

/** More dropdown — grid icon opens a small panel with the extra links */
function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isMoreActive = moreLinks.some((l) => pathname === l.to || pathname.startsWith(l.to + "/"));

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More pages"
        aria-expanded={open}
        className={`relative flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors rounded-md ${
          isMoreActive ? "text-saber-blue" : "text-muted-foreground hover:text-foreground"
        } ${open ? "bg-muted/60" : ""}`}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        More
        {isMoreActive && !open && (
          <span className="absolute left-3 right-3 -bottom-px h-px bg-saber-blue shadow-glow-blue" />
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-52 rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-lg overflow-hidden z-50 animate-scale-in">
          <div className="p-1.5">
            {moreLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-[0.2em] transition-colors ${
                    isActive
                      ? "bg-muted text-saber-blue"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <l.icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-saber-blue" : "text-muted-foreground/60"}`} />
                    {l.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ onSearchOpen }: { onSearchOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { setOpen: openPalette } = useCommandPalette();

  const handleSearchClick = () => {
    if (onSearchOpen) onSearchOpen();
    else openPalette(true);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative h-7 w-7 flex items-center justify-center">
            <svg viewBox="0 0 28 28" className="absolute inset-0 h-full w-full logo-ring text-foreground/15" fill="none">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 5" />
            </svg>
            <svg viewBox="0 0 28 28" className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] logo-ring-reverse text-foreground/25" fill="none">
              <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <Swords className="relative h-4 w-4 text-saber-blue animate-saber-pulse" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-wider">VNR610</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Realm Codex</span>
          </div>
        </Link>

        {/* Desktop nav — centered */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                  isActive ? "text-saber-blue" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-px h-px bg-saber-blue shadow-glow-blue animate-saber-ignite origin-left" />
                  )}
                </>
              )}
            </NavLink>
          ))}
          {/* More dropdown */}
          <MoreMenu />
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleSearchClick}
            className="flex items-center justify-center h-9 w-9 rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
            aria-label="Open search (⌘K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <AdminButton />
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu — shows all links */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-1">
            {/* Primary links */}
            {primaryLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.2em] ${
                    isActive ? "bg-muted text-saber-blue" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {/* More links with divider */}
            <div className="my-1 border-t border-border/40" />
            <p className="px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-muted-foreground/40">More</p>
            {moreLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.2em] ${
                    isActive ? "bg-muted text-saber-blue" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <l.icon className={`h-3.5 w-3.5 ${isActive ? "text-saber-blue" : "text-muted-foreground/50"}`} />
                    {l.label}
                  </>
                )}
              </NavLink>
            ))}
            <div onClick={() => setOpen(false)}>
              <AdminButton mobile />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
