/**
 * rss — generates an RSS 2.0 feed from published blog posts.
 *
 * URL: GET /functions/v1/rss
 * Returns: application/rss+xml
 *
 * Env vars (auto-injected):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SITE_URL = "https://vnr610.dev";
const SITE_TITLE = "VNR610 · Realm Codex";
const SITE_DESC = "Cybersecurity and fullstack development writeups by VNR610.";
const AUTHOR_EMAIL = "bbvnr610@proton.me (VNR610)";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select("title, slug, excerpt, content, tags, created_at, author")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const items = (posts ?? []).map((post) => {
      const url = `${SITE_URL}/writeups/${post.slug}`;
      const pubDate = new Date(post.created_at).toUTCString();
      const desc = post.excerpt
        ? escapeXml(post.excerpt)
        : escapeXml(post.content.replace(/[#*`\[\]]/g, "").slice(0, 200) + "…");
      const categories = (post.tags ?? [])
        .map((t: string) => `<category>${escapeXml(t)}</category>`)
        .join("\n        ");

      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      <author>${AUTHOR_EMAIL}</author>
      ${categories}
    </item>`;
    }).join("\n");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/favicon.ico</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;

    return new Response(rss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(`RSS generation failed: ${String(err)}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
