import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X, Swords, Terminal, ShieldAlert, LayoutGrid, FolderGit2, GitCommitVertical, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommandPalette } from "@/components/saber/CommandPalette";
import { FontToggle, FontToggleMobile } from "@/components/saber/FontToggle";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/skills", label: "Skills" },
  { to: "/writeups", label: "Writeups" },
  { to: "/devlog", label: "Dev Diary" },
  { to: "/contact", label: "Contact" },
];

const moreLinks = [
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/timeline", label: "Timeline", icon: GitCommitVertical },
  { to: "/certifications", label: "Certifications", icon: Award },
];

/**
 * Returns true when the current pathname is within the given section root.
 * "/" requires exact match so it doesn't mark everything as active.
 */
function isInSection(pathname: string, root: string): boolean {
  if (root === "/") return pathname === "/";
  return pathname === root || pathname.startsWith(root + "/");
}

/**
 * Navigate to a section root and always scroll to top.
 * - Already at root  → replace (no duplicate history) + smooth scroll to top
 * - On a sub-page    → push to root (useScrollToTop in App.tsx handles scroll)
 * - Elsewhere        → push to root
 * Optional closeFn closes a menu before navigating.
 */
function useNavClick(closeFn?: () => void) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback(
    (root: string) => {
      closeFn?.();
      if (pathname === root) {
        // Already at root — replace to avoid duplicate history, force scroll
        navigate(root, { replace: true });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // Sub-page or different section — push (scroll handled by useScrollToTop)
        navigate(root);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [navigate, pathname, closeFn],
  );
}

/** Animated admin entry point */
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

/** More dropdown */
function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const isMoreActive = moreLinks.some((l) => isInSection(pathname, l.to));
  const handleNav = useNavClick(() => setOpen(false));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
            {moreLinks.map((l) => {
              const active = isInSection(pathname, l.to);
              return (
                <button
                  key={l.to}
                  onClick={() => handleNav(l.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs uppercase tracking-[0.2em] transition-colors text-left ${
                    active
                      ? "bg-muted text-saber-blue"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <l.icon className={`h-3.5 w-3.5 shrink-0 ${active ? "text-saber-blue" : "text-muted-foreground/60"}`} />
                  {l.label}
                </button>
              );
            })}
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
  const handleNav = useNavClick();
  const handleMobileNav = useNavClick(() => setOpen(false));

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
          {primaryLinks.map((l) => {
            const active = isInSection(pathname, l.to);
            return (
              <button
                key={l.to}
                onClick={() => handleNav(l.to)}
                className={`relative px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-saber-blue" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-px h-px bg-saber-blue shadow-glow-blue animate-saber-ignite origin-left" />
                )}
              </button>
            );
          })}
          <MoreMenu />
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          <FontToggle />
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <nav className="container py-4 flex flex-col gap-1">
            {primaryLinks.map((l) => {
              const active = isInSection(pathname, l.to);
              return (
                <button
                  key={l.to}
                  onClick={() => handleMobileNav(l.to)}
                  className={`px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.2em] text-left ${
                    active ? "bg-muted text-saber-blue" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
            <div className="my-1 border-t border-border/40" />
            <p className="px-3 py-1 text-[9px] uppercase tracking-[0.35em] text-muted-foreground/40">More</p>
            {moreLinks.map((l) => {
              const active = isInSection(pathname, l.to);
              return (
                <button
                  key={l.to}
                  onClick={() => handleMobileNav(l.to)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.2em] text-left ${
                    active ? "bg-muted text-saber-blue" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <l.icon className={`h-3.5 w-3.5 ${active ? "text-saber-blue" : "text-muted-foreground/50"}`} />
                  {l.label}
                </button>
              );
            })}
            <div onClick={() => setOpen(false)}>
              <AdminButton mobile />
            </div>
            <div className="mt-2 pt-3 border-t border-border/40">
              <FontToggleMobile />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
