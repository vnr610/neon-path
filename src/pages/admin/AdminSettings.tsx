import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Monitor, Smartphone, Globe, LogOut,
  Loader2, Shield, Clock, Wifi, RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown device";
  const u = ua.toLowerCase();
  if (u.includes("android")) return "Android";
  if (u.includes("iphone") || u.includes("ipad")) return "iOS";
  if (u.includes("mobile")) return "Mobile";
  if (u.includes("windows")) return "Windows";
  if (u.includes("mac os") || u.includes("macintosh")) return "macOS";
  if (u.includes("linux")) return "Linux";
  return "Desktop";
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "";
  const u = ua.toLowerCase();
  if (u.includes("edg/")) return "Edge";
  if (u.includes("chrome")) return "Chrome";
  if (u.includes("firefox")) return "Firefox";
  if (u.includes("safari") && !u.includes("chrome")) return "Safari";
  if (u.includes("opera") || u.includes("opr/")) return "Opera";
  return "";
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function DeviceIcon({ ua }: { ua: string | null }) {
  const d = parseDevice(ua).toLowerCase();
  if (d === "android" || d === "ios" || d === "mobile") {
    return <Smartphone className="h-4 w-4 text-muted-foreground" />;
  }
  return <Monitor className="h-4 w-4 text-muted-foreground" />;
}

const AdminSettings = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const loadSession = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    setCurrentSession(data.session);
    setLoading(false);
  };

  useEffect(() => { loadSession(); }, []);

  const handleSignOutAll = async () => {
    if (!confirm("Sign out of all devices? You will be redirected to login.")) return;
    setSigningOutAll(true);
    await supabase.auth.signOut({ scope: "global" });
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const handleSignOutCurrent = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const ua = currentSession?.user?.user_metadata?.user_agent
    ?? (typeof navigator !== "undefined" ? navigator.userAgent : null);

  const device = parseDevice(ua);
  const browser = parseBrowser(ua);
  const deviceLabel = [device, browser].filter(Boolean).join(" · ");

  // Decode session info from JWT
  let sessionCreatedAt: string | null = null;
  let sessionExpiresAt: string | null = null;
  try {
    if (currentSession?.access_token) {
      const payload = JSON.parse(atob(currentSession.access_token.split(".")[1]));
      if (payload.iat) sessionCreatedAt = new Date(payload.iat * 1000).toISOString();
      if (payload.exp) sessionExpiresAt = new Date(payload.exp * 1000).toISOString();
    }
  } catch { /* ignore */ }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-2xl space-y-10">

        {/* ── Session management ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em] mb-1">
                Session management
              </p>
              <p className="text-sm text-muted-foreground">
                Manage your active login sessions.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={handleSignOutAll}
              disabled={signingOutAll || loading}
            >
              {signingOutAll
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <LogOut className="h-3.5 w-3.5" />}
              Sign out all devices
            </Button>
          </div>

          {loading ? (
            <div className="saber-card h-28 animate-pulse bg-muted/20" />
          ) : !currentSession ? (
            <div className="saber-card p-6 text-center text-muted-foreground text-sm">
              No active session found.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current session card */}
              <div className="saber-card p-5 border-saber-blue/30 bg-saber-blue/5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-10 w-10 rounded-lg saber-border flex items-center justify-center shrink-0 shadow-glow-blue">
                    <DeviceIcon ua={ua} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold">{deviceLabel || "This device"}</p>
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-[0.2em] font-mono bg-saber-blue/15 text-saber-blue border border-saber-blue/30">
                        Current session
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {currentSession.user?.email}
                      </span>
                      {sessionCreatedAt && (
                        <span className="flex items-center gap-1">
                          <Wifi className="h-3 w-3" />
                          Signed in {timeAgo(sessionCreatedAt)}
                        </span>
                      )}
                      {sessionExpiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {timeAgo(sessionExpiresAt).startsWith("-")
                            ? "expired"
                            : `in ${new Date(sessionExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      )}
                    </div>
                    {ua && (
                      <p className="text-[10px] text-muted-foreground/40 font-mono mt-1 truncate max-w-xs">
                        {ua.slice(0, 80)}{ua.length > 80 ? "…" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive gap-1.5"
                  onClick={handleSignOutCurrent}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              </div>

              {/* Info card about other sessions */}
              <div className="saber-card p-4 flex items-start gap-3">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Other active sessions on different devices are not listed here due to Supabase API limitations.
                    Use <span className="text-foreground font-mono text-xs">"Sign out all devices"</span> to
                    immediately invalidate all tokens across every device.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 gap-1.5 text-muted-foreground"
            onClick={loadSession}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </section>

        {/* ── Account info ── */}
        <section>
          <p className="text-eyebrow-bright text-[10px] uppercase tracking-[0.32em] mb-4">Account</p>
          <div className="saber-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg saber-border flex items-center justify-center">
                <Shield className="h-4 w-4 text-saber-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold">{session?.user?.email ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  Role: <span className="text-foreground font-mono">{session?.user?.role ?? "authenticated"}</span>
                  {" · "}
                  ID: <span className="text-foreground font-mono text-[10px]">{session?.user?.id?.slice(0, 8)}…</span>
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground mb-1">Last sign in</p>
                <p className="font-mono">
                  {session?.user?.last_sign_in_at
                    ? timeAgo(session.user.last_sign_in_at)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Account created</p>
                <p className="font-mono">
                  {session?.user?.created_at
                    ? new Date(session.user.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Auth provider</p>
                <p className="font-mono capitalize">
                  {session?.user?.app_metadata?.provider ?? "email"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Email confirmed</p>
                <p className="font-mono">
                  {session?.user?.email_confirmed_at ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
