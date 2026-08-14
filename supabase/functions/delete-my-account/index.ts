/**
 * Cancellazione del profilo da parte del candidato.
 *
 * Prima l'area candidato diceva "per cancellare scrivi a privacy@...": un
 * diritto GDPR lavorato a mano, con tempi che dipendono da chi legge la
 * casella. Qui il candidato lo esercita da solo.
 *
 * Vale solo per chi ha ruolo `candidato` e solo sul proprio account:
 * l'id non arriva mai dal body, si legge dal token.
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
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) return json({ error: "Sessione non valida" }, 401);

    const { data: profilo } = await supabaseAdmin
      .from("profiles")
      .select("ruolo")
      .eq("user_id", user.id)
      .single();

    // Un'azienda che cancella sé stessa porterebbe via i candidati di tutti:
    // quella cancellazione passa da noi.
    if (profilo?.ruolo !== "candidato") {
      return json({ error: "Solo i candidati possono cancellarsi da qui" }, 403);
    }

    const { data: candidati } = await supabaseAdmin
      .from("candidati")
      .select("id")
      .eq("user_id", user.id);

    const ids = (candidati ?? []).map((c) => c.id);

    if (ids.length) {
      // Ordine dal basso: le tabelle figlie prima, altrimenti le foreign key
      // rifiutano la cancellazione del candidato.
      for (const tabella of [
        "risposte",
        "analisi_candidato",
        "profili_candidato",
        "marketplace_sblocchi",
      ]) {
        const { error } = await supabaseAdmin.from(tabella).delete().in("candidato_id", ids);
        // Tabella non ancora creata (migration non applicata): non è un motivo
        // per bloccare la cancellazione del resto.
        if (error && !/does not exist|schema cache/i.test(error.message)) {
          console.error(`delete-my-account: ${tabella}`, error);
          return json({ error: "Cancellazione non completata" }, 500);
        }
      }

      const { error: errCand } = await supabaseAdmin.from("candidati").delete().in("id", ids);
      if (errCand) {
        console.error("delete-my-account: candidati", errCand);
        return json({ error: "Cancellazione non completata" }, 500);
      }
    }

    await supabaseAdmin.from("profiles").delete().eq("user_id", user.id);

    // L'utente auth per ultimo: se fallisse prima, resterebbero righe orfane
    // senza più nessuno che possa chiederne la cancellazione.
    const { error: errUser } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (errUser) {
      console.error("delete-my-account: auth", errUser);
      return json({ error: "Account non eliminato del tutto, ti ricontattiamo" }, 500);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("delete-my-account:", error);
    return json({ error: "Errore imprevisto" }, 500);
  }
});
