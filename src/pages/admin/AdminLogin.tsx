import { useState } from "react";
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
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  // If already signed in as admin, redirect.
  if (!loading && user && isAdmin) {
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

    // On success, AuthProvider's onAuthStateChange will update the session
    // and the Navigate above will redirect to /admin automatically.
    setStatus("idle");
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
            <p className="text-body-sm">Enter your email and password to access the dashboard.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <FormField
              id="email"
              label="Email"
              required
              error={errors.email}
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

            {/* Password */}
            <FormField
              id="password"
              label="Password"
              required
              error={errors.password}
            >
              <div className="relative">
                <SaberInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  maxLength={128}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
                  Verifying
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

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
