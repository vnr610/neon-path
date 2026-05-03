/**
 * github-webhook — receives GitHub webhook events (push, star, fork, etc.)
 * and logs them to a github_events table for display on the portfolio.
 *
 * Setup in GitHub:
 *   Repo → Settings → Webhooks → Add webhook
 *   Payload URL: https://<project>.supabase.co/functions/v1/github-webhook
 *   Content type: application/json
 *   Secret: set a random string and add it as GITHUB_WEBHOOK_SECRET in Supabase secrets
 *   Events: Push, Stars, Forks (or "Send me everything")
 *
 * Required env vars:
 *   GITHUB_WEBHOOK_SECRET  — the secret you set in GitHub webhook settings
 *   SUPABASE_URL           — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Verify GitHub's HMAC-SHA256 signature */
async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  if (!signature?.startsWith("sha256=")) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = "sha256=" + encodeHex(new Uint8Array(sig));
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/** Extract a human-readable summary from the event payload */
function summarizeEvent(event: string, payload: Record<string, unknown>): string {
  switch (event) {
    case "push": {
      const commits = (payload.commits as unknown[])?.length ?? 0;
      const branch = (payload.ref as string)?.replace("refs/heads/", "") ?? "unknown";
      const repo = (payload.repository as Record<string, unknown>)?.name ?? "";
      return `Pushed ${commits} commit${commits !== 1 ? "s" : ""} to ${repo}/${branch}`;
    }
    case "star": {
      const action = payload.action as string;
      const repo = (payload.repository as Record<string, unknown>)?.name ?? "";
      return `${action === "created" ? "⭐ Starred" : "Unstarred"} ${repo}`;
    }
    case "fork": {
      const repo = (payload.repository as Record<string, unknown>)?.name ?? "";
      const forkee = (payload.forkee as Record<string, unknown>)?.full_name ?? "";
      return `Forked ${repo} → ${forkee}`;
    }
    case "create": {
      const refType = payload.ref_type as string;
      const ref = payload.ref as string;
      const repo = (payload.repository as Record<string, unknown>)?.name ?? "";
      return `Created ${refType} "${ref}" in ${repo}`;
    }
    case "pull_request": {
      const action = payload.action as string;
      const pr = payload.pull_request as Record<string, unknown>;
      const title = pr?.title as string ?? "";
      const repo = (payload.repository as Record<string, unknown>)?.name ?? "";
      return `PR ${action}: "${title}" in ${repo}`;
    }
    case "issues": {
      const action = payload.action as string;
      const issue = payload.issue as Record<string, unknown>;
      const title = issue?.title as string ?? "";
      return `Issue ${action}: "${title}"`;
    }
    case "release": {
      const action = payload.action as string;
      const release = payload.release as Record<string, unknown>;
      const tag = release?.tag_name as string ?? "";
      const repo = (payload.repository as Record<string, unknown>)?.name ?? "";
      return `Release ${action}: ${tag} in ${repo}`;
    }
    default:
      return `GitHub event: ${event}`;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const event = req.headers.get("x-github-event") ?? "unknown";
  const signature = req.headers.get("x-hub-signature-256") ?? "";
  const deliveryId = req.headers.get("x-github-delivery") ?? "";

  // Verify signature if secret is configured
  const secret = Deno.env.get("GITHUB_WEBHOOK_SECRET");
  if (secret) {
    const valid = await verifySignature(secret, rawBody, signature);
    if (!valid) {
      console.warn("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Skip certain noisy events
  const skipEvents = ["ping"];
  if (skipEvents.includes(event)) {
    return new Response(JSON.stringify({ ok: true, skipped: true, event }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const summary = summarizeEvent(event, payload);
  const repo = (payload.repository as Record<string, unknown>)?.full_name ?? null;
  const repoUrl = (payload.repository as Record<string, unknown>)?.html_url ?? null;
  const sender = (payload.sender as Record<string, unknown>)?.login ?? null;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert by delivery_id to prevent duplicate processing
    const { error } = await supabase.from("github_events").upsert(
      {
        delivery_id: deliveryId,
        event_type: event,
        repo,
        repo_url: repoUrl,
        sender,
        summary,
        payload,
        received_at: new Date().toISOString(),
      },
      { onConflict: "delivery_id" },
    );

    if (error) {
      console.error("DB error:", error);
      // Still return 200 to GitHub so it doesn't retry
    }

    console.log(`[${event}] ${summary}`);

    return new Response(JSON.stringify({ ok: true, event, summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("github-webhook error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
