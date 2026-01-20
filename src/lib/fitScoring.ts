/**
 * Fit Scoring con 4 livelli di verdetto - Manuale Talent Profiler V5
 * 
 * VERDETTI:
 * - IDONEO: Tutti requisiti essenziali OK, nessuna criticità
 * - IDONEO_CON_RISERVA: Requisiti OK ma aree di attenzione
 * - DA_VALUTARE: Una criticità da approfondire
 * - NON_IDONEO: 2+ criticità
 */
import { ProfiloCandidato } from '@/types/database';
import { calculateRoleMatching, FitVerdict, ROLE_PROFILES } from './roleMatching';

export interface FitContext {
  eta?: number | null;
  ruolo_attuale?: string | null;
  funzione?: string | null;
  profilo: ProfiloCandidato;
}

export interface FitResult {
  baseScore: number;
  adjustments: FitAdjustment[];
  finalScore: number;
  verdict: FitVerdict;
  alerts: string[];
  dettaglioMatching?: {
    requisitiSoddisfatti: number;
    requisitiTotali: number;
    criticita: number;
    attenzioni: number;
    patternRilevati: string[];
    motivazione: string;
  };
}

export interface FitAdjustment {
  reason: string;
  adjustment: number;
}

// Funzioni aziendali per fallback (compatibilità)
const FUNCTION_IDEAL_PROFILES: Record<string, {
  requiredTraits: string[];
  penaltyTraits: string[];
  baseMultiplier: number;
}> = {
  'Ufficio vendite': {
    requiredTraits: ['PA', 'SP', 'EC', 'MO', 'CF'],
    penaltyTraits: ['SC'], 
    baseMultiplier: 1.2,
  },
  'Direzione generale': {
    requiredTraits: ['QR', 'PA', 'MO', 'CF', 'SP', 'EC'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Amministrazione': {
    requiredTraits: ['EF', 'SC', 'QR'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio risorse umane': {
    requiredTraits: ['PA', 'CF', 'SV'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Produzione': {
    requiredTraits: ['EF', 'EC', 'SC'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Logistica': {
    requiredTraits: ['EF', 'EC', 'CF'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio marketing': {
    requiredTraits: ['PA', 'SP', 'EC'],
    penaltyTraits: ['SC'],
    baseMultiplier: 1.0,
  },
  'Ufficio tecnico': {
    requiredTraits: ['EF', 'EC'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio acquisti': {
    requiredTraits: ['EC', 'QR', 'EF'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
};

export function calculateFitScore(context: FitContext): FitResult {
  const { eta, ruolo_attuale, funzione, profilo } = context;
  const scalePunteggi = (profilo.scale_punteggi as Record<string, number>) || {};
  
  const adjustments: FitAdjustment[] = [];
  const alerts: string[] = [];
  
  // ============ NUOVO: Usa il sistema di matching V5 se disponibile ============
  if (funzione && ROLE_PROFILES[funzione]) {
    const matching = calculateRoleMatching(funzione, scalePunteggi);
    
    // Calcola score direttamente dalla compatibilità
    const baseScore = matching.compatibilitaPct;
    
    // Applica aggiustamenti per età in ruoli specifici
    let ageAdjustment = 0;
    if (eta && eta > 55 && funzione === 'Ufficio vendite') {
      const sc = scalePunteggi['SC'] || 100;
      if (sc > 150) {
        ageAdjustment = -10;
        adjustments.push({ 
          reason: 'Alta rigidità con età avanzata in ruolo commerciale', 
          adjustment: -10 
        });
        alerts.push('Profilo potenzialmente incompatibile con modelli di vendita strutturati.');
      }
    }
    
    // Pattern critici come alert
    matching.patternRilevati.forEach(pattern => {
      if (pattern.includes('🔴')) {
        alerts.push(pattern.replace('🔴 ', ''));
      }
    });
    
    // Score finale con cap
    const finalScore = Math.max(0, Math.min(100, baseScore + ageAdjustment));
    
    return {
      baseScore,
      adjustments,
      finalScore,
      verdict: matching.verdict,
      alerts,
      dettaglioMatching: {
        requisitiSoddisfatti: matching.requisitiSoddisfatti.length,
        requisitiTotali: matching.requisitiSoddisfatti.length + matching.requisitiMancanti.length,
        criticita: matching.criticita,
        attenzioni: matching.attenzioni,
        patternRilevati: matching.patternRilevati,
        motivazione: matching.motivazione,
      }
    };
  }
  
  // ============ FALLBACK: Logica originale per funzioni non mappate ============
  
  // 1. Calcola score base dalla media delle scale principali
  const mainScales = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA'];
  const scaleValues = mainScales.map(s => scalePunteggi[s] || 100);
  const avgScore = scaleValues.reduce((a, b) => a + b, 0) / scaleValues.length;
  
  // Normalizza a 0-100
  let baseScore = Math.round(((avgScore - 50) / 150) * 100);
  baseScore = Math.max(0, Math.min(100, baseScore));
  
  // 2. Bonus/Penalità per funzione specifica
  if (funzione && FUNCTION_IDEAL_PROFILES[funzione]) {
    const profile = FUNCTION_IDEAL_PROFILES[funzione];
    
    const requiredAvg = profile.requiredTraits
      .map(t => scalePunteggi[t] || 100)
      .reduce((a, b) => a + b, 0) / profile.requiredTraits.length;
    
    if (requiredAvg > 140) {
      const bonus = Math.round((requiredAvg - 140) / 6);
      adjustments.push({ reason: `Eccellenza nelle competenze chiave per ${funzione}`, adjustment: bonus });
    } else if (requiredAvg < 100) {
      const penalty = -Math.round((100 - requiredAvg) / 5);
      adjustments.push({ reason: `Competenze chiave sotto la media per ${funzione}`, adjustment: penalty });
    }
  }
  
  // 3. Correzione età + ruolo vendite
  if (eta && eta > 55 && (funzione === 'Ufficio vendite' || ruolo_attuale?.toLowerCase().includes('vendite'))) {
    const schematicita = scalePunteggi['SC'] || 100;
    const capFronteggiare = scalePunteggi['CF'] || 100;
    
    if (schematicita > 150) {
      adjustments.push({ reason: 'Alta rigidità con età avanzata in ruolo commerciale', adjustment: -15 });
      alerts.push('Profilo potenzialmente incompatibile con modelli di vendita strutturati. Resistenza al cambiamento elevata.');
    }
    
    if (capFronteggiare < 100) {
      adjustments.push({ reason: 'Vulnerabilità allo stress in ruolo commerciale senior', adjustment: -10 });
    }
  }
  
  // 4. Pattern critico V5: Motore a vuoto
  const mo = scalePunteggi['MO'] || 100;
  const sp = scalePunteggi['SP'] || 100;
  if (mo > 140 && sp < 100 && funzione === 'Ufficio vendite') {
    adjustments.push({ reason: 'Motore a vuoto: alta motivazione senza obiettivi (pericoloso per vendita)', adjustment: -20 });
    alerts.push('MOTORE A VUOTO: Alta Motivazione ma Bassa Ambizione. Sembra motivato ma non produce risultati concreti.');
  }
  
  // 5. Correzione amministrativo troppo rigido
  if (funzione === 'Amministrazione') {
    const schematicita = scalePunteggi['SC'] || 100;
    const efficacia = scalePunteggi['EC'] || 100;
    
    if (schematicita > 160 && efficacia < 100) {
      alerts.push('Ottimo per ruoli procedurali. Rischio blocco operativo su imprevisti e eccezioni.');
    }
  }
  
  // 6. Stress zone penalty
  if (profilo.stress_zone) {
    adjustments.push({ reason: 'Zona stress attiva - difficoltà potenziale sotto pressione', adjustment: -15 });
    alerts.push('Candidato in zona stress. Valutare attentamente il contesto lavorativo.');
  }
  
  // 7. Out points penalty
  const outPoints = (profilo.out_points as string[]) || [];
  if (outPoints.length > 2) {
    const penalty = -5 * (outPoints.length - 2);
    adjustments.push({ reason: `${outPoints.length} aree critiche rilevate`, adjustment: penalty });
  }
  
  // 8. Strength points bonus
  const strengthPoints = (profilo.strength_points as string[]) || [];
  if (strengthPoints.length >= 3) {
    const bonus = 5 * Math.min(strengthPoints.length - 2, 3);
    adjustments.push({ reason: `${strengthPoints.length} aree di eccellenza`, adjustment: bonus });
  }
  
  // Calcola score finale
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
  const finalScore = Math.max(0, Math.min(100, baseScore + totalAdjustment));
  
  // ============ DETERMINA VERDETTO CON 4 LIVELLI V5 ============
  // Conta criticità basandosi su pattern e out points
  const criticalPatterns = alerts.filter(a => 
    a.includes('MOTORE A VUOTO') || 
    a.includes('STRESS ZONE CRITICA') ||
    a.includes('RIGIDITÀ FRAGILE')
  ).length;
  
  const criticita = criticalPatterns + (outPoints.length > 3 ? 1 : 0);
  const attenzioni = alerts.length - criticalPatterns;
  
  let verdict: FitVerdict;
  if (criticita >= 2 || finalScore < 35) {
    verdict = 'NON_IDONEO';
  } else if (criticita === 1 || (finalScore >= 35 && finalScore < 50)) {
    verdict = 'DA_VALUTARE';
  } else if (attenzioni > 0 || (finalScore >= 50 && finalScore < 70)) {
    verdict = 'IDONEO_CON_RISERVA';
  } else {
    verdict = 'IDONEO';
  }
  
  return {
    baseScore,
    adjustments,
    finalScore,
    verdict,
    alerts,
    dettaglioMatching: {
      requisitiSoddisfatti: 0,
      requisitiTotali: 0,
      criticita,
      attenzioni,
      patternRilevati: [],
      motivazione: generateMotivation(verdict, criticita, attenzioni, alerts),
    }
  };
}

function generateMotivation(
  verdict: FitVerdict, 
  criticita: number, 
  attenzioni: number,
  alerts: string[]
): string {
  switch (verdict) {
    case 'IDONEO':
      return 'Profilo compatibile con il ruolo. Tutti i requisiti essenziali sono soddisfatti senza aree critiche.';
    case 'IDONEO_CON_RISERVA':
      return `Profilo sostanzialmente compatibile con ${attenzioni} area/e di attenzione da monitorare.`;
    case 'DA_VALUTARE':
      return `Profilo con ${criticita} criticità significativa che richiede approfondimento in sede di colloquio.`;
    case 'NON_IDONEO':
      return `Profilo non compatibile: ${criticita} criticità rilevate. ${alerts[0] || ''}`;
  }
}

// ============ HELPER FUNCTIONS AGGIORNATE PER 4 VERDETTI ============

export function getVerdictLabel(verdict: FitVerdict): string {
  const labels: Record<FitVerdict, string> = {
    'NON_IDONEO': 'Non Idoneo',
    'DA_VALUTARE': 'Da Valutare',
    'IDONEO_CON_RISERVA': 'Idoneo con Riserva',
    'IDONEO': 'Idoneo',
  };
  return labels[verdict];
}

export function getVerdictColor(verdict: FitVerdict): string {
  const colors: Record<FitVerdict, string> = {
    'NON_IDONEO': 'destructive',
    'DA_VALUTARE': 'warning',
    'IDONEO_CON_RISERVA': 'secondary',
    'IDONEO': 'success',
  };
  return colors[verdict];
}

export function getVerdictBgColor(verdict: FitVerdict): string {
  const colors: Record<FitVerdict, string> = {
    'NON_IDONEO': 'bg-red-100 border-red-500 text-red-700',
    'DA_VALUTARE': 'bg-amber-100 border-amber-500 text-amber-700',
    'IDONEO_CON_RISERVA': 'bg-blue-100 border-blue-500 text-blue-700',
    'IDONEO': 'bg-green-100 border-green-500 text-green-700',
  };
  return colors[verdict];
}

export function getVerdictIcon(verdict: FitVerdict): 'XCircle' | 'AlertCircle' | 'AlertTriangle' | 'CheckCircle2' {
  const icons: Record<FitVerdict, 'XCircle' | 'AlertCircle' | 'AlertTriangle' | 'CheckCircle2'> = {
    'NON_IDONEO': 'XCircle',
    'DA_VALUTARE': 'AlertCircle',
    'IDONEO_CON_RISERVA': 'AlertTriangle',
    'IDONEO': 'CheckCircle2',
  };
  return icons[verdict];
}

/**
 * Calcola la probabilità di successo a 12 mesi - DETERMINISTICO
 * 
 * Formula:
 * - Base = compatibilità ruolo %
 * - +5% se nessuna criticità
 * - +10% se profilo ideale per il ruolo
 * - -10% per ogni pattern critico
 * - -15% se stress zone attiva
 * - -10% se età > 55 + alta rigidità in vendite
 */
export function calculateSuccessProbability(context: {
  scalePunteggi: Record<string, number>;
  ruolo: string;
  eta?: number;
  stressZone?: boolean;
  profiloTipo?: ProfiloTipo;
}): number {
  const { scalePunteggi, ruolo, eta, stressZone, profiloTipo } = context;
  
  // Importa il matching
  const matching = calculateRoleMatching(ruolo, scalePunteggi);
  
  // Base = compatibilità
  let probability = matching.compatibilitaPct;
  
  // Bonus per assenza di criticità
  if (matching.criticita === 0) {
    probability += 5;
  }
  
  // Penalità per pattern critici
  const patternCritici = matching.patternRilevati.filter(p => 
    p.includes('🔴') || 
    p.includes('MOTORE A VUOTO') || 
    p.includes('STRESS ZONE CRITICA')
  );
  probability -= patternCritici.length * 10;
  
  // Penalità stress zone
  if (stressZone) {
    probability -= 15;
  }
  
  // Penalità età + rigidità in vendite
  if (eta && eta > 55 && ruolo === 'Ufficio vendite') {
    const sc = scalePunteggi['SC'] || 100;
    if (sc > 150) {
      probability -= 10;
    }
  }
  
  // Bonus per profili ideali nel ruolo (usa import dinamico per evitare circular)
  if (profiloTipo) {
    const idealRoles: Record<string, string[]> = {
      'LEADER_NATURALE': ['Direzione generale'],
      'COMMERCIALE_NATURALE': ['Ufficio vendite'],
      'ESECUTORE_AFFIDABILE': ['Amministrazione', 'Produzione'],
      'TECNICO_SPECIALISTA': ['Ufficio tecnico'],
      'AMMINISTRATIVO_METODICO': ['Amministrazione'],
      'CREATIVO_DESTABILIZZANTE': ['Ufficio marketing'],
      'PROFESSIONISTA_AUTONOMO': ['Ufficio tecnico', 'Ufficio acquisti'],
      'COLLABORATORE_CRESCITA': [],
      'SUPPORTO_OPERATIVO': ['Logistica', 'Produzione'],
      'IN_TRANSIZIONE': [],
    };
    
    if (idealRoles[profiloTipo]?.includes(ruolo)) {
      probability += 10;
    }
  }
  
  // Bonus/Malus per requisiti
  if (matching.requisitiMancanti.length === 0) {
    probability += 5;
  } else if (matching.requisitiMancanti.length >= 2) {
    probability -= 5;
  }
  
  // Cap tra 10 e 95
  return Math.max(10, Math.min(95, Math.round(probability)));
}

// Re-export FitVerdict per compatibilità
export type { FitVerdict } from './roleMatching';

// Import per TypeScript
import type { ProfiloTipo } from '@/types/database';
