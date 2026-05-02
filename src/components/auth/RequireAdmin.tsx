import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signOut } = useAuth();
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="saber-card p-10 max-w-md text-center space-y-5">
          <ShieldAlert className="h-8 w-8 mx-auto text-foreground/70" />
          <div>
            <p className="text-eyebrow-bright mb-2">access denied</p>
            <h1 className="text-display-md mb-3">Insufficient clearance</h1>
            <p className="text-body-sm">
              This account does not hold the admin role. Sign out and try a different identity.
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