/**
 * Crea un secondo accesso per la stessa azienda.
 *
 * Finora un'impresa aveva un login solo, che si passavano di mano: con la
 * fase della selezione appena introdotta, "chi ha scartato questo
 * candidato?" non aveva risposta.
 *
 * L'azienda del nuovo utente NON arriva mai dal body: si legge dal profilo
 * di chi chiama. Altrimenti chiunque potrebbe creare un utente dentro
 * l'azienda di qualcun altro.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function generatePassword(): string {
  // Niente 0/O/1/l/I: queste password si dettano a voce o si copiano a mano.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non autenticato" }, 401);

    const {
      data: { user: caller },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !caller) return json({ error: "Sessione non valida" }, 401);

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("ruolo, azienda_id")
      .eq("user_id", caller.id)
      .single();

    if (!callerProfile) return json({ error: "Profilo non trovato" }, 403);
    if (callerProfile.ruolo !== "azienda" && callerProfile.ruolo !== "superadmin") {
      return json({ error: "Non hai i permessi per aggiungere accessi" }, 403);
    }
    if (!callerProfile.azienda_id) {
      return json({ error: "Il tuo profilo non è collegato a un'azienda" }, 400);
    }

    const body = await req.json().catch(() => ({}));
    const nome = String(body.nome ?? "").trim();
    const cognome = String(body.cognome ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email.includes("@")) return json({ error: "Email non valida" }, 400);

    // Un'email già registrata qui darebbe un errore generico di Supabase:
    // meglio dire cosa è successo davvero.
    const { data: esistente } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (esistente) {
      return json({ error: "Questa email ha già un accesso" }, 409);
    }

    const password = generatePassword();
    const { data: creato, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome, cognome },
    });

    if (createError || !creato.user) {
      return json({ error: createError?.message ?? "Creazione non riuscita" }, 400);
    }

    // Il profilo lo crea un trigger: qui si completa con ruolo e azienda,
    // presi dal chiamante e non dal body.
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        ruolo: "azienda",
        azienda_id: callerProfile.azienda_id,
        nome: nome || null,
        cognome: cognome || null,
        email,
      })
      .eq("user_id", creato.user.id);

    if (profileError) {
      // Senza rollback resterebbe un utente che può autenticarsi ma non
      // appartiene a nessuna azienda: peggio di non averlo creato.
      await supabaseAdmin.auth.admin.deleteUser(creato.user.id);
      return json({ error: "Accesso non collegato all'azienda, annullato" }, 500);
    }

    return json({ email, password });
  } catch (error) {
    console.error("create-team-user:", error);
    return json({ error: "Errore imprevisto" }, 500);
  }
});
