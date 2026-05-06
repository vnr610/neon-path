/**
 * FontToggle — font picker.
 * Desktop: dropdown panel anchored to the button.
 * Mobile (inside nav menu): inline expanded list, no floating panel.
 */

import { useRef, useEffect, useState } from "react";
import { Type, Check, ChevronDown } from "lucide-react";
import { useFont, FONT_THEMES, type FontTheme } from "@/hooks/useFont";

const PREVIEW_STYLE: Record<FontTheme, string> = {
  realm:    "'Orbitron', monospace",
  terminal: "'JetBrains Mono', monospace",
  clean:    "'Space Grotesk', sans-serif",
  inter:    "'Inter', sans-serif",
  fira:     "'Fira Code', monospace",
  ibm:      "'IBM Plex Mono', monospace",
  sora:     "'Sora', sans-serif",
  mixed:    "'Sora', sans-serif",
  sf:       "-apple-system, 'SF Pro Display', BlinkMacSystemFont, sans-serif",
  jakarta:  "'Plus Jakarta Sans', sans-serif",
  dm:       "'DM Sans', sans-serif",
  nunito:   "'Nunito', sans-serif",
  outfit:   "'Outfit', sans-serif",
};

const GROUPS = ["Cyber", "Design", "Apple"] as const;

function FontList({ onSelect }: { onSelect?: () => void }) {
  const { font, setFont } = useFont();
  return (
    <div className="pb-1">
      {GROUPS.map((group) => {
        const items = FONT_THEMES.filter((t) => t.group === group);
        return (
          <div key={group}>
            <p className="px-4 pt-2 pb-1 text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40">
              {group}
            </p>
            <div className="px-1.5 space-y-0.5">
              {items.map((theme) => {
                const active = font === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => { setFont(theme.id); onSelect?.(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span
                      className="text-sm font-semibold w-7 shrink-0 leading-none"
                      style={{ fontFamily: PREVIEW_STYLE[theme.id] }}
                      aria-hidden
                    >
                      Aa
                    </span>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-medium leading-tight">{theme.label}</span>
                      <span className="text-[10px] text-muted-foreground/55 truncate leading-tight mt-0.5">
                        {theme.meta}
                      </span>
                    </div>
                    {active && <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Desktop navbar version — floating dropdown */
export function FontToggle() {
  const { font } = useFont();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = FONT_THEMES.find((t) => t.id === font)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change font"
        aria-expanded={open}
        className={`h-8 px-2 rounded-md saber-border flex items-center gap-1.5 transition-colors ${
          open ? "text-foreground bg-muted/60" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Type className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[10px] uppercase tracking-[0.2em] hidden sm:inline">
          {current.label}
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-60 rounded-xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-lg z-50 animate-scale-in overflow-hidden">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[9px] uppercase tracking-[0.35em] text-muted-foreground/50">Font Style</p>
          </div>
          <div className="max-h-72 overflow-y-auto overscroll-contain">
            <FontList onSelect={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Mobile menu version — inline accordion, no floating panel */
export function FontToggleMobile() {
  const { font } = useFont();
  const [open, setOpen] = useState(false);
  const current = FONT_THEMES.find((t) => t.id === font)!;

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Type className="h-3.5 w-3.5 shrink-0" />
          Font · {current.label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1 rounded-lg border border-border/40 bg-muted/20 overflow-hidden">
          <FontList />
        </div>
      )}
    </div>
  );
}
