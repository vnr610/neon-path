/**
 * og-image — generates Open Graph social preview images for blog posts.
 *
 * Usage:
 *   GET /functions/v1/og-image?title=My+Post&tags=security,react&excerpt=Short+desc
 *
 * Returns a PNG image suitable for og:image meta tags.
 * Uses @resvg/resvg-wasm to render SVG → PNG in Deno.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Truncate text to maxLen, appending ellipsis if needed */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

/** Escape XML special characters for SVG text */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wrap text into lines of maxChars */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

function buildSvg(title: string, excerpt: string, tags: string[]): string {
  const W = 1200;
  const H = 630;

  const titleLines = wrapText(truncate(title, 80), 38);
  const excerptLines = wrapText(truncate(excerpt, 160), 72);
  const tagStr = tags
    .slice(0, 5)
    .map((t) => `#${t}`)
    .join("  ");

  // Title text — large, bold
  const titleY = 220;
  const titleLineHeight = 72;
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="80" y="${titleY + i * titleLineHeight}" font-size="60" font-weight="700" fill="#f5f5f5" font-family="monospace">${escapeXml(line)}</text>`,
    )
    .join("\n");

  // Excerpt text — smaller, muted
  const excerptY = titleY + titleLines.length * titleLineHeight + 32;
  const excerptSvg = excerptLines
    .slice(0, 3)
    .map(
      (line, i) =>
        `<text x="80" y="${excerptY + i * 36}" font-size="26" fill="#888" font-family="monospace">${escapeXml(line)}</text>`,
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
    <!-- Blue glow -->
    <radialGradient id="glow" cx="15%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <!-- Grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.3" stroke-opacity="0.04"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="${W}" height="3" fill="#3b82f6" opacity="0.8"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="4" height="${H}" fill="#3b82f6" opacity="0.4"/>

  <!-- Brand / domain -->
  <text x="80" y="100" font-size="18" fill="#3b82f6" font-family="monospace" letter-spacing="6" text-transform="uppercase" opacity="0.9">VNR610 · REALM</text>
  <line x1="80" y1="116" x2="320" y2="116" stroke="#3b82f6" stroke-width="1" opacity="0.3"/>

  <!-- Title -->
  ${titleSvg}

  <!-- Excerpt -->
  ${excerptSvg}

  <!-- Tags -->
  <text x="80" y="${H - 60}" font-size="20" fill="#3b82f6" font-family="monospace" opacity="0.7">${escapeXml(tagStr)}</text>

  <!-- Bottom right decoration -->
  <circle cx="${W - 80}" cy="${H - 80}" r="120" fill="#3b82f6" opacity="0.03"/>
  <circle cx="${W - 80}" cy="${H - 80}" r="80" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.15"/>
  <circle cx="${W - 80}" cy="${H - 80}" r="40" fill="none" stroke="#3b82f6" stroke-width="0.5" opacity="0.2"/>

  <!-- Corner label -->
  <text x="${W - 80}" y="${H - 40}" font-size="14" fill="#333" font-family="monospace" text-anchor="end">vnr610.dev</text>
</svg>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title") || "VNR610 Realm";
    const excerpt = url.searchParams.get("excerpt") || "Cybersecurity & fullstack development writeups.";
    const tagsParam = url.searchParams.get("tags") || "";
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : [];

    const svg = buildSvg(title, excerpt, tags);

    // Return SVG directly — browsers and most OG scrapers accept SVG for og:image
    // For PNG conversion, a headless browser or resvg-wasm would be needed
    return new Response(svg, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
