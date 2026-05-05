/**
 * FontToggle — dropdown font picker in the navbar.
 * Opens a panel listing all available font themes with previews.
 */

import { useRef, useEffect, useState } from "react";
import { Type, Check } from "lucide-react";
import { useFont, FONT_THEMES, type FontTheme } from "@/hooks/useFont";

/* Per-theme font-family for the live preview text */
const PREVIEW_STYLE: Record<FontTheme, string> = {
  realm:    "'Orbitron', monospace",
  terminal: "'JetBrains Mono', monospace",
  clean:    "'Space Grotesk', sans-serif",
  inter:    "'Inter', sans-serif",
  fira:     "'Fira Code', monospace",
  ibm:      "'IBM Plex Mono', monospace",
  sora:     "'Sora', sans-serif",
  mixed:    "'Sora', sans-serif",
};

export function FontToggle() {
  const { font, setFont } = useFont();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = FONT_THEMES.find((t) => t.id === font)!;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change font"
        aria-expanded={open}
        className={`h-8 px-2 rounded-md saber-border flex items-center gap-1.5 transition-colors ${
          open
            ? "text-foreground bg-muted/60"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Type className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.2em] hidden sm:inline">
          {current.label}
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-lg overflow-hidden z-50 animate-scale-in">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/50">
              Font Style
            </p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {FONT_THEMES.map((theme) => {
              const active = font === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => { setFont(theme.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {/* Live preview of the font */}
                  <span
                    className="text-base font-semibold w-7 shrink-0 leading-none"
                    style={{ fontFamily: PREVIEW_STYLE[theme.id] }}
                    aria-hidden
                  >
                    Aa
                  </span>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-medium leading-tight">{theme.label}</span>
                    <span className="text-[10px] text-muted-foreground/60 truncate leading-tight mt-0.5">
                      {theme.meta}
                    </span>
                  </div>

                  {active && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
