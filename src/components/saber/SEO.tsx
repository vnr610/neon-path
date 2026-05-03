/**
 * SEO — sets <title> and Open Graph / Twitter meta tags per page.
 * Uses React's built-in document.title mutation (no extra deps).
 */

import { useEffect } from "react";

const SITE_NAME = "VNR610 · Realm Codex";
const DEFAULT_DESC =
  "Personal portfolio of VNR610 — mastering Full Stack development and Cybersecurity.";
const DEFAULT_IMAGE = "/placeholder.svg";
const OG_IMAGE_FN = "https://ucghqoburfkakzfubets.supabase.co/functions/v1/og-image";

type SEOProps = {
  title?: string;
  description?: string;
  image?: string | null;
  /** Canonical path, e.g. "/blog/my-post" */
  path?: string;
  /** Tags for OG image generation */
  tags?: string[];
};

export function SEO({ title, description = DEFAULT_DESC, image, path = "", tags = [] }: SEOProps) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  // Build OG image URL: use thumbnail if provided, otherwise generate via edge function
  const ogImage = image
    ? image
    : title
    ? `${OG_IMAGE_FN}?title=${encodeURIComponent(title)}${description ? `&excerpt=${encodeURIComponent(description.slice(0, 160))}` : ""}${tags.length ? `&tags=${encodeURIComponent(tags.join(","))}` : ""}`
    : DEFAULT_IMAGE;

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
    setMeta("og:image", ogImage);
    setMeta("og:url", url);
    setMeta("og:type", "website");
    setMeta("og:site_name", SITE_NAME);

    // Twitter
    setMeta("twitter:card", "summary_large_image", "name");
    setMeta("twitter:title", fullTitle, "name");
    setMeta("twitter:description", description, "name");
    setMeta("twitter:image", ogImage, "name");
  }, [fullTitle, description, ogImage, url]);

  return null;
}
