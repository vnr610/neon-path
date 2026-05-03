import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface RequireRoleProps {
  children: ReactNode;
  /** Roles that are allowed to access this route. Defaults to admin-only. */
  allow?: Array<"admin" | "editor">;
}

/**
 * Route guard that allows access based on role.
 * - Unauthenticated → redirect to /admin/login
 * - Authenticated but wrong role → access denied screen
 * - Authenticated with allowed role → render children
 */
export function RequireRole({ children, allow = ["admin"] }: RequireRoleProps) {
  const { user, role, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em]">
            verifying clearance
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (!role || !allow.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="saber-card p-10 max-w-md text-center space-y-5">
          <ShieldAlert className="h-8 w-8 mx-auto text-foreground/70" />
          <div>
            <p className="text-eyebrow-bright mb-2">access denied</p>
            <h1 className="text-display-md mb-3">Insufficient clearance</h1>
            <p className="text-body-sm">
              Your role does not have access to this section.
            </p>
          </div>
          <Button onClick={signOut} variant="outline" className="saber-border">
            Disengage
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
