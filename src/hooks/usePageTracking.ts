/**
 * usePageTracking — fires a page view event on every route change.
 * Drop this hook once inside App or a layout component.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/content";

export function usePageTracking() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't track admin routes
    if (pathname.startsWith("/admin")) return;
    trackPageView(pathname);
  }, [pathname]);
}
