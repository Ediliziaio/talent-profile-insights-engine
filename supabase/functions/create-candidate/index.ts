import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateUsername(aziendaNome: string): string {
  const slug = aziendaNome
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 12);
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  return `${slug}-${suffix}`;
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
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
      .select("ruolo, azienda_id")
      .eq("user_id", caller.id)
      .single();

    if (profileError || !callerProfile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only azienda or superadmin can create candidates
    if (!["azienda", "superadmin"].includes(callerProfile.ruolo)) {
      return new Response(JSON.stringify({ error: "Not authorized to create candidates" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await req.json();
    const { nome, cognome, email, eta, telefono, ruolo_attuale, funzione, azienda_id: bodyAziendaId } = body;

    if (!nome || !cognome) {
      return new Response(JSON.stringify({ error: "Nome e cognome sono obbligatori" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine azienda_id
    let aziendaId: string;
    if (callerProfile.ruolo === "superadmin") {
      if (!bodyAziendaId) {
        return new Response(JSON.stringify({ error: "Superadmin must specify azienda_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      aziendaId = bodyAziendaId;
    } else {
      if (!callerProfile.azienda_id) {
        return new Response(JSON.stringify({ error: "Caller has no azienda_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      aziendaId = callerProfile.azienda_id;
    }

    // Get azienda name for username generation
    const { data: azienda, error: aziendaError } = await supabaseAdmin
      .from("aziende")
      .select("nome")
      .eq("id", aziendaId)
      .single();

    if (aziendaError || !azienda) {
      return new Response(JSON.stringify({ error: "Azienda not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate credentials
    const username = generateUsername(azienda.nome);
    const password = generatePassword();
    const internalEmail = `${username}@candidati.talentprofile.local`;
    const token_link = generateToken();

    // Create user with admin API (already confirmed)
    const { data: authData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cognome,
        ruolo: "candidato",
      },
    });

    if (createUserError || !authData.user) {
      console.error("Error creating user:", createUserError);
      return new Response(JSON.stringify({ error: createUserError?.message || "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = authData.user.id;

    try {
      // Update profile (created by trigger) with correct data
      const { error: profileUpdateError } = await supabaseAdmin
        .from("profiles")
        .update({
          ruolo: "candidato",
          azienda_id: aziendaId,
          nome,
          cognome,
          email: email || internalEmail,
        })
        .eq("user_id", newUserId);

      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        throw profileUpdateError;
      }

      // Create candidato record
      const { data: candidato, error: candidatoError } = await supabaseAdmin
        .from("candidati")
        .insert({
          nome,
          cognome,
          email: email || null,
          username,
          eta: eta ? parseInt(eta) : null,
          telefono: telefono || null,
          ruolo_attuale: ruolo_attuale || null,
          funzione: funzione || null,
          azienda_id: aziendaId,
          user_id: newUserId,
          test_link_token: token_link,
          test_completato: false,
        })
        .select()
        .single();

      if (candidatoError) {
        console.error("Error creating candidato:", candidatoError);
        throw candidatoError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          candidato,
          username,
          password,
          loginUrl: "/auth",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (dbError) {
      // Rollback: delete the user if DB operations fail
      console.error("Rolling back user creation due to DB error:", dbError);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(JSON.stringify({ error: "Failed to create candidate record" }), {
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
