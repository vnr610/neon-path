/**
 * LogoSaber — compact diagonal lightsaber for the navbar logo.
 * Matches the warrior's saber angle (~215°). anime.js ignition + hum.
 */
import { useEffect, useRef } from "react";
import anime from "animejs";

interface LogoSaberProps {
  size?: number;
  className?: string;
}

export function LogoSaber({ size = 28, className = "" }: LogoSaberProps) {
  const bladeRef = useRef<SVGLineElement>(null);
  const glowRef = useRef<SVGLineElement>(null);
  const coreRef = useRef<SVGLineElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const ignited = useRef(false);

  // Saber at ~45° angle (top-right to bottom-left) to match warrior pose
  const x1 = size * 0.78;
  const y1 = size * 0.18;
  const x2 = size * 0.18;
  const y2 = size * 0.82;

  const ignite = () => {
    if (ignited.current) return;
    ignited.current = true;

    anime.set([bladeRef.current, glowRef.current, coreRef.current], {
      x2: x1, y2: y1,
    });

    anime({
      targets: [bladeRef.current, glowRef.current, coreRef.current],
      x2, y2,
      duration: 480,
      easing: "easeOutQuart",
      complete: () => {
        // Hum
        anime({
          targets: groupRef.current,
          translateX: [-0.4, 0.4],
          translateY: [-0.3, 0.3],
          duration: 100,
          easing: "easeInOutSine",
          loop: true,
          direction: "alternate",
        });
        anime({
          targets: coreRef.current,
          opacity: [1, 0.6, 1],
          duration: 1600,
          easing: "easeInOutQuad",
          loop: true,
        });
      },
    });
  };

  useEffect(() => {
    const t = setTimeout(ignite, 500);
    return () => clearTimeout(t);
  }, []);

  const hiltLen = size * 0.28;
  const hiltAngle = Math.atan2(y2 - y1, x2 - x1);
  const hx2 = x1 + Math.cos(hiltAngle) * hiltLen;
  const hy2 = y1 + Math.sin(hiltAngle) * hiltLen;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <filter id="ls-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="ls-blade" x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(0 0% 75%)" />
          <stop offset="70%" stopColor="hsl(0 0% 30%)" />
          <stop offset="100%" stopColor="hsl(0 0% 10%)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ls-glow-grad" x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="hsl(0 0% 80%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ls-hilt" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 6%)" />
          <stop offset="40%" stopColor="hsl(0 0% 38%)" />
          <stop offset="60%" stopColor="hsl(0 0% 24%)" />
          <stop offset="100%" stopColor="hsl(0 0% 5%)" />
        </linearGradient>
      </defs>

      <g ref={groupRef}>
        {/* Glow */}
        <line
          ref={glowRef}
          x1={x1} y1={y1} x2={x1} y2={y1}
          stroke="url(#ls-glow-grad)"
          strokeWidth={size * 0.18}
          strokeLinecap="round"
          filter="url(#ls-glow)"
          opacity={0.4}
        />
        {/* Blade */}
        <line
          ref={bladeRef}
          x1={x1} y1={y1} x2={x1} y2={y1}
          stroke="url(#ls-blade)"
          strokeWidth={size * 0.07}
          strokeLinecap="round"
        />
        {/* Core */}
        <line
          ref={coreRef}
          x1={x1} y1={y1} x2={x1} y2={y1}
          stroke="hsl(0 0% 95%)"
          strokeWidth={size * 0.025}
          strokeLinecap="round"
          opacity={0.9}
        />
        {/* Hilt */}
        <line
          x1={x1} y1={y1}
          x2={hx2} y2={hy2}
          stroke="url(#ls-hilt)"
          strokeWidth={size * 0.14}
          strokeLinecap="round"
        />
        {/* Guard */}
        {(() => {
          const perp = hiltAngle + Math.PI / 2;
          const gx = x1 + Math.cos(hiltAngle) * size * 0.06;
          const gy = y1 + Math.sin(hiltAngle) * size * 0.06;
          const gl = size * 0.18;
          return (
            <line
              x1={gx + Math.cos(perp) * gl} y1={gy + Math.sin(perp) * gl}
              x2={gx - Math.cos(perp) * gl} y2={gy - Math.sin(perp) * gl}
              stroke="hsl(0 0% 28%)"
              strokeWidth={size * 0.06}
              strokeLinecap="round"
            />
          );
        })()}
        {/* Pommel */}
        <circle
          cx={hx2} cy={hy2}
          r={size * 0.07}
          fill="hsl(0 0% 22%)"
        />
      </g>
    </svg>
  );
}
