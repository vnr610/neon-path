import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Terminal, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LogoSaber } from "@/components/saber/LogoSaber";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/skills", label: "Skills" },
  { to: "/projects", label: "Projects" },
  { to: "/writeups", label: "Writeups" },
  { to: "/timeline", label: "Timeline" },
  { to: "/certifications", label: "Certifications" },
];

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
        {/* Animated icon container */}
        <span className="relative flex h-5 w-5 items-center justify-center">
          {/* Outer ping ring */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-foreground/20 animate-ping opacity-60" />
          {/* Icon */}
          <ShieldAlert className="relative h-3.5 w-3.5 text-foreground/70 group-hover:text-foreground transition-colors animate-saber-pulse" />
        </span>
        <span className="hidden sm:inline">Console</span>
      </Link>
    );
  }

  // Not admin — show subtle login link
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

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative h-7 w-7 flex items-center justify-center">
            {/* Outer rotating ring */}
            <svg viewBox="0 0 28 28" className="absolute inset-0 h-full w-full logo-ring text-foreground/15" fill="none">
              <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 5" />
            </svg>
            {/* Inner counter-rotating ring */}
            <svg viewBox="0 0 28 28" className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] logo-ring-reverse text-foreground/25" fill="none">
              <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <LogoSaber size={18} className="relative" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-wider">VNR610</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Realm Codex</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
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
        </nav>

        {/* Desktop admin button */}
        <div className="hidden md:flex items-center">
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
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
            <div onClick={() => setOpen(false)}>
              <AdminButton mobile />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
