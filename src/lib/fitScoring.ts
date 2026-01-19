// Logica di calcolo fit score con correzioni contestuali
import { ProfiloCandidato } from '@/types/database';

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
  verdict: 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';
  alerts: string[];
}

export interface FitAdjustment {
  reason: string;
  adjustment: number;
}

// Funzioni aziendali mappate a ruoli ideali
const FUNCTION_IDEAL_PROFILES: Record<string, {
  requiredTraits: string[];
  penaltyTraits: string[];
  baseMultiplier: number;
}> = {
  'Ufficio vendite': {
    requiredTraits: ['PA', 'SP', 'EC'],
    penaltyTraits: ['SC'], // Alta schematicità può essere un problema
    baseMultiplier: 1.2,
  },
  'Direzione generale': {
    requiredTraits: ['QR', 'PA', 'MO', 'CF'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Amministrazione': {
    requiredTraits: ['SC', 'EF', 'SV'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio risorse umane': {
    requiredTraits: ['SP', 'CF', 'PA'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Produzione': {
    requiredTraits: ['EF', 'EC', 'QN'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Logistica': {
    requiredTraits: ['EF', 'QN', 'SV'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio marketing': {
    requiredTraits: ['PA', 'MO', 'EC'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio tecnico': {
    requiredTraits: ['EF', 'SC', 'EC'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
  'Ufficio acquisti': {
    requiredTraits: ['EC', 'CF', 'SC'],
    penaltyTraits: [],
    baseMultiplier: 1.0,
  },
};

export function calculateFitScore(context: FitContext): FitResult {
  const { eta, ruolo_attuale, funzione, profilo } = context;
  const scalePunteggi = profilo.scale_punteggi || {};
  
  const adjustments: FitAdjustment[] = [];
  const alerts: string[] = [];
  
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
    
    // Bonus per trait richiesti alti
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
  
  // 4. Correzione amministrativo troppo rigido
  if (funzione === 'Amministrazione') {
    const schematicita = scalePunteggi['SC'] || 100;
    const efficacia = scalePunteggi['EC'] || 100;
    
    if (schematicita > 160 && efficacia < 100) {
      alerts.push('Ottimo per ruoli procedurali. Rischio blocco operativo su imprevisti e eccezioni.');
    }
  }
  
  // 5. Stress zone penalty
  if (profilo.stress_zone) {
    adjustments.push({ reason: 'Zona stress attiva - difficoltà potenziale sotto pressione', adjustment: -15 });
    alerts.push('Candidato in zona stress. Valutare attentamente il contesto lavorativo.');
  }
  
  // 6. Out points penalty
  if (profilo.out_points && profilo.out_points.length > 2) {
    const penalty = -5 * (profilo.out_points.length - 2);
    adjustments.push({ reason: `${profilo.out_points.length} aree critiche rilevate`, adjustment: penalty });
  }
  
  // 7. Strength points bonus
  if (profilo.strength_points && profilo.strength_points.length >= 3) {
    const bonus = 5 * Math.min(profilo.strength_points.length - 2, 3);
    adjustments.push({ reason: `${profilo.strength_points.length} aree di eccellenza`, adjustment: bonus });
  }
  
  // Calcola score finale
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.adjustment, 0);
  const finalScore = Math.max(0, Math.min(100, baseScore + totalAdjustment));
  
  // Determina verdict
  let verdict: 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';
  if (finalScore < 40) {
    verdict = 'NON_IDONEO';
  } else if (finalScore < 65) {
    verdict = 'VALUTARE';
  } else {
    verdict = 'IDONEO';
  }
  
  return {
    baseScore,
    adjustments,
    finalScore,
    verdict,
    alerts,
  };
}

export function getVerdictLabel(verdict: 'NON_IDONEO' | 'VALUTARE' | 'IDONEO'): string {
  const labels = {
    'NON_IDONEO': 'Non Idoneo',
    'VALUTARE': 'Da Valutare',
    'IDONEO': 'Idoneo',
  };
  return labels[verdict];
}

export function getVerdictColor(verdict: 'NON_IDONEO' | 'VALUTARE' | 'IDONEO'): string {
  const colors = {
    'NON_IDONEO': 'destructive',
    'VALUTARE': 'warning',
    'IDONEO': 'success',
  };
  return colors[verdict];
}
