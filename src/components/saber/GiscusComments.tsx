/**
 * GiscusComments — GitHub Discussions-powered comment section.
 * Renders a giscus iframe that maps each blog post (by pathname) to a Discussion.
 *
 * Repo: vnr610/neon-path
 * Repo ID: R_kgDOSSOiBQ
 * Category ID: set VITE_GISCUS_CATEGORY_ID in .env (get from giscus.app)
 */

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

type Props = {
  /** The post slug — used as the discussion mapping term */
  term: string;
};

const REPO = "vnr610/neon-path";
const REPO_ID = "R_kgDOSSOiBQ";
// Get this from giscus.app → paste into .env as VITE_GISCUS_CATEGORY_ID
const CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID ?? "";
const CATEGORY = import.meta.env.VITE_GISCUS_CATEGORY ?? "General";

export function GiscusComments({ term }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Remove any existing giscus iframe (e.g. on slug change)
    ref.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", REPO);
    script.setAttribute("data-repo-id", REPO_ID);
    script.setAttribute("data-category", CATEGORY);
    script.setAttribute("data-category-id", CATEGORY_ID);
    script.setAttribute("data-mapping", "specific");
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", "dark");
    script.setAttribute("data-lang", "en");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);
  }, [term]);

  if (!CATEGORY_ID) {
    return (
      <div className="saber-card p-6 flex items-center gap-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground/40 shrink-0" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Comments not configured</p>
          <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">
            Add <code className="text-saber-blue">VITE_GISCUS_CATEGORY_ID</code> to your .env file.
            Get it from <a href="https://giscus.app" target="_blank" rel="noreferrer" className="text-saber-blue hover:underline">giscus.app</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">
          // comments · via · github
        </p>
      </div>
      {/* giscus injects the iframe here */}
      <div ref={ref} className="giscus-container" />
    </div>
  );
}
