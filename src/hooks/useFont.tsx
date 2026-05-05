/**
 * useFont — global font theme context.
 * Applies a class to <html> and persists the choice to localStorage.
 *
 * Font themes (all fonts already loaded via Google Fonts in index.css):
 *   realm    — Orbitron display + JetBrains Mono body  (default, cyber feel)
 *   terminal — JetBrains Mono for everything           (full hacker mono)
 *   clean    — Space Grotesk display + body            (readable sans-serif)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type FontTheme = "realm" | "terminal" | "clean";

export const FONT_THEMES: { id: FontTheme; label: string; preview: string }[] = [
  { id: "realm",    label: "Realm",    preview: "Orbitron + Mono" },
  { id: "terminal", label: "Terminal", preview: "Full Mono"        },
  { id: "clean",    label: "Clean",    preview: "Space Grotesk"    },
];

const STORAGE_KEY = "vnr610-font-theme";
const DEFAULT: FontTheme = "realm";

interface FontCtx {
  font: FontTheme;
  setFont: (f: FontTheme) => void;
}

const Ctx = createContext<FontCtx | null>(null);

export function FontProvider({ children }: { children: ReactNode }) {
  const [font, setFontState] = useState<FontTheme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as FontTheme | null;
      return stored && FONT_THEMES.some((t) => t.id === stored) ? stored : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  // Apply class to <html> whenever font changes
  useEffect(() => {
    const root = document.documentElement;
    FONT_THEMES.forEach((t) => root.classList.remove(`font-theme-${t.id}`));
    root.classList.add(`font-theme-${font}`);
    try { localStorage.setItem(STORAGE_KEY, font); } catch { /* ignore */ }
  }, [font]);

  const setFont = (f: FontTheme) => setFontState(f);

  return <Ctx.Provider value={{ font, setFont }}>{children}</Ctx.Provider>;
}

export function useFont(): FontCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFont must be used inside <FontProvider>");
  return ctx;
}
