import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  label: string;
  variant?: "blue" | "purple" | "muted";
  className?: string;
}

export function LevelBadge({ label, variant = "blue", className }: LevelBadgeProps) {
  const styles = {
    blue: "border-saber-blue/40 text-saber-blue shadow-[0_0_12px_hsl(var(--saber-blue)/0.35)]",
    purple: "border-saber-purple/40 text-saber-purple shadow-[0_0_12px_hsl(var(--saber-purple)/0.35)]",
    muted: "border-border text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] uppercase tracking-[0.2em] font-medium bg-background/60 backdrop-blur-sm",
        styles[variant],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", variant === "blue" && "bg-saber-blue", variant === "purple" && "bg-saber-purple", variant === "muted" && "bg-muted-foreground")} />
      {label}
    </span>
  );
}
