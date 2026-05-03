/**
 * contact-notify — saves a contact message to Supabase and sends an email
 * notification to the site owner via Resend.
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   RESEND_API_KEY   — from resend.com
 *   NOTIFY_EMAIL     — your email address to receive notifications
 *   SUPABASE_URL     — auto-injected by Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as ContactPayload;
    const { name, email, message } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return new Response(
        JSON.stringify({ error: "name, email, and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Save to Supabase ──────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save message" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Send email via Resend ─────────────────────────────────────────────────
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const notifyEmail = Deno.env.get("NOTIFY_EMAIL");

    if (resendKey && notifyEmail) {
      const sentAt = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kathmandu",
        dateStyle: "medium",
        timeStyle: "short",
      });

      const emailBody = {
        from: "VNR610 Realm <onboarding@resend.dev>",
        to: [notifyEmail],
        reply_to: email.trim(),
        subject: `New message from ${name.trim()} — VNR610 Realm`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0f0f0f;border:1px solid #222;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:20px 28px;border-bottom:1px solid #1a1a1a;background:#0a0a0a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#555;">VNR610 · REALM CODEX</span>
                  </td>
                  <td align="right">
                    <span style="font-size:10px;color:#333;letter-spacing:0.2em;">// new · transmission</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px;">

              <p style="margin:0 0 24px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#555;">
                Incoming message
              </p>

              <!-- Sender info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1e1e1e;border-radius:6px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <span style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444;">From</span><br/>
                          <span style="font-size:15px;font-weight:600;color:#f0f0f0;">${name.trim()}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444;">Email</span><br/>
                          <a href="mailto:${email.trim()}" style="font-size:13px;color:#888;text-decoration:none;">${email.trim()}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#141414;border:1px solid #1e1e1e;border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#444;display:block;margin-bottom:10px;">Message</span>
                    <p style="margin:0;font-size:13px;color:#ccc;line-height:1.7;white-space:pre-wrap;">${message.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                  </td>
                </tr>
              </table>

              <!-- Reply CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f0f0f0;border-radius:6px;">
                    <a href="mailto:${email.trim()}?subject=Re: Your message to VNR610"
                       style="display:inline-block;padding:10px 20px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#0a0a0a;text-decoration:none;font-weight:600;">
                      Reply to ${name.trim().split(" ")[0]}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #1a1a1a;background:#0a0a0a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:9px;color:#333;letter-spacing:0.22em;text-transform:uppercase;">vnr610 · realm</span>
                  </td>
                  <td align="right">
                    <span style="font-size:9px;color:#333;">${sentAt} NPT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        text: `New message from ${name.trim()} <${email.trim()}>\n\n${message.trim()}\n\n---\nReceived: ${sentAt} NPT\nReply: ${email.trim()}`,
      };

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailBody),
      });

      if (!resendRes.ok) {
        const resendErr = await resendRes.text();
        // Don't fail the whole request — message is already saved to DB
        console.error("Resend error:", resendErr);
      }
    } else {
      console.warn("RESEND_API_KEY or NOTIFY_EMAIL not set — skipping email notification");
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("contact-notify error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
