/**
 * NewsletterForm — compact subscribe widget used in the Footer and blog posts.
 * Calls the newsletter-subscribe Edge Function.
 */

import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

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
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: email.trim() },
      });
      if (error) {
        console.error("Newsletter function error:", error);
        throw error;
      }
      if (data?.status === "duplicate") { setStatus("duplicate"); return; }
      if (data?.error) {
        console.error("Newsletter response error:", data.error);
        throw new Error(data.error);
      }
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error("Newsletter submit failed:", err);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
        <span className="font-mono text-xs text-muted-foreground">
          You're in. Check your inbox.
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className="saber-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-muted-foreground/60" />
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">
            // newsletter
          </p>
        </div>
        <h3 className="font-display text-lg font-semibold mb-1">Stay in the loop</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Get notified when new writeups and projects drop. No spam.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 min-w-0 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-saber text-primary-foreground text-xs font-mono uppercase tracking-[0.2em] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "submitting"
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <><span>Subscribe</span><ArrowRight className="h-3.5 w-3.5" /></>}
          </button>
        </form>
        {status === "duplicate" && (
          <p className="text-xs text-muted-foreground/60 font-mono mt-2">Already subscribed.</p>
        )}
        {status === "error" && (
          <p className="text-xs text-destructive font-mono mt-2">Something went wrong. Try again.</p>
        )}
      </div>
    );
  }

  // Footer variant — compact horizontal
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 min-w-0 h-9 rounded-md border border-border/60 bg-background/60 px-3 text-xs font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-9 px-4 rounded-md saber-border text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
      >
        {status === "submitting"
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <><Mail className="h-3 w-3" /><span>Subscribe</span></>}
      </button>
      {status === "duplicate" && (
        <p className="text-[10px] text-muted-foreground/50 font-mono sm:hidden">Already subscribed.</p>
      )}
    </form>
  );
}
