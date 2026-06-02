/**
 * skill-snapshot — scheduled function that records a daily snapshot of all
 * skill progress values into skill_progress_history.
 *
 * Schedule: daily at 00:00 UTC (configure in Supabase Dashboard →
 *   Edge Functions → skill-snapshot → Schedule: "0 0 * * *")
 *
 * Can also be triggered manually via POST for testing.
 *
 * Env vars (auto-injected by Supabase):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireAdminOrScheduleSecret(req: Request) {
  const scheduleSecret = Deno.env.get("SKILL_SNAPSHOT_SECRET");
  const providedSecret = req.headers.get("x-snapshot-secret") ?? req.headers.get("x-cron-secret");

  if (scheduleSecret && providedSecret === scheduleSecret) {
    return null;
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const userToken = authHeader.replace("Bearer ", "");
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser(userToken);
  if (authError || !user) {
    return jsonResponse({ error: "Invalid or expired token" }, 401);
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
    return jsonResponse({ error: "Unable to verify permissions" }, 500);
  }
  if (!roleData) {
    return jsonResponse({ error: "Insufficient permissions" }, 403);
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authError = await requireAdminOrScheduleSecret(req);
    if (authError) return authError;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch all current skills
    const { data: skills, error: fetchError } = await supabase
      .from("skills")
      .select("id, name, progress");

    if (fetchError) {
      console.error("Failed to fetch skills:", fetchError);
      return jsonResponse({ error: fetchError.message }, 500);
    }

    if (!skills || skills.length === 0) {
      return jsonResponse({ ok: true, snapshotted: 0, message: "No skills found" }, 200);
    }

    // Insert a snapshot row for each skill
    const snapshots = skills.map((skill) => ({
      skill_id: skill.id,
      progress: skill.progress,
      recorded_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("skill_progress_history")
      .insert(snapshots);

    if (insertError) {
      console.error("Failed to insert snapshots:", insertError);
      return jsonResponse({ error: insertError.message }, 500);
    }

    // Prune snapshots older than 90 days to keep the table lean
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);

    const { error: pruneError } = await supabase
      .from("skill_progress_history")
      .delete()
      .lt("recorded_at", cutoff.toISOString());

    if (pruneError) {
      // Non-fatal — log but don't fail the response
      console.warn("Prune error (non-fatal):", pruneError);
    }

    console.log(`Snapshotted ${snapshots.length} skills at ${new Date().toISOString()}`);

    return new Response(
      JSON.stringify({
        ok: true,
        snapshotted: snapshots.length,
        skills: skills.map((s) => ({ name: s.name, progress: s.progress })),
        prunedBefore: cutoff.toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("skill-snapshot error:", err);
    return jsonResponse({ error: String(err) }, 500);
  }
});
