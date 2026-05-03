import { useState, useRef } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Loader2, Lock, Swords, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FormField, SaberInput } from "@/components/saber/FormField";
import { FormStatusArea, type FormStatus } from "@/components/saber/AdminFormShell";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .max(255, "Email too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const AdminLogin = () => {
  const { user, role, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If already signed in with any valid role, redirect.
  if (!loading && user && role) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setStatusMessage(undefined);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.errors) {
        const field = issue.path[0] as "email" | "password";
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setStatusMessage("verifying credentials…");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (authError) {
      setStatus("error");
      setStatusMessage(authError.message);
      return;
    }

    // On success, AuthProvider's onAuthStateChange will update the session.
    // Keep submitting state — the Navigate above will redirect once isAdmin resolves.
    // If it takes too long, surface an error.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus("error");
      setStatusMessage("Signed in but could not verify your role. Check your account has been granted access.");
    }, 8000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      {/* Scan line for cyber feel */}
      <div className="scan-overlay" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group animate-fade-up opacity-0" style={{ animationDelay: "0.05s" }}>
          <div className="relative h-8 w-8 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="absolute inset-0 h-full w-full logo-ring text-foreground/15" fill="none">
              <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
            </svg>
            <svg viewBox="0 0 32 32" className="absolute inset-1 h-[calc(100%-8px)] w-[calc(100%-8px)] logo-ring-reverse text-foreground/25" fill="none">
              <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.5" />
            </svg>
            <Swords className="relative h-4 w-4 text-saber-blue animate-saber-pulse" />
          </div>
          <span className="font-display text-sm tracking-[0.3em] group-hover:text-saber-blue transition-colors">VNR610</span>
        </Link>

        <div className="saber-card p-8 sm:p-10 shadow-glow-soft animate-scale-in opacity-0" style={{ animationDelay: "0.15s" }}>
          <div className="mb-8 text-center animate-fade-up opacity-0" style={{ animationDelay: "0.25s" }}>
            {/* Animated lock icon */}
            <div className="flex justify-center mb-4">
              <div className="relative h-12 w-12 flex items-center justify-center">
                <span className="absolute inset-0 rounded-full border border-foreground/20 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
                <span className="absolute inset-1 rounded-full border border-foreground/15" />
                <Lock className="relative h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-eyebrow-bright mb-3">admin console</p>
            <h1 className="text-display-md mb-2">Authenticate</h1>
            <p className="text-body-sm">Enter your credentials to access the dashboard.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.35s" }}>
              <FormField id="email" label="Email" required error={errors.email} hint="The email associated with your admin account.">
                <SaberInput
                  id="email" type="email" inputMode="email" autoComplete="email" autoFocus
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@realm.dev" maxLength={255}
                />
              </FormField>
            </div>

            <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.42s" }}>
              <FormField id="password" label="Password" required error={errors.password}>
                <div className="relative">
                  <SaberInput
                    id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" maxLength={128} className="pr-10"
                  />
                  <button
                    type="button" onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
            </div>

            <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.48s" }}>
              <FormStatusArea status={status} message={statusMessage} />
            </div>

            <div className="animate-fade-up opacity-0" style={{ animationDelay: "0.54s" }}>
              <Button
                type="submit" disabled={status === "submitting"}
                className="w-full bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue font-mono text-[11px] uppercase tracking-[0.25em]"
              >
                {status === "submitting" ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />Verifying</>
                ) : (
                  <><Lock className="h-3.5 w-3.5 mr-2" />Sign In</>
                )}
              </Button>
            </div>
          </form>

          <p className="text-center text-eyebrow mt-8 animate-fade-up opacity-0" style={{ animationDelay: "0.6s" }}>
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
