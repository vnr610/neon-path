import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { EmptyGlyph } from "./EmptyGlyph";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Short, motivating one-liner shown above the title (e.g. "The first stroke begins here.") */
  hint?: string;
  /** Monospace status string shown at the bottom (e.g. "awaiting first entry") */
  status?: string;
  action?: ReactNode;
  /** Kept for API compatibility; visual is monochrome. */
  glow?: "blue" | "purple";
}

const DEFAULT_HINT = "Every realm begins empty.";

export function EmptyState({
  icon,
  title,
  description,
  hint = DEFAULT_HINT,
  status = "awaiting first entry",
  action,
}: EmptyStateProps) {
  return (
    <div className="saber-card flex flex-col items-center justify-center text-center px-8 py-16 sm:py-20 relative overflow-hidden">
      {/* Faint corner crosshairs */}
      <Crosshair className="top-3 left-3" />
      <Crosshair className="top-3 right-3 rotate-90" />
      <Crosshair className="bottom-3 left-3 -rotate-90" />
      <Crosshair className="bottom-3 right-3 rotate-180" />

      <EmptyGlyph icon={icon} />

      {hint && (
        <p className="mt-6 text-eyebrow-bright">
          <span className="text-foreground/40">//</span> {hint}
        </p>
      )}

      <h3 className="text-display-md mt-3 mb-3">{title}</h3>

      {description && (
        <p className="text-body-sm max-w-md">{description}</p>
      )}

      <div className="mt-8 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-foreground/70 animate-pulse" />
        <span className="text-mono">{status}</span>
      </div>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function Crosshair({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`absolute h-3 w-3 text-foreground/20 pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M0 0.5 H6 M0.5 0 V6" />
    </svg>
  );
}
