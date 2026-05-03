/**
 * ReadingProgress — thin bar at the top of the viewport that fills
 * as the user scrolls through the article.
 */

import { useEffect, useState } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-foreground/60 via-foreground/90 to-foreground/60 shadow-[0_0_8px_hsl(0_0%_100%/0.4)] transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
