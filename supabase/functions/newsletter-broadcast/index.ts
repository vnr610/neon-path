/**
 * newsletter-broadcast — sends newsletter to all subscribers via Resend.
 * Uses verified domain sender vnr610@manojmagar.info.np — works for any recipient.
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Subscriber = {
  email: string;
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: jsonResponse({ error: "Unauthorized" }, 401) };
  }

  const userToken = authHeader.replace("Bearer ", "");
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(userToken);
  if (authError || !user) {
    return { error: jsonResponse({ error: "Invalid or expired token" }, 401) };
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: roleData, error: roleError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) {
    console.error("role check error:", roleError);
    return { error: jsonResponse({ error: "Unable to verify permissions" }, 500) };
  }
  if (!roleData) {
    return { error: jsonResponse({ error: "Insufficient permissions" }, 403) };
  }

  return { adminClient };
}

function buildHtml(subject: string, body: string, siteUrl: string): string {
  const htmlBody = body.trim().split("\n\n")
    .map((p) => `<p style="margin:0 0 16px;font-size:14px;color:#ccc;line-height:1.7;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
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
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;

    const { subject, body } = await req.json() as { subject?: string; body?: string };

    if (!subject?.trim() || !body?.trim()) {
      return jsonResponse({ error: "subject and body are required" }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return jsonResponse({ error: "RESEND_API_KEY not configured" }, 500);
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://www.manojmagar.info.np";

    const { data: subscribers, error: dbError } = await auth.adminClient
      .from("newsletter_subscribers")
      .select("email");

    if (dbError) throw new Error(dbError.message);

    if (!subscribers || subscribers.length === 0) {
      return jsonResponse({ status: "ok", sent: 0 }, 200);
    }

    const html = buildHtml(subject, body, siteUrl);
    const text = `${subject.trim()}\n\n${body.trim()}\n\n---\n${siteUrl}`;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send one per subscriber using verified domain sender
    for (const row of subscribers as Subscriber[]) {
      const email = row.email;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VNR610 Realm <vnr610@manojmagar.info.np>",
          to: [email],
          subject: subject.trim(),
          html,
          text,
        }),
      });

      if (res.ok) {
        sent++;
        console.log(`✓ ${email}`);
      } else {
        const err = await res.text();
        errors.push(`${email}: ${err}`);
        console.error(`✗ ${email}: ${err}`);
        failed++;
      }

      await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`Broadcast: ${sent} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ status: "ok", sent, failed, errors }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("broadcast error:", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
