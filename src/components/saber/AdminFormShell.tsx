import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AdminFormShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  submitLabel?: string;
  discardLabel?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

export function AdminFormShell({
  eyebrow,
  title,
  description,
  submitLabel = "Save Entry",
  discardLabel = "Discard",
  onSubmit,
  children,
}: AdminFormShellProps) {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-6 bg-foreground/60 shadow-glow-blue" />
          <p className="text-eyebrow-bright">{eyebrow}</p>
        </div>
        <h2 className="text-display-md mb-2">{title}</h2>
        {description && <p className="text-body-sm max-w-xl">{description}</p>}
      </div>

      <form
        className="saber-card p-6 sm:p-9 space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
        noValidate
      >
        {children}

        <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/60">
          <p className="hidden sm:flex items-center gap-2 text-eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-foreground/40" />
            unsaved · ready
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="ghost"
              className="text-eyebrow text-muted-foreground hover:text-foreground"
            >
              {discardLabel}
            </Button>
            <Button
              type="submit"
              className="bg-gradient-saber text-primary-foreground border-0 shadow-glow-blue hover:opacity-90 font-mono text-[11px] uppercase tracking-[0.25em] px-5"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
