import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisInput {
  candidato_id: string;
}

interface ScalePunteggi {
  [key: string]: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidato_id } = await req.json() as AnalysisInput;

    if (!candidato_id) {
      return new Response(
        JSON.stringify({ error: 'candidato_id è richiesto' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY non configurata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Recupera dati candidato
    const { data: candidato, error: candError } = await supabase
      .from('candidati')
      .select('*, profili_candidato(*)')
      .eq('id', candidato_id)
      .single();

    if (candError || !candidato) {
      return new Response(
        JSON.stringify({ error: 'Candidato non trovato' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profilo = candidato.profili_candidato;
    if (!profilo || !profilo.scale_punteggi) {
      return new Response(
        JSON.stringify({ error: 'Profilo candidato non disponibile. Il test deve essere completato.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const scalePunteggi: ScalePunteggi = profilo.scale_punteggi;
    const eta = candidato.eta;
    const ruolo = candidato.ruolo_attuale;
    const funzione = candidato.funzione;
    const nome = `${candidato.nome} ${candidato.cognome}`;
    const sesso = candidato.sesso;

    // Costruisci il prompt per l'AI
    const systemPrompt = `Sei un Senior HR Expert specializzato in psicologia del lavoro e assessment professionale.
Analizza i dati del candidato e genera una valutazione strutturata per supportare le decisioni di assunzione.

Il tuo output DEVE essere in formato JSON valido con la seguente struttura esatta:
{
  "profilo_sintetico": "Descrizione generale del candidato in 2-3 frasi",
  "punti_forza": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "punti_debolezza": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "rischi_operativi": "Analisi dettagliata dei rischi per l'azienda se questo candidato viene assunto. Include scenari concreti.",
  "fit_score": numero da 0 a 100,
  "fit_verdict": "NON_IDONEO" o "VALUTARE" o "IDONEO",
  "fit_motivo": "Spiegazione sintetica del verdetto",
  "raccomandazione": {
    "decisione": "ASSUMERE" o "VALUTARE" o "SCARTARE",
    "motivo_principale": "Il motivo principale della decisione",
    "rischio_aziendale": "Il rischio principale per l'azienda",
    "tempo_onboarding": "es: 2-4 settimane",
    "probabilita_successo_12m": numero da 0 a 100
  }
}

Criteri per il verdetto:
- 0-39: NON_IDONEO - Profilo non compatibile con il ruolo
- 40-64: VALUTARE - Necessita approfondimento in colloquio
- 65-100: IDONEO - Buona compatibilità con il ruolo

Considera questi fattori con particolare attenzione:
1. Se età > 55 e ruolo vendite e alta schematicità (SC > 150): penalizza fortemente - resistenza al cambiamento
2. Se stress_zone attivo: evidenzia il rischio di burnout
3. Se out_points numerosi: sottolinea le aree critiche
4. Se in funzione amministrativa con alta schematicità: può essere positivo per compliance ma rischio su eccezioni`;

    const userPrompt = `Analizza questo candidato:

DATI ANAGRAFICI:
- Nome: ${nome}
- Età: ${eta || 'Non specificata'}
- Sesso: ${sesso || 'Non specificato'}
- Ruolo attuale: ${ruolo || 'Non specificato'}
- Funzione aziendale: ${funzione || 'Non specificata'}

PUNTEGGI SCALE (0-200, 100 = media):
- Stile di Vita (SV): ${scalePunteggi['SV'] || 100}
- Motivazione (MO): ${scalePunteggi['MO'] || 100}
- Capacità di Fronteggiare (CF): ${scalePunteggi['CF'] || 100}
- Efficienza (EF): ${scalePunteggi['EF'] || 100}
- Efficacia (EC): ${scalePunteggi['EC'] || 100}
- Quantità Responsabilità (QN): ${scalePunteggi['QN'] || 100}
- Qualità Responsabilità (QR): ${scalePunteggi['QR'] || 100}
- Spazio Vitale (SP): ${scalePunteggi['SP'] || 100}
- Partecipazione (PA): ${scalePunteggi['PA'] || 100}
- Schematicità (SC): ${scalePunteggi['SC'] || 100}

INDICATORI CALCOLATI:
- Leadership %: ${profilo.leadership_pct?.toFixed(1) || 'N/A'}
- Maturità %: ${profilo.maturita_pct?.toFixed(1) || 'N/A'}
- Potenziale %: ${profilo.potenziale_pct?.toFixed(1) || 'N/A'}
- Zona Stress: ${profilo.stress_zone ? 'ATTIVA' : 'No'}
- Profilo Tipo: ${profilo.profilo_tipo || 'N/A'}
- Out Points: ${profilo.out_points?.join(', ') || 'Nessuno'}
- Strength Points: ${profilo.strength_points?.join(', ') || 'Nessuno'}

Genera l'analisi JSON completa.`;

    // Chiama Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit superato. Riprova tra qualche secondo.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crediti AI esauriti. Contatta il supporto.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Errore nella generazione dell\'analisi AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Risposta AI vuota' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON dalla risposta
    let analisi;
    try {
      // Rimuovi eventuali backticks markdown
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analisi = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, content);
      return new Response(
        JSON.stringify({ error: 'Errore nel parsing della risposta AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salva nel database
    const { data: savedAnalisi, error: saveError } = await supabase
      .from('analisi_candidato')
      .upsert({
        candidato_id,
        profilo_sintetico: analisi.profilo_sintetico,
        punti_forza: analisi.punti_forza,
        punti_debolezza: analisi.punti_debolezza,
        rischi_operativi: analisi.rischi_operativi,
        fit_score: analisi.fit_score,
        fit_verdict: analisi.fit_verdict,
        fit_motivo: analisi.fit_motivo,
        raccomandazione: analisi.raccomandazione,
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'candidato_id',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      // Restituisci comunque l'analisi anche se il salvataggio fallisce
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analisi: savedAnalisi || analisi,
        message: 'Analisi generata con successo'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Analyze candidate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
