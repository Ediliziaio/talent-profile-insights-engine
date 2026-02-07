/**
 * Sistema di Scoring V5 - Assessment Psicometrico
 * 
 * Caratteristiche:
 * - 15 tratti + CTRL per attendibilità
 * - Range punteggi: -100 / +100
 * - 3 macro-aree: ESSERE, FARE, AVERE
 * - Supporto risposta "D" (= B nel calcolo)
 * - Domande con polarità speciale (SPECIAL scoring)
 */

import { 
  TraitCode, 
  TRAIT_LABELS, 
  MacroAreaCode, 
  MACRO_AREA_TRAITS,
  ReliabilityIndex,
  ProfiloTipoV5,
  RispostaValueV5,
  PolaritaV5
} from '@/types/database';

// ============================================
// COSTANTI E CONFIGURAZIONE
// ============================================

/**
 * Punteggi massimi per tratto (numero domande * 10)
 * Basato sulla mappatura domande del Manuale V5
 */
export const TRAIT_MAX_SCORES: Record<TraitCode, number> = {
  ORG: 120,   // 12 domande
  AUT: 220,   // 22 domande (include 228 SPECIAL)
  GP: 170,    // 17 domande (verificato da DB)
  ADS: 210,   // 21 domande
  DET: 190,   // 19 domande
  VEN: 190,   // 19 domande
  HRM: 70,    // 7 domande (verificato da mappatura manuale)
  LDR: 110,   // 11 domande
  PRO: 160,   // 16 domande
  COM: 160,   // 16 domande
  ESP: 130,   // 13 domande
  RC: 170,    // 17 domande
  FIN: 140,   // 14 domande (include 211-213 SPECIAL)
  SUC: 160,   // 16 domande (include 072 SPECIAL)
  PRI: 170,   // 17 domande
  CTRL: 50,   // 5 domande (non produce punteggio, solo conteggio)
};

/**
 * Mappatura domande con scoring speciale
 * Queste domande hanno punteggi non standard per le risposte
 */
export const SPECIAL_SCORING: Record<number, { a: number; b: number; c: number }> = {
  // 072: Età primo guadagno (SUC)
  72: { a: 10, b: 5, c: 0 },   // Prima 21 = +10, 21-23 = +5, Dopo 23 = 0
  
  // 073: % risparmio (FIN)
  73: { a: 0, b: 5, c: 10 },   // <5% = 0, 5-15% = +5, >15% = +10
  
  // 211: Tempo investimenti (FIN)
  211: { a: 10, b: 5, c: 0 },  // Sì = +10, Meno del dovuto = +5, No = 0
  
  // 212: Riserve finanziarie (FIN)
  212: { a: 0, b: 5, c: 10 },  // <3 mesi = 0, 3-6 mesi = +5, >9 mesi = +10
  
  // 213: Autonomia finanziaria (FIN)
  213: { a: 0, b: 5, c: 10 },  // <3 mesi = 0, 3-9 mesi = +5, >9 mesi = +10
  
  // 228: Potenziale successo (AUT)
  228: { a: 10, b: 5, c: 0 },  // Molto più = +10, Uguale = +5, Un po' meno = 0
};

/**
 * Domande di controllo (238-242)
 * Risposta attesa: A
 */
export const CONTROL_QUESTIONS = [238, 239, 240, 241, 242];

// ============================================
// INTERFACCE
// ============================================

export interface RispostaInputV5 {
  domanda_id: number;
  valore: RispostaValueV5;
}

export interface DomandaV5 {
  id: number;
  scala_primaria: TraitCode;
  polarita: PolaritaV5;
}

export interface TraitScore {
  trait: TraitCode;
  label: string;
  rawScore: number;
  maxScore: number;
  normalizedScore: number;  // -100 / +100
}

export interface MacroAreaScore {
  area: MacroAreaCode;
  label: string;
  percentage: number;
  traits: TraitCode[];
}

export interface ProfiloCalcolatoV5 {
  // Punteggi tratti normalizzati (-100/+100)
  traits_v5: Record<TraitCode, number>;
  
  // Macro-aree (percentuali)
  essere_pct: number;
  fare_pct: number;
  avere_pct: number;
  
  // Attendibilità
  reliability_index: ReliabilityIndex;
  control_unexpected_count: number;
  
  // Profilo
  profilo_tipo_v5: ProfiloTipoV5;
  
  // Analisi
  valleys: TraitCode[];           // Tratti sotto media di 20+ punti
  strengths: TraitCode[];         // Tratti sopra media di 15+ punti
  improvements: TraitCode[];      // Tratti sotto media di 15+ punti
  
  // Compatibilità V4 (per transizione)
  assessment_version: 'v5';
}

// ============================================
// FUNZIONI DI CALCOLO
// ============================================

/**
 * Calcola il punteggio per una singola risposta
 */
export function calcolaPunteggioRisposta(
  domandaId: number,
  risposta: RispostaValueV5,
  polarita: PolaritaV5
): number {
  // Risposta D = B nel calcolo
  const rispostaEffettiva = risposta === 'D' ? 'B' : risposta;
  
  // Domande con scoring speciale
  if (polarita === 'S' && SPECIAL_SCORING[domandaId]) {
    const scoring = SPECIAL_SCORING[domandaId];
    return scoring[rispostaEffettiva.toLowerCase() as 'a' | 'b' | 'c'] || 0;
  }
  
  // Domande di controllo (risposta attesa: A)
  if (polarita === 'C') {
    // Per CTRL non calcoliamo punteggio, solo conteggio inattese
    return 0;
  }
  
  // Polarità positiva
  if (polarita === '+') {
    if (rispostaEffettiva === 'A') return 10;
    if (rispostaEffettiva === 'B') return 5;
    return 0; // C
  }
  
  // Polarità negativa
  if (polarita === '-') {
    if (rispostaEffettiva === 'A') return 0;
    if (rispostaEffettiva === 'B') return 5;
    return 10; // C
  }
  
  return 0;
}

/**
 * Calcola il punteggio grezzo per un tratto
 */
export function calcolaPunteggioGrezzoTraito(
  risposte: RispostaInputV5[],
  domande: DomandaV5[],
  trait: TraitCode
): number {
  const domandeTraito = domande.filter(d => d.scala_primaria === trait);
  
  let punteggio = 0;
  
  for (const domanda of domandeTraito) {
    const risposta = risposte.find(r => r.domanda_id === domanda.id);
    if (!risposta) continue;
    
    punteggio += calcolaPunteggioRisposta(domanda.id, risposta.valore, domanda.polarita);
  }
  
  return punteggio;
}

/**
 * Normalizza un punteggio grezzo al range -100/+100
 * Formula: ((rawScore / maxScore) * 200) - 100
 */
export function normalizzaPunteggio(rawScore: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round(((rawScore / maxScore) * 200) - 100);
}

/**
 * Calcola l'attendibilità basata sulle domande di controllo
 * Manuale V2:
 * - 0-1 inattese = YES
 * - 2-5 inattese = CAUTION  
 * - 6-8 inattese = NO
 * - >8 inattese = ZERO (profilo non utilizzabile)
 */
export function calcolaAttendibilita(risposte: RispostaInputV5[]): {
  index: ReliabilityIndex;
  unexpectedCount: number;
} {
  let unexpectedCount = 0;
  
  for (const questionId of CONTROL_QUESTIONS) {
    const risposta = risposte.find(r => r.domanda_id === questionId);
    // Risposta attesa: A
    if (risposta && risposta.valore !== 'A') {
      unexpectedCount++;
    }
  }
  
  if (unexpectedCount <= 1) {
    return { index: 'YES', unexpectedCount };
  } else if (unexpectedCount <= 5) {
    return { index: 'CAUTION', unexpectedCount };
  } else if (unexpectedCount <= 8) {
    return { index: 'NO', unexpectedCount };
  } else {
    return { index: 'ZERO', unexpectedCount };
  }
}

/**
 * Applica la logica di forzatura (FORCED) quando attendibilità = NO
 * Riduce i punteggi del 20-30% in base alla media
 */
export function applicaForzatura(traits: Record<TraitCode, number>): Record<TraitCode, number> {
  // Calcola media tratti (escluso CTRL)
  const traitCodes = Object.keys(traits).filter(t => t !== 'CTRL') as TraitCode[];
  const somma = traitCodes.reduce((acc, t) => acc + traits[t], 0);
  const media = somma / traitCodes.length;
  
  // Determina fattore di riduzione
  let reductionFactor = 1;
  if (media > 60) {
    reductionFactor = 0.7; // Riduci del 30%
  } else if (media > 40) {
    reductionFactor = 0.8; // Riduci del 20%
  }
  
  // Applica riduzione
  const forced: Record<TraitCode, number> = {} as Record<TraitCode, number>;
  for (const trait of traitCodes) {
    forced[trait] = Math.round(traits[trait] * reductionFactor);
  }
  forced.CTRL = 0; // CTRL non ha punteggio
  
  return forced;
}

/**
 * Calcola le macro-aree (ESSERE, FARE, AVERE)
 */
export function calcolaMacroAree(traits: Record<TraitCode, number>): {
  essere_pct: number;
  fare_pct: number;
  avere_pct: number;
} {
  // ESSERE% = ((ORG + AUT + GP + 300) / 600) * 100
  const essere = ((traits.ORG + traits.AUT + traits.GP + 300) / 600) * 100;
  
  // FARE% = ((ADS + DET + VEN + HRM + 400) / 800) * 100
  const fare = ((traits.ADS + traits.DET + traits.VEN + traits.HRM + 400) / 800) * 100;
  
  // AVERE% = ((LDR + PRO + COM + ESP + 400) / 800) * 100
  const avere = ((traits.LDR + traits.PRO + traits.COM + traits.ESP + 400) / 800) * 100;
  
  return {
    essere_pct: Math.round(essere * 10) / 10,
    fare_pct: Math.round(fare * 10) / 10,
    avere_pct: Math.round(avere * 10) / 10,
  };
}

/**
 * Identifica valli, punti di forza e aree di miglioramento
 */
export function analizzaTraits(traits: Record<TraitCode, number>): {
  valleys: TraitCode[];
  strengths: TraitCode[];
  improvements: TraitCode[];
} {
  // Escludi CTRL e indicatori dal calcolo media
  const traitCodes = (Object.keys(traits) as TraitCode[])
    .filter(t => t !== 'CTRL' && !['RC', 'FIN', 'SUC', 'PRI'].includes(t));
  
  const somma = traitCodes.reduce((acc, t) => acc + traits[t], 0);
  const media = somma / traitCodes.length;
  
  const valleys: TraitCode[] = [];
  const strengths: TraitCode[] = [];
  const improvements: TraitCode[] = [];
  
  for (const trait of traitCodes) {
    const diff = traits[trait] - media;
    
    if (diff <= -20) {
      valleys.push(trait);
    } else if (diff <= -15) {
      improvements.push(trait);
    } else if (diff >= 15) {
      strengths.push(trait);
    }
  }
  
  return { valleys, strengths, improvements };
}

/**
 * Determina il profilo tipo V5
 */
export function determinaProfiloTipoV5(
  traits: Record<TraitCode, number>,
  macroAree: { essere_pct: number; fare_pct: number; avere_pct: number },
  hasCriticalSyndromes: boolean = false
): ProfiloTipoV5 {
  const { essere_pct, fare_pct, avere_pct } = macroAree;
  
  // CRITICAL: almeno una S01-S04
  if (hasCriticalSyndromes) {
    return 'CRITICAL';
  }
  
  // LEADER: tutte le aree >= 60%
  if (essere_pct >= 60 && fare_pct >= 60 && avere_pct >= 60) {
    return 'LEADER';
  }
  
  // STRATEGIST: ESSERE >= 60% e FARE < 50%
  if (essere_pct >= 60 && fare_pct < 50) {
    return 'STRATEGIST';
  }
  
  // EXECUTOR: FARE >= 60% e ESSERE < 50%
  if (fare_pct >= 60 && essere_pct < 50) {
    return 'EXECUTOR';
  }
  
  // SPECIALIST: una area >= 70%, altre < 50%
  const aree = [essere_pct, fare_pct, avere_pct];
  const maxArea = Math.max(...aree);
  const otherAreas = aree.filter(a => a !== maxArea);
  if (maxArea >= 70 && otherAreas.every(a => a < 50)) {
    return 'SPECIALIST';
  }
  
  // GROWTH_POTENTIAL: tutte 40-60%, no sindromi gravi
  if (aree.every(a => a >= 40 && a <= 60)) {
    return 'GROWTH_POTENTIAL';
  }
  
  // IN_TRANSIZIONE: pattern misto
  return 'IN_TRANSIZIONE';
}

// ============================================
// FUNZIONE PRINCIPALE
// ============================================

/**
 * Calcola il profilo completo V5 da un set di risposte
 */
export function calcolaProfiloV5(
  risposte: RispostaInputV5[],
  domande: DomandaV5[],
  forceIfUnreliable: boolean = false
): ProfiloCalcolatoV5 {
  // 1. Calcola attendibilità
  const { index: reliabilityIndex, unexpectedCount } = calcolaAttendibilita(risposte);
  
  // 2. Calcola punteggi grezzi per ogni tratto
  const traits_v5: Record<TraitCode, number> = {} as Record<TraitCode, number>;
  const traitCodes: TraitCode[] = ['ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'HRM', 
    'LDR', 'PRO', 'COM', 'ESP', 'RC', 'FIN', 'SUC', 'PRI', 'CTRL'];
  
  for (const trait of traitCodes) {
    if (trait === 'CTRL') {
      traits_v5[trait] = 0; // CTRL non ha punteggio
      continue;
    }
    
    const rawScore = calcolaPunteggioGrezzoTraito(risposte, domande, trait);
    const maxScore = TRAIT_MAX_SCORES[trait];
    traits_v5[trait] = normalizzaPunteggio(rawScore, maxScore);
  }
  
  // 3. Applica forzatura se necessario
  let finalTraits = traits_v5;
  let finalReliability: ReliabilityIndex = reliabilityIndex;
  
  if (reliabilityIndex === 'NO' && forceIfUnreliable) {
    finalTraits = applicaForzatura(traits_v5);
    finalReliability = 'FORCED';
  }
  
  // 4. Calcola macro-aree
  const macroAree = calcolaMacroAree(finalTraits);
  
  // 5. Analizza tratti (valli, forze, miglioramenti)
  const { valleys, strengths, improvements } = analizzaTraits(finalTraits);
  
  // 6. Determina profilo tipo
  const profilo_tipo_v5 = determinaProfiloTipoV5(finalTraits, macroAree);
  
  return {
    traits_v5: finalTraits,
    essere_pct: macroAree.essere_pct,
    fare_pct: macroAree.fare_pct,
    avere_pct: macroAree.avere_pct,
    reliability_index: finalReliability,
    control_unexpected_count: unexpectedCount,
    profilo_tipo_v5,
    valleys,
    strengths,
    improvements,
    assessment_version: 'v5',
  };
}

// ============================================
// FUNZIONI DI UTILITÀ PER UI
// ============================================

/**
 * Ottiene il colore per un punteggio V5 (-100/+100)
 */
export function getScoreColorV5(score: number): string {
  if (score < -30) return 'hsl(var(--chart-danger))';     // Rosso
  if (score < 0) return 'hsl(var(--chart-warning))';       // Arancione
  if (score < 30) return 'hsl(var(--chart-caution))';      // Giallo
  return 'hsl(var(--chart-success))';                      // Verde
}

/**
 * Ottiene la classe CSS per un punteggio V5
 */
export function getScoreClassV5(score: number): string {
  if (score < -30) return 'text-red-600 bg-red-50';
  if (score < 0) return 'text-orange-600 bg-orange-50';
  if (score < 30) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
}

/**
 * Ottiene la fascia interpretativa per un tratto specifico
 */
export function getFasciaInterpretativa(trait: TraitCode, score: number): {
  fascia: 'eccellente' | 'buono' | 'discreto' | 'mediocre' | 'critico';
  descrizione: string;
} {
  // Soglie specifiche per tratto (dal Manuale V5)
  const soglie: Record<TraitCode, { eccellente: number; buono: number; discreto: number; mediocre: number }> = {
    ORG: { eccellente: 65, buono: 40, discreto: 30, mediocre: 0 },
    AUT: { eccellente: 60, buono: 35, discreto: 20, mediocre: 0 },
    GP: { eccellente: 65, buono: 30, discreto: 21, mediocre: 0 },
    ADS: { eccellente: 44, buono: 30, discreto: 20, mediocre: 0 },
    DET: { eccellente: 44, buono: 35, discreto: 20, mediocre: 0 },
    VEN: { eccellente: 70, buono: 50, discreto: 30, mediocre: 0 },
    HRM: { eccellente: 30, buono: 15, discreto: 0, mediocre: -15 },
    LDR: { eccellente: 44, buono: 20, discreto: 0, mediocre: -20 },
    PRO: { eccellente: 40, buono: 20, discreto: 10, mediocre: 0 },
    COM: { eccellente: 30, buono: 15, discreto: 0, mediocre: -15 },
    ESP: { eccellente: 60, buono: 30, discreto: 15, mediocre: 0 },
    RC: { eccellente: 45, buono: 30, discreto: 15, mediocre: -14 },  // RC ha interpretazione speciale
    FIN: { eccellente: 30, buono: 15, discreto: 0, mediocre: -15 },
    SUC: { eccellente: 69, buono: 30, discreto: 0, mediocre: -30 },
    PRI: { eccellente: 70, buono: 45, discreto: 20, mediocre: 0 },
    CTRL: { eccellente: 0, buono: 0, discreto: 0, mediocre: 0 },  // CTRL non ha interpretazione
  };
  
  const s = soglie[trait];
  
  if (score >= s.eccellente) return { fascia: 'eccellente', descrizione: 'Eccellente' };
  if (score >= s.buono) return { fascia: 'buono', descrizione: 'Buono' };
  if (score >= s.discreto) return { fascia: 'discreto', descrizione: 'Discreto' };
  if (score >= s.mediocre) return { fascia: 'mediocre', descrizione: 'Mediocre' };
  return { fascia: 'critico', descrizione: 'Critico' };
}

/**
 * Ottiene etichetta profilo V5
 */
export function getProfiloTipoV5Label(tipo: ProfiloTipoV5): string {
  const labels: Record<ProfiloTipoV5, string> = {
    'LEADER': 'Leader',
    'STRATEGIST': 'Strategist',
    'EXECUTOR': 'Executor',
    'SPECIALIST': 'Specialist',
    'GROWTH_POTENTIAL': 'Growth Potential',
    'IN_TRANSIZIONE': 'In Transizione',
    'CRITICAL': 'Profilo Critico',
  };
  return labels[tipo] || 'Non definito';
}

/**
 * Ottiene descrizione profilo V5
 */
export function getProfiloTipoV5Description(tipo: ProfiloTipoV5): string {
  const descriptions: Record<ProfiloTipoV5, string> = {
    'LEADER': 'Eccelle in tutte le macro-aree. Adatto a ruoli di direzione e responsabilità elevata.',
    'STRATEGIST': 'Forte visione e pianificazione, meno orientato all\'esecuzione. Ideale per ruoli strategici.',
    'EXECUTOR': 'Eccellente nell\'esecuzione, meno nella visione. Adatto a ruoli operativi senior.',
    'SPECIALIST': 'Forte specializzazione in un\'area specifica. Ideale per ruoli tecnici o di nicchia.',
    'GROWTH_POTENTIAL': 'Profilo equilibrato con margini di crescita. Investimento formativo consigliato.',
    'IN_TRANSIZIONE': 'Pattern misto che richiede approfondimento. Valutare sindromi attive.',
    'CRITICAL': 'Presenza di sindromi critiche (S01-S04). Valutazione approfondita necessaria.',
  };
  return descriptions[tipo] || 'Profilo in valutazione';
}

/**
 * Ottiene il badge colore per ReliabilityIndex
 */
export function getReliabilityBadge(index: ReliabilityIndex): {
  color: string;
  label: string;
  className: string;
} {
  switch (index) {
    case 'YES':
      return { color: 'green', label: 'Attendibile', className: 'bg-green-100 text-green-800' };
    case 'CAUTION':
      return { color: 'yellow', label: 'Attenzione', className: 'bg-yellow-100 text-yellow-800' };
    case 'NO':
      return { color: 'red', label: 'Non Attendibile', className: 'bg-red-100 text-red-800' };
    case 'FORCED':
      return { color: 'orange', label: 'Forzato', className: 'bg-orange-100 text-orange-800' };
    default:
      return { color: 'gray', label: 'N/D', className: 'bg-gray-100 text-gray-800' };
  }
}
