/**
 * OfflineError — shown when the browser is offline (glitch effect)
 * ServerError  — shown when Supabase/API is down (skull + decay effect)
 *
 * Both use anime.js for their animations.
 */
import { useEffect, useRef, useState } from "react";
import anime from "animejs";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";

// ─── Glitch text hook ─────────────────────────────────────────────────────────

const GLITCH_CHARS = "!@#$%^&*<>?/\\|{}[]~`01";

function useGlitchText(text: string, interval = 2500) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const run = () => {
      let frame = 0;
      const total = 16;
      const id = setInterval(() => {
        frame++;
        if (frame >= total) {
          setDisplay(text);
          clearInterval(id);
          return;
        }
        const progress = frame / total;
        setDisplay(
          text
            .split("")
            .map((c, i) =>
              c === " " ? " " :
              i / text.length < progress
                ? c
                : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            )
            .join("")
        );
      }, 35);
    };

    run();
    const loop = setInterval(run, interval);
    return () => clearInterval(loop);
  }, [text, interval]);

  return display;
}

// ─── Offline (glitch) ─────────────────────────────────────────────────────────

export function OfflineError() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glitch1Ref = useRef<HTMLDivElement>(null);
  const glitch2Ref = useRef<HTMLDivElement>(null);
  const titleText = useGlitchText("CONNECTION LOST", 3000);
  const codeText = useGlitchText("ERR_NETWORK_OFFLINE", 4000);

  useEffect(() => {
    // Glitch layer animation
    const tl = anime.timeline({ loop: true });

    tl.add({
      targets: glitch1Ref.current,
      translateX: [-4, 4, -2, 3, 0],
      opacity: [0, 0.6, 0],
      duration: 300,
      easing: "steps(5)",
      delay: 2000,
    }).add({
      targets: glitch2Ref.current,
      translateX: [3, -3, 2, -1, 0],
      opacity: [0, 0.5, 0],
      duration: 250,
      easing: "steps(4)",
      offset: "-=200",
    }).add({
      targets: containerRef.current,
      translateX: [-2, 2, -1, 1, 0],
      duration: 200,
      easing: "steps(4)",
      offset: "-=150",
    });

    return () => tl.pause();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-30" />
      <div className="scan-overlay" />

      {/* Glitch colour layers */}
      <div
        ref={glitch1Ref}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{ background: "hsl(0 0% 100% / 0.03)", mixBlendMode: "screen" }}
      />
      <div
        ref={glitch2Ref}
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{ background: "hsl(0 0% 0% / 0.4)", mixBlendMode: "multiply" }}
      />

      <div ref={containerRef} className="relative z-10 text-center max-w-md w-full">
        {/* Terminal header */}
        <div className="saber-card p-4 mb-6 font-mono text-[10px] text-left space-y-1">
          <p className="text-muted-foreground/50">// realm :: network diagnostic</p>
          <p className="text-muted-foreground animate-pulse">
            <span className="text-foreground/40 mr-2">›</span>
            ping gateway… <span className="text-destructive/70">timeout</span>
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground/40 mr-2">›</span>
            dns resolve… <span className="text-destructive/70">failed</span>
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground/40 mr-2">›</span>
            status: <span className="text-destructive/80 font-bold">OFFLINE</span>
          </p>
          <span className="inline-block h-3 w-1.5 bg-foreground/60 animate-pulse" />
        </div>

        {/* Glitch title */}
        <div className="relative mb-2">
          {/* Shadow layers for RGB split effect */}
          <h1
            className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground/10 absolute inset-0 select-none"
            style={{ transform: "translate(-3px, 0)", color: "hsl(0 0% 100% / 0.08)" }}
            aria-hidden
          >
            {titleText}
          </h1>
          <h1
            className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground/10 absolute inset-0 select-none"
            style={{ transform: "translate(3px, 0)", color: "hsl(0 0% 60% / 0.08)" }}
            aria-hidden
          >
            {titleText}
          </h1>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight relative">
            {titleText}
          </h1>
        </div>

        <p className="font-mono text-xs text-muted-foreground/60 tracking-[0.3em] mb-8">
          {codeText}
        </p>

        <p className="text-sm text-muted-foreground mb-8">
          No network connection detected. Check your connection and try again.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Server down (skull) ──────────────────────────────────────────────────────

export function ServerError({ code = 500, message = "Internal Server Error" }: { code?: number; message?: string }) {
  const skullRef = useRef<SVGGElement>(null);
  const eyeLeftRef = useRef<SVGCircleElement>(null);
  const eyeRightRef = useRef<SVGCircleElement>(null);
  const cracksRef = useRef<SVGGElement>(null);
  const [decayLines, setDecayLines] = useState<number[]>([]);
  const codeText = useGlitchText(`${code}`, 3500);

  useEffect(() => {
    // Skull float
    anime({
      targets: skullRef.current,
      translateY: [-4, 4],
      duration: 3000,
      easing: "easeInOutSine",
      loop: true,
      direction: "alternate",
    });

    // Eye flicker
    anime({
      targets: [eyeLeftRef.current, eyeRightRef.current],
      opacity: [1, 0.1, 1, 0.4, 1],
      duration: 2200,
      easing: "steps(5)",
      loop: true,
      delay: anime.stagger(300),
    });

    // Cracks appear
    anime({
      targets: cracksRef.current,
      opacity: [0, 1],
      duration: 800,
      delay: 600,
      easing: "easeOutQuad",
    });

    // Decay drip lines
    const lines = Array.from({ length: 6 }, (_, i) => i);
    setDecayLines(lines);

    // Drip animation
    setTimeout(() => {
      anime({
        targets: ".decay-drip",
        scaleY: [0, 1],
        opacity: [0.8, 0],
        duration: () => anime.random(800, 1600),
        delay: () => anime.random(0, 1200),
        easing: "easeInQuad",
        loop: true,
      });
    }, 200);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-20" />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Skull SVG */}
        <div className="flex justify-center mb-8">
          <svg width="120" height="140" viewBox="0 0 120 140" className="overflow-visible">
            <defs>
              <filter id="skull-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="skull-grad" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="hsl(0 0% 22%)" />
                <stop offset="100%" stopColor="hsl(0 0% 6%)" />
              </radialGradient>
            </defs>

            <g ref={skullRef}>
              {/* Skull cranium */}
              <ellipse cx="60" cy="52" rx="44" ry="46" fill="url(#skull-grad)" filter="url(#skull-glow)" />

              {/* Jaw */}
              <rect x="28" y="82" width="64" height="28" rx="6" fill="hsl(0 0% 10%)" />
              {/* Jaw teeth */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect
                  key={i}
                  x={32 + i * 10}
                  y={88}
                  width={7}
                  height={16}
                  rx={2}
                  fill="hsl(0 0% 18%)"
                />
              ))}
              {/* Jaw gap */}
              <rect x="28" y="82" width="64" height="4" rx="0" fill="hsl(0 0% 4%)" />

              {/* Eye sockets */}
              <ellipse ref={eyeLeftRef} cx="40" cy="52" rx="14" ry="16" fill="hsl(0 0% 4%)" />
              <ellipse ref={eyeRightRef} cx="80" cy="52" rx="14" ry="16" fill="hsl(0 0% 4%)" />

              {/* Eye glow */}
              <ellipse cx="40" cy="52" rx="8" ry="9" fill="hsl(0 0% 30%)" opacity={0.3} />
              <ellipse cx="80" cy="52" rx="8" ry="9" fill="hsl(0 0% 30%)" opacity={0.3} />

              {/* Nose cavity */}
              <path d="M55 68 L60 58 L65 68 Z" fill="hsl(0 0% 4%)" />

              {/* Cracks */}
              <g ref={cracksRef} opacity={0} stroke="hsl(0 0% 35%)" strokeWidth="0.8" fill="none">
                <path d="M60 10 L58 25 L62 30 L56 42" />
                <path d="M75 18 L72 28 L76 35" />
                <path d="M45 15 L47 26 L43 32" />
              </g>

              {/* Decay drips */}
              {decayLines.map((i) => (
                <rect
                  key={i}
                  className="decay-drip"
                  x={30 + i * 12}
                  y={96}
                  width={2}
                  height={20 + i * 3}
                  rx={1}
                  fill="hsl(0 0% 25%)"
                  opacity={0}
                  style={{ transformOrigin: `${30 + i * 12}px 96px` }}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Error code */}
        <div className="relative mb-2">
          <h1
            className="font-display text-6xl sm:text-7xl font-black saber-text"
            style={{ textShadow: "0 0 40px hsl(0 0% 100% / 0.1)" }}
          >
            {codeText}
          </h1>
        </div>

        <p className="font-mono text-xs text-muted-foreground/60 tracking-[0.3em] uppercase mb-4">
          {message}
        </p>

        {/* Terminal log */}
        <div className="saber-card p-4 mb-8 font-mono text-[10px] text-left space-y-1">
          <p className="text-muted-foreground/50">// realm :: server diagnostic</p>
          <p className="text-muted-foreground">
            <span className="text-foreground/40 mr-2">›</span>
            service health… <span className="text-destructive/70">critical</span>
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground/40 mr-2">›</span>
            database… <span className="text-destructive/70">unreachable</span>
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground/40 mr-2">›</span>
            realm status: <span className="text-destructive/80 font-bold">DEAD</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-saber-blue hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
