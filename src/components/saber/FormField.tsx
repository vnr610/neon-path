import { ReactNode, forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared input chrome                                                 */
/* ------------------------------------------------------------------ */

const baseFieldClasses =
  "w-full rounded-md bg-background/40 border px-3.5 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 transition-all duration-200 outline-none";

const stateClasses = {
  default:
    "border-border/60 hover:border-foreground/30 focus:border-foreground/70 focus:bg-background/70 focus:shadow-[0_0_0_1px_hsl(0_0%_100%/0.25),0_0_24px_-4px_hsl(0_0%_100%/0.25)]",
  error:
    "border-destructive/70 bg-destructive/5 focus:border-destructive focus:shadow-[0_0_0_1px_hsl(var(--destructive)/0.6),0_0_24px_-4px_hsl(var(--destructive)/0.4)]",
  success:
    "border-foreground/40 focus:border-foreground/70 focus:shadow-[0_0_0_1px_hsl(0_0%_100%/0.3),0_0_24px_-4px_hsl(0_0%_100%/0.3)]",
} as const;

type FieldState = keyof typeof stateClasses;

/* ------------------------------------------------------------------ */
/* FormField wrapper (label + hint + error)                            */
/* ------------------------------------------------------------------ */

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: FormFieldProps) {
  const state: FieldState = error ? "error" : "default";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground"
        >
          <span className="text-foreground/40 mr-1.5">//</span>
          {label}
          {required && <span className="text-foreground/70 ml-1">*</span>}
        </label>
        {optional && (
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
            optional
          </span>
        )}
      </div>

      <div data-state={state}>{children}</div>

      {hint && !error && (
        <p className="font-mono text-[10px] tracking-wide text-muted-foreground/70 pl-0.5">
          {hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SaberInput                                                          */
/* ------------------------------------------------------------------ */

interface SaberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  state?: FieldState;
}

export const SaberInput = forwardRef<HTMLInputElement, SaberInputProps>(
  ({ className, state = "default", ...props }, ref) => (
    <input
      ref={ref}
      className={cn(baseFieldClasses, "h-10", stateClasses[state], className)}
      {...props}
    />
  ),
);
SaberInput.displayName = "SaberInput";

/* ------------------------------------------------------------------ */
/* SaberTextarea                                                       */
/* ------------------------------------------------------------------ */

interface SaberTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  state?: FieldState;
}

export const SaberTextarea = forwardRef<HTMLTextAreaElement, SaberTextareaProps>(
  ({ className, state = "default", rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseFieldClasses, "min-h-[96px] resize-y leading-relaxed", stateClasses[state], className)}
      {...props}
    />
  ),
);
SaberTextarea.displayName = "SaberTextarea";

/* ------------------------------------------------------------------ */
/* FormSection — visual grouping inside a form                         */
/* ------------------------------------------------------------------ */

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="space-y-5 pb-6 border-b border-border/40 last:border-0 last:pb-0">
      <header className="flex items-center gap-3">
        <span className="h-px w-5 bg-foreground/40" />
        <h3 className="font-mono text-[10px] uppercase tracking-[0.32em] text-foreground/80">
          {title}
        </h3>
        {description && (
          <span className="font-mono text-[10px] text-muted-foreground/60">— {description}</span>
        )}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Helper export — ready visual cue                                    */
/* ------------------------------------------------------------------ */

export function FieldSuccessHint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70">
      <CheckCircle2 className="h-3 w-3" />
      {children}
    </p>
  );
}