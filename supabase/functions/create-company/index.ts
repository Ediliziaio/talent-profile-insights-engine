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

async function sendWelcomeEmail(
  nome: string,
  email: string,
  password: string,
  emailContatto: string
): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TalentProfile <onboarding@resend.dev>",
        to: [emailContatto],
        subject: `Benvenuto su TalentProfile - Credenziali Accesso ${nome}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://talent-profile-insights-engine.lovable.app/talentprofile_logo_v3.png" 
                   alt="TalentProfile" style="max-width: 180px;" />
            </div>
            
            <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 20px;">
              Benvenuto su TalentProfile!
            </h1>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Gentile <strong>${nome}</strong>,
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Il tuo account aziendale è stato creato con successo. 
              Ecco le tue credenziali di accesso:
            </p>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
                        padding: 24px; border-radius: 12px; margin: 24px 0; 
                        border-left: 4px solid #6366f1;">
              <p style="margin: 8px 0; font-size: 15px;">
                <strong style="color: #555;">Email:</strong> 
                <span style="color: #1a1a2e; font-family: monospace;">${email}</span>
              </p>
              <p style="margin: 8px 0; font-size: 15px;">
                <strong style="color: #555;">Password:</strong> 
                <span style="color: #1a1a2e; font-family: monospace;">${password}</span>
              </p>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://talent-profile-insights-engine.lovable.app" 
                 style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                        color: white; padding: 14px 32px; text-decoration: none; 
                        border-radius: 8px; font-weight: 600; font-size: 16px;
                        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                Accedi a TalentProfile
              </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #666; font-size: 13px; line-height: 1.6;">
                <strong>⚠️ Importante:</strong> Ti consigliamo di cambiare la password al primo accesso.
              </p>
              <p style="color: #888; font-size: 12px; margin-top: 16px;">
                Per assistenza: support@talentprofile.it<br/>
                © ${new Date().getFullYear()} TalentProfile - Tutti i diritti riservati
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (response.ok) {
      console.log("Welcome email sent successfully to:", emailContatto);
    } else {
      const errorData = await response.text();
      console.error("Failed to send email:", errorData);
    }
  } catch (emailError) {
    console.error("Error sending welcome email:", emailError);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    if (callerProfile.ruolo !== "superadmin") {
      return new Response(JSON.stringify({ error: "Not authorized to create companies" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { nome, settore, email_contatto, telefono, indirizzo, attiva } = body;

    if (!nome) {
      return new Response(JSON.stringify({ error: "Nome azienda è obbligatorio" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const password = generatePassword();
    const email = email_contatto || `azienda_${azienda.id}@talentprofile.local`;

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
      console.error("Error creating user:", createUserError);
      await supabaseAdmin.from("aziende").delete().eq("id", azienda.id);
      return new Response(JSON.stringify({ error: createUserError?.message || "Failed to create user" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newUserId = authData.user.id;

    try {
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

      // Send welcome email (non-blocking)
      if (email_contatto) {
        sendWelcomeEmail(nome, email, password, email_contatto);
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
