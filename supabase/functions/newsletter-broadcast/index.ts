/**
 * newsletter-broadcast — sends newsletter to all subscribers via Gmail REST API.
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

async function sendEmail(token: string, opts: {
  from: string; to: string;
  subject: string; html: string; text: string;
}): Promise<void> {
  const boundary = `b_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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
  if (!res.ok) throw new Error(`Gmail error (${res.status}): ${await res.text()}`);
}

function buildHtml(subject: string, body: string, siteUrl: string): string {
  const htmlBody = body.trim().split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;font-size:14px;color:#ccc;line-height:1.7;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #222;border-radius:8px;overflow:hidden;max-width:520px;width:100%;">
  <tr><td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">VNR610 · REALM CODEX</span></td>
      <td align="right"><span style="font-size:10px;color:#333;letter-spacing:0.2em;">// newsletter</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:32px 28px;">
    <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;color:#f0f0f0;">${subject.trim()}</h1>
    ${htmlBody}
    <div style="margin-top:28px;padding-top:24px;border-top:1px solid #1a1a1a;">
      <a href="${siteUrl}" style="display:inline-block;padding:10px 22px;background:#f0f0f0;color:#0a0a0a;border-radius:6px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;font-weight:700;">
        Visit the realm →
      </a>
    </div>
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #1a1a1a;background:#0a0a0a;">
    <span style="font-size:9px;color:#333;letter-spacing:0.22em;text-transform:uppercase;">vnr610 · realm · newsletter</span>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { subject, body } = await req.json() as { subject?: string; body?: string };

    if (!subject?.trim() || !body?.trim()) {
      return new Response(JSON.stringify({ error: "subject and body are required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    if (!gmailUser) {
      return new Response(JSON.stringify({ error: "GMAIL_USER not configured" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://vnr610.dev";

    // Get access token once, reuse for all sends
    const token = await getAccessToken();

    // Load subscribers
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: subscribers, error: dbError } = await supabase
      .from("newsletter_subscribers")
      .select("email");

    if (dbError) throw new Error(dbError.message);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ status: "ok", sent: 0 }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const html = buildHtml(subject, body, siteUrl);
    const text = `${subject.trim()}\n\n${body.trim()}\n\n---\n${siteUrl}`;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of subscribers) {
      const email = (row as any).email as string;
      try {
        await sendEmail(token, {
          from: `VNR610 Realm <${gmailUser}>`,
          to: email,
          subject: subject.trim(),
          html,
          text,
        });
        sent++;
        console.log(`✓ ${email}`);
      } catch (err) {
        const msg = String(err);
        errors.push(`${email}: ${msg}`);
        console.error(`✗ ${email}: ${msg}`);
        failed++;
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log(`Done: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ status: "ok", sent, failed, errors }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("broadcast error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
