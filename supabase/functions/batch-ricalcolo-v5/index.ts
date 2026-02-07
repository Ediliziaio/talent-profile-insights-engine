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
type SyndromeSeverity = 'RED' | 'ORANGE' | 'YELLOW';

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

interface SyndromeDetected {
  code: string;
  name: string;
  severity: SyndromeSeverity;
  description: string;
  category: 'primary' | 'secondary';
  triggeredBy: string[];
}

const MACRO_AREA_TRAITS: Record<string, TraitCode[]> = {
  ESSERE: ['ORG', 'AUT', 'GP'],
  FARE: ['ADS', 'DET', 'VEN', 'HRM'],
  AVERE: ['LDR', 'PRO', 'COM', 'ESP']
};

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

// ============================================
// COMPLETE SYNDROME DETECTION (24 SYNDROMES)
// Based on Manuale V5
// ============================================

function getActiveSyndromes(traits: TraitsV5, eta?: number): SyndromeDetected[] {
  const syndromes: SyndromeDetected[] = [];
  
  const allTraitValues = [
    traits.ORG, traits.AUT, traits.GP, traits.ADS, traits.DET,
    traits.VEN, traits.HRM, traits.LDR, traits.PRO, traits.COM,
    traits.ESP, traits.RC, traits.FIN, traits.SUC, traits.PRI
  ];
  
  // ============================================
  // PRIMARY SYNDROMES (S01-S18)
  // ============================================
  
  // S01 - PERSONA DEMOTIVANTE CRONICA
  if (traits.HRM < 0 && traits.PRO < 0 && traits.COM < 0 && traits.ESP < 0) {
    syndromes.push({
      code: 'S01',
      name: 'PERSONA DEMOTIVANTE CRONICA',
      severity: 'RED',
      description: 'SEMPRE NON IDONEA. Porta al fallimento chi gestisce.',
      category: 'primary',
      triggeredBy: ['HRM', 'PRO', 'COM', 'ESP']
    });
  }
  
  // S02 - SP (SOPPRESSIVA)
  if (traits.AUT >= 60 && traits.GP < 21 && traits.COM <= 0 && traits.RC > 45) {
    syndromes.push({
      code: 'S02',
      name: 'SP (SOPPRESSIVA)',
      severity: 'RED',
      description: 'SEMPRE NON IDONEA. Porta aziende al fallimento.',
      category: 'primary',
      triggeredBy: ['AUT', 'GP', 'COM', 'RC']
    });
  }
  
  // S03 - TROUBLE
  if (traits.AUT >= 60 && (traits.GP < 21 || traits.RC <= -19) && traits.COM <= 0) {
    syndromes.push({
      code: 'S03',
      name: 'TROUBLE',
      severity: 'RED',
      description: 'Bomba a mano. Idonea SOLO con controllo costante.',
      category: 'primary',
      triggeredBy: ['AUT', 'GP', 'RC', 'COM']
    });
  }
  
  // S04 - PERSONA DEMOTIVANTE
  if (traits.PRO <= 0 && traits.COM <= 0 && traits.ESP <= 0) {
    syndromes.push({
      code: 'S04',
      name: 'PERSONA DEMOTIVANTE',
      severity: 'RED',
      description: 'SEMPRE NON IDONEA. Amplifica difficoltà, demotiva.',
      category: 'primary',
      triggeredBy: ['PRO', 'COM', 'ESP']
    });
  }
  
  // S05 - ATTEGGIAMENTO DEMOTIVANTE
  if (traits.GP <= 0 && traits.PRO < 10 && traits.COM <= 0) {
    syndromes.push({
      code: 'S05',
      name: 'ATTEGGIAMENTO DEMOTIVANTE',
      severity: 'ORANGE',
      description: '50% casi problemi etica. NON IDONEA ruoli chiave.',
      category: 'primary',
      triggeredBy: ['GP', 'PRO', 'COM']
    });
  }
  
  // S06 - POTENZIALI PROBLEMI ETICA (6 combinazioni)
  const S06a = traits.ORG < 31 && traits.ADS < 0 && traits.PRO < 15 && traits.FIN < 0;
  const S06b = traits.RC < -14 && traits.FIN < 31 && traits.GP < 0 && traits.ADS < 40 && traits.PRI < 70;
  const S06c = traits.RC < -14 && traits.FIN < 31 && traits.GP > 60 && traits.ADS < 40 && traits.PRI < 70;
  const S06d = (traits.ESP > 49 && traits.ORG < 26 && traits.AUT < 30 && traits.ADS < 40) || 
               (traits.COM > 14 && traits.ORG < 26 && traits.AUT < 30 && traits.ADS < 40);
  const S06e = traits.PRO > 0 && traits.COM > 0 && traits.ESP > 0 && traits.SUC < 69 && traits.PRI < 40 && traits.FIN < 30;
  const S06f = traits.PRO < -50 && traits.COM < -50;
  
  if (S06a || S06b || S06c || S06d || S06e || S06f) {
    syndromes.push({
      code: 'S06',
      name: 'POTENZIALI PROBLEMI ETICA',
      severity: 'ORANGE',
      description: 'Attendibilità 85%. Richiede approfondimento.',
      category: 'primary',
      triggeredBy: ['Multiple']
    });
  }
  
  // S07 - CREATIVO DISPERSIVO
  if (traits.ORG < 30 && traits.RC <= 14) {
    syndromes.push({
      code: 'S07',
      name: 'CREATIVO DISPERSIVO',
      severity: 'ORANGE',
      description: 'Inizia progetti, non completa.',
      category: 'primary',
      triggeredBy: ['ORG', 'RC']
    });
  }
  
  // S08 - GHOST
  if (traits.ORG > 44 && traits.AUT > 44 && traits.GP > 44 && traits.ADS > 44 && 
      traits.DET > 44 && traits.VEN > 44 && traits.PRO > 44) {
    syndromes.push({
      code: 'S08',
      name: 'GHOST',
      severity: 'ORANGE',
      description: '80% prestazioni inferiori al grafico.',
      category: 'primary',
      triggeredBy: ['ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'PRO']
    });
  }
  
  // S09 - ROBOTISMO AL CONTRARIO
  if ((traits.AUT >= 60 && traits.GP < 21) || (traits.AUT >= 60 && traits.RC <= -20)) {
    syndromes.push({
      code: 'S09',
      name: 'ROBOTISMO AL CONTRARIO',
      severity: 'ORANGE',
      description: 'Fa opposto di richiesto. Non idonea Capo Area.',
      category: 'primary',
      triggeredBy: ['AUT', 'GP', 'RC']
    });
  }
  
  // S10 - DISACCORDO Tipo 1
  if (traits.AUT > 29 && traits.DET > 29 && traits.VEN > 49 && traits.PRO < 30 && traits.COM < 20) {
    syndromes.push({
      code: 'S10',
      name: 'DISACCORDO Tipo 1',
      severity: 'YELLOW',
      description: 'Genera disaccordi inconsapevoli.',
      category: 'primary',
      triggeredBy: ['AUT', 'DET', 'VEN', 'PRO', 'COM']
    });
  }
  
  // S11 - DISACCORDO Tipo 2
  if (traits.GP > 49 && traits.PRO > 39 && traits.COM < 16 && 
      (traits.DET > 44 || (traits.DET > 35 && traits.AUT > 60))) {
    syndromes.push({
      code: 'S11',
      name: 'DISACCORDO Tipo 2',
      severity: 'YELLOW',
      description: 'Attacca chi non concorda.',
      category: 'primary',
      triggeredBy: ['GP', 'PRO', 'COM', 'DET', 'AUT']
    });
  }
  
  // S12 - INSUCCESSO COMMERCIALE
  if (traits.VEN > 29 && (eta || 0) > 39 && traits.RC > 44 && traits.SUC < 69 && traits.FIN < 30) {
    syndromes.push({
      code: 'S12',
      name: 'INSUCCESSO COMMERCIALE',
      severity: 'YELLOW',
      description: 'Scarsi risultati nonostante attitudine.',
      category: 'primary',
      triggeredBy: ['VEN', 'RC', 'SUC', 'FIN', 'età']
    });
  }
  
  // S13 - FUORI ROTTA
  if (traits.SUC < 69 && traits.PRI < 40 && traits.FIN < 30) {
    syndromes.push({
      code: 'S13',
      name: 'FUORI ROTTA',
      severity: 'YELLOW',
      description: 'Principi sbagliati per prosperità.',
      category: 'primary',
      triggeredBy: ['SUC', 'PRI', 'FIN']
    });
  }
  
  // S14 - POCA PRECISIONE
  if (traits.AUT >= 60 && traits.VEN >= 70) {
    syndromes.push({
      code: 'S14',
      name: 'POCA PRECISIONE',
      severity: 'YELLOW',
      description: 'Non adatta ruoli impiegatizi/back office.',
      category: 'primary',
      triggeredBy: ['AUT', 'VEN']
    });
  }
  
  // S15 - PROFILO TUTTO BASSO
  const allLow = traits.ORG <= 10 && traits.AUT <= 10 && traits.GP <= 10 && traits.ADS <= 10 && 
                 traits.DET <= 10 && traits.VEN <= 10 && traits.HRM <= 10 && traits.LDR <= 10 && 
                 traits.PRO <= 10 && traits.COM <= 10 && traits.ESP <= 10 && traits.FIN <= 10 && 
                 traits.SUC <= 10 && traits.PRI <= 10;
  
  if (allLow) {
    syndromes.push({
      code: 'S15',
      name: 'PROFILO TUTTO BASSO',
      severity: 'ORANGE',
      description: 'Condizione PSP. Relazione demotivante in corso.',
      category: 'primary',
      triggeredBy: ['All traits low']
    });
  }
  
  // S16 - BRUTTO CARATTERE
  if (traits.PRO < 10 && traits.COM <= 0) {
    syndromes.push({
      code: 'S16',
      name: 'BRUTTO CARATTERE',
      severity: 'YELLOW',
      description: 'Difficoltà relazionali evidenti.',
      category: 'primary',
      triggeredBy: ['PRO', 'COM']
    });
  }
  
  // S17 - GP PIÙ ALTO
  const maxTrait = Math.max(...allTraitValues);
  if (traits.GP === maxTrait && traits.GP > 0) {
    syndromes.push({
      code: 'S17',
      name: 'GP PIÙ ALTO',
      severity: 'YELLOW',
      description: 'Non affronta situazioni.',
      category: 'primary',
      triggeredBy: ['GP']
    });
  }
  
  // S18 - EGO
  if (traits.ORG < 0 && traits.AUT > 50 && traits.DET > 44 && traits.VEN > 44 && 
      traits.LDR > 44 && traits.PRO < 0 && traits.COM < 0 && traits.ESP > 60) {
    syndromes.push({
      code: 'S18',
      name: 'EGO',
      severity: 'YELLOW',
      description: 'Ego ipertrofico. Difficile da gestire.',
      category: 'primary',
      triggeredBy: ['ORG', 'AUT', 'DET', 'VEN', 'LDR', 'PRO', 'COM', 'ESP']
    });
  }
  
  // ============================================
  // SECONDARY SYNDROMES (SS1-SS6)
  // ============================================
  
  // SS1 - FA COSE MA NON LE FA FARE
  if (traits.ADS > 44 && traits.DET < 30) {
    syndromes.push({
      code: 'SS1',
      name: 'FA COSE MA NON LE FA FARE',
      severity: 'YELLOW',
      description: 'Alta autodisciplina ma bassa determinazione nella delega.',
      category: 'secondary',
      triggeredBy: ['ADS', 'DET']
    });
  }
  
  // SS2 - DISACCORDO IMPORTANTE
  if (traits.GP <= 0 && traits.COM <= 0) {
    syndromes.push({
      code: 'SS2',
      name: 'DISACCORDO IMPORTANTE',
      severity: 'YELLOW',
      description: 'Combinazione pressione e scarsa comprensione genera conflitti.',
      category: 'secondary',
      triggeredBy: ['GP', 'COM']
    });
  }
  
  // SS3 - PERFEZIONISTA
  if (traits.ORG > 64 && traits.COM < 0) {
    syndromes.push({
      code: 'SS3',
      name: 'PERFEZIONISTA',
      severity: 'YELLOW',
      description: 'Alta organizzazione ma poca tolleranza per errori altrui.',
      category: 'secondary',
      triggeredBy: ['ORG', 'COM']
    });
  }
  
  // SS4 - ESECUTORE (Positive pattern)
  if (traits.ORG >= 30 && traits.GP >= 30 && traits.PRO >= 20) {
    syndromes.push({
      code: 'SS4',
      name: 'ESECUTORE',
      severity: 'YELLOW',
      description: 'Profilo positivo: affidabile, organizzato, proattivo.',
      category: 'secondary',
      triggeredBy: ['ORG', 'GP', 'PRO']
    });
  }
  
  // SS5 - ZERBINO
  if (traits.PRO > 40 && traits.DET < 35) {
    syndromes.push({
      code: 'SS5',
      name: 'ZERBINO',
      severity: 'YELLOW',
      description: 'Alta proattività ma non si impone.',
      category: 'secondary',
      triggeredBy: ['PRO', 'DET']
    });
  }
  
  // SS6 - RC ELEVATA
  if (traits.RC >= 45) {
    syndromes.push({
      code: 'SS6',
      name: 'RC ELEVATA',
      severity: 'YELLOW',
      description: 'Rigidità elevata. Resiste ai cambiamenti.',
      category: 'secondary',
      triggeredBy: ['RC']
    });
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
        
        // Calculate syndromes (now with all 24)
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
            syndromes_count: syndromes.length,
            syndromes: syndromes.map(s => ({ code: s.code, severity: s.severity }))
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
