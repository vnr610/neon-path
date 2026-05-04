/**
 * OfflineDetector — wraps the app and shows the OfflinePage
 * whenever the browser loses network connectivity.
 */

import { useEffect, useState, ReactNode } from "react";
import { OfflinePage } from "@/pages/Offline";

export function OfflineDetector({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (isOffline) return <OfflinePage />;
  return <>{children}</>;
}
