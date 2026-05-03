/**
 * SEO — sets <title> and Open Graph / Twitter meta tags per page.
 * Uses React's built-in document.title mutation (no extra deps).
 */

import { useEffect } from "react";

const SITE_NAME = "VNR610 · Realm Codex";
const DEFAULT_DESC =
  "Personal portfolio of VNR610 — mastering Full Stack development and Cybersecurity.";
const DEFAULT_IMAGE = "/placeholder.svg";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string;
  /** Canonical path, e.g. "/blog/my-post" */
  path?: string;
};

export function SEO({ title, description = DEFAULT_DESC, image = DEFAULT_IMAGE, path = "" }: SEOProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (property: string, content: string, attr: "name" | "property" = "property") => {
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard
    setMeta("description", description, "name");

    // Open Graph
    setMeta("og:title", fullTitle);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", url);
    setMeta("og:type", "website");
    setMeta("og:site_name", SITE_NAME);

    // Twitter
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", fullTitle, "name");
    setMeta("twitter:description", description, "name");
    setMeta("twitter:image", image, "name");
  }, [fullTitle, description, image, url]);

  return null;
}
