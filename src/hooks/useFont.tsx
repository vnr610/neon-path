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
  | "mixed"
  | "sf"
  | "jakarta"
  | "dm"
  | "nunito"
  | "outfit";

export const FONT_THEMES: {
  id: FontTheme;
  label: string;
  meta: string;
  group: "Cyber" | "Design" | "Apple";
}[] = [
  // ── Cyber / Dev ──────────────────────────────────────────────────────────
  { id: "realm",    label: "Realm",          meta: "Orbitron + JetBrains Mono",  group: "Cyber"  },
  { id: "terminal", label: "Terminal",       meta: "JetBrains Mono",             group: "Cyber"  },
  { id: "fira",     label: "Fira Code",      meta: "Fira Code",                  group: "Cyber"  },
  { id: "ibm",      label: "IBM Plex Mono",  meta: "IBM Plex Mono",              group: "Cyber"  },
  // ── Design / UI ──────────────────────────────────────────────────────────
  { id: "inter",    label: "Inter",          meta: "Inter + Fira Code",          group: "Design" },
  { id: "clean",    label: "Space Grotesk",  meta: "Space Grotesk",              group: "Design" },
  { id: "jakarta",  label: "Jakarta",        meta: "Plus Jakarta Sans + DM Mono",group: "Design" },
  { id: "dm",       label: "DM Sans",        meta: "DM Sans + DM Mono",          group: "Design" },
  { id: "outfit",   label: "Outfit",         meta: "Outfit + Fira Code",         group: "Design" },
  { id: "sora",     label: "Sora",           meta: "Sora + JetBrains Mono",      group: "Design" },
  { id: "nunito",   label: "Nunito",         meta: "Nunito + JetBrains Mono",    group: "Design" },
  { id: "mixed",    label: "Mixed",          meta: "Sora + IBM Plex Mono",       group: "Design" },
  // ── Apple / iOS ──────────────────────────────────────────────────────────
  { id: "sf",       label: "SF Pro",         meta: "Apple system font (iOS/macOS)", group: "Apple" },
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
