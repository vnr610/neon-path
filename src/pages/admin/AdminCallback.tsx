import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

/**
 * Magic-link callback. Supabase parses the recovery/access tokens from the
 * URL hash automatically inside the client; we just wait for the auth state
 * to settle, then send the user to /admin (or back to access-denied).
 */
const AdminCallback = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  if (loading || (!user && !waited)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-mono text-[10px] uppercase tracking-[0.32em]">
            igniting session
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="saber-card p-10 max-w-md text-center space-y-5">
          <ShieldAlert className="h-8 w-8 mx-auto text-foreground/70" />
          <p className="text-eyebrow-bright">access denied</p>
          <h1 className="text-display-md">Insufficient clearance</h1>
          <p className="text-body-sm">
            This account is not authorised for the admin console.
          </p>
          <Button onClick={signOut} variant="outline" className="saber-border">
            Disengage
          </Button>
        </div>
      </div>
    );
  }

  return <Navigate to="/admin" replace />;
};

export default AdminCallback;