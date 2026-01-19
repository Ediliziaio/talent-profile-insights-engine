import { DOMANDE } from '@/data/questionario';
import { ProfiloTipo, ScalaCode, SCALE_LABELS } from '@/types/database';

export interface RispostaInput {
  domanda_id: number;
  valore: 'A' | 'B' | 'C';
}

export interface ScalaPunteggio {
  scala: ScalaCode;
  label: string;
  punteggio: number;
}

export interface ProfiloCalcolato {
  scale_punteggi: Record<string, number>;
  leadership_pct: number;
  maturita_pct: number;
  potenziale_pct: number;
  schematicita: number;
  stress_zone: boolean;
  profilo_tipo: ProfiloTipo;
  out_points: string[];
  strength_points: string[];
}

// Main scale codes (excluding ST and LE which are sub-scales)
const MAIN_SCALE_CODES: ScalaCode[] = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA', 'SC'];

export function calcolaPunteggio(risposte: RispostaInput[], scala: ScalaCode): number {
  const domandeScala = DOMANDE.filter(d => d.scala_primaria === scala);
  
  let punteggio = 100;
  
  for (const domanda of domandeScala) {
    const risposta = risposte.find(r => r.domanda_id === domanda.id);
    if (!risposta) continue;
    
    if (domanda.polarita === '+') {
      if (risposta.valore === 'A') punteggio += 10;
      else if (risposta.valore === 'B') punteggio += 5;
      // C = 0
    } else {
      // Polarità negativa
      if (risposta.valore === 'A') punteggio -= 10;
      else if (risposta.valore === 'B') punteggio -= 5;
      // C = 0
    }
  }
  
  // Normalize to 0-200 range
  return Math.max(0, Math.min(200, punteggio));
}

export function calcolaProfilo(risposte: RispostaInput[]): ProfiloCalcolato {
  // Calculate all scale scores
  const scale_punteggi: Record<string, number> = {};
  
  for (const scala of MAIN_SCALE_CODES) {
    scale_punteggi[scala] = calcolaPunteggio(risposte, scala);
  }
  
  // Calculate percentage indicators
  // Leadership % (Area Risultati): Qualità Resp + Spazio Vitale + Partecipazione
  const leadership_pct = ((scale_punteggi['QR'] + scale_punteggi['SP'] + scale_punteggi['PA']) / 600) * 100;
  
  // Maturità % (Area Pianificazione): Stile Vita + Motivazione + Cap. Fronteggiare
  const maturita_pct = ((scale_punteggi['SV'] + scale_punteggi['MO'] + scale_punteggi['CF']) / 600) * 100;
  
  // Potenziale % (Area Azione): Quantità Resp + Efficacia + Efficienza
  const potenziale_pct = ((scale_punteggi['QN'] + scale_punteggi['EC'] + scale_punteggi['EF']) / 600) * 100;
  
  // Schematicità
  const schematicita = scale_punteggi['SC'];
  
  // Stress Zone: Stile Vita < 100 AND Cap. Fronteggiare < 100
  const stress_zone = scale_punteggi['SV'] < 100 && scale_punteggi['CF'] < 100;
  
  // Out Points: scores < 80 (excluding schematicità)
  const out_points: string[] = [];
  for (const [scala, punteggio] of Object.entries(scale_punteggi)) {
    if (scala !== 'SC' && punteggio < 80) {
      out_points.push(SCALE_LABELS[scala as ScalaCode]);
    }
  }
  
  // Strength Points: scores > 160 (excluding schematicità)
  const strength_points: string[] = [];
  for (const [scala, punteggio] of Object.entries(scale_punteggi)) {
    if (scala !== 'SC' && punteggio > 160) {
      strength_points.push(SCALE_LABELS[scala as ScalaCode]);
    }
  }
  
  // Determine profile type
  const profilo_tipo = determinaProfiloTipo(scale_punteggi, stress_zone, out_points, strength_points);
  
  return {
    scale_punteggi,
    leadership_pct: Math.round(leadership_pct * 10) / 10,
    maturita_pct: Math.round(maturita_pct * 10) / 10,
    potenziale_pct: Math.round(potenziale_pct * 10) / 10,
    schematicita,
    stress_zone,
    profilo_tipo,
    out_points,
    strength_points
  };
}

/**
 * Determina il profilo psicologico in base ai DATI REALI del candidato.
 * La logica segue pattern psicologici coerenti con i punteggi.
 */
function determinaProfiloTipo(
  scale: Record<string, number>,
  stressZone: boolean,
  outPoints: string[],
  strengthPoints: string[]
): ProfiloTipo {
  const schematicita = scale['SC'] || 100;
  
  // PRIORITÀ 1: SICUREZZA - Zona stress attiva (vulnerabilità evidente)
  // Persona con SV e CF bassi mostra segni di difficoltà, cerca protezione
  if (stressZone) {
    return 'SICUREZZA';
  }
  
  // PRIORITÀ 2: SICUREZZA - Molte aree critiche (OUT POINTS >= 3)
  // Persona con molte fragilità cerca stabilità e rassicurazioni
  if (outPoints.length >= 3) {
    return 'SICUREZZA';
  }
  
  // PRIORITÀ 3: ANALITICO - Alta schematicità + Efficienza alta
  // Persona rigida, metodica, razionale che procede per logica
  if (schematicita >= 150 && scale['EF'] >= 140) {
    return 'ANALITICO';
  }
  
  // PRIORITÀ 4: PRESTIGIO - Leadership forte con alta partecipazione
  // Persona che vuole emergere, essere riconosciuta come leader
  if (scale['QR'] >= 150 && scale['PA'] >= 140 && scale['SP'] >= 130) {
    return 'PRESTIGIO';
  }
  
  // PRIORITÀ 5: ORIGINALE - Alta efficacia con bassa schematicità (innovativo)
  // Persona che cerca novità, non segue schemi, vuole essere il primo
  if (scale['EC'] >= 150 && schematicita < 100 && scale['MO'] >= 130) {
    return 'ORIGINALE';
  }
  
  // PRIORITÀ 6: AFFETTO - Alta partecipazione e motivazione relazionale
  // Persona orientata alle relazioni, cerca approvazione
  if (scale['PA'] >= 160 && scale['MO'] >= 140 && scale['CF'] >= 120) {
    return 'AFFETTO';
  }
  
  // PRIORITÀ 7: ESTETA - Alto spazio personale con attenzione all'immagine
  // Persona attenta all'estetica e alla presentazione
  if (scale['SP'] >= 150 && scale['PA'] >= 140 && scale['QR'] >= 120) {
    return 'ESTETA';
  }
  
  // PRIORITÀ 8: CONSERVATORE - Efficienza alta con schematicità e prudenza
  // Persona strategica che valuta il lungo termine
  if (scale['EF'] >= 140 && schematicita >= 130 && scale['MO'] >= 120) {
    return 'CONSERVATORE';
  }
  
  // PRIORITÀ 9: COMODITÀ - Quantità responsabilità bassa, delega
  // Persona che cerca soluzioni semplici, evita complicazioni
  if (scale['QN'] < 100 && scale['QR'] < 110) {
    return 'COMODITA';
  }
  
  // PRIORITÀ 10: SVAGO - Buon equilibrio vita-lavoro
  // Persona che cerca flessibilità e work-life balance
  if (scale['SP'] >= 130 && scale['SV'] >= 120 && scale['CF'] >= 110) {
    return 'SVAGO';
  }
  
  // PRIORITÀ 11: RISPARMIO - Punteggi generalmente bassi
  // Persona orientata all'ottimizzazione e ai costi
  const avgAllScales = Object.entries(scale)
    .filter(([k]) => k !== 'SC')
    .reduce((sum, [, v]) => sum + v, 0) / 9;
  
  if (avgAllScales < 105 && outPoints.length >= 2) {
    return 'RISPARMIO';
  }
  
  // DEFAULT: Determina in base al pattern dominante delle aree
  const avgRisultati = (scale['QR'] + scale['SP'] + scale['PA']) / 3;
  const avgPianificazione = (scale['SV'] + scale['MO'] + scale['CF']) / 3;
  const avgAzione = (scale['QN'] + scale['EC'] + scale['EF']) / 3;
  
  // Se ha punti di forza, usa quelli per determinare il profilo
  if (strengthPoints.length > 0) {
    if (strengthPoints.some(p => p.includes('Qualità') || p.includes('Leadership'))) {
      return 'PRESTIGIO';
    }
    if (strengthPoints.some(p => p.includes('Efficacia'))) {
      return avgRisultati > avgPianificazione ? 'ORIGINALE' : 'CONSERVATORE';
    }
    if (strengthPoints.some(p => p.includes('Partecipazione'))) {
      return 'AFFETTO';
    }
  }
  
  // Pattern finale basato sulle aree dominanti
  if (avgRisultati > avgPianificazione && avgRisultati > avgAzione) {
    return schematicita > 120 ? 'ESTETA' : 'PRESTIGIO';
  } else if (avgPianificazione > avgAzione) {
    return schematicita > 120 ? 'CONSERVATORE' : 'AFFETTO';
  } else {
    return schematicita < 100 ? 'ORIGINALE' : 'ANALITICO';
  }
}

export function getScaleForRadarChart(punteggi: Record<string, number>): ScalaPunteggio[] {
  const orderedScales: ScalaCode[] = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA'];
  
  return orderedScales.map(scala => ({
    scala,
    label: SCALE_LABELS[scala],
    punteggio: punteggi[scala] || 100
  }));
}

export function getScoreColor(score: number): string {
  if (score < 80) return 'hsl(var(--chart-danger))';
  if (score > 160) return 'hsl(var(--chart-strength))';
  if (score < 120) return 'hsl(var(--chart-warning))';
  return 'hsl(var(--chart-normal))';
}

export function getScoreColorClass(score: number): string {
  if (score < 80) return 'text-destructive';
  if (score > 160) return 'text-success';
  if (score < 120) return 'text-warning';
  return 'text-primary';
}

export function getProfiloTipoLabel(tipo: ProfiloTipo): string {
  const labels: Record<ProfiloTipo, string> = {
    'PRESTIGIO': 'Prestigio',
    'ORIGINALE': 'Originale',
    'ANALITICO': 'Analitico',
    'ESTETA': 'Esteta',
    'CONSERVATORE': 'Conservatore',
    'AFFETTO': 'Affetto',
    'SICUREZZA': 'Sicurezza',
    'COMODITA': 'Comodità',
    'SVAGO': 'Svago',
    'RISPARMIO': 'Risparmio'
  };
  return labels[tipo] || 'Non definito';
}

export function getProfiloTipoDescription(tipo: ProfiloTipo): string {
  const descriptions: Record<ProfiloTipo, string> = {
    'PRESTIGIO': 'Cerca esclusività e status. Vuole sentirsi unico e privilegiato.',
    'ORIGINALE': 'Innovativo e pioniere. Vuole essere il primo e anticipare le tendenze.',
    'ANALITICO': 'Razionale e metodico. Basa tutto su dati e logica.',
    'ESTETA': 'Attento all\'estetica e all\'immagine. Cerca armonia e design.',
    'CONSERVATORE': 'Prudente e strategico. Cerca valore duraturo e sicurezza.',
    'AFFETTO': 'Relazionale e empatico. Cerca armonia e approvazione.',
    'SICUREZZA': 'Cerca stabilità e rassicurazioni. In un momento di vulnerabilità.',
    'COMODITA': 'Cerca soluzioni semplici e immediate. Delega volentieri.',
    'SVAGO': 'Cerca equilibrio vita-lavoro. Valorizza la flessibilità.',
    'RISPARMIO': 'Orientato al costo e al budget. Cerca ottimizzazione.'
  };
  return descriptions[tipo] || 'Profilo in valutazione';
}
