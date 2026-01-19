import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Response patterns for each candidate profile
interface ResponsePattern {
  [scale: string]: { A: number; B: number; C: number };
}

const CANDIDATE_PROFILES = [
  {
    nome: "Marco",
    cognome: "Rossi",
    email: "marco.rossi@test.com",
    telefono: "3331112222",
    eta: 27,
    sesso: "M",
    ruolo_attuale: "Candidato",
    funzione: "Ufficio vendite",
    // Venditore Inadatto - scarso fit
    patterns: {
      SV: { A: 0.20, B: 0.30, C: 0.50 },
      MO: { A: 0.10, B: 0.20, C: 0.70 },
      CF: { A: 0.15, B: 0.25, C: 0.60 },
      EF: { A: 0.25, B: 0.35, C: 0.40 },
      EC: { A: 0.10, B: 0.30, C: 0.60 },
      QN: { A: 0.20, B: 0.30, C: 0.50 },
      QR: { A: 0.20, B: 0.30, C: 0.50 },
      SP: { A: 0.30, B: 0.40, C: 0.30 },
      PA: { A: 0.15, B: 0.35, C: 0.50 },
      SC: { A: 0.35, B: 0.40, C: 0.25 },
      ST: { A: 0.60, B: 0.30, C: 0.10 },
      LE: { A: 0.15, B: 0.25, C: 0.60 },
    } as ResponsePattern,
    expectedProfile: {
      profilo_tipo: "IN_TRANSIZIONE",
      leadership_pct: 28,
      maturita_pct: 25,
      potenziale_pct: 32,
    },
  },
  {
    nome: "Luca",
    cognome: "Bianchi",
    email: "luca.bianchi@test.com",
    telefono: "3332223333",
    eta: 34,
    sesso: "M",
    ruolo_attuale: "Candidato",
    funzione: "Ufficio vendite",
    // Venditore TOP - alto fit
    patterns: {
      SV: { A: 0.80, B: 0.15, C: 0.05 },
      MO: { A: 0.85, B: 0.12, C: 0.03 },
      CF: { A: 0.75, B: 0.20, C: 0.05 },
      EF: { A: 0.70, B: 0.25, C: 0.05 },
      EC: { A: 0.85, B: 0.12, C: 0.03 },
      QN: { A: 0.65, B: 0.30, C: 0.05 },
      QR: { A: 0.80, B: 0.15, C: 0.05 },
      SP: { A: 0.70, B: 0.25, C: 0.05 },
      PA: { A: 0.85, B: 0.12, C: 0.03 },
      SC: { A: 0.55, B: 0.35, C: 0.10 },
      ST: { A: 0.10, B: 0.25, C: 0.65 },
      LE: { A: 0.75, B: 0.20, C: 0.05 },
    } as ResponsePattern,
    expectedProfile: {
      profilo_tipo: "LEADER",
      leadership_pct: 72,
      maturita_pct: 68,
      potenziale_pct: 65,
    },
  },
  {
    nome: "Paolo",
    cognome: "Verdi",
    email: "paolo.verdi@test.com",
    telefono: "3333334444",
    eta: 41,
    sesso: "M",
    ruolo_attuale: "Candidato",
    funzione: "Amministrazione",
    // Amministrativo Analitico - fit medio
    patterns: {
      SV: { A: 0.45, B: 0.40, C: 0.15 },
      MO: { A: 0.40, B: 0.45, C: 0.15 },
      CF: { A: 0.35, B: 0.40, C: 0.25 },
      EF: { A: 0.55, B: 0.35, C: 0.10 },
      EC: { A: 0.50, B: 0.35, C: 0.15 },
      QN: { A: 0.30, B: 0.40, C: 0.30 },
      QR: { A: 0.45, B: 0.40, C: 0.15 },
      SP: { A: 0.40, B: 0.45, C: 0.15 },
      PA: { A: 0.30, B: 0.40, C: 0.30 },
      SC: { A: 0.85, B: 0.12, C: 0.03 },
      ST: { A: 0.40, B: 0.35, C: 0.25 },
      LE: { A: 0.30, B: 0.40, C: 0.30 },
    } as ResponsePattern,
    expectedProfile: {
      profilo_tipo: "STRATEGIST",
      leadership_pct: 42,
      maturita_pct: 38,
      potenziale_pct: 40,
    },
  },
  {
    nome: "Simone",
    cognome: "Neri",
    email: "simone.neri@test.com",
    telefono: "3334445555",
    eta: 30,
    sesso: "M",
    ruolo_attuale: "Candidato",
    funzione: "Produzione",
    // Jolly Operativo - buon fit trasversale
    patterns: {
      SV: { A: 0.60, B: 0.30, C: 0.10 },
      MO: { A: 0.55, B: 0.35, C: 0.10 },
      CF: { A: 0.60, B: 0.30, C: 0.10 },
      EF: { A: 0.65, B: 0.28, C: 0.07 },
      EC: { A: 0.62, B: 0.30, C: 0.08 },
      QN: { A: 0.60, B: 0.32, C: 0.08 },
      QR: { A: 0.55, B: 0.35, C: 0.10 },
      SP: { A: 0.58, B: 0.32, C: 0.10 },
      PA: { A: 0.50, B: 0.38, C: 0.12 },
      SC: { A: 0.50, B: 0.40, C: 0.10 },
      ST: { A: 0.20, B: 0.40, C: 0.40 },
      LE: { A: 0.40, B: 0.40, C: 0.20 },
    } as ResponsePattern,
    expectedProfile: {
      profilo_tipo: "EXECUTOR",
      leadership_pct: 55,
      maturita_pct: 52,
      potenziale_pct: 58,
    },
  },
];

// Questions organized by scale
interface QuestionsByScale {
  [scale: string]: Array<{ id: number; polarita: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify user is superadmin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorizzato" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Token non valido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is superadmin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("ruolo")
      .eq("user_id", userData.user.id)
      .single();

    if (!profile || profile.ruolo !== "superadmin") {
      return new Response(JSON.stringify({ error: "Solo i superadmin possono eseguire questa operazione" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find Teknofinestre company
    const { data: azienda, error: aziendaError } = await supabaseAdmin
      .from("aziende")
      .select("id")
      .ilike("nome", "%teknofinestre%")
      .single();

    if (aziendaError || !azienda) {
      return new Response(JSON.stringify({ error: "Azienda Teknofinestre non trovata" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all questions from database
    const { data: domande, error: domandeError } = await supabaseAdmin
      .from("domande")
      .select("id, scala_primaria, polarita")
      .order("id");

    if (domandeError || !domande) {
      return new Response(JSON.stringify({ error: "Errore nel recupero domande" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Organize questions by scale
    const questionsByScale: QuestionsByScale = {};
    for (const d of domande) {
      if (!questionsByScale[d.scala_primaria]) {
        questionsByScale[d.scala_primaria] = [];
      }
      questionsByScale[d.scala_primaria].push({ id: d.id, polarita: d.polarita });
    }

    const createdCandidates = [];

    for (const candidateProfile of CANDIDATE_PROFILES) {
      // Check if candidate already exists
      const { data: existing } = await supabaseAdmin
        .from("candidati")
        .select("id")
        .eq("email", candidateProfile.email)
        .maybeSingle();

      if (existing) {
        console.log(`Candidate ${candidateProfile.email} already exists, skipping`);
        continue;
      }

      // Create candidate
      const { data: candidato, error: candError } = await supabaseAdmin
        .from("candidati")
        .insert({
          nome: candidateProfile.nome,
          cognome: candidateProfile.cognome,
          email: candidateProfile.email,
          telefono: candidateProfile.telefono,
          eta: candidateProfile.eta,
          sesso: candidateProfile.sesso,
          ruolo_attuale: candidateProfile.ruolo_attuale,
          funzione: candidateProfile.funzione,
          azienda_id: azienda.id,
          test_completato: true,
          data_test: new Date().toISOString(),
        })
        .select()
        .single();

      if (candError) {
        console.error(`Error creating candidate ${candidateProfile.cognome}:`, candError);
        continue;
      }

      // Generate responses based on patterns
      const risposte = [];
      const scaleScores: Record<string, number> = {};

      for (const [scala, questions] of Object.entries(questionsByScale)) {
        const pattern = candidateProfile.patterns[scala] || { A: 0.33, B: 0.34, C: 0.33 };
        let score = 100;

        for (const question of questions) {
          // Determine response based on weighted probability
          const rand = Math.random();
          let valore: "A" | "B" | "C";
          
          if (rand < pattern.A) {
            valore = "A";
          } else if (rand < pattern.A + pattern.B) {
            valore = "B";
          } else {
            valore = "C";
          }

          risposte.push({
            candidato_id: candidato.id,
            domanda_id: question.id,
            valore,
          });

          // Calculate score contribution
          if (question.polarita === "+") {
            if (valore === "A") score += 10;
            else if (valore === "B") score += 5;
          } else {
            if (valore === "A") score -= 10;
            else if (valore === "B") score -= 5;
          }
        }

        // Normalize score
        scaleScores[scala] = Math.max(0, Math.min(200, score));
      }

      // Insert responses
      const { error: rispError } = await supabaseAdmin
        .from("risposte")
        .insert(risposte);

      if (rispError) {
        console.error(`Error inserting responses for ${candidateProfile.cognome}:`, rispError);
      }

      // Calculate profile indicators
      const leadership_pct = ((scaleScores["QR"] || 100) + (scaleScores["SP"] || 100) + (scaleScores["PA"] || 100)) / 6;
      const maturita_pct = ((scaleScores["SV"] || 100) + (scaleScores["MO"] || 100) + (scaleScores["CF"] || 100)) / 6;
      const potenziale_pct = ((scaleScores["QN"] || 100) + (scaleScores["EC"] || 100) + (scaleScores["EF"] || 100)) / 6;
      const schematicita = scaleScores["SC"] || 100;
      const stress_zone = (scaleScores["SV"] || 100) < 100 && (scaleScores["CF"] || 100) < 100;

      // Determine profile type
      let profilo_tipo = "EXECUTOR";
      if (stress_zone || ((scaleScores["SV"] || 100) < 100 && (scaleScores["CF"] || 100) < 100)) {
        profilo_tipo = "IN_TRANSIZIONE";
      } else if (
        leadership_pct > 35 &&
        Object.values(scaleScores).every(v => v >= 120) &&
        (scaleScores["QR"] || 0) >= 140 &&
        (scaleScores["PA"] || 0) >= 140
      ) {
        profilo_tipo = "LEADER";
      } else if (
        (scaleScores["SV"] || 0) > 140 &&
        (scaleScores["MO"] || 0) > 140 &&
        (scaleScores["SC"] || 0) > 130
      ) {
        profilo_tipo = "STRATEGIST";
      }

      // Calculate out_points and strength_points
      const SCALE_LABELS: Record<string, string> = {
        SV: "Stile di Vita",
        MO: "Motivazione",
        CF: "Capacità di Fronteggiare",
        EF: "Efficienza",
        EC: "Efficacia",
        QN: "Quantità Responsabilità",
        QR: "Qualità Responsabilità",
        SP: "Spazio Vitale",
        PA: "Partecipazione",
        SC: "Schematicità",
      };

      const out_points: string[] = [];
      const strength_points: string[] = [];
      
      for (const [scala, punteggio] of Object.entries(scaleScores)) {
        if (scala !== "SC" && scala !== "ST" && scala !== "LE") {
          if (punteggio < 80) {
            out_points.push(SCALE_LABELS[scala] || scala);
          }
          if (punteggio > 160) {
            strength_points.push(SCALE_LABELS[scala] || scala);
          }
        }
      }

      // Insert risultati
      const risultatiData = Object.entries(scaleScores).map(([scala, punteggio]) => ({
        candidato_id: candidato.id,
        scala,
        punteggio_normalizzato: punteggio,
        punteggio_grezzo: punteggio,
      }));

      const { error: risError } = await supabaseAdmin
        .from("risultati")
        .insert(risultatiData);

      if (risError) {
        console.error(`Error inserting results for ${candidateProfile.cognome}:`, risError);
      }

      // Insert profile
      const { error: profError } = await supabaseAdmin
        .from("profili_candidato")
        .insert({
          candidato_id: candidato.id,
          leadership_pct: Math.round(leadership_pct * 10) / 10,
          maturita_pct: Math.round(maturita_pct * 10) / 10,
          potenziale_pct: Math.round(potenziale_pct * 10) / 10,
          schematicita,
          stress_zone,
          profilo_tipo,
          out_points,
          strength_points,
          scale_punteggi: scaleScores,
        });

      if (profError) {
        console.error(`Error inserting profile for ${candidateProfile.cognome}:`, profError);
      }

      createdCandidates.push({
        nome: candidateProfile.nome,
        cognome: candidateProfile.cognome,
        profilo_tipo,
        leadership_pct: Math.round(leadership_pct * 10) / 10,
        maturita_pct: Math.round(maturita_pct * 10) / 10,
        potenziale_pct: Math.round(potenziale_pct * 10) / 10,
        stress_zone,
        out_points,
        strength_points,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${createdCandidates.length} candidati demo creati`,
        candidates: createdCandidates,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in seed-demo-candidates:", error);
    const errorMessage = error instanceof Error ? error.message : "Errore interno";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
