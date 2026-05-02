/**
 * LightSaber3D
 * A pure SVG dark lightsaber animated with anime.js.
 * - Ignition: blade extends from hilt with glow burst
 * - Idle hum: subtle flicker + floating
 * - Particles: sparks drift off the blade tip
 * - Hover: blade brightens, hum intensifies
 */
import { useEffect, useRef, useState } from "react";
import anime from "animejs";

interface LightSaber3DProps {
  /** Width of the SVG canvas */
  width?: number;
  /** Height of the SVG canvas */
  height?: number;
  className?: string;
}

// Spark particle type
type Spark = { id: number; x: number; y: number; vx: number; vy: number; life: number; size: number };

export function LightSaber3D({ width = 320, height = 480, className = "" }: LightSaber3DProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const bladeRef = useRef<SVGRectElement>(null);
  const glowRef = useRef<SVGRectElement>(null);
  const coreRef = useRef<SVGRectElement>(null);
  const hiltGroupRef = useRef<SVGGElement>(null);
  const bladeGroupRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGCircleElement>(null);
  const ignited = useRef(false);
  const idleAnim = useRef<anime.AnimeInstance | null>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);
  const sparkInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Saber geometry (SVG coords, origin top-left)
  const cx = width / 2;
  const hiltY = height - 60;       // hilt bottom
  const hiltH = 110;               // hilt height
  const hiltW = 22;
  const bladeFullH = height - hiltY - hiltH + 20; // full blade height when extended
  const bladeW = 8;
  const bladeTipY = 40;            // blade tip Y when fully extended

  // Colours — monochrome dark saber (near-black blade, white core)
  const bladeColor = "hsl(0 0% 8%)";
  const bladeGlow = "hsl(0 0% 100% / 0.12)";
  const coreColor = "hsl(0 0% 92%)";
  const hiltColor = "hsl(0 0% 18%)";
  const hiltAccent = "hsl(0 0% 35%)";
  const hiltGrip = "hsl(0 0% 10%)";

  // ── Ignition sequence ──────────────────────────────────────────────────────
  const ignite = () => {
    if (ignited.current) return;
    ignited.current = true;

    const blade = bladeRef.current;
    const glow = glowRef.current;
    const core = coreRef.current;
    const burst = burstRef.current;
    const bladeGroup = bladeGroupRef.current;
    if (!blade || !glow || !core || !burst || !bladeGroup) return;

    // Start blade at hilt, extend upward
    anime.set(blade, { height: 0, y: hiltY });
    anime.set(glow, { height: 0, y: hiltY });
    anime.set(core, { height: 0, y: hiltY });
    anime.set(burst, { opacity: 0, r: 0 });

    // Burst flash at ignition point
    anime({
      targets: burst,
      r: [0, 40],
      opacity: [0.8, 0],
      duration: 400,
      easing: "easeOutExpo",
    });

    // Blade extends
    anime({
      targets: [blade, glow, core],
      height: (el: Element) => {
        if (el === core) return bladeFullH - 20;
        if (el === glow) return bladeFullH + 10;
        return bladeFullH;
      },
      y: (el: Element) => {
        if (el === core) return bladeTipY + 10;
        if (el === glow) return bladeTipY - 5;
        return bladeTipY;
      },
      duration: 600,
      easing: "easeOutQuart",
      complete: () => {
        startIdleHum();
        startSparks();
      },
    });
  };

  // ── Idle hum ───────────────────────────────────────────────────────────────
  const startIdleHum = () => {
    const bladeGroup = bladeGroupRef.current;
    if (!bladeGroup) return;

    idleAnim.current = anime({
      targets: bladeGroup,
      translateY: [-3, 3, -2, 2, -1, 1, 0],
      opacity: [1, 0.92, 1, 0.95, 1],
      duration: 3200,
      easing: "easeInOutSine",
      loop: true,
      direction: "alternate",
    });

    // Blade flicker
    anime({
      targets: coreRef.current,
      opacity: [1, 0.85, 1, 0.9, 1],
      duration: 1800,
      easing: "easeInOutQuad",
      loop: true,
    });
  };

  // ── Spark particles ────────────────────────────────────────────────────────
  const startSparks = () => {
    sparkInterval.current = setInterval(() => {
      const id = sparkId.current++;
      const newSpark: Spark = {
        id,
        x: cx + (Math.random() - 0.5) * bladeW * 2,
        y: bladeTipY + Math.random() * 30,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.random() * 2 - 0.5,
        life: 1,
        size: Math.random() * 2 + 0.5,
      };
      setSparks((prev) => [...prev.slice(-12), newSpark]);

      // Animate spark out
      setTimeout(() => {
        setSparks((prev) => prev.filter((s) => s.id !== id));
      }, 900);
    }, 180);
  };

  // ── Hover intensify ────────────────────────────────────────────────────────
  const onHoverIn = () => {
    if (!ignited.current) { ignite(); return; }
    anime({
      targets: glowRef.current,
      opacity: [0.6, 1],
      width: [bladeW + 8, bladeW + 20],
      x: [cx - (bladeW + 8) / 2, cx - (bladeW + 20) / 2],
      duration: 300,
      easing: "easeOutQuad",
    });
  };

  const onHoverOut = () => {
    anime({
      targets: glowRef.current,
      opacity: [1, 0.6],
      width: [bladeW + 20, bladeW + 8],
      x: [cx - (bladeW + 20) / 2, cx - (bladeW + 8) / 2],
      duration: 400,
      easing: "easeOutQuad",
    });
  };

  // ── Mount: auto-ignite after short delay ──────────────────────────────────
  useEffect(() => {
    const t = setTimeout(ignite, 600);
    return () => {
      clearTimeout(t);
      idleAnim.current?.pause();
      if (sparkInterval.current) clearInterval(sparkInterval.current);
    };
  }, []);

  const bladeX = cx - bladeW / 2;
  const glowX = cx - (bladeW + 8) / 2;
  const coreX = cx - 2;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`select-none cursor-pointer ${className}`}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      aria-label="Dark lightsaber"
    >
      <defs>
        {/* Blade glow filter */}
        <filter id="saber-glow" x="-100%" y="-10%" width="300%" height="120%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Hilt bevel */}
        <filter id="hilt-shadow" x="-20%" y="-5%" width="140%" height="110%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="hsl(0 0% 0%)" floodOpacity="0.8" />
        </filter>
        {/* Blade gradient — dark with bright core */}
        <linearGradient id="blade-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 0%)" stopOpacity="0.9" />
          <stop offset="40%" stopColor={bladeColor} stopOpacity="1" />
          <stop offset="50%" stopColor="hsl(0 0% 20%)" stopOpacity="1" />
          <stop offset="60%" stopColor={bladeColor} stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(0 0% 0%)" stopOpacity="0.9" />
        </linearGradient>
        {/* Glow gradient */}
        <linearGradient id="glow-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(0 0% 100%)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0" />
        </linearGradient>
        {/* Hilt gradient — 3D cylinder look */}
        <linearGradient id="hilt-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 8%)" />
          <stop offset="30%" stopColor="hsl(0 0% 28%)" />
          <stop offset="50%" stopColor="hsl(0 0% 40%)" />
          <stop offset="70%" stopColor="hsl(0 0% 22%)" />
          <stop offset="100%" stopColor="hsl(0 0% 6%)" />
        </linearGradient>
        {/* Pommel gradient */}
        <radialGradient id="pommel-grad" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="hsl(0 0% 50%)" />
          <stop offset="100%" stopColor="hsl(0 0% 10%)" />
        </radialGradient>
      </defs>

      {/* ── Blade group (animated) ── */}
      <g ref={bladeGroupRef}>
        {/* Outer glow */}
        <rect
          ref={glowRef}
          x={glowX}
          y={hiltY}
          width={bladeW + 8}
          height={0}
          rx={4}
          fill="url(#glow-grad)"
          filter="url(#saber-glow)"
          opacity={0.6}
        />
        {/* Main blade */}
        <rect
          ref={bladeRef}
          x={bladeX}
          y={hiltY}
          width={bladeW}
          height={0}
          rx={3}
          fill="url(#blade-grad)"
        />
        {/* Bright core line */}
        <rect
          ref={coreRef}
          x={coreX}
          y={hiltY}
          width={4}
          height={0}
          rx={2}
          fill={coreColor}
          opacity={0.9}
        />
        {/* Ignition burst */}
        <circle
          ref={burstRef}
          cx={cx}
          cy={hiltY}
          r={0}
          fill="hsl(0 0% 100%)"
          opacity={0}
        />
        {/* Spark particles */}
        {sparks.map((s) => (
          <circle
            key={s.id}
            cx={s.x + s.vx * 20}
            cy={s.y + s.vy * 20}
            r={s.size}
            fill="hsl(0 0% 90%)"
            opacity={s.life * 0.7}
          />
        ))}
      </g>

      {/* ── Hilt (static, drawn on top of blade base) ── */}
      <g ref={hiltGroupRef} filter="url(#hilt-shadow)">
        {/* Main grip body */}
        <rect
          x={cx - hiltW / 2}
          y={hiltY - hiltH + 30}
          width={hiltW}
          height={hiltH - 10}
          rx={4}
          fill="url(#hilt-grad)"
        />
        {/* Grip ridges */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x={cx - hiltW / 2 - 1}
            y={hiltY - hiltH + 55 + i * 12}
            width={hiltW + 2}
            height={5}
            rx={1}
            fill={hiltGrip}
            opacity={0.8}
          />
        ))}
        {/* Activation button */}
        <rect
          x={cx - hiltW / 2 - 3}
          y={hiltY - hiltH + 42}
          width={8}
          height={8}
          rx={2}
          fill={hiltAccent}
        />
        <rect
          x={cx - hiltW / 2 - 2}
          y={hiltY - hiltH + 43}
          width={6}
          height={6}
          rx={1.5}
          fill="hsl(0 0% 60%)"
          opacity={0.6}
        />
        {/* Guard / crossguard */}
        <rect
          x={cx - hiltW / 2 - 8}
          y={hiltY - hiltH + 28}
          width={hiltW + 16}
          height={8}
          rx={3}
          fill="url(#hilt-grad)"
        />
        {/* Pommel cap */}
        <ellipse
          cx={cx}
          cy={hiltY + 14}
          rx={hiltW / 2 + 2}
          ry={10}
          fill="url(#pommel-grad)"
        />
        {/* Emitter shroud at top */}
        <rect
          x={cx - hiltW / 2 + 2}
          y={hiltY - hiltH + 18}
          width={hiltW - 4}
          height={14}
          rx={2}
          fill="hsl(0 0% 12%)"
        />
        <rect
          x={cx - 3}
          y={hiltY - hiltH + 16}
          width={6}
          height={16}
          rx={1}
          fill="hsl(0 0% 25%)"
        />
      </g>
    </svg>
  );
}
