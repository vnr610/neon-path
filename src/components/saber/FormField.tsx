import {
  ReactNode,
  forwardRef,
  cloneElement,
  isValidElement,
  useId,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ButtonHTMLAttributes,
  useState,
  useRef,
  useEffect,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  // Auto-wire aria attributes onto the first valid child (the actual control)
  const enhancedChild = isValidElement(children)
    ? cloneElement(children as React.ReactElement<any>, {
        id: (children.props as any).id ?? id,
        "aria-describedby":
          [describedBy, (children.props as any)["aria-describedby"]]
            .filter(Boolean)
            .join(" ") || undefined,
        "aria-invalid": error ? true : (children.props as any)["aria-invalid"],
        "aria-required": required || (children.props as any)["aria-required"],
        state: (children.props as any).state ?? state,
      })
    : children;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground"
        >
          <span className="text-foreground/40 mr-1.5">//</span>
          {label}
          {required && (
            <span className="text-foreground/70 ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {optional && (
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60">
            optional
          </span>
        )}
      </div>

      <div data-state={state}>{enhancedChild}</div>

      {hint && !error && (
        <p
          id={hintId}
          className="font-mono text-[10px] tracking-wide text-muted-foreground/70 pl-0.5"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-destructive"
        >
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

/* ------------------------------------------------------------------ */
/* SaberDatePicker — popover calendar with input shell styling         */
/* ------------------------------------------------------------------ */

interface SaberDatePickerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  state?: FieldState;
  disabledDates?: (date: Date) => boolean;
}

export const SaberDatePicker = forwardRef<HTMLButtonElement, SaberDatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "Pick a date",
      state: stateProp = "default",
      disabledDates,
      className,
      id,
      ...buttonProps
    },
    ref,
  ) => {
    const [internal, setInternal] = useState<Date | undefined>(value);
    const selected = value ?? internal;
    const fallbackId = useId();
    const fieldId = id ?? fallbackId;
    const [open, setOpen] = useState(false);
    const popoverContentRef = useRef<HTMLDivElement>(null);

    const handleChange = (d: Date | undefined) => {
      setInternal(d);
      onChange?.(d);
      if (d) setOpen(false);
    };

    // Keyboard handler on the trigger button:
    // - Enter / Space / ArrowDown / ArrowUp -> open
    // - Escape -> close (handled inside Popover too, but kept for safety)
    const handleTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (open) return;
      if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };

    // When the calendar opens, move focus into it so arrow keys navigate days.
    // react-day-picker handles arrow / PageUp/Down / Home/End once focused.
    useEffect(() => {
      if (!open) return;
      const id = window.setTimeout(() => {
        const root = popoverContentRef.current;
        if (!root) return;
        const target =
          root.querySelector<HTMLElement>('[role="gridcell"] [aria-selected="true"]') ||
          root.querySelector<HTMLElement>('[role="gridcell"] button:not([disabled])') ||
          root.querySelector<HTMLElement>("button:not([disabled])");
        target?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }, [open]);

    // Trap focus within the popover while open.
    const handleContentKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab") return;
      const root = popoverContentRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            id={fieldId}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={open}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              baseFieldClasses,
              "h-10 flex items-center justify-between text-left",
              stateClasses[stateProp],
              !selected && "text-muted-foreground/60",
              className,
            )}
            {...buttonProps}
          >
            <span className="truncate">
              {selected ? format(selected, "PPP") : placeholder}
            </span>
            <CalendarIcon className="h-4 w-4 ml-2 opacity-60 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverContentRef}
          role="dialog"
          aria-modal="true"
          aria-label="Choose date"
          onKeyDown={handleContentKeyDown}
          className="w-auto p-0 saber-border bg-popover/95 backdrop-blur-xl"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleChange}
            disabled={disabledDates}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    );
  },
);
SaberDatePicker.displayName = "SaberDatePicker";