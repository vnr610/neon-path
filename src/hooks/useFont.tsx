/**
 * useFont — global font theme context.
 * Applies a class to <html> and persists the choice to localStorage.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type FontTheme =
  | "realm"
  | "terminal"
  | "clean"
  | "inter"
  | "fira"
  | "ibm"
  | "sora"
  | "mixed";

export const FONT_THEMES: {
  id: FontTheme;
  label: string;
  preview: string;   // shown in the picker as a sample string
  meta: string;      // font name description
}[] = [
  { id: "realm",    label: "Realm",    preview: "Aa",  meta: "Orbitron + JetBrains Mono"  },
  { id: "terminal", label: "Terminal", preview: "Aa",  meta: "JetBrains Mono"              },
  { id: "clean",    label: "Clean",    preview: "Aa",  meta: "Space Grotesk"               },
  { id: "inter",    label: "Inter",    preview: "Aa",  meta: "Inter + Fira Code"           },
  { id: "fira",     label: "Fira",     preview: "Aa",  meta: "Fira Code"                   },
  { id: "ibm",      label: "IBM Plex", preview: "Aa",  meta: "IBM Plex Mono"               },
  { id: "sora",     label: "Sora",     preview: "Aa",  meta: "Sora + JetBrains Mono"       },
  { id: "mixed",    label: "Mixed",    preview: "Aa",  meta: "Sora + IBM Plex Mono"        },
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

  useEffect(() => {
    const root = document.documentElement;
    FONT_THEMES.forEach((t) => root.classList.remove(`font-theme-${t.id}`));
    root.classList.add(`font-theme-${font}`);
    try { localStorage.setItem(STORAGE_KEY, font); } catch { /* ignore */ }
  }, [font]);

  return (
    <Ctx.Provider value={{ font, setFont: setFontState }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFont(): FontCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFont must be used inside <FontProvider>");
  return ctx;
}
