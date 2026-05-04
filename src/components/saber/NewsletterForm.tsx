/**
 * NewsletterForm — subscribe widget used in the Footer.
 * Inserts directly into Supabase, then fires welcome email via edge function.
 */

import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2, Loader2, Mail, Sparkles } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "duplicate" | "error";

type Props = {
  /** "footer" = horizontal compact, "inline" = stacked card */
  variant?: "footer" | "inline";
};

export function NewsletterForm({ variant = "footer" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

      if (error) {
        if (error.code === "23505") { setStatus("duplicate"); return; }
        console.error("Newsletter subscribe error:", error);
        throw error;
      }

      // Fire welcome email (non-blocking)
      supabase.functions.invoke("newsletter-subscribe", {
        body: { email: email.trim(), welcomeOnly: true },
      }).catch((err) => console.warn("Welcome email failed (non-critical):", err));

      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("Newsletter submit failed:", err);
      setStatus("error");
    }
  };

  // ── Inline card variant (used standalone) ────────────────────────────────

  if (variant === "inline") {
    if (status === "success") {
      return (
        <div className="saber-card p-8 flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-full saber-border flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-foreground" />
          </div>
          <p className="font-display text-base font-semibold">You're in</p>
          <p className="text-sm text-muted-foreground">Check your inbox for a welcome email.</p>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden saber-card p-8">
        {/* Background glow */}
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-foreground/3 blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-md saber-border flex items-center justify-center shrink-0">
              <Mail className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">
                // newsletter
              </p>
            </div>
          </div>

          <h3 className="font-display text-xl font-semibold mb-1">Stay in the loop</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Get notified when new writeups and projects drop. No spam, unsubscribe anytime.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-md border border-border/60 bg-background/60 pl-9 pr-3 py-2.5 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-saber text-primary-foreground text-xs font-mono uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50 shadow-glow-blue"
            >
              {status === "submitting"
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <><span>Subscribe</span><ArrowRight className="h-3.5 w-3.5" /></>}
            </button>
          </form>

          {status === "duplicate" && (
            <p className="text-xs text-muted-foreground/60 font-mono mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> Already subscribed.
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive font-mono mt-2">Something went wrong. Try again.</p>
          )}

          <p className="text-[10px] text-muted-foreground/30 font-mono mt-3 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Join the realm codex
          </p>
        </div>
      </div>
    );
  }

  // ── Footer variant — compact horizontal ──────────────────────────────────

  if (status === "success") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-foreground/60 shrink-0" />
        <span className="font-mono text-xs text-muted-foreground">
          You're in. Check your inbox.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xs">
      <div className="relative flex-1 min-w-0">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full h-9 rounded-md border border-border/60 bg-background/60 px-3 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-9 px-4 rounded-md bg-gradient-saber text-primary-foreground text-xs font-mono uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-glow-blue"
      >
        {status === "submitting"
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <><Mail className="h-3 w-3" /><span>Join</span></>}
      </button>
      {status === "duplicate" && (
        <p className="text-[10px] text-muted-foreground/50 font-mono absolute mt-10">Already subscribed.</p>
      )}
    </form>
  );
}
