import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Swords } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/skills", label: "Skills" },
  { to: "/projects", label: "Projects" },
  { to: "/blog", label: "Blog" },
  { to: "/timeline", label: "Timeline" },
  { to: "/certifications", label: "Certifications" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Swords className="h-5 w-5 text-saber-blue animate-saber-pulse" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-wider">VNR610</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">M Thapa Magar</span>
          </div>
        </Link>

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

        <div className="hidden md:block">
          <Link
            to="/admin/login"
            className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-saber-purple transition-colors"
          >
            Admin
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

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
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 mt-2 border-t border-border/60 pt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-saber-purple"
            >
              Admin Console
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
