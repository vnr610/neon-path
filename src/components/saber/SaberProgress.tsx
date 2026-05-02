interface SaberProgressProps {
  label?: string;
  value?: number; // 0-100, undefined = empty
  variant?: "blue" | "purple";
}

export function SaberProgress({ label, value, variant = "blue" }: SaberProgressProps) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const empty = value === undefined;
  return (
    <div>
      {label && (
        <div className="flex justify-between mb-2 text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className={empty ? "text-muted-foreground/60" : variant === "blue" ? "text-saber-blue" : "text-saber-purple"}>
            {empty ? "—" : `${v}%`}
          </span>
        </div>
      )}
      <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${variant === "blue" ? "bg-saber-blue shadow-[0_0_10px_hsl(var(--saber-blue)/0.8)]" : "bg-saber-purple shadow-[0_0_10px_hsl(var(--saber-purple)/0.8)]"}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
