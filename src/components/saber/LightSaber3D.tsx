/**
 * DarkWarrior — Full SVG illustration of a dark armored figure
 * in Vader-style pose: 3/4 view, right arm extended down-left
 * holding a lightsaber diagonally. Pure monochrome.
 *
 * Animations (anime.js):
 *  - Saber ignition: blade extends from hilt with burst
 *  - Idle breathing: chest plate rises/falls subtly
 *  - Cape flow: cape sways gently
 *  - Saber hum: blade flickers + floats
 *  - Sparks: particles drift off blade tip
 *  - Hover: saber glow intensifies
 */
import { useEffect, useRef, useState } from "react";
import anime from "animejs";

interface LightSaber3DProps {
  width?: number;
  height?: number;
  className?: string;
}

type Spark = { id: number; x: number; y: number; angle: number; size: number };

export function LightSaber3D({ width = 340, height = 520, className = "" }: LightSaber3DProps) {
  const bladeRef = useRef<SVGLineElement>(null);
  const bladeGlowRef = useRef<SVGLineElement>(null);
  const bladeCoreRef = useRef<SVGLineElement>(null);
  const burstRef = useRef<SVGCircleElement>(null);
  const saberGroupRef = useRef<SVGGElement>(null);
  const bodyGroupRef = useRef<SVGGElement>(null);
  const capeRef = useRef<SVGPathElement>(null);
  const chestRef = useRef<SVGGElement>(null);
  const ignited = useRef(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const sparkId = useRef(0);
  const sparkTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Saber geometry: diagonal from hand down-left ──────────────────────────
  // Hand position (right arm extended down-left)
  const handX = 210;
  const handY = 310;
  // Blade direction: angled ~210° (down-left like the photo)
  const bladeAngle = 215; // degrees
  const bladeLen = 180;
  const rad = (bladeAngle * Math.PI) / 180;
  const bladeTipX = handX + Math.cos(rad) * bladeLen;
  const bladeTipY = handY + Math.sin(rad) * bladeLen;

  // ── Ignition ──────────────────────────────────────────────────────────────
  const ignite = () => {
    if (ignited.current) return;
    ignited.current = true;

    const blade = bladeRef.current;
    const glow = bladeGlowRef.current;
    const core = bladeCoreRef.current;
    const burst = burstRef.current;
    if (!blade || !glow || !core || !burst) return;

    // Start at hilt (hand), extend to tip
    anime.set([blade, glow, core], {
      x2: handX,
      y2: handY,
    });
    anime.set(burst, { opacity: 0, r: 0 });

    // Burst flash
    anime({
      targets: burst,
      r: [0, 28],
      opacity: [0.9, 0],
      duration: 350,
      easing: "easeOutExpo",
    });

    // Blade extends
    anime({
      targets: [blade, glow, core],
      x2: bladeTipX,
      y2: bladeTipY,
      duration: 550,
      easing: "easeOutQuart",
      complete: () => {
        startHum();
        startSparks();
      },
    });
  };

  // ── Idle hum ──────────────────────────────────────────────────────────────
  const startHum = () => {
    // Saber group micro-vibration
    anime({
      targets: saberGroupRef.current,
      translateX: [-0.5, 0.5],
      translateY: [-0.3, 0.3],
      duration: 120,
      easing: "easeInOutSine",
      loop: true,
      direction: "alternate",
    });
    // Core flicker
    anime({
      targets: bladeCoreRef.current,
      opacity: [0.95, 0.6, 0.95, 0.8, 0.95],
      strokeWidth: [2, 1.2, 2, 1.6, 2],
      duration: 1800,
      easing: "easeInOutQuad",
      loop: true,
    });
    // Glow pulse
    anime({
      targets: bladeGlowRef.current,
      opacity: [0.35, 0.55, 0.35],
      strokeWidth: [10, 16, 10],
      duration: 2400,
      easing: "easeInOutSine",
      loop: true,
    });
  };

  // ── Breathing ─────────────────────────────────────────────────────────────
  const startBreathing = () => {
    anime({
      targets: chestRef.current,
      translateY: [-1.5, 1.5],
      duration: 3200,
      easing: "easeInOutSine",
      loop: true,
      direction: "alternate",
    });
    // Cape sway
    anime({
      targets: capeRef.current,
      d: [
        { value: "M 155 200 Q 80 320 60 480 L 130 480 Q 145 340 165 220 Z" },
        { value: "M 155 200 Q 70 330 55 480 L 125 480 Q 140 350 162 222 Z" },
        { value: "M 155 200 Q 80 320 60 480 L 130 480 Q 145 340 165 220 Z" },
      ],
      duration: 4000,
      easing: "easeInOutSine",
      loop: true,
    });
  };

  // ── Sparks ────────────────────────────────────────────────────────────────
  const startSparks = () => {
    sparkTimer.current = setInterval(() => {
      const id = sparkId.current++;
      const spread = 15;
      const s: Spark = {
        id,
        x: bladeTipX + (Math.random() - 0.5) * spread,
        y: bladeTipY + (Math.random() - 0.5) * spread,
        angle: Math.random() * 360,
        size: Math.random() * 2 + 0.8,
      };
      setSparks((p) => [...p.slice(-10), s]);
      setTimeout(() => setSparks((p) => p.filter((sp) => sp.id !== id)), 700);
    }, 220);
  };

  // ── Hover ─────────────────────────────────────────────────────────────────
  const onHoverIn = () => {
    if (!ignited.current) { ignite(); return; }
    anime({ targets: bladeGlowRef.current, strokeWidth: 20, opacity: 0.7, duration: 200, easing: "easeOutQuad" });
  };
  const onHoverOut = () => {
    anime({ targets: bladeGlowRef.current, strokeWidth: 10, opacity: 0.35, duration: 300, easing: "easeOutQuad" });
  };

  useEffect(() => {
    const t1 = setTimeout(ignite, 700);
    const t2 = setTimeout(startBreathing, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (sparkTimer.current) clearInterval(sparkTimer.current);
    };
  }, []);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 340 520"
      className={`select-none cursor-pointer overflow-visible ${className}`}
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      aria-label="Dark warrior with lightsaber"
    >
      <defs>
        {/* Saber glow filter */}
        <filter id="dw-saber-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Figure shadow */}
        <filter id="dw-shadow" x="-10%" y="-5%" width="130%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="hsl(0 0% 0%)" floodOpacity="0.9" />
        </filter>
        {/* Armor highlight gradient */}
        <linearGradient id="dw-armor" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 4%)" />
          <stop offset="35%" stopColor="hsl(0 0% 22%)" />
          <stop offset="55%" stopColor="hsl(0 0% 32%)" />
          <stop offset="75%" stopColor="hsl(0 0% 14%)" />
          <stop offset="100%" stopColor="hsl(0 0% 3%)" />
        </linearGradient>
        {/* Helmet gradient */}
        <linearGradient id="dw-helmet" x1="0.2" x2="0.8" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(0 0% 28%)" />
          <stop offset="30%" stopColor="hsl(0 0% 16%)" />
          <stop offset="60%" stopColor="hsl(0 0% 8%)" />
          <stop offset="100%" stopColor="hsl(0 0% 2%)" />
        </linearGradient>
        {/* Cape gradient */}
        <linearGradient id="dw-cape" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="hsl(0 0% 2%)" />
          <stop offset="40%" stopColor="hsl(0 0% 8%)" />
          <stop offset="100%" stopColor="hsl(0 0% 1%)" />
        </linearGradient>
        {/* Chest panel gradient */}
        <linearGradient id="dw-chest-panel" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(0 0% 18%)" />
          <stop offset="100%" stopColor="hsl(0 0% 6%)" />
        </linearGradient>
        {/* Saber blade gradient along stroke */}
        <linearGradient id="dw-blade" x1={handX} y1={handY} x2={bladeTipX} y2={bladeTipY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(0 0% 70%)" />
          <stop offset="60%" stopColor="hsl(0 0% 30%)" />
          <stop offset="100%" stopColor="hsl(0 0% 10%)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="dw-blade-glow" x1={handX} y1={handY} x2={bladeTipX} y2={bladeTipY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.5" />
          <stop offset="70%" stopColor="hsl(0 0% 80%)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(0 0% 60%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dw-blade-core" x1={handX} y1={handY} x2={bladeTipX} y2={bladeTipY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(0 0% 100%)" />
          <stop offset="80%" stopColor="hsl(0 0% 90%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(0 0% 80%)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── FIGURE ── */}
      <g ref={bodyGroupRef} filter="url(#dw-shadow)">

        {/* ── CAPE (behind body) ── */}
        <path
          ref={capeRef}
          d="M 155 200 Q 80 320 60 480 L 130 480 Q 145 340 165 220 Z"
          fill="url(#dw-cape)"
          opacity={0.95}
        />
        {/* Cape right side */}
        <path
          d="M 200 200 Q 260 300 270 480 L 230 480 Q 225 310 195 210 Z"
          fill="hsl(0 0% 3%)"
          opacity={0.9}
        />

        {/* ── TORSO / CHEST ARMOR ── */}
        <g ref={chestRef}>
          {/* Main chest plate */}
          <path
            d="M 148 195 L 230 195 L 245 260 L 240 310 L 140 310 L 135 260 Z"
            fill="url(#dw-armor)"
          />
          {/* Chest center ridge */}
          <path
            d="M 188 195 L 192 195 L 196 310 L 184 310 Z"
            fill="hsl(0 0% 28%)"
            opacity={0.5}
          />
          {/* Shoulder pauldron left */}
          <path
            d="M 148 195 Q 120 185 110 200 L 118 230 Q 135 220 148 220 Z"
            fill="url(#dw-armor)"
          />
          {/* Shoulder pauldron right */}
          <path
            d="M 230 195 Q 258 185 268 200 L 260 230 Q 245 220 230 220 Z"
            fill="url(#dw-armor)"
          />
          {/* Chest control panel */}
          <rect x="162" y="230" width="56" height="38" rx="3" fill="url(#dw-chest-panel)" />
          {/* Panel buttons row 1 */}
          {[0,1,2,3].map(i => (
            <rect key={i} x={165 + i*13} y={234} width={9} height={6} rx={1.5}
              fill={i % 2 === 0 ? "hsl(0 0% 35%)" : "hsl(0 0% 20%)"} />
          ))}
          {/* Panel buttons row 2 */}
          {[0,1,2,3].map(i => (
            <rect key={i} x={165 + i*13} y={244} width={9} height={6} rx={1.5}
              fill={i % 2 === 0 ? "hsl(0 0% 20%)" : "hsl(0 0% 30%)"} />
          ))}
          {/* Panel indicator lights */}
          {[0,1,2].map(i => (
            <circle key={i} cx={168 + i*16} cy={258} r={3}
              fill={i === 1 ? "hsl(0 0% 70%)" : "hsl(0 0% 25%)"} />
          ))}
          {/* Belt */}
          <rect x="135" y="300" width="110" height="18" rx="2" fill="hsl(0 0% 12%)" />
          <rect x="182" y="298" width="16" height="22" rx="2" fill="hsl(0 0% 22%)" />
          {/* Belt buckle detail */}
          {[-2,-1,0,1,2].map(i => (
            <rect key={i} x={184 + i*2.5} y={302} width={2} height={12} rx={0.5}
              fill="hsl(0 0% 35%)" opacity={0.7} />
          ))}
        </g>

        {/* ── RIGHT ARM (extended, holding saber) ── */}
        {/* Upper arm */}
        <path
          d="M 230 210 Q 255 230 265 270 L 250 278 Q 242 240 222 222 Z"
          fill="url(#dw-armor)"
        />
        {/* Forearm */}
        <path
          d="M 265 270 Q 278 295 285 320 L 268 326 Q 258 302 250 278 Z"
          fill="url(#dw-armor)"
        />
        {/* Gloved hand */}
        <path
          d="M 285 320 Q 295 330 298 345 L 278 348 Q 272 336 268 326 Z"
          fill="hsl(0 0% 8%)"
        />
        {/* Knuckle detail */}
        {[0,1,2,3].map(i => (
          <ellipse key={i} cx={280 + i*4} cy={338} rx={2} ry={3}
            fill="hsl(0 0% 18%)" />
        ))}

        {/* ── LEFT ARM (at side, slightly bent) ── */}
        {/* Upper arm */}
        <path
          d="M 148 210 Q 122 228 115 265 L 130 270 Q 136 238 155 222 Z"
          fill="url(#dw-armor)"
        />
        {/* Forearm */}
        <path
          d="M 115 265 Q 108 290 110 315 L 126 312 Q 126 290 130 270 Z"
          fill="url(#dw-armor)"
        />

        {/* ── NECK / COLLAR ── */}
        <rect x="175" y="165" width="30" height="35" rx="4" fill="hsl(0 0% 10%)" />
        {/* Collar ridges */}
        {[0,1,2].map(i => (
          <rect key={i} x="172" y={168 + i*8} width="36" height="4" rx="1"
            fill="hsl(0 0% 18%)" opacity={0.6} />
        ))}

        {/* ── HELMET ── */}
        {/* Dome */}
        <ellipse cx="190" cy="110" rx="58" ry="62" fill="url(#dw-helmet)" />
        {/* Dome highlight */}
        <ellipse cx="175" cy="88" rx="22" ry="18" fill="hsl(0 0% 30%)" opacity={0.18} />
        {/* Brow ridge */}
        <path
          d="M 138 128 Q 165 118 190 120 Q 215 118 242 128 L 240 136 Q 215 126 190 128 Q 165 126 140 136 Z"
          fill="hsl(0 0% 6%)"
        />
        {/* Face mask — angular Vader shape */}
        <path
          d="M 145 130 L 155 170 L 165 185 L 190 190 L 215 185 L 225 170 L 235 130 Q 215 122 190 122 Q 165 122 145 130 Z"
          fill="hsl(0 0% 5%)"
        />
        {/* Mask center ridge */}
        <path
          d="M 188 122 L 192 122 L 194 190 L 186 190 Z"
          fill="hsl(0 0% 14%)"
          opacity={0.5}
        />
        {/* Respirator grille */}
        <rect x="172" y="158" width="36" height="22" rx="3" fill="hsl(0 0% 8%)" />
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x={174 + i*5.5} y={160} width={3.5} height={18} rx={1}
            fill="hsl(0 0% 18%)" opacity={0.7} />
        ))}
        {/* Eye lenses */}
        <ellipse cx="170" cy="140" rx="16" ry="10" fill="hsl(0 0% 4%)" />
        <ellipse cx="210" cy="140" rx="16" ry="10" fill="hsl(0 0% 4%)" />
        {/* Lens glint */}
        <ellipse cx="163" cy="136" rx="5" ry="3" fill="hsl(0 0% 22%)" opacity={0.4} />
        <ellipse cx="203" cy="136" rx="5" ry="3" fill="hsl(0 0% 22%)" opacity={0.4} />
        {/* Cheek vents */}
        {[0,1,2].map(i => (
          <rect key={i} x={148} y={148 + i*6} width={14} height={3} rx={1}
            fill="hsl(0 0% 14%)" />
        ))}
        {[0,1,2].map(i => (
          <rect key={i} x={218} y={148 + i*6} width={14} height={3} rx={1}
            fill="hsl(0 0% 14%)" />
        ))}
        {/* Helmet side panels */}
        <path d="M 138 128 Q 128 140 130 165 L 145 168 L 145 130 Z" fill="hsl(0 0% 10%)" />
        <path d="M 242 128 Q 252 140 250 165 L 235 168 L 235 130 Z" fill="hsl(0 0% 10%)" />
        {/* Dome top ridge */}
        <path d="M 185 50 Q 190 46 195 50 L 194 122 L 186 122 Z" fill="hsl(0 0% 20%)" opacity={0.4} />
      </g>

      {/* ── SABER ── */}
      <g ref={saberGroupRef}>
        {/* Hilt */}
        <g>
          {/* Main grip — cylindrical, angled */}
          <line
            x1={handX} y1={handY}
            x2={handX + Math.cos(rad) * 38}
            y2={handY + Math.sin(rad) * 38}
            stroke="url(#dw-armor)"
            strokeWidth={12}
            strokeLinecap="round"
          />
          {/* Grip ridges */}
          {[1,2,3,4,5].map(i => {
            const t = i / 6;
            const rx = handX + Math.cos(rad) * (8 + t * 28);
            const ry = handY + Math.sin(rad) * (8 + t * 28);
            const perp = rad + Math.PI / 2;
            return (
              <line key={i}
                x1={rx + Math.cos(perp) * 7} y1={ry + Math.sin(perp) * 7}
                x2={rx - Math.cos(perp) * 7} y2={ry - Math.sin(perp) * 7}
                stroke="hsl(0 0% 8%)" strokeWidth={2.5} strokeLinecap="round"
              />
            );
          })}
          {/* Guard */}
          {(() => {
            const gx = handX + Math.cos(rad) * 6;
            const gy = handY + Math.sin(rad) * 6;
            const perp = rad + Math.PI / 2;
            return (
              <line
                x1={gx + Math.cos(perp) * 14} y1={gy + Math.sin(perp) * 14}
                x2={gx - Math.cos(perp) * 14} y2={gy - Math.sin(perp) * 14}
                stroke="hsl(0 0% 30%)" strokeWidth={5} strokeLinecap="round"
              />
            );
          })()}
          {/* Activation button */}
          {(() => {
            const bx = handX + Math.cos(rad) * 18;
            const by = handY + Math.sin(rad) * 18;
            const perp = rad + Math.PI / 2;
            return (
              <circle
                cx={bx + Math.cos(perp) * 7}
                cy={by + Math.sin(perp) * 7}
                r={3.5}
                fill="hsl(0 0% 40%)"
              />
            );
          })()}
          {/* Pommel */}
          <circle
            cx={handX + Math.cos(rad) * 40}
            cy={handY + Math.sin(rad) * 40}
            r={6}
            fill="hsl(0 0% 25%)"
          />
        </g>

        {/* Blade glow (outer) */}
        <line
          ref={bladeGlowRef}
          x1={handX} y1={handY}
          x2={handX} y2={handY}
          stroke="url(#dw-blade-glow)"
          strokeWidth={10}
          strokeLinecap="round"
          filter="url(#dw-saber-glow)"
          opacity={0.35}
        />
        {/* Blade body */}
        <line
          ref={bladeRef}
          x1={handX} y1={handY}
          x2={handX} y2={handY}
          stroke="url(#dw-blade)"
          strokeWidth={5}
          strokeLinecap="round"
        />
        {/* Blade core */}
        <line
          ref={bladeCoreRef}
          x1={handX} y1={handY}
          x2={handX} y2={handY}
          stroke="url(#dw-blade-core)"
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.95}
        />
        {/* Ignition burst */}
        <circle
          ref={burstRef}
          cx={handX} cy={handY}
          r={0}
          fill="hsl(0 0% 100%)"
          opacity={0}
        />
        {/* Sparks */}
        {sparks.map(s => (
          <circle
            key={s.id}
            cx={s.x + Math.cos(s.angle) * 8}
            cy={s.y + Math.sin(s.angle) * 8}
            r={s.size}
            fill="hsl(0 0% 88%)"
            opacity={0.6}
          />
        ))}
      </g>
    </svg>
  );
}
