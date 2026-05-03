/**
 * NewsletterForm — Coming soon placeholder while mail API is being configured.
 */

import { Construction, Mail } from "lucide-react";

type Props = {
  variant?: "footer" | "inline";
};

export function NewsletterForm({ variant = "footer" }: Props) {
  if (variant === "inline") {
    return (
      <div className="saber-card p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-4 w-4 text-muted-foreground/40" />
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">
            // newsletter · coming soon
          </p>
        </div>
        <h3 className="font-display text-lg font-semibold mb-1 text-muted-foreground/60">
          Newsletter
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <Construction className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
          <p className="text-xs text-muted-foreground/40 font-mono">
            Email notifications coming soon — being configured.
          </p>
        </div>
      </div>
    );
  }

  // Footer variant
  return (
    <div className="flex items-center gap-2">
      <Construction className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
      <p className="text-xs text-muted-foreground/40 font-mono">
        Newsletter coming soon
      </p>
    </div>
  );
}
