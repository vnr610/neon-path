import { LucideIcon } from "lucide-react";

interface EmptyGlyphProps {
  icon: LucideIcon;
}

/**
 * Animated monochrome SVG halo around a Lucide icon.
 * Pure decoration — uses currentColor so it inherits text color.
 */
export function EmptyGlyph({ icon: Icon }: EmptyGlyphProps) {
  return (
    <div className="relative h-28 w-28 flex items-center justify-center text-foreground/90">
      {/* Outer dashed ring */}
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full text-foreground/15 [animation:spin_24s_linear_infinite]"
        fill="none"
      >
        <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
      </svg>

      {/* Counter-rotating mid ring with ticks */}
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-2 h-[calc(100%-1rem)] w-[calc(100%-1rem)] text-foreground/25 [animation:spin_18s_linear_infinite_reverse]"
        fill="none"
      >
        <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.75" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          const x1 = 60 + Math.cos(a) * 46;
          const y1 = 60 + Math.sin(a) * 46;
          const x2 = 60 + Math.cos(a) * 50;
          const y2 = 60 + Math.sin(a) * 50;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.75" />;
        })}
      </svg>

      {/* Inner core circle with subtle glow */}
      <div className="relative h-14 w-14 rounded-full border border-border/80 bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-glow-soft">
        <Icon className="h-6 w-6 text-foreground/90" strokeWidth={1.5} />
        <span className="absolute -top-px left-1/2 h-px w-6 -translate-x-1/2 bg-foreground/60 blur-[0.5px]" />
      </div>

      {/* Floating dots */}
      <span className="absolute top-2 right-3 h-1 w-1 rounded-full bg-foreground/60 animate-pulse" />
      <span className="absolute bottom-3 left-2 h-1 w-1 rounded-full bg-foreground/40 animate-pulse [animation-delay:600ms]" />
    </div>
  );
}
