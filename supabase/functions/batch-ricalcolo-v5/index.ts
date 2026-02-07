import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// V5 Trait Codes
type TraitCode = 'ORG' | 'AUT' | 'GP' | 'ADS' | 'DET' | 'VEN' | 'HRM' | 'LDR' | 'PRO' | 'COM' | 'ESP' | 'RC' | 'FIN' | 'SUC' | 'PRI' | 'CTRL';
type PolaritaV5 = '+' | '-' | 'S' | 'C';
type RispostaValueV5 = 'A' | 'B' | 'C' | 'D';
type ReliabilityIndex = 'YES' | 'CAUTION' | 'NO' | 'FORCED';

interface DomandaV5 {
  id: number;
  scala_primaria: TraitCode;
  polarita: PolaritaV5;
}

interface RispostaInputV5 {
  domanda_id: number;
  valore: RispostaValueV5;
}

interface TraitsV5 {
  ORG: number;
  AUT: number;
  GP: number;
  ADS: number;
  DET: number;
  VEN: number;
  HRM: number;
  LDR: number;
  PRO: number;
  COM: number;
  ESP: number;
  RC: number;
  FIN: number;
  SUC: number;
  PRI: number;
  CTRL?: number;
}

interface ProfiloCalcolatoV5 {
  traits_v5: TraitsV5;
  essere_pct: number;
  fare_pct: number;
  avere_pct: number;
  reliability_index: ReliabilityIndex;
  profilo_tipo_v5: string;
  strengths: TraitCode[];
  valleys: TraitCode[];
}

const MACRO_AREA_TRAITS: Record<string, TraitCode[]> = {
  ESSERE: ['ORG', 'AUT', 'GP'],
  FARE: ['ADS', 'DET', 'VEN', 'HRM'],
  AVERE: ['LDR', 'PRO', 'COM', 'ESP']
};

const INDICATOR_TRAITS: TraitCode[] = ['RC', 'FIN', 'SUC', 'PRI'];
const ALL_CORE_TRAITS: TraitCode[] = ['ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'HRM', 'LDR', 'PRO', 'COM', 'ESP', 'RC', 'FIN', 'SUC', 'PRI'];

function calcolaProfiloV5(risposte: RispostaInputV5[], domande: DomandaV5[]): ProfiloCalcolatoV5 {
  // Initialize raw scores
  const rawScores: Record<TraitCode, { sum: number; count: number }> = {} as any;
  ALL_CORE_TRAITS.forEach(trait => {
    rawScores[trait] = { sum: 0, count: 0 };
  });
  rawScores['CTRL'] = { sum: 0, count: 0 };
  
  // Create domanda lookup
  const domandaMap = new Map(domande.map(d => [d.id, d]));
  
  // Process each response
  for (const risposta of risposte) {
    const domanda = domandaMap.get(risposta.domanda_id);
    if (!domanda) continue;
    
    const trait = domanda.scala_primaria;
    const polarita = domanda.polarita;
    const valore = risposta.valore;
    
    // Skip 'D' (preferisco non rispondere)
    if (valore === 'D') continue;
    
    // Calculate score based on polarity
    let score: number;
    
    if (polarita === 'C') {
      // CTRL questions
      score = valore === 'A' ? 2 : valore === 'B' ? 1 : 0;
      rawScores['CTRL'].sum += score;
      rawScores['CTRL'].count++;
    } else if (polarita === 'S') {
      // Special scoring
      score = valore === 'A' ? 2 : valore === 'B' ? 1 : 0;
      if (rawScores[trait]) {
        rawScores[trait].sum += score;
        rawScores[trait].count++;
      }
    } else if (polarita === '+') {
      // Positive polarity: A=2, B=1, C=0
      score = valore === 'A' ? 2 : valore === 'B' ? 1 : 0;
      if (rawScores[trait]) {
        rawScores[trait].sum += score;
        rawScores[trait].count++;
      }
    } else {
      // Negative polarity: A=0, B=1, C=2
      score = valore === 'A' ? 0 : valore === 'B' ? 1 : 2;
      if (rawScores[trait]) {
        rawScores[trait].sum += score;
        rawScores[trait].count++;
      }
    }
  }
  
  // Normalize to -100/+100 range
  const traits_v5: TraitsV5 = {} as TraitsV5;
  
  for (const trait of ALL_CORE_TRAITS) {
    const data = rawScores[trait];
    if (data.count === 0) {
      traits_v5[trait] = 0;
    } else {
      const avg = data.sum / data.count;
      // avg is 0-2, normalize to -100/+100
      traits_v5[trait] = Math.round((avg - 1) * 100);
    }
  }
  
  // Calculate CTRL for reliability
  const ctrlData = rawScores['CTRL'];
  const ctrlAvg = ctrlData.count > 0 ? ctrlData.sum / ctrlData.count : 1;
  
  // Determine reliability index
  let reliability_index: ReliabilityIndex;
  if (ctrlAvg >= 1.5) {
    reliability_index = 'YES';
  } else if (ctrlAvg >= 1.0) {
    reliability_index = 'CAUTION';
  } else if (ctrlAvg >= 0.5) {
    reliability_index = 'NO';
  } else {
    reliability_index = 'FORCED';
  }
  
  // Calculate macro-area percentages
  const calcMacroArea = (traitCodes: TraitCode[]): number => {
    const sum = traitCodes.reduce((acc, t) => acc + traits_v5[t], 0);
    const avg = sum / traitCodes.length;
    return Math.round(((avg + 100) / 200) * 100);
  };
  
  const essere_pct = calcMacroArea(MACRO_AREA_TRAITS.ESSERE);
  const fare_pct = calcMacroArea(MACRO_AREA_TRAITS.FARE);
  const avere_pct = calcMacroArea(MACRO_AREA_TRAITS.AVERE);
  
  // Calculate strengths (>=60) and valleys (<=-40)
  const strengths: TraitCode[] = [];
  const valleys: TraitCode[] = [];
  
  for (const trait of ALL_CORE_TRAITS) {
    if (traits_v5[trait] >= 60) strengths.push(trait);
    if (traits_v5[trait] <= -40) valleys.push(trait);
  }
  
  // Determine profile type V5
  let profilo_tipo_v5: string;
  
  const hasCriticalSyndromes = valleys.some(t => ['GP', 'AUT', 'LDR'].includes(t)) && valleys.length >= 2;
  
  if (hasCriticalSyndromes) {
    profilo_tipo_v5 = 'CRITICAL';
  } else if (essere_pct >= 60 && fare_pct >= 60 && avere_pct >= 60) {
    profilo_tipo_v5 = 'LEADER';
  } else if (essere_pct >= 60 && fare_pct < 50) {
    profilo_tipo_v5 = 'STRATEGIST';
  } else if (fare_pct >= 60 && essere_pct < 50) {
    profilo_tipo_v5 = 'EXECUTOR';
  } else if (
    (essere_pct >= 70 && fare_pct < 50 && avere_pct < 50) ||
    (fare_pct >= 70 && essere_pct < 50 && avere_pct < 50) ||
    (avere_pct >= 70 && essere_pct < 50 && fare_pct < 50)
  ) {
    profilo_tipo_v5 = 'SPECIALIST';
  } else if (essere_pct >= 40 && essere_pct <= 60 && fare_pct >= 40 && fare_pct <= 60 && avere_pct >= 40 && avere_pct <= 60) {
    profilo_tipo_v5 = 'GROWTH_POTENTIAL';
  } else {
    profilo_tipo_v5 = 'IN_TRANSIZIONE';
  }
  
  return {
    traits_v5,
    essere_pct,
    fare_pct,
    avere_pct,
    reliability_index,
    profilo_tipo_v5,
    strengths,
    valleys
  };
}

// Syndrome detection
interface SyndromeDetected {
  code: string;
  name: string;
  severity: 'RED' | 'ORANGE' | 'YELLOW';
  triggeredBy: string[];
}

function getActiveSyndromes(traits: TraitsV5, eta?: number): SyndromeDetected[] {
  const syndromes: SyndromeDetected[] = [];
  
  // S01 - Depression Pattern
  if (traits.AUT <= -60 && traits.GP <= -40) {
    syndromes.push({
      code: 'S01',
      name: 'Pattern Depressivo',
      severity: 'RED',
      triggeredBy: ['AUT', 'GP']
    });
  }
  
  // S02 - Burnout Risk
  if (traits.GP <= -60 && traits.ADS >= 60) {
    syndromes.push({
      code: 'S02',
      name: 'Rischio Burnout',
      severity: 'RED',
      triggeredBy: ['GP', 'ADS']
    });
  }
  
  // S03 - Authority Conflict
  if (traits.LDR <= -60 && traits.RC >= 60) {
    syndromes.push({
      code: 'S03',
      name: 'Conflitto con Autorità',
      severity: 'RED',
      triggeredBy: ['LDR', 'RC']
    });
  }
  
  // S04 - Imposter Syndrome
  if (traits.PRO <= -60 && traits.ESP <= -40) {
    syndromes.push({
      code: 'S04',
      name: 'Sindrome Impostore',
      severity: 'RED',
      triggeredBy: ['PRO', 'ESP']
    });
  }
  
  // S05 - Procrastination Risk
  if (traits.DET <= -40 && traits.ORG <= -20) {
    syndromes.push({
      code: 'S05',
      name: 'Rischio Procrastinazione',
      severity: 'ORANGE',
      triggeredBy: ['DET', 'ORG']
    });
  }
  
  // S06 - Conflict Avoidance
  if (traits.COM >= 60 && traits.LDR <= -20) {
    syndromes.push({
      code: 'S06',
      name: 'Evitamento Conflitti',
      severity: 'ORANGE',
      triggeredBy: ['COM', 'LDR']
    });
  }
  
  // S07 - Excessive Rigidity
  if (traits.RC >= 80) {
    syndromes.push({
      code: 'S07',
      name: 'Rigidità Eccessiva',
      severity: 'ORANGE',
      triggeredBy: ['RC']
    });
  }
  
  // S08 - Workaholic Pattern
  if (traits.ADS >= 80 && traits.ESP <= -20) {
    syndromes.push({
      code: 'S08',
      name: 'Pattern Workaholic',
      severity: 'YELLOW',
      triggeredBy: ['ADS', 'ESP']
    });
  }
  
  // Age-related syndromes
  if (eta && eta < 25) {
    if (traits.ORG <= -40) {
      syndromes.push({
        code: 'S09',
        name: 'Immaturità Organizzativa',
        severity: 'YELLOW',
        triggeredBy: ['ORG', 'età']
      });
    }
  }
  
  return syndromes;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request body for optional candidato_id filter
    let candidatoId: string | null = null;
    try {
      const body = await req.json();
      candidatoId = body.candidato_id || null;
    } catch {
      // No body or invalid JSON, process all candidates
    }
    
    // Load all questions
    const { data: domande, error: domandeError } = await supabase
      .from('domande')
      .select('id, scala_primaria, polarita')
      .order('id');
    
    if (domandeError) {
      throw new Error(`Errore caricamento domande: ${domandeError.message}`);
    }
    
    // Load candidates with completed tests
    let candidatiQuery = supabase
      .from('candidati')
      .select('id, nome, cognome, eta')
      .eq('test_completato', true);
    
    if (candidatoId) {
      candidatiQuery = candidatiQuery.eq('id', candidatoId);
    }
    
    const { data: candidati, error: candidatiError } = await candidatiQuery.order('updated_at', { ascending: false });
    
    if (candidatiError) {
      throw new Error(`Errore caricamento candidati: ${candidatiError.message}`);
    }
    
    const results: any[] = [];
    let success = 0;
    let failed = 0;
    
    for (const candidato of candidati || []) {
      try {
        // Load responses for this candidate
        const { data: risposte, error: risposteError } = await supabase
          .from('risposte')
          .select('domanda_id, valore')
          .eq('candidato_id', candidato.id)
          .order('domanda_id');
        
        if (risposteError || !risposte || risposte.length === 0) {
          results.push({
            candidatoId: candidato.id,
            nome: `${candidato.nome} ${candidato.cognome}`,
            success: false,
            error: risposteError?.message || 'Nessuna risposta trovata'
          });
          failed++;
          continue;
        }
        
        // Calculate V5 profile
        const profilo = calcolaProfiloV5(risposte as RispostaInputV5[], domande as DomandaV5[]);
        
        // Calculate syndromes
        const syndromes = getActiveSyndromes(profilo.traits_v5, candidato.eta || undefined);
        
        // Check if profile exists
        const { data: existing } = await supabase
          .from('profili_candidato')
          .select('id')
          .eq('candidato_id', candidato.id)
          .maybeSingle();
        
        const profileData = {
          traits_v5: profilo.traits_v5,
          essere_pct: profilo.essere_pct,
          fare_pct: profilo.fare_pct,
          avere_pct: profilo.avere_pct,
          reliability_index: profilo.reliability_index,
          profilo_tipo_v5: profilo.profilo_tipo_v5,
          syndromes_detected: syndromes,
          assessment_version: 'v5',
          strength_points: profilo.strengths,
          out_points: profilo.valleys,
          updated_at: new Date().toISOString()
        };
        
        let dbError;
        if (existing) {
          const { error } = await supabase
            .from('profili_candidato')
            .update(profileData)
            .eq('candidato_id', candidato.id);
          dbError = error;
        } else {
          const { error } = await supabase
            .from('profili_candidato')
            .insert([{
              candidato_id: candidato.id,
              ...profileData
            }]);
          dbError = error;
        }
        
        if (dbError) {
          results.push({
            candidatoId: candidato.id,
            nome: `${candidato.nome} ${candidato.cognome}`,
            success: false,
            error: dbError.message
          });
          failed++;
        } else {
          results.push({
            candidatoId: candidato.id,
            nome: `${candidato.nome} ${candidato.cognome}`,
            success: true,
            profilo_tipo_v5: profilo.profilo_tipo_v5,
            essere_pct: profilo.essere_pct,
            fare_pct: profilo.fare_pct,
            avere_pct: profilo.avere_pct,
            syndromes_count: syndromes.length
          });
          success++;
        }
        
      } catch (err) {
        results.push({
          candidatoId: candidato.id,
          nome: `${candidato.nome} ${candidato.cognome}`,
          success: false,
          error: err instanceof Error ? err.message : 'Errore sconosciuto'
        });
        failed++;
      }
    }
    
    return new Response(
      JSON.stringify({
        total: (candidati || []).length,
        success,
        failed,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore interno' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
