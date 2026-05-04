/**
 * list-sessions — returns all active sessions for the authenticated user.
 * Uses the Supabase Admin API which requires the service role key.
 *
 * Called client-side with the user's JWT — we verify it, extract the user ID,
 * then use the admin client to list their sessions.
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

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userToken = authHeader.replace("Bearer ", "");

  // Verify the user token and get user info
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  const { data: { user }, error: userError } = await anonClient.auth.getUser(userToken);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Use admin client to list sessions
  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Call the Admin REST API directly — listUserSessions may not exist in all SDK versions
  const adminRes = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users/${user.id}/sessions`,
    {
      headers: {
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!}`,
      },
    },
  );

  if (!adminRes.ok) {
    const errText = await adminRes.text();
    return new Response(JSON.stringify({ error: `Admin API error: ${errText}` }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const adminData = await adminRes.json();

  // Parse user-agent into a readable device string
  function parseDevice(ua: string | null): string {
    if (!ua) return "Unknown device";
    const u = ua.toLowerCase();
    if (u.includes("mobile") || u.includes("android") || u.includes("iphone")) {
      if (u.includes("android")) return "Android";
      if (u.includes("iphone") || u.includes("ipad")) return "iOS";
      return "Mobile";
    }
    if (u.includes("windows")) return "Windows";
    if (u.includes("mac")) return "macOS";
    if (u.includes("linux")) return "Linux";
    return "Desktop";
  }

  const sessions = (adminData?.sessions ?? adminData ?? []).map((s: any) => ({
    id: s.id,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    userAgent: s.user_agent ?? null,
    device: parseDevice(s.user_agent ?? null),
    ip: s.ip ?? null,
    isCurrent: s.id === s.id, // will be compared client-side
  }));

  return new Response(JSON.stringify({ sessions, userId: user.id }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
