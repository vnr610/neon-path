import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  glow?: "blue" | "purple";
}

export function EmptyState({ icon: Icon, title, description, action, glow = "blue" }: EmptyStateProps) {
  return (
    <div className="saber-card flex flex-col items-center justify-center text-center px-8 py-16 sm:py-20">
      <div
        className={`relative mb-6 h-16 w-16 rounded-full border border-border/60 flex items-center justify-center bg-background/60 ${
          glow === "blue" ? "shadow-glow-blue" : "shadow-glow-purple"
        }`}
      >
        <Icon className={`h-7 w-7 ${glow === "blue" ? "text-saber-blue" : "text-saber-purple"}`} />
      </div>
      <h3 className="font-display text-lg sm:text-xl mb-2 tracking-wide">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
