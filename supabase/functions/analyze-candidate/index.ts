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

// ============ REQUISITI RUOLI V5 ============
const ROLE_REQUIREMENTS: Record<string, { requisiti: { scala: string; soglia: number; tipo: string; label: string }[]; attenzioni: { scala: string; soglia: number; tipo: string; label: string }[] }> = {
  'Ufficio vendite': {
    requisiti: [
      { scala: 'SP', soglia: 130, tipo: 'min', label: 'Ambizione (SP > 130)' },
      { scala: 'PA', soglia: 145, tipo: 'min', label: 'Partecipazione (PA > 145)' },
      { scala: 'MO', soglia: 140, tipo: 'min', label: 'Motivazione (MO > 140)' },
      { scala: 'CF', soglia: 130, tipo: 'min', label: 'Capacità Fronteggiare (CF > 130)' },
      { scala: 'EC', soglia: 150, tipo: 'min', label: 'Efficacia (EC > 150)' },
    ],
    attenzioni: [
      { scala: 'SC', soglia: 165, tipo: 'max', label: 'Schematicità (SC < 165)' },
    ],
  },
  'Amministrazione': {
    requisiti: [
      { scala: 'EF', soglia: 145, tipo: 'min', label: 'Efficienza (EF > 145)' },
      { scala: 'QR', soglia: 125, tipo: 'min', label: 'Qualità Responsabilità (QR > 125)' },
    ],
    attenzioni: [],
  },
  'Direzione generale': {
    requisiti: [
      { scala: 'QR', soglia: 160, tipo: 'min', label: 'Qualità Responsabilità (QR > 160)' },
      { scala: 'CF', soglia: 150, tipo: 'min', label: 'Capacità Fronteggiare (CF > 150)' },
      { scala: 'SP', soglia: 140, tipo: 'min', label: 'Ambizione (SP > 140)' },
      { scala: 'PA', soglia: 140, tipo: 'min', label: 'Partecipazione (PA > 140)' },
      { scala: 'EC', soglia: 150, tipo: 'min', label: 'Efficacia (EC > 150)' },
    ],
    attenzioni: [
      { scala: 'SC', soglia: 160, tipo: 'max', label: 'Schematicità (SC < 160)' },
    ],
  },
  'Ufficio risorse umane': {
    requisiti: [
      { scala: 'PA', soglia: 140, tipo: 'min', label: 'Partecipazione (PA > 140)' },
      { scala: 'CF', soglia: 130, tipo: 'min', label: 'Capacità Fronteggiare (CF > 130)' },
      { scala: 'SV', soglia: 110, tipo: 'min', label: 'Stile di Vita (SV > 110)' },
    ],
    attenzioni: [],
  },
  'Ufficio marketing': {
    requisiti: [
      { scala: 'SP', soglia: 130, tipo: 'min', label: 'Ambizione (SP > 130)' },
      { scala: 'PA', soglia: 130, tipo: 'min', label: 'Partecipazione (PA > 130)' },
      { scala: 'EC', soglia: 130, tipo: 'min', label: 'Efficacia (EC > 130)' },
    ],
    attenzioni: [
      { scala: 'SC', soglia: 160, tipo: 'max', label: 'Schematicità (SC < 160)' },
    ],
  },
  'Ufficio tecnico': {
    requisiti: [
      { scala: 'EC', soglia: 145, tipo: 'min', label: 'Efficacia (EC > 145)' },
      { scala: 'EF', soglia: 130, tipo: 'min', label: 'Efficienza (EF > 130)' },
    ],
    attenzioni: [],
  },
  'Ufficio acquisti': {
    requisiti: [
      { scala: 'EC', soglia: 140, tipo: 'min', label: 'Efficacia (EC > 140)' },
      { scala: 'QR', soglia: 130, tipo: 'min', label: 'Qualità Responsabilità (QR > 130)' },
      { scala: 'EF', soglia: 130, tipo: 'min', label: 'Efficienza (EF > 130)' },
    ],
    attenzioni: [],
  },
  'Produzione': {
    requisiti: [
      { scala: 'EF', soglia: 130, tipo: 'min', label: 'Efficienza (EF > 130)' },
      { scala: 'SC', soglia: 100, tipo: 'min', label: 'Schematicità (SC > 100)' },
      { scala: 'EC', soglia: 110, tipo: 'min', label: 'Efficacia (EC > 110)' },
    ],
    attenzioni: [],
  },
  'Logistica': {
    requisiti: [
      { scala: 'EF', soglia: 140, tipo: 'min', label: 'Efficienza (EF > 140)' },
      { scala: 'EC', soglia: 130, tipo: 'min', label: 'Efficacia (EC > 130)' },
      { scala: 'CF', soglia: 110, tipo: 'min', label: 'Capacità Fronteggiare (CF > 110)' },
    ],
    attenzioni: [],
  },
};

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

// Calcolo matching per ruolo V5
function calculateRoleMatch(ruolo: string, scalePunteggi: ScalePunteggi): { 
  criticalita: number; 
  attenzioni: number; 
  requisiti: { label: string; valore: number; soglia: number; ok: boolean }[];
  requisitiMancanti: { label: string; valore: number; soglia: number }[];
  areeAttenzione: { label: string; valore: number; soglia: number }[];
} {
  const config = ROLE_REQUIREMENTS[ruolo];
  if (!config) {
    return { criticalita: 0, attenzioni: 0, requisiti: [], requisitiMancanti: [], areeAttenzione: [] };
  }

  const requisiti: { label: string; valore: number; soglia: number; ok: boolean }[] = [];
  const requisitiMancanti: { label: string; valore: number; soglia: number }[] = [];
  const areeAttenzione: { label: string; valore: number; soglia: number }[] = [];

  for (const req of config.requisiti) {
    const valore = scalePunteggi[req.scala] ?? 100;
    const ok = req.tipo === 'min' ? valore >= req.soglia : valore <= req.soglia;
    requisiti.push({ label: req.label, valore, soglia: req.soglia, ok });
    if (!ok) {
      requisitiMancanti.push({ label: req.label, valore, soglia: req.soglia });
    }
  }

  for (const att of config.attenzioni) {
    const valore = scalePunteggi[att.scala] ?? 100;
    const ok = att.tipo === 'min' ? valore >= att.soglia : valore <= att.soglia;
    if (!ok) {
      areeAttenzione.push({ label: att.label, valore, soglia: att.soglia });
    }
  }

  return {
    criticalita: requisitiMancanti.length,
    attenzioni: areeAttenzione.length,
    requisiti,
    requisitiMancanti,
    areeAttenzione,
  };
}

// Calcola verdetto V5 (4 livelli)
function calculateVerdict(criticalita: number, attenzioni: number): 'NON_IDONEO' | 'DA_VALUTARE' | 'IDONEO_CON_RISERVA' | 'IDONEO' {
  if (criticalita >= 2) return 'NON_IDONEO';
  if (criticalita === 1) return 'DA_VALUTARE';
  if (attenzioni > 0) return 'IDONEO_CON_RISERVA';
  return 'IDONEO';
}

// Calcola compatibilità per tutti i ruoli
function calculateAllRolesCompatibility(scalePunteggi: ScalePunteggi): { ruolo: string; compatibilita: number; verdict: string }[] {
  const results: { ruolo: string; compatibilita: number; verdict: string }[] = [];

  for (const ruolo of Object.keys(ROLE_REQUIREMENTS)) {
    const match = calculateRoleMatch(ruolo, scalePunteggi);
    const totalReqs = ROLE_REQUIREMENTS[ruolo].requisiti.length;
    const satisfiedReqs = totalReqs - match.criticalita;
    const basePct = totalReqs > 0 ? (satisfiedReqs / totalReqs) * 100 : 100;
    const attenzioniPenalty = match.attenzioni * 5;
    const compatibilita = Math.max(0, Math.min(100, Math.round(basePct - attenzioniPenalty)));
    const verdict = calculateVerdict(match.criticalita, match.attenzioni);
    
    results.push({ ruolo, compatibilita, verdict });
  }

  return results.sort((a, b) => b.compatibilita - a.compatibilita);
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
    const funzione = candidato.funzione || 'Non specificata';
    const nome = `${candidato.nome} ${candidato.cognome}`;
    const sesso = candidato.sesso;

    // Estrai tutti i punteggi
    const sv = scalePunteggi['SV'] || 100;
    const cf = scalePunteggi['CF'] || 100;
    const mo = scalePunteggi['MO'] || 100;
    const sp = scalePunteggi['SP'] || 100;
    const ef = scalePunteggi['EF'] || 100;
    const ec = scalePunteggi['EC'] || 100;
    const qn = scalePunteggi['QN'] || 100;
    const qr = scalePunteggi['QR'] || 100;
    const sc = scalePunteggi['SC'] || 100;
    const pa = scalePunteggi['PA'] || 100;

    // Calcola matching V5
    const roleMatch = calculateRoleMatch(funzione, scalePunteggi);
    const allRolesMatch = calculateAllRolesCompatibility(scalePunteggi);
    const verdict = calculateVerdict(roleMatch.criticalita, roleMatch.attenzioni);
    const ruoloIdeale = allRolesMatch[0];

    // Calcola la severità della stress zone
    const stressZoneSeverity = calculateStressZoneSeverity(sv, cf);
    const stressZoneDescription = getStressZoneSeverityDescription(stressZoneSeverity);

    // Identifica pattern V5
    const patterns: string[] = [];
    
    // PATTERN CHIAVE V5: Motore che gira a vuoto
    if (mo > 140 && sp < 100) {
      patterns.push(`🔴 MOTORE A VUOTO: Alta Motivazione (MO ${mo}) + Bassa Ambizione (SP ${sp}). Sembra motivato ma non ha obiettivi concreti. PERICOLOSO per vendita.`);
    }
    
    if (sv < 60 && cf < 60) {
      patterns.push(`🔴 STRESS ZONE CRITICA: SV ${sv} + CF ${cf}. Crisi grave.`);
    } else if (sv < 80 && cf < 80) {
      patterns.push(`🟠 STRESS ZONE ATTIVA: SV ${sv} + CF ${cf}. Inserimento graduale.`);
    }
    
    if (ec - ef > 40) patterns.push(`🟠 VISIONARIO DISORGANIZZATO: Gap EC-EF di ${ec - ef} punti.`);
    if (sc > 170 && cf < 90) patterns.push(`🔴 RIGIDITÀ FRAGILE: SC ${sc} + CF ${cf}.`);
    if (qn > 140 && qr < 80) patterns.push(`🔴 CARICATO IRRESPONSABILE: QN ${qn} + QR ${qr}.`);
    if ((ef + ec) / 2 > 150 && sv < 80) patterns.push(`🟠 WORKAHOLIC A RISCHIO: Produttività alta ma SV ${sv}.`);
    if (qr > 150 && pa < 90) patterns.push(`🟠 LEADER ISOLATO: QR ${qr} + PA ${pa}.`);

    // Costruisci requisiti per il prompt
    const requisitiText = roleMatch.requisiti.map(r => 
      `- ${r.label}: Valore ${r.valore} → ${r.ok ? '✅ OK' : '❌ CRITICITÀ'}`
    ).join('\n');

    const requisitiMancantiText = roleMatch.requisitiMancanti.length > 0 
      ? roleMatch.requisitiMancanti.map(r => `- ${r.label}: Valore ${r.valore} (richiesto ${r.soglia})`).join('\n')
      : 'Nessun requisito mancante';

    const areeAttenzioneText = roleMatch.areeAttenzione.length > 0
      ? roleMatch.areeAttenzione.map(a => `- ${a.label}: Valore ${a.valore} (soglia ${a.soglia})`).join('\n')
      : 'Nessuna area di attenzione';

    // ============ PROMPT V5 COMPLETO ============
    const systemPrompt = `Sei un Senior HR Expert specializzato in psicologia del lavoro secondo il Manuale Talent Profiler V5.

## DEFINIZIONI SCALE CORRETTE (V5)

### STILE DI VITA (SV) - Situazione Personale ATTUALE
Misura come sta il candidato ORA nella sua vita personale:
- Basso SV = Momento buio (problemi familiari, salute, economia, divorzio, lutto)
- Alto SV = Vita personale serena e stabile
NOTA: Se SV basso, la persona va supportata prima come individuo, poi come lavoratore.

### SPAZIO VITALE (SP) - AMBIZIONE
Misura gli obiettivi personali materiali ed economici:
- Basso SP = Nessuna ambizione, non desidera migliorare la propria condizione
- Alto SP = Forte ambizione, obiettivi chiari di crescita economica
CRITICO per vendita: senza ambizione, come può convincere altri a comprare?

### PATTERN CHIAVE: "Motore che gira a vuoto"
Alta Motivazione (MO) + Basso Spazio Vitale (SP) = PERICOLOSO
Il candidato sembra motivato (lavora tanto) ma non ha una meta (ambizione).
Come un motore acceso in folle: consuma carburante senza andare da nessuna parte.
Per la vendita è FATALE: produce sforzo ma non risultati.

## 4 LIVELLI DI VERDETTO (MAI default generici!)
- **IDONEO**: Tutti i requisiti soddisfatti, nessuna criticità né attenzione
- **IDONEO_CON_RISERVA**: Tutti i requisiti OK, ma ci sono aree di attenzione da monitorare
- **DA_VALUTARE**: Una criticità (requisito non soddisfatto), approfondimento in colloquio necessario
- **NON_IDONEO**: 2+ criticità, profilo incompatibile con il ruolo

## OUTPUT JSON RICHIESTO
{
  "profilo_sintetico": "Descrizione DETTAGLIATA del candidato in 4-6 frasi secondo V5.",
  "punti_forza": ["5 punti specifici con spiegazione"],
  "punti_debolezza": ["5 punti specifici con impatto concreto"],
  "rischi_operativi": "Analisi APPROFONDITA dei rischi (min 100 parole)",
  "fit_score": numero 0-100,
  "fit_verdict": "${verdict}",
  "fit_motivo": "Spiegazione dettagliata del verdetto in 2-3 frasi",
  "matching_ruolo_richiesto": {
    "ruolo": "${funzione}",
    "compatibilita_pct": numero 0-100,
    "requisiti_verificati": ${JSON.stringify(roleMatch.requisiti)},
    "criticita": ${roleMatch.criticalita},
    "attenzioni": ${roleMatch.attenzioni},
    "verdict": "${verdict}"
  },
  "compatibilita_tutti_ruoli": ${JSON.stringify(allRolesMatch)},
  "ruolo_ideale": "${ruoloIdeale?.ruolo || funzione}",
  "pattern_rilevati": ${JSON.stringify(patterns)},
  "stress_zone_analisi": "Analisi specifica della situazione stress",
  "domande_colloquio": [
    { "area": "Nome area critica", "domanda": "Domanda SPECIFICA per il colloquio basata sul ruolo ${funzione}" }
  ],
  "raccomandazione": {
    "decisione": "ASSUMERE" | "VALUTARE" | "SCARTARE",
    "motivo_principale": "Motivazione in 1-2 frasi",
    "rischio_aziendale": "Rischio principale",
    "tempo_onboarding": "es: 2-4 settimane",
    "probabilita_successo_12m": numero 0-100
  }
}

## REGOLE CRITICHE
1. MAI verdetti generici tipo "Profilo in fase di analisi"
2. SEMPRE verificare pattern "Motore a vuoto" per vendita
3. Le domande colloquio devono essere SPECIFICHE per il ruolo ${funzione}
4. Se età >55 + ruolo vendite + SC >150: segnalare resistenza al cambiamento`;

    const userPrompt = `## CANDIDATO: ${nome}
Età: ${eta || 'N/S'} | Sesso: ${sesso || 'N/S'}
Ruolo attuale: ${ruolo || 'N/S'}
**FUNZIONE RICHIESTA: ${funzione}**

## PUNTEGGI SCALE (0-200, 100=media)
| Scala | Valore | Interpretazione |
|-------|--------|-----------------|
| SV - Situazione Personale | ${sv} | ${sv < 60 ? '⚠️ CRITICO' : sv < 80 ? '⚠️ Sotto media' : sv < 120 ? '✓ Norma' : sv < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| MO - Motivazione | ${mo} | ${mo < 60 ? '⚠️ CRITICO' : mo < 80 ? '⚠️ Sotto media' : mo < 120 ? '✓ Norma' : mo < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| CF - Resilienza | ${cf} | ${cf < 60 ? '⚠️ CRITICO' : cf < 80 ? '⚠️ Sotto media' : cf < 120 ? '✓ Norma' : cf < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| EF - Efficienza | ${ef} | ${ef < 60 ? '⚠️ CRITICO' : ef < 80 ? '⚠️ Sotto media' : ef < 120 ? '✓ Norma' : ef < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| EC - Efficacia | ${ec} | ${ec < 60 ? '⚠️ CRITICO' : ec < 80 ? '⚠️ Sotto media' : ec < 120 ? '✓ Norma' : ec < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| QN - Quantità Responsabilità | ${qn} | ${qn < 60 ? '⚠️ CRITICO' : qn < 80 ? '⚠️ Sotto media' : qn < 120 ? '✓ Norma' : qn < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| QR - Qualità Responsabilità | ${qr} | ${qr < 60 ? '⚠️ CRITICO' : qr < 80 ? '⚠️ Sotto media' : qr < 120 ? '✓ Norma' : qr < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| SP - AMBIZIONE | ${sp} | ${sp < 60 ? '⚠️ CRITICO - Nessuna ambizione' : sp < 80 ? '⚠️ Bassa ambizione' : sp < 120 ? '✓ Norma' : sp < 160 ? '✓ Buona ambizione' : '★ Molto ambizioso'} |
| PA - Partecipazione | ${pa} | ${pa < 60 ? '⚠️ CRITICO' : pa < 80 ? '⚠️ Sotto media' : pa < 120 ? '✓ Norma' : pa < 160 ? '✓ Sopra media' : '★ Eccellenza'} |
| SC - Schematicità | ${sc} | ${sc < 80 ? '✓ Molto flessibile' : sc < 100 ? '✓ Flessibile' : sc < 140 ? '✓ Equilibrato' : sc < 165 ? '⚠️ Rigido' : '⚠️ MOLTO RIGIDO'} |

## VERIFICA REQUISITI RUOLO "${funzione}"
${requisitiText}

### CRITICITÀ (${roleMatch.criticalita})
${requisitiMancantiText}

### AREE ATTENZIONE (${roleMatch.attenzioni})
${areeAttenzioneText}

## VERDETTO AUTOMATICO V5: **${verdict}**

## PATTERN V5 RILEVATI
${patterns.length > 0 ? patterns.join('\n') : '✓ Nessun pattern critico'}

## STRESS ZONE
Severità: ${stressZoneSeverity.toUpperCase()}
${stressZoneDescription}

## INDICATORI CALCOLATI
- Leadership %: ${profilo.leadership_pct?.toFixed(1) || 'N/A'}
- Maturità %: ${profilo.maturita_pct?.toFixed(1) || 'N/A'}
- Potenziale %: ${profilo.potenziale_pct?.toFixed(1) || 'N/A'}
- Out Points: ${profilo.out_points?.join(', ') || 'Nessuno'}
- Strength Points: ${profilo.strength_points?.join(', ') || 'Nessuno'}

## COMPATIBILITÀ TUTTI I RUOLI
${allRolesMatch.map((r, i) => `${i+1}. ${r.ruolo}: ${r.compatibilita}% (${r.verdict})`).join('\n')}

Genera l'analisi JSON completa secondo il Manuale V5. Le domande colloquio devono essere SPECIFICHE per ${funzione}.`;

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
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analisi = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, content);
      return new Response(
        JSON.stringify({ error: 'Errore nel parsing della risposta AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Salva nel database con dati V5 arricchiti
    const { data: savedAnalisi, error: saveError } = await supabase
      .from('analisi_candidato')
      .upsert({
        candidato_id,
        profilo_sintetico: analisi.profilo_sintetico,
        punti_forza: analisi.punti_forza,
        punti_debolezza: analisi.punti_debolezza,
        rischi_operativi: analisi.rischi_operativi,
        fit_score: analisi.fit_score,
        fit_verdict: verdict, // Usa il verdetto calcolato automaticamente
        fit_motivo: analisi.fit_motivo,
        raccomandazione: {
          ...analisi.raccomandazione,
          stress_zone_severity: stressZoneSeverity,
          stress_zone_analisi: analisi.stress_zone_analisi,
          domande_colloquio: analisi.domande_colloquio,
          matching_ruolo_richiesto: {
            ruolo: funzione,
            requisiti: roleMatch.requisiti,
            criticita: roleMatch.criticalita,
            attenzioni: roleMatch.attenzioni,
          },
          compatibilita_tutti_ruoli: allRolesMatch,
          ruolo_ideale: ruoloIdeale?.ruolo,
          pattern_rilevati: patterns,
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
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analisi: savedAnalisi || analisi,
        message: 'Analisi generata con successo secondo il Manuale V5'
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
