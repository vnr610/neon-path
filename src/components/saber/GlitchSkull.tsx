/**
 * GlitchSkull — animated skull with glitch/flicker effect.
 * Used on 404 and offline error pages.
 */

import { useEffect, useState } from "react";

interface GlitchSkullProps {
  size?: number;
}

export function GlitchSkull({ size = 160 }: GlitchSkullProps) {
  const [glitch, setGlitch] = useState(false);
  const [flicker, setFlicker] = useState(false);

  // Random glitch bursts
  useEffect(() => {
    const scheduleGlitch = () => {
      const delay = 2000 + Math.random() * 4000;
      return setTimeout(() => {
        setGlitch(true);
        // Multiple rapid flickers
        let count = 0;
        const flickerId = setInterval(() => {
          setFlicker((v) => !v);
          count++;
          if (count > 6) {
            clearInterval(flickerId);
            setGlitch(false);
            setFlicker(false);
          }
        }, 60);
        scheduleGlitch();
      }, delay);
    };
    const t = scheduleGlitch();
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative select-none"
      style={{ width: size, height: size }}
    >
      {/* Outer rotating dashed ring */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full text-foreground/10 [animation:spin_30s_linear_infinite]"
        fill="none"
      >
        <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 8" />
      </svg>

      {/* Counter-rotating ring with ticks */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] text-foreground/20 [animation:spin_20s_linear_infinite_reverse]"
        fill="none"
      >
        <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * 22.5 * Math.PI) / 180;
          const x1 = 100 + Math.cos(a) * 74;
          const y1 = 100 + Math.sin(a) * 74;
          const x2 = 100 + Math.cos(a) * 80;
          const y2 = 100 + Math.sin(a) * 80;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.75" />;
        })}
      </svg>

      {/* Glitch offset layers */}
      {glitch && (
        <>
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full text-saber-blue/30"
            style={{ transform: `translate(${flicker ? -3 : 2}px, ${flicker ? 1 : -2}px)` }}
            fill="currentColor"
          >
            <SkullPath />
          </svg>
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 w-full h-full text-destructive/20"
            style={{ transform: `translate(${flicker ? 3 : -2}px, ${flicker ? -1 : 2}px)` }}
            fill="currentColor"
          >
            <SkullPath />
          </svg>
        </>
      )}

      {/* Main skull */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 w-full h-full transition-opacity duration-75 ${
          flicker ? "opacity-40" : "opacity-100"
        } text-foreground/80`}
        fill="currentColor"
      >
        <SkullPath />
      </svg>

      {/* Scan line overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* Pulsing glow dot */}
      <span className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-foreground/50 animate-pulse" />
      <span className="absolute bottom-5 left-5 h-1 w-1 rounded-full bg-foreground/30 animate-pulse [animation-delay:700ms]" />
    </div>
  );
}

/** Skull SVG path — fits in a 100×100 viewBox */
function SkullPath() {
  return (
    <>
      {/* Cranium */}
      <path d="M50 8 C28 8 14 24 14 42 C14 54 20 64 30 70 L30 80 C30 83 33 86 36 86 L64 86 C67 86 70 83 70 80 L70 70 C80 64 86 54 86 42 C86 24 72 8 50 8 Z" />
      {/* Left eye socket */}
      <ellipse cx="37" cy="44" rx="9" ry="10" fill="var(--background, #0a0a0a)" />
      {/* Right eye socket */}
      <ellipse cx="63" cy="44" rx="9" ry="10" fill="var(--background, #0a0a0a)" />
      {/* Nose */}
      <path d="M46 58 L50 52 L54 58 L52 60 L48 60 Z" fill="var(--background, #0a0a0a)" />
      {/* Teeth dividers */}
      <rect x="36" y="80" width="2" height="6" fill="var(--background, #0a0a0a)" rx="1" />
      <rect x="44" y="80" width="2" height="6" fill="var(--background, #0a0a0a)" rx="1" />
      <rect x="52" y="80" width="2" height="6" fill="var(--background, #0a0a0a)" rx="1" />
      <rect x="60" y="80" width="2" height="6" fill="var(--background, #0a0a0a)" rx="1" />
      {/* Crack */}
      <path d="M50 14 L47 26 L52 32 L48 44" stroke="var(--background, #0a0a0a)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  );
}
