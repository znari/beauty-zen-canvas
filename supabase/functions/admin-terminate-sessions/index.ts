import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[admin-terminate-sessions] Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token to verify identity
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error("[admin-terminate-sessions] Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[admin-terminate-sessions] User ${user.id} requesting session termination`);

    // Verify user has admin role using has_role function
    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      console.error("[admin-terminate-sessions] User is not admin:", roleError);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[admin-terminate-sessions] Admin verified, proceeding with session termination`);

    // Use service role client to call the admin function
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function to terminate all sessions
    const { data: result, error: terminateError } = await adminClient.rpc(
      "admin_terminate_all_sessions"
    );

    if (terminateError) {
      console.error("[admin-terminate-sessions] Error terminating sessions:", terminateError);
      return new Response(
        JSON.stringify({ error: "Erro ao encerrar sessões: " + terminateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const terminatedCount = result || 0;
    console.log(`[admin-terminate-sessions] Successfully terminated ${terminatedCount} sessions`);

    // Log the admin action
    await adminClient.from("webhook_security_logs").insert({
      endpoint: "admin-terminate-sessions",
      success: true,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
      error_message: `Admin ${user.email} terminated ${terminatedCount} sessions`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Todas as sessões foram encerradas",
        terminated_count: terminatedCount,
        admin_email: user.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[admin-terminate-sessions] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
