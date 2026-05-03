/**
 * EditToolbar — floating draggable toolbar shown to logged-in admins/editors.
 * Grab the grip handle to drag it anywhere on screen. Click collapse to minimise.
 */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Pencil, LogOut, ChevronUp, ChevronDown, GripHorizontal } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

function getEditLink(pathname: string, role: "admin" | "editor" | null): { label: string; href: string } | null {
  if (pathname.startsWith("/writeups/") && pathname.length > 10) {
    const slug = pathname.replace("/writeups/", "");
    return { label: "Edit writeup", href: `/admin/writeups?edit=${slug}` };
  }
  if (pathname === "/writeups" || pathname === "/blog") {
    return { label: "Manage writeups", href: "/admin/writeups" };
  }
  if (pathname === "/projects") {
    return role === "admin" ? { label: "Manage projects", href: "/admin/projects" } : null;
  }
  if (pathname === "/skills") {
    return role === "admin" ? { label: "Manage skills", href: "/admin/skills" } : null;
  }
  if (pathname === "/timeline") {
    return role === "admin" ? { label: "Manage timeline", href: "/admin/timeline" } : null;
  }
  if (pathname === "/certifications") {
    return role === "admin" ? { label: "Manage certs", href: "/admin/certifications" } : null;
  }
  if (pathname === "/" || pathname === "/about") {
    return role === "admin" ? { label: "Edit home page", href: "/admin/home" } : null;
  }
  if (pathname === "/contact") {
    return role === "admin" || role === "editor" ? { label: "View messages", href: "/admin/messages" } : null;
  }
  return null;
}

export function EditToolbar() {
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Set initial position to bottom-center
  useEffect(() => {
    setPos({
      x: window.innerWidth / 2,
      y: window.innerHeight - 40,
    });
  }, []);

  // Mouse drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) return;
    e.preventDefault();
    dragging.current = true;
    const rect = toolbarRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - (rect.left + rect.width / 2),
        y: e.clientY - (rect.top + rect.height / 2),
      };
    }
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Touch drag
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!(e.target as HTMLElement).closest("[data-drag-handle]")) return;
    dragging.current = true;
    const touch = e.touches[0];
    const rect = toolbarRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: touch.clientX - (rect.left + rect.width / 2),
        y: touch.clientY - (rect.top + rect.height / 2),
      };
    }
  }, []);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      const touch = e.touches[0];
      setPos({
        x: touch.clientX - dragOffset.current.x,
        y: touch.clientY - dragOffset.current.y,
      });
    };
    const onTouchEnd = () => { dragging.current = false; };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  if (loading || !user || !role) return null;
  if (location.pathname.startsWith("/admin")) return null;
  if (pos === null) return null;

  const editLink = getEditLink(location.pathname, role);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const style: React.CSSProperties = {
    position: "fixed",
    left: pos.x,
    top: pos.y,
    transform: "translate(-50%, -50%)",
    zIndex: 50,
  };

  return (
    <div ref={toolbarRef} style={style} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/90 border border-saber-blue/40 shadow-glow-blue backdrop-blur text-saber-blue text-[10px] uppercase tracking-[0.25em] font-mono hover:bg-muted/60 transition-all select-none"
        >
          <Pencil className="h-3 w-3" />
          Edit mode
          <ChevronUp className="h-3 w-3" />
        </button>
      ) : (
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-background/90 border border-saber-blue/40 shadow-glow-blue backdrop-blur select-none">
          {/* Drag handle */}
          <span
            data-drag-handle="true"
            className="flex items-center px-2 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            title="Drag to move"
          >
            <GripHorizontal className="h-3.5 w-3.5" />
          </span>

          {/* Role badge */}
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-saber-blue px-2 border-r border-border/60">
            {role}
          </span>

          {/* Edit current page */}
          {editLink && (
            <Link
              to={editLink.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-foreground hover:text-saber-blue hover:bg-muted/60 transition-colors"
            >
              <Pencil className="h-3 w-3" />
              {editLink.label}
            </Link>
          )}

          {editLink && <span className="h-4 w-px bg-border/60" />}

          {/* Dashboard */}
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <LayoutDashboard className="h-3 w-3" />
            Dashboard
          </Link>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-mono text-muted-foreground hover:text-destructive hover:bg-muted/60 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Exit
          </button>

          {/* Collapse */}
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center px-2 py-1.5 rounded-full text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}
