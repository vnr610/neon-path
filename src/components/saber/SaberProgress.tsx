/**
 * SaberProgress — animated progress bar.
 * Fills from 0 → value when it enters the viewport (scroll-triggered).
 */
import { useEffect, useRef, useState } from "react";

interface SaberProgressProps {
  label?: string;
  value?: number; // 0-100
  variant?: "blue" | "purple";
}

export function SaberProgress({ label, value, variant = "blue" }: SaberProgressProps) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const empty = value === undefined;

  // Scroll-triggered fill
  const barRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const el = barRef.current;
    if (!el || empty) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFilled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [empty]);

  return (
    <div ref={barRef}>
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
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            variant === "blue"
              ? "bg-saber-blue shadow-[0_0_10px_hsl(var(--saber-blue)/0.8)]"
              : "bg-saber-purple shadow-[0_0_10px_hsl(var(--saber-purple)/0.8)]"
          }`}
          style={{ width: filled ? `${v}%` : "0%" }}
        />
      </div>
    </div>
  );
}
