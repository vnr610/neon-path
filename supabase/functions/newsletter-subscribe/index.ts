/**
 * newsletter-subscribe — saves subscriber and sends welcome email via Gmail REST API.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GMAIL_CLIENT_ID")!,
      client_secret: Deno.env.get("GMAIL_CLIENT_SECRET")!,
      refresh_token: Deno.env.get("GMAIL_REFRESH_TOKEN")!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Token error: ${await res.text()}`);
  const d = await res.json();
  return d.access_token;
}

async function sendEmail(opts: {
  from: string; to: string;
  subject: string; html: string; text: string;
}): Promise<void> {
  const token = await getAccessToken();
  const boundary = `b_${Date.now()}`;
  const mime = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    opts.text,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    opts.html,
    ``,
    `--${boundary}--`,
  ].join("\r\n");

  const raw = btoa(unescape(encodeURIComponent(mime)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) throw new Error(`Gmail error: ${await res.text()}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { email, welcomeOnly } = await req.json() as {
      email?: string; welcomeOnly?: boolean;
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const clean = email.trim().toLowerCase();

    if (!welcomeOnly) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false } },
      );

      const { error: dbError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: clean });

      if (dbError) {
        if (dbError.code === "23505") {
          return new Response(JSON.stringify({ status: "duplicate" }), {
            status: 200, headers: { ...cors, "Content-Type": "application/json" },
          });
        }
        throw new Error(dbError.message);
      }
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://vnr610.dev";

    if (gmailUser) {
      try {
        await sendEmail({
          from: `VNR610 Realm <${gmailUser}>`,
          to: clean,
          subject: "You're in — VNR610 Realm Codex",
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #222;border-radius:8px;overflow:hidden;max-width:520px;width:100%;">
  <tr><td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0a0a0a;">
    <span style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">VNR610 · REALM CODEX</span>
  </td></tr>
  <tr><td style="padding:32px 28px;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#555;">Transmission confirmed</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#f0f0f0;">You're subscribed.</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#888;line-height:1.7;">
      You'll get notified when new writeups, projects, and milestones drop. No spam.
    </p>
    <a href="${siteUrl}/writeups" style="display:inline-block;padding:10px 20px;background:#f0f0f0;color:#0a0a0a;border-radius:6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;font-weight:600;">
      Read latest writeups
    </a>
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #1a1a1a;background:#0a0a0a;">
    <span style="font-size:9px;color:#333;letter-spacing:0.22em;text-transform:uppercase;">vnr610 · realm · newsletter</span>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
          text: `You're subscribed to VNR610 Realm Codex.\n\nRead latest: ${siteUrl}/writeups`,
        });
      } catch (e) {
        console.warn("Welcome email failed (non-critical):", e);
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("subscribe error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
