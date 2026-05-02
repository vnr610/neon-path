import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Loader2, Mail, Swords, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FormField, SaberInput } from "@/components/saber/FormField";
import { FormStatusArea, type FormStatus } from "@/components/saber/AdminFormShell";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email")
  .max(255, "Email too long");

const AdminLogin = () => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  // If already signed in as admin, redirect.
  if (!loading && user && isAdmin) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      setStatus("error");
      setStatusMessage(undefined);
      return;
    }

    setStatus("submitting");
    setStatusMessage("dispatching link to your inbox");

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/callback`,
        // The very first sign-in needs to create the user so the
        // bootstrap_first_admin() trigger can grant admin. Subsequent
        // sign-ins simply re-authenticate the same account.
        shouldCreateUser: true,
      },
    });

    if (authError) {
      setStatus("error");
      setStatusMessage(authError.message);
      return;
    }

    setStatus("success");
    setStatusMessage(`magic link sent to ${parsed.data}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Swords className="h-5 w-5 text-saber-blue animate-saber-pulse" />
          <span className="font-display text-sm tracking-[0.3em]">VNR610</span>
        </Link>

        <div className="saber-card p-8 sm:p-10 shadow-glow-soft">
          <div className="mb-8 text-center">
            <p className="text-eyebrow-bright mb-3">admin console</p>
            <h1 className="text-display-md mb-2">Authenticate</h1>
            <p className="text-body-sm">A passwordless link will be sent to your inbox.</p>
          </div>

          {status === "success" ? (
            <div className="text-center space-y-4 py-2">
              <CheckCircle2 className="h-8 w-8 mx-auto text-foreground/80" />
              <div>
                <p className="text-eyebrow-bright mb-2">link dispatched</p>
                <p className="text-body-sm">
                  Check <span className="text-foreground font-mono">{email}</span> and click
                  the link to ignite your session.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setStatusMessage(undefined);
                }}
                className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <FormField
                id="email"
                label="Email"
                required
                error={error}
                hint="The email associated with your admin account."
              >
                <SaberInput
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@realm.dev"
                  maxLength={255}
                />
              </FormField>

              <FormStatusArea status={status} message={statusMessage} />

              <Button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue font-mono text-[11px] uppercase tracking-[0.25em]"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                    Transmitting
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-eyebrow mt-8">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Back to realm
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
