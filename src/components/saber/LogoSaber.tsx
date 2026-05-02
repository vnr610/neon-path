/**
 * LogoSaber — compact animated saber for the navbar logo.
 * Uses anime.js for ignition + idle hum. Pure SVG, no canvas.
 */
import { useEffect, useRef } from "react";
import anime from "animejs";

interface LogoSaberProps {
  size?: number;
  className?: string;
}

export function LogoSaber({ size = 28, className = "" }: LogoSaberProps) {
  const bladeRef = useRef<SVGRectElement>(null);
  const coreRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<SVGRectElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const ignited = useRef(false);

  const cx = size / 2;
  const hiltH = size * 0.38;
  const hiltW = size * 0.22;
  const hiltY = size - hiltH;
  const bladeW = size * 0.1;
  const bladeFullH = hiltY - 2;
  const bladeTipY = 2;

  const ignite = () => {
    if (ignited.current) return;
    ignited.current = true;

    const blade = bladeRef.current;
    const core = coreRef.current;
    const glow = glowRef.current;
    if (!blade || !core || !glow) return;

    anime.set([blade, core, glow], { height: 0, y: hiltY });

    anime({
      targets: [blade, glow],
      height: bladeFullH,
      y: bladeTipY,
      duration: 500,
      easing: "easeOutQuart",
    });
    anime({
      targets: core,
      height: bladeFullH - 4,
      y: bladeTipY + 2,
      duration: 500,
      easing: "easeOutQuart",
      complete: () => {
        // Idle hum
        anime({
          targets: groupRef.current,
          translateY: [-1, 1],
          duration: 2000,
          easing: "easeInOutSine",
          loop: true,
          direction: "alternate",
        });
        anime({
          targets: core,
          opacity: [1, 0.7, 1],
          duration: 1600,
          easing: "easeInOutQuad",
          loop: true,
        });
      },
    });
  };

  useEffect(() => {
    const t = setTimeout(ignite, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="logo-glow" x="-200%" y="-20%" width="500%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="logo-hilt" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 8%)" />
          <stop offset="40%" stopColor="hsl(0 0% 40%)" />
          <stop offset="60%" stopColor="hsl(0 0% 28%)" />
          <stop offset="100%" stopColor="hsl(0 0% 6%)" />
        </linearGradient>
      </defs>

      <g ref={groupRef}>
        {/* Glow */}
        <rect
          ref={glowRef}
          x={cx - bladeW}
          y={hiltY}
          width={bladeW * 2}
          height={0}
          rx={bladeW}
          fill="hsl(0 0% 100%)"
          opacity={0.12}
          filter="url(#logo-glow)"
        />
        {/* Blade */}
        <rect
          ref={bladeRef}
          x={cx - bladeW / 2}
          y={hiltY}
          width={bladeW}
          height={0}
          rx={bladeW / 2}
          fill="hsl(0 0% 15%)"
        />
        {/* Core */}
        <rect
          ref={coreRef}
          x={cx - 1}
          y={hiltY}
          width={2}
          height={0}
          rx={1}
          fill="hsl(0 0% 90%)"
          opacity={0.9}
        />
        {/* Hilt */}
        <rect
          x={cx - hiltW / 2}
          y={hiltY}
          width={hiltW}
          height={hiltH}
          rx={2}
          fill="url(#logo-hilt)"
        />
        {/* Guard */}
        <rect
          x={cx - hiltW / 2 - 3}
          y={hiltY + 2}
          width={hiltW + 6}
          height={3}
          rx={1}
          fill="hsl(0 0% 30%)"
        />
        {/* Grip lines */}
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={cx - hiltW / 2}
            y={hiltY + 8 + i * 5}
            width={hiltW}
            height={2}
            rx={0.5}
            fill="hsl(0 0% 8%)"
            opacity={0.7}
          />
        ))}
        {/* Pommel */}
        <ellipse
          cx={cx}
          cy={size - 2}
          rx={hiltW / 2 + 1}
          ry={3}
          fill="hsl(0 0% 20%)"
        />
      </g>
    </svg>
  );
}
