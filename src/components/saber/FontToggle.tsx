/**
 * FontToggle — cycles through font themes in the navbar.
 * Shows the current theme label and cycles on click.
 */

import { Type } from "lucide-react";
import { useFont, FONT_THEMES } from "@/hooks/useFont";

export function FontToggle() {
  const { font, setFont } = useFont();

  const currentIndex = FONT_THEMES.findIndex((t) => t.id === font);
  const next = FONT_THEMES[(currentIndex + 1) % FONT_THEMES.length];
  const current = FONT_THEMES[currentIndex];

  return (
    <button
      onClick={() => setFont(next.id)}
      className="h-8 px-2 rounded-md saber-border flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      aria-label={`Font: ${current.label}. Click to switch to ${next.label}`}
      title={`Font: ${current.label} → ${next.label}`}
    >
      <Type className="h-3.5 w-3.5 shrink-0" />
      <span className="text-[10px] uppercase tracking-[0.2em] hidden sm:inline">{current.label}</span>
    </button>
  );
}
