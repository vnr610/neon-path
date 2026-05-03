/**
 * HeroExtras — two hero enhancements:
 *
 * 1. CursorGlow   — soft radial glow that follows the mouse inside the hero section.
 * 2. TypingLine   — cycles through phrases with a typewriter effect + blinking cursor.
 */

import { useEffect, useRef, useState } from "react";

// ─── 1. Cursor glow ───────────────────────────────────────────────────────────

export function CursorGlow({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
      glow.style.opacity = "1";
    };

    const onLeave = () => { glow.style.opacity = "0"; };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [containerRef]);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300"
      style={{
        width: "480px",
        height: "480px",
        background: "radial-gradient(circle, hsl(0 0% 100% / 0.04) 0%, transparent 70%)",
      }}
      aria-hidden
    />
  );
}

// ─── 2. Typing terminal line ──────────────────────────────────────────────────

const PHRASES = [
  "forging path through the code",
  "scanning for vulnerabilities",
  "building full stack systems",
  "breaking things to learn them",
  "compiling the next milestone",
  "pwning boxes on HTB",
];

const TYPE_SPEED = 55;   // ms per char
const DELETE_SPEED = 30; // ms per char
const PAUSE_AFTER = 2200; // ms before deleting

export function TypingLine() {
  const [displayed, setDisplayed] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typing, setTyping] = useState(true);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];

    if (paused) {
      timeoutRef.current = setTimeout(() => {
        setPaused(false);
        setTyping(false);
      }, PAUSE_AFTER);
      return () => clearTimeout(timeoutRef.current);
    }

    if (typing) {
      if (displayed.length < phrase.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(phrase.slice(0, displayed.length + 1));
        }, TYPE_SPEED);
      } else {
        setPaused(true);
      }
    } else {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed((d) => d.slice(0, -1));
        }, DELETE_SPEED);
      } else {
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
        setTyping(true);
      }
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, typing, paused, phraseIdx]);

  return (
    <span className="font-mono text-xs text-muted-foreground tracking-wider">
      <span className="text-foreground">{">"}</span>{" "}
      vnr610@realm:~${" "}
      <span>{displayed}</span>
      <span className="inline-block w-[2px] h-[0.85em] bg-foreground/70 ml-0.5 align-middle animate-pulse" />
    </span>
  );
}
