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
  const profilo_tipo = determinaProfiloTipo(scale_punteggi, leadership_pct, stress_zone);
  
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

function determinaProfiloTipo(
  scale: Record<string, number>,
  leadership: number,
  stressZone: boolean
): ProfiloTipo {
  // LEADER: High across all areas
  if (
    leadership > 35 &&
    Object.values(scale).every(v => v >= 120) &&
    scale['QR'] >= 140 &&
    scale['PA'] >= 140
  ) {
    return 'LEADER';
  }
  
  // IN_TRANSIZIONE: Mixed pattern with stress
  if (stressZone || scale['SV'] < 100 && scale['CF'] < 100) {
    return 'IN_TRANSIZIONE';
  }
  
  // STRATEGIST: High Planning, Medium Action
  if (
    scale['SV'] > 140 &&
    scale['MO'] > 140 &&
    scale['EC'] > 130 &&
    scale['EF'] < 130 &&
    scale['SC'] > 130
  ) {
    return 'STRATEGIST';
  }
  
  // EXECUTOR: High Action, Lower Planning
  if (
    scale['EC'] > 150 &&
    scale['EF'] > 150 &&
    scale['SV'] < 120
  ) {
    return 'EXECUTOR';
  }
  
  // Default to EXECUTOR if no specific match
  return 'EXECUTOR';
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
    'EXECUTOR': 'Executor',
    'STRATEGIST': 'Strategist',
    'LEADER': 'Leader',
    'IN_TRANSIZIONE': 'In Transizione'
  };
  return labels[tipo];
}

export function getProfiloTipoDescription(tipo: ProfiloTipo): string {
  const descriptions: Record<ProfiloTipo, string> = {
    'EXECUTOR': 'Persona orientata all\'azione immediata, efficiente nell\'esecuzione. Ruoli ideali: Operations, Produzione, Vendite operative.',
    'STRATEGIST': 'Persona riflessiva che analizza prima di agire. Eccellente nella pianificazione. Ruoli ideali: Management, Consulenza, R&D.',
    'LEADER': 'Profilo equilibrato con capacità di visione e di esecuzione. Naturale propensione alla guida. Ruoli ideali: Direzione, Project Management.',
    'IN_TRANSIZIONE': 'Profilo che mostra segnali di difficoltà temporanea. Potenziale presente ma bloccato da fattori contingenti. Richiede approfondimento in colloquio.'
  };
  return descriptions[tipo];
}
