import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Terminal } from "lucide-react";
import { GlitchSkull } from "@/components/saber/GlitchSkull";

const GLITCH_CHARS = "!@#$%^&*<>?/\\|{}[]~`";

function useGlitch(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      if (frame > 12) { setDisplay(text); clearInterval(id); return; }
      setDisplay(
        text.split("").map((c, i) =>
          i < frame / 2 ? c : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        ).join("")
      );
    }, 40);
    return () => clearInterval(id);
  }, [text, active]);
  return display;
}

const NotFound = () => {
  const location = useLocation();
  const [glitching, setGlitching] = useState(false);
  const [booted, setBooted] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  const glitch404 = useGlitch("404", glitching);

  useEffect(() => {
    console.error("404:", location.pathname);
    const sequence = [
      "> initializing realm…",
      `> resolving path: ${location.pathname}`,
      "> scanning sector…",
      "> ERROR: route not found in codex",
      "> signal lost",
    ];
    let i = 0;
    const id = setInterval(() => {
      if (i < sequence.length) {
        setLines((prev) => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(id);
        setBooted(true);
        const glitchId = setInterval(() => {
          setGlitching(true);
          setTimeout(() => setGlitching(false), 600);
        }, 4000);
        return () => clearInterval(glitchId);
      }
    }, 280);
    return () => clearInterval(id);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
      <div className="scan-overlay" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">

        {/* Skull */}
        <div className="mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <GlitchSkull size={180} />
        </div>

        {/* Boot terminal */}
        <div className="w-full saber-card p-6 mb-8 font-mono text-[11px] space-y-1 min-h-[120px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">
            <Terminal className="inline h-3 w-3 mr-1.5" />
            realm :: terminal
          </p>
          {lines.map((line, i) => (
            <p
              key={i}
              className={`animate-fade-up opacity-0 ${line.includes("ERROR") ? "text-destructive/80" : "text-muted-foreground"}`}
              style={{ animationDelay: `${i * 0.28}s` }}
            >
              {line}
            </p>
          ))}
          {booted && (
            <span className="inline-block h-3.5 w-1.5 bg-foreground/70 animate-pulse ml-0.5" />
          )}
        </div>

        {/* 404 display */}
        <div className={`text-center transition-opacity duration-500 ${booted ? "opacity-100" : "opacity-0"}`}>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">
            signal lost
          </p>
          <h1
            className="font-display text-[8rem] sm:text-[10rem] font-black leading-none saber-text select-none cursor-default"
            onMouseEnter={() => setGlitching(true)}
            onMouseLeave={() => setGlitching(false)}
          >
            {glitch404}
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-4 mb-8">
            This path does not exist in the codex.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.25em] text-saber-blue hover:underline group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Return to realm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
