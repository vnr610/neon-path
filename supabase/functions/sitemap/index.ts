/**
 * sitemap — generates a styled XML sitemap with XSL for browser rendering.
 *
 * URL: GET /functions/v1/sitemap
 * Returns: application/xml with XSL stylesheet for human-readable display
 *
 * Includes: static pages, blog posts, projects, dev logs, certifications
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://vnr610.dev";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// XSL stylesheet — makes the sitemap human-readable in browsers
const XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Sitemap — VNR610 Realm Codex</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          :root {
            --bg: #080b0f;
            --surface: #0d1117;
            --surface2: #161b22;
            --border: rgba(255,255,255,0.07);
            --border2: rgba(255,255,255,0.12);
            --fg: #e6edf3;
            --muted: #7d8590;
            --blue: #3b82f6;
            --blue-dim: rgba(59,130,246,0.15);
            --purple: #8b5cf6;
            --green: #3fb950;
            --amber: #d29922;
            --red: #f85149;
            --pink: #f778ba;
          }

          html { scroll-behavior: smooth; }

          body {
            background: var(--bg);
            color: var(--fg);
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            min-height: 100vh;
          }

          /* ── Grid background ── */
          body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
              linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
            z-index: 0;
          }

          .wrap {
            position: relative;
            z-index: 1;
            max-width: 1000px;
            margin: 0 auto;
            padding: 3rem 1.5rem 5rem;
          }

          /* ── Header ── */
          .header {
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid var(--border);
          }

          .header-top {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
          }

          .logo-ring {
            width: 40px;
            height: 40px;
            position: relative;
            flex-shrink: 0;
          }

          .site-name {
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .site-sub {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: var(--muted);
            margin-top: 0.15rem;
          }

          .header-meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 1rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.7rem;
            color: var(--muted);
          }

          .stat-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: var(--surface2);
            border: 1px solid var(--border2);
            border-radius: 20px;
            padding: 0.3rem 0.8rem;
            font-size: 0.7rem;
            color: var(--fg);
          }

          .stat-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--blue);
            box-shadow: 0 0 6px var(--blue);
            animation: pulse 2s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }

          /* ── Section headers ── */
          .section-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 2.5rem 0 1rem;
          }

          .section-line {
            flex: 1;
            height: 1px;
            background: var(--border);
          }

          .section-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.35em;
            color: var(--muted);
            white-space: nowrap;
          }

          /* ── URL cards ── */
          .url-grid {
            display: grid;
            gap: 0.5rem;
          }

          .url-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0.9rem 1.1rem;
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 1rem;
            transition: border-color 0.15s, background 0.15s;
            text-decoration: none;
          }

          .url-card:hover {
            border-color: var(--border2);
            background: var(--surface2);
          }

          .url-card:hover .url-path {
            color: var(--blue);
          }

          .url-left { min-width: 0; }

          .url-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            color: var(--fg);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.15s;
          }

          .url-full {
            font-size: 0.7rem;
            color: var(--muted);
            margin-top: 0.15rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .url-right {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            flex-shrink: 0;
          }

          /* ── Badges ── */
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.2rem 0.55rem;
            border-radius: 5px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.6rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            border: 1px solid;
            white-space: nowrap;
          }

          .badge-page    { color: #60a5fa; border-color: rgba(59,130,246,0.3);  background: rgba(59,130,246,0.08); }
          .badge-post    { color: #4ade80; border-color: rgba(74,222,128,0.3);  background: rgba(74,222,128,0.08); }
          .badge-project { color: #c084fc; border-color: rgba(192,132,252,0.3); background: rgba(192,132,252,0.08); }
          .badge-devlog  { color: #fbbf24; border-color: rgba(251,191,36,0.3);  background: rgba(251,191,36,0.08); }
          .badge-cert    { color: #f9a8d4; border-color: rgba(249,168,212,0.3); background: rgba(249,168,212,0.08); }

          /* ── Priority indicator ── */
          .priority {
            display: flex;
            align-items: center;
            gap: 3px;
          }

          .priority-bar {
            width: 3px;
            border-radius: 2px;
            background: var(--border2);
          }

          .priority-bar.active-1 { background: var(--green); height: 8px; }
          .priority-bar.active-2 { background: var(--green); height: 12px; }
          .priority-bar.active-3 { background: var(--amber); height: 16px; }
          .priority-bar.active-4 { background: var(--blue); height: 20px; }
          .priority-bar.inactive { height: 8px; }

          .freq-tag {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.6rem;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.15em;
          }

          .date-tag {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            color: var(--muted);
          }

          /* ── Footer ── */
          .footer {
            margin-top: 4rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .footer-brand {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: var(--muted);
          }

          .footer-links {
            display: flex;
            gap: 1.5rem;
          }

          .footer-links a {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.2em;
            color: var(--muted);
            text-decoration: none;
            transition: color 0.15s;
          }

          .footer-links a:hover { color: var(--blue); }

          @media (max-width: 600px) {
            .url-card { grid-template-columns: 1fr; }
            .url-right { flex-wrap: wrap; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">

          <!-- Header -->
          <div class="header">
            <div class="header-top">
              <svg class="logo-ring" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="#3b82f6" stroke-width="0.5" stroke-dasharray="3 5" opacity="0.4"/>
                <circle cx="20" cy="20" r="13" stroke="#8b5cf6" stroke-width="0.5" opacity="0.3"/>
                <path d="M14 20 L20 14 L26 20 L20 26 Z" stroke="#3b82f6" stroke-width="1.5" fill="none"/>
                <circle cx="20" cy="20" r="2" fill="#3b82f6"/>
              </svg>
              <div>
                <div class="site-name">VNR610 · Realm Codex</div>
                <div class="site-sub">XML Sitemap</div>
              </div>
            </div>
            <div class="header-meta">
              <span class="stat-pill">
                <span class="stat-dot"></span>
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> URLs indexed
              </span>
              <span>Generated: <xsl:value-of select="substring(sitemap:urlset/sitemap:url[1]/sitemap:lastmod, 1, 10)"/></span>
              <span>vnr610.dev</span>
            </div>
          </div>

          <!-- Static pages -->
          <div class="section-header">
            <span class="section-line"></span>
            <span class="section-label">// static pages</span>
            <span class="section-line"></span>
          </div>
          <div class="url-grid">
            <xsl:for-each select="sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/writeups/')) and not(contains(sitemap:loc, '/projects/')) and not(contains(sitemap:loc, '/devlog/'))]">
              <xsl:sort select="sitemap:priority" order="descending" data-type="number"/>
              <a class="url-card" href="{sitemap:loc}">
                <div class="url-left">
                  <div class="url-path"><xsl:value-of select="substring-after(sitemap:loc, 'vnr610.dev')"/></div>
                  <div class="url-full"><xsl:value-of select="sitemap:loc"/></div>
                </div>
                <div class="url-right">
                  <span class="badge badge-page">Page</span>
                  <span class="freq-tag"><xsl:value-of select="sitemap:changefreq"/></span>
                  <span class="date-tag"><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></span>
                </div>
              </a>
            </xsl:for-each>
          </div>

          <!-- Writeups -->
          <xsl:if test="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/writeups/')]">
            <div class="section-header">
              <span class="section-line"></span>
              <span class="section-label">// writeups</span>
              <span class="section-line"></span>
            </div>
            <div class="url-grid">
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/writeups/')]">
                <xsl:sort select="sitemap:lastmod" order="descending"/>
                <a class="url-card" href="{sitemap:loc}">
                  <div class="url-left">
                    <div class="url-path"><xsl:value-of select="substring-after(sitemap:loc, '/writeups/')"/></div>
                    <div class="url-full"><xsl:value-of select="sitemap:loc"/></div>
                  </div>
                  <div class="url-right">
                    <span class="badge badge-post">Writeup</span>
                    <span class="date-tag"><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></span>
                  </div>
                </a>
              </xsl:for-each>
            </div>
          </xsl:if>

          <!-- Projects -->
          <xsl:if test="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/projects/')]">
            <div class="section-header">
              <span class="section-line"></span>
              <span class="section-label">// projects</span>
              <span class="section-line"></span>
            </div>
            <div class="url-grid">
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/projects/')]">
                <xsl:sort select="sitemap:lastmod" order="descending"/>
                <a class="url-card" href="{sitemap:loc}">
                  <div class="url-left">
                    <div class="url-path"><xsl:value-of select="substring-after(sitemap:loc, '/projects/')"/></div>
                    <div class="url-full"><xsl:value-of select="sitemap:loc"/></div>
                  </div>
                  <div class="url-right">
                    <span class="badge badge-project">Project</span>
                    <span class="date-tag"><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></span>
                  </div>
                </a>
              </xsl:for-each>
            </div>
          </xsl:if>

          <!-- Dev Logs -->
          <xsl:if test="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/devlog/')]">
            <div class="section-header">
              <span class="section-line"></span>
              <span class="section-label">// dev diary</span>
              <span class="section-line"></span>
            </div>
            <div class="url-grid">
              <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/devlog/')]">
                <xsl:sort select="sitemap:lastmod" order="descending"/>
                <a class="url-card" href="{sitemap:loc}">
                  <div class="url-left">
                    <div class="url-path"><xsl:value-of select="substring-after(sitemap:loc, '/devlog/')"/></div>
                    <div class="url-full"><xsl:value-of select="sitemap:loc"/></div>
                  </div>
                  <div class="url-right">
                    <span class="badge badge-devlog">Dev Log</span>
                    <span class="date-tag"><xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/></span>
                  </div>
                </a>
              </xsl:for-each>
            </div>
          </xsl:if>

          <!-- Footer -->
          <div class="footer">
            <span class="footer-brand">⚔ vnr610 · realm codex · sitemap</span>
            <div class="footer-links">
              <a href="https://vnr610.dev">Home</a>
              <a href="https://vnr610.dev/writeups">Writeups</a>
              <a href="https://vnr610.dev/contact">Contact</a>
            </div>
          </div>

        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod.slice(0, 10)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Check if XSL requested
  const url = new URL(req.url);
  if (url.searchParams.get("xsl") === "1") {
    return new Response(XSL, {
      headers: { ...corsHeaders, "Content-Type": "application/xslt+xml; charset=utf-8" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date().toISOString();

    // Fetch all dynamic content in parallel
    const [postsRes, projectsRes, devLogsRes, certsRes] = await Promise.all([
      supabase.from("blog_posts").select("slug, updated_at, created_at").eq("status", "published").order("created_at", { ascending: false }),
      supabase.from("projects").select("slug, updated_at, created_at").not("slug", "is", null),
      supabase.from("dev_logs").select("slug, log_date, updated_at").eq("is_public", true).eq("status", "published").not("slug", "is", null),
      supabase.from("certifications").select("id, updated_at, created_at"),
    ]);

    const entries: string[] = [];

    // Static pages
    const staticPages = [
      { path: "/",               freq: "weekly",  priority: "1.0" },
      { path: "/about",          freq: "monthly", priority: "0.9" },
      { path: "/writeups",       freq: "daily",   priority: "0.9" },
      { path: "/devlog",         freq: "daily",   priority: "0.8" },
      { path: "/projects",       freq: "weekly",  priority: "0.8" },
      { path: "/skills",         freq: "weekly",  priority: "0.7" },
      { path: "/timeline",       freq: "weekly",  priority: "0.7" },
      { path: "/certifications", freq: "monthly", priority: "0.7" },
      { path: "/contact",        freq: "monthly", priority: "0.6" },
      { path: "/privacy",        freq: "yearly",  priority: "0.3" },
      { path: "/terms",          freq: "yearly",  priority: "0.3" },
    ];

    for (const p of staticPages) {
      entries.push(urlEntry(`${SITE_URL}${p.path}`, now, p.freq, p.priority));
    }

    // Blog posts
    for (const post of postsRes.data ?? []) {
      if (!post.slug) continue;
      entries.push(urlEntry(
        `${SITE_URL}/writeups/${post.slug}`,
        post.updated_at || post.created_at,
        "monthly", "0.8",
      ));
    }

    // Projects with detail pages
    for (const project of projectsRes.data ?? []) {
      if (!project.slug) continue;
      entries.push(urlEntry(
        `${SITE_URL}/projects/${project.slug}`,
        project.updated_at || project.created_at,
        "monthly", "0.7",
      ));
    }

    // Dev log entries
    for (const log of devLogsRes.data ?? []) {
      if (!log.slug) continue;
      entries.push(urlEntry(
        `${SITE_URL}/devlog/${log.slug}`,
        log.updated_at || log.log_date,
        "monthly", "0.6",
      ));
    }

    const xslUrl = `${SITE_URL}/functions/v1/sitemap?xsl=1`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${xslUrl}"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err) {
    return new Response(`Sitemap generation failed: ${String(err)}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
