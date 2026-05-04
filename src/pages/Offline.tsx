import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { GlitchSkull } from "@/components/saber/GlitchSkull";
import { Button } from "@/components/ui/button";

const GLITCH_CHARS = "!@#$%^&*<>?/\\|{}[]~`";

function useGlitch(text: string) {
  const [display, setDisplay] = useState(text);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const schedule = () => {
      const delay = 3000 + Math.random() * 3000;
      return setTimeout(() => {
        setActive(true);
        let frame = 0;
        const id = setInterval(() => {
          frame++;
          if (frame > 10) {
            setDisplay(text);
            setActive(false);
            clearInterval(id);
            schedule();
            return;
          }
          setDisplay(
            text.split("").map((c, i) =>
              i < frame / 2 ? c : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
            ).join("")
          );
        }, 50);
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [text]);

  return display;
}

export function OfflinePage() {
  const title = useGlitch("OFFLINE");
  const [lines, setLines] = useState<string[]>([]);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const sequence = [
      "> pinging gateway…",
      "> no response from host",
      "> retrying… failed",
      "> ERROR: network unreachable",
      "> connection severed",
    ];
    let i = 0;
    const id = setInterval(() => {
      if (i < sequence.length) {
        setLines((prev) => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(id);
        setBooted(true);
      }
    }, 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-40" />
      <div className="scan-overlay" />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">

        {/* Skull */}
        <div className="mb-8 animate-fade-up opacity-0" style={{ animationDelay: "0.1s" }}>
          <GlitchSkull size={180} />
        </div>

        {/* Terminal */}
        <div className="w-full saber-card p-6 mb-8 font-mono text-[11px] space-y-1 min-h-[120px]">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 mb-3">
            <WifiOff className="inline h-3 w-3 mr-1.5" />
            realm :: network
          </p>
          {lines.map((line, i) => (
            <p
              key={i}
              className={`animate-fade-up opacity-0 ${line.includes("ERROR") ? "text-destructive/80" : "text-muted-foreground"}`}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {line}
            </p>
          ))}
          {booted && (
            <span className="inline-block h-3.5 w-1.5 bg-foreground/70 animate-pulse ml-0.5" />
          )}
        </div>

        {/* Main display */}
        <div className={`text-center transition-opacity duration-500 ${booted ? "opacity-100" : "opacity-0"}`}>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-4">
            connection severed
          </p>
          <h1 className="font-display text-[6rem] sm:text-[8rem] font-black leading-none saber-text select-none">
            {title}
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-4 mb-8 max-w-sm mx-auto">
            The realm is unreachable. Check your connection and try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="saber-border gap-2 font-mono text-xs uppercase tracking-[0.2em]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
