/**
 * contact-notify — saves contact message to Supabase and sends notification
 * to site owner via Resend.
 *
 * Required secrets:
 *   RESEND_API_KEY          — from resend.com
 *   NOTIFY_EMAIL            — your notification email address
 *   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter: max 3 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 minutes
  const limit = 3;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Rate limiting by IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("cf-connecting-ip")
    ?? "unknown";

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait before submitting again." }), {
      status: 429, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const { name, email, message } = await req.json() as {
      name?: string; email?: string; message?: string;
    };

    // Validate required fields
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response(JSON.stringify({ error: "name, email, and message are required" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate lengths
    if (name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Name too long (max 100 characters)" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (message.trim().length > 5000) {
      return new Response(JSON.stringify({ error: "Message too long (max 5000 characters)" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ── Save to Supabase ──────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { error: dbError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save message" }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // ── Send notification via Resend ──────────────────────────────────────────
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL");

    if (!notifyEmail) {
      console.warn("NOTIFY_EMAIL not set — skipping email notification");
    }

    if (resendKey && notifyEmail) {
      const sentAt = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kathmandu",
        dateStyle: "medium",
        timeStyle: "short",
      });

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VNR610 Realm <vnr610@manojmagar.info.np>",
          to: [notifyEmail],
          reply_to: email.trim(),
          subject: `New message from ${name.trim()} — VNR610 Realm`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;color:#f5f5f5;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #222;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">
  <tr><td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">VNR610 · REALM CODEX</span></td>
      <td align="right"><span style="font-size:10px;color:#333;letter-spacing:0.2em;">// new · transmission</span></td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:28px;">
    <p style="margin:0 0 20px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#555;">Incoming message</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1e1e1e;border-radius:6px;margin-bottom:16px;">
      <tr><td style="padding:16px 20px;">
        <span style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444;">From</span><br/>
        <span style="font-size:15px;font-weight:600;color:#f0f0f0;">${name.trim()}</span><br/><br/>
        <span style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444;">Email</span><br/>
        <a href="mailto:${email.trim()}" style="font-size:13px;color:#888;text-decoration:none;">${email.trim()}</a>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1e1e1e;border-radius:6px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <span style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444;display:block;margin-bottom:10px;">Message</span>
        <p style="margin:0;font-size:13px;color:#ccc;line-height:1.7;white-space:pre-wrap;">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      </td></tr>
    </table>
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#f0f0f0;border-radius:6px;">
        <a href="mailto:${email.trim()}?subject=Re: Your message to VNR610"
          style="display:inline-block;padding:10px 20px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#0a0a0a;text-decoration:none;font-weight:600;">
          Reply to ${name.trim().split(" ")[0]}
        </a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #1a1a1a;background:#0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:9px;color:#333;letter-spacing:0.22em;text-transform:uppercase;">vnr610 · realm</span></td>
      <td align="right"><span style="font-size:9px;color:#333;">${sentAt} NPT</span></td>
    </tr></table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
          text: `New message from ${name.trim()} <${email.trim()}>\n\n${message.trim()}\n\n---\nReceived: ${sentAt} NPT`,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        // Don't fail — message already saved to DB
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("contact-notify error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
