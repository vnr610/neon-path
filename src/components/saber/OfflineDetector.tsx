/**
 * OfflineDetector — wraps the app and shows the OfflinePage
 * whenever the browser loses network connectivity.
 *
 * Uses a debounced check instead of trusting navigator.onLine directly,
 * because navigator.onLine can briefly return false during a hard refresh
 * (Ctrl+R) even when the user is online — causing a false offline flash.
 */

import { useEffect, useState, ReactNode } from "react";
import { OfflinePage } from "@/pages/Offline";

export function OfflineDetector({ children }: { children: ReactNode }) {
  // Start as online — we'll verify after mount
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let offlineTimer: ReturnType<typeof setTimeout> | null = null;

    const handleOffline = () => {
      // Debounce: only show offline page if still offline after 2 seconds.
      // This prevents the false-positive flash on Ctrl+R / hard refresh.
      offlineTimer = setTimeout(() => {
        if (!navigator.onLine) setIsOffline(true);
      }, 2000);
    };

    const handleOnline = () => {
      if (offlineTimer) clearTimeout(offlineTimer);
      setIsOffline(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (offlineTimer) clearTimeout(offlineTimer);
    };
  }, []);

  if (isOffline) return <OfflinePage />;
  return <>{children}</>;
}
