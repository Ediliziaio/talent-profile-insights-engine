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

type StressZoneSeverity = 'nessuna' | 'lieve' | 'moderata' | 'severa' | 'critica';

function calculateStressZoneSeverity(sv: number, cf: number): StressZoneSeverity {
  if (sv >= 100 || cf >= 100) return 'nessuna';
  const minValue = Math.min(sv, cf);
  if (minValue < 40) return 'critica';
  if (minValue < 60) return 'severa';
  if (minValue < 80) return 'moderata';
  return 'lieve';
}

function getStressZoneSeverityDescription(severity: StressZoneSeverity): string {
  switch (severity) {
    case 'critica': return 'CRITICA - Situazione di crisi grave con risorse personali quasi nulle';
    case 'severa': return 'SEVERA - Significativa difficoltà con risorse limitate';
    case 'moderata': return 'MODERATA - Difficoltà moderata con risorse parziali';
    case 'lieve': return 'LIEVE - Difficoltà minore con risorse adeguate';
    default: return 'Nessuna stress zone rilevata';
  }
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

    // Calcola la severità della stress zone (Manuale V3)
    const sv = scalePunteggi['SV'] || 100;
    const cf = scalePunteggi['CF'] || 100;
    const stressZoneSeverity = calculateStressZoneSeverity(sv, cf);
    const stressZoneDescription = getStressZoneSeverityDescription(stressZoneSeverity);

    // Identifica pattern combinati critici
    const patterns: string[] = [];
    const ec = scalePunteggi['EC'] || 100;
    const ef = scalePunteggi['EF'] || 100;
    const qn = scalePunteggi['QN'] || 100;
    const qr = scalePunteggi['QR'] || 100;
    const sc = scalePunteggi['SC'] || 100;
    const pa = scalePunteggi['PA'] || 100;
    const mo = scalePunteggi['MO'] || 100;

    if (ec - ef > 40) patterns.push('VISIONARIO DISORGANIZZATO FORTE: Gap EC-EF >40 punti');
    else if (ec - ef > 20) patterns.push('Visionario Disorganizzato: Gap EC-EF 20-40 punti');
    if (ef - ec > 40) patterns.push('ESECUTORE SENZA VISIONE: Gap EF-EC >40 punti');
    if (qn > 130 && qr < 80) patterns.push('CARICATO IRRESPONSABILE: QN alto + QR basso');
    if (qn < 70 && qr < 70) patterns.push('SCARICATORE DI RESPONSABILITÀ: QN e QR entrambi bassi');
    if (qn > 160 && qr > 160 && sv < 90) patterns.push('SUPER-RESPONSABILE A RISCHIO: QN+QR altissimi + SV basso');
    if (sc > 170 && cf < 80) patterns.push('RIGIDITÀ FRAGILE: SC molto alta + CF basso');
    if (sv < 70 && ef > 150 && ec > 150) patterns.push('WORKAHOLIC A RISCHIO: Alta produttività + SV basso');
    if (sv < 80 && mo > 140) patterns.push('Combattente sotto Pressione: SV basso + MO alto');
    if (qr > 150 && pa < 80) patterns.push('Leader Isolato: QR alto + PA basso');

    // Costruisci il prompt per l'AI (ARRICCHITO Manuale V3)
    const systemPrompt = `Sei un Senior HR Expert specializzato in psicologia del lavoro e assessment professionale, con expertise nel Manuale Talent Profiler V3.

ANALIZZA i dati del candidato e genera una valutazione ESAUSTIVA e DETTAGLIATA per supportare le decisioni di assunzione.

## STRESS ZONE - MANUALE V3
La Stress Zone ha 4 livelli di severità basati su SV (Stile di Vita) e CF (Capacità di Fronteggiare):
- CRITICA (almeno uno <40): Crisi grave, risorse quasi nulle. ASSUNZIONE FORTEMENTE SCONSIGLIATA.
- SEVERA (almeno uno 40-59): Difficoltà significativa. Colloquio approfondito OBBLIGATORIO.
- MODERATA (almeno uno 60-79): Difficoltà moderata. Inserimento graduale richiesto.
- LIEVE (entrambi 80-99): Difficoltà minore. Monitorare senza allarmarsi.

## PATTERN CRITICI DA IDENTIFICARE
- Gap Efficacia-Efficienza (EC vs EF): Visionario Disorganizzato (EC >> EF) o Esecutore Cieco (EF >> EC)
- Pattern Responsabilità (QN vs QR): Caricato Irresponsabile (QN alto, QR basso) o Scaricatore (entrambi bassi)
- Pattern Workaholic: Alta produttività (EF+EC) + bassa sfera personale (SV)
- Rigidità Fragile: Alta schematicità (SC) + bassa resilienza (CF)
- Leader Isolato: Alta responsabilità (QR) + bassa partecipazione (PA)

## OUTPUT RICHIESTO (JSON)
{
  "profilo_sintetico": "Descrizione DETTAGLIATA del candidato in 4-6 frasi. Includi tratti dominanti, stile lavorativo, punti caratterizzanti.",
  "punti_forza": ["5 punti di forza SPECIFICI con spiegazione concreta di come si manifestano"],
  "punti_debolezza": ["5 punti di debolezza SPECIFICI con impatto concreto sul lavoro"],
  "rischi_operativi": "Analisi APPROFONDITA dei rischi per l'azienda. Scenari concreti, costi potenziali, situazioni da evitare. Almeno 100 parole.",
  "fit_score": numero 0-100,
  "fit_verdict": "NON_IDONEO" | "VALUTARE" | "IDONEO",
  "fit_motivo": "Spiegazione DETTAGLIATA del verdetto in 2-3 frasi",
  "stress_zone_severity": "${stressZoneSeverity}",
  "stress_zone_analisi": "Analisi SPECIFICA della situazione stress del candidato e implicazioni per l'inserimento",
  "domande_colloquio": [
    { "area": "Nome area critica (es. Stress, Responsabilità, Flessibilità)", "domanda": "Domanda SPECIFICA e penetrante per il colloquio" },
    // Genera 4-6 domande mirate alle aree critiche del candidato
  ],
  "raccomandazione": {
    "decisione": "ASSUMERE" | "VALUTARE" | "SCARTARE",
    "motivo_principale": "Il motivo principale della decisione in 1-2 frasi",
    "rischio_aziendale": "Il rischio principale per l'azienda se si assume",
    "tempo_onboarding": "es: 2-4 settimane standard / 4-8 settimane esteso / 8-12 settimane con supervisione intensiva",
    "probabilita_successo_12m": numero 0-100
  }
}

## CRITERI VERDETTO
- 0-39: NON_IDONEO - Profilo incompatibile o rischi troppo elevati
- 40-64: VALUTARE - Necessita approfondimento in colloquio, potenziale con riserve
- 65-100: IDONEO - Buona compatibilità, rischi gestibili

## FATTORI PENALIZZANTI
1. Stress Zone Critica o Severa: -20/-30 punti
2. Età >55 + ruolo vendite + SC >150: -15 punti (resistenza al cambiamento in ruolo dinamico)
3. >2 scale sotto 70: -10 punti (aree critiche multiple)
4. Pattern Workaholic + Stress Zone: -15 punti (burnout imminente)
5. Caricato Irresponsabile: -10 punti (affidabilità compromessa)

## FATTORI VALORIZZANTI
1. Nessuna Stress Zone + strength points: +10 punti
2. Profilo bilanciato (tutte le scale 90-160): +10 punti
3. Alta leadership naturale (QR+PA+SP alti): +10 punti
4. Funzione amministrativa + alta schematicità: +5 punti (compliance)`;

    const userPrompt = `ANALIZZA questo candidato secondo il Manuale V3:

## DATI ANAGRAFICI
- Nome: ${nome}
- Età: ${eta || 'Non specificata'}
- Sesso: ${sesso || 'Non specificato'}
- Ruolo attuale: ${ruolo || 'Non specificato'}
- Funzione aziendale: ${funzione || 'Non specificata'}

## PUNTEGGI SCALE (0-200, 100 = media popolazione)
| Scala | Punteggio | Interpretazione |
|-------|-----------|-----------------|
| Stile di Vita (SV) | ${sv} | ${sv < 60 ? 'CRITICO' : sv < 80 ? 'Sotto media' : sv < 120 ? 'Nella norma' : sv < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Motivazione (MO) | ${mo} | ${mo < 60 ? 'CRITICO' : mo < 80 ? 'Sotto media' : mo < 120 ? 'Nella norma' : mo < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Capacità di Fronteggiare (CF) | ${cf} | ${cf < 60 ? 'CRITICO' : cf < 80 ? 'Sotto media' : cf < 120 ? 'Nella norma' : cf < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Efficienza (EF) | ${ef} | ${ef < 60 ? 'CRITICO' : ef < 80 ? 'Sotto media' : ef < 120 ? 'Nella norma' : ef < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Efficacia (EC) | ${ec} | ${ec < 60 ? 'CRITICO' : ec < 80 ? 'Sotto media' : ec < 120 ? 'Nella norma' : ec < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Quantità Responsabilità (QN) | ${qn} | ${qn < 60 ? 'CRITICO' : qn < 80 ? 'Sotto media' : qn < 120 ? 'Nella norma' : qn < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Qualità Responsabilità (QR) | ${qr} | ${qr < 60 ? 'CRITICO' : qr < 80 ? 'Sotto media' : qr < 120 ? 'Nella norma' : qr < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Spazio Vitale (SP) | ${scalePunteggi['SP'] || 100} | ${(scalePunteggi['SP'] || 100) < 60 ? 'CRITICO' : (scalePunteggi['SP'] || 100) < 80 ? 'Sotto media' : (scalePunteggi['SP'] || 100) < 120 ? 'Nella norma' : (scalePunteggi['SP'] || 100) < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Partecipazione (PA) | ${pa} | ${pa < 60 ? 'CRITICO' : pa < 80 ? 'Sotto media' : pa < 120 ? 'Nella norma' : pa < 160 ? 'Sopra media' : 'ECCELLENZA'} |
| Schematicità (SC) | ${sc} | ${sc < 80 ? 'Molto flessibile' : sc < 100 ? 'Flessibile' : sc < 140 ? 'Equilibrato' : sc < 160 ? 'Rigido' : 'MOLTO RIGIDO'} |

## INDICATORI CALCOLATI
- Impatto Organizzativo (Leadership) %: ${profilo.leadership_pct?.toFixed(1) || 'N/A'}
- Solidità Personale (Maturità) %: ${profilo.maturita_pct?.toFixed(1) || 'N/A'}
- Capacità Produttiva (Potenziale) %: ${profilo.potenziale_pct?.toFixed(1) || 'N/A'}
- Flessibilità al Cambiamento: ${200 - sc}/200

## STRESS ZONE
- Stato: ${stressZoneSeverity.toUpperCase()}
- Descrizione: ${stressZoneDescription}

## PATTERN IDENTIFICATI
${patterns.length > 0 ? patterns.map(p => `- ${p}`).join('\n') : '- Nessun pattern critico identificato'}

## DATI AGGIUNTIVI
- Profilo Tipo: ${profilo.profilo_tipo || 'N/A'}
- Out Points: ${profilo.out_points?.join(', ') || 'Nessuno'}
- Strength Points: ${profilo.strength_points?.join(', ') || 'Nessuno'}

Genera l'analisi JSON completa secondo il Manuale V3.`;

    // Chiama Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
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
        raccomandazione: {
          ...analisi.raccomandazione,
          stress_zone_severity: stressZoneSeverity,
          stress_zone_analisi: analisi.stress_zone_analisi,
          domande_colloquio: analisi.domande_colloquio
        },
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
        message: 'Analisi generata con successo secondo il Manuale V3'
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
