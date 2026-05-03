/**
 * ScrollReveal — wraps children and animates them in when they enter the viewport.
 * Uses IntersectionObserver, fires once.
 */
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

type Animation = "fade-up" | "fade-left" | "fade-right" | "scale-in" | "fade-in";

interface ScrollRevealProps {
  children: ReactNode;
  animation?: Animation;
  delay?: number;   // ms
  duration?: number; // ms
  threshold?: number;
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
}

const animationMap: Record<Animation, string> = {
  "fade-up":    "translateY(18px)",
  "fade-left":  "translateX(-18px)",
  "fade-right": "translateX(18px)",
  "scale-in":   "scale(0.93)",
  "fade-in":    "none",
};

export function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.12,
  className = "",
  style,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const transform = animationMap[animation];

  const baseStyle: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : transform === "none" ? undefined : transform,
    transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    ...style,
  };

  // @ts-expect-error — dynamic tag
  return <Tag ref={ref} className={className} style={baseStyle}>{children}</Tag>;
}
