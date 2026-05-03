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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!skills || skills.length === 0) {
      return new Response(JSON.stringify({ ok: true, snapshotted: 0, message: "No skills found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
