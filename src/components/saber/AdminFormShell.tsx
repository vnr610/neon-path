import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FormStatus = "idle" | "ready" | "error" | "success" | "submitting";

interface FormStatusAreaProps {
  status: FormStatus;
  message?: string;
  errors?: string[];
}

/**
 * Reusable inline status area for admin form shells.
 * Surfaces validation errors / success readiness without submitting data.
 */
export function FormStatusArea({ status, message, errors = [] }: FormStatusAreaProps) {
  if (status === "idle" && !message && errors.length === 0) return null;

  const tone = {
    idle: "border-border/40 text-muted-foreground",
    ready: "border-foreground/30 text-foreground/80",
    error: "border-destructive/60 text-destructive bg-destructive/5",
    success: "border-foreground/40 text-foreground bg-foreground/5",
    submitting: "border-border/60 text-muted-foreground",
  }[status];

  const Icon = {
    idle: AlertCircle,
    ready: CheckCircle2,
    error: AlertCircle,
    success: CheckCircle2,
    submitting: Loader2,
  }[status];

  const label = {
    idle: "awaiting input",
    ready: "ready to commit",
    error: errors.length > 0 ? `${errors.length} issue${errors.length === 1 ? "" : "s"} to resolve` : "validation failed",
    success: "saved",
    submitting: "transmitting",
  }[status];

  return (
    <div
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      className={cn(
        "rounded-md border px-4 py-3 transition-colors",
        tone,
      )}
    >
      <div className="flex items-center gap-2.5">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", status === "submitting" && "animate-spin")} />
        <span className="font-mono text-[10px] uppercase tracking-[0.28em]">{label}</span>
        {message && (
          <span className="font-mono text-[10px] text-muted-foreground/80 truncate">
            — {message}
          </span>
        )}
      </div>
      {errors.length > 0 && (
        <ul className="mt-2.5 pl-5 space-y-1">
          {errors.map((err, i) => (
            <li
              key={i}
              className="font-mono text-[11px] text-destructive/90 list-disc marker:text-destructive/60"
            >
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface AdminFormShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  submitLabel?: string;
  discardLabel?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onDiscard?: () => void;
  status?: FormStatus;
  statusMessage?: string;
  errors?: string[];
  children: ReactNode;
}

export function AdminFormShell({
  eyebrow,
  title,
  description,
  submitLabel = "Save Entry",
  discardLabel = "Discard",
  onSubmit,
  onDiscard,
  status = "idle",
  statusMessage,
  errors = [],
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

        <FormStatusArea status={status} message={statusMessage} errors={errors} />

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
              onClick={onDiscard}
            >
              {discardLabel}
            </Button>
            <Button
              type="submit"
              disabled={status === "submitting"}
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
