import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // Get auth header to verify caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the caller's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get caller's profile to check role
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("ruolo")
      .eq("user_id", caller.id)
      .single();

    if (profileError || !callerProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only superadmin can create companies
    if (callerProfile.ruolo !== "superadmin") {
      return new Response(JSON.stringify({ error: "Not authorized to create companies" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { nome, settore, email_contatto, telefono, indirizzo, attiva } = body;

    if (!nome) {
      return new Response(JSON.stringify({ error: "Nome azienda è obbligatorio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create azienda record
    const { data: azienda, error: aziendaError } = await supabaseAdmin
      .from("aziende")
      .insert({
        nome,
        settore: settore || null,
        email_contatto: email_contatto || null,
        telefono: telefono || null,
        indirizzo: indirizzo || null,
        attiva: attiva ?? true,
      })
      .select()
      .single();

    if (aziendaError) {
      console.error("Error creating azienda:", aziendaError);
      return new Response(JSON.stringify({ error: aziendaError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Generate credentials
    const password = generatePassword();
    const email = email_contatto || `azienda_${azienda.id}@talentprofile.local`;

    // 3. Create user with admin API (NO auto-login for caller)
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        ruolo: "azienda",
      },
    });

    if (createUserError || !authData.user) {
      // Rollback: delete the azienda if user creation fails
      console.error("Error creating user:", createUserError);
      await supabaseAdmin.from("aziende").delete().eq("id", azienda.id);
      return new Response(JSON.stringify({ error: createUserError?.message || "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = authData.user.id;

    try {
      // 4. Update profile (created by trigger) with correct data
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({
          ruolo: "azienda",
          azienda_id: azienda.id,
          nome,
          email,
        })
        .eq("user_id", newUserId);

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        throw profileUpdateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          azienda,
          email,
          password,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (dbError) {
      // Rollback: delete the user and azienda if profile update fails
      console.error("Rolling back due to DB error:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      await supabaseAdmin.from("aziende").delete().eq("id", azienda.id);
      return new Response(JSON.stringify({ error: "Failed to complete company setup" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
