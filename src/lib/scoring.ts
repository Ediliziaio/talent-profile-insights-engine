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
  // Calcoliamo i punteggi medi per le diverse aree
  const avgResults = (scale['QR'] + scale['SP'] + scale['PA']) / 3;
  const avgPlanning = (scale['SV'] + scale['MO'] + scale['CF']) / 3;
  const avgAction = (scale['QN'] + scale['EC'] + scale['EF']) / 3;
  const schematicita = scale['SC'];
  
  // PRESTIGIO: Alto QR + PA alto + cerca esclusività
  if (scale['QR'] >= 150 && scale['PA'] >= 140 && schematicita >= 120 && avgResults > avgPlanning) {
    return 'PRESTIGIO';
  }
  
  // ORIGINALE: Alto EC + PA alto + bassa schematicità (innovativo)
  if (scale['EC'] >= 150 && scale['PA'] >= 130 && schematicita < 100 && scale['MO'] >= 130) {
    return 'ORIGINALE';
  }
  
  // ANALITICO: Alta schematicità + alto EF + metodico
  if (schematicita >= 150 && scale['EF'] >= 140 && scale['CF'] >= 130) {
    return 'ANALITICO';
  }
  
  // ESTETA: Alto SP + PA alto + attenzione immagine
  if (scale['SP'] >= 150 && scale['PA'] >= 140 && scale['QR'] >= 120) {
    return 'ESTETA';
  }
  
  // CONSERVATORE: Alto EF + schematicità alta + QR alto (prudente strategico)
  if (scale['EF'] >= 140 && schematicita >= 130 && scale['QR'] >= 130 && scale['MO'] >= 120) {
    return 'CONSERVATORE';
  }
  
  // AFFETTO: PA altissimo + MO alto + orientato alle relazioni
  if (scale['PA'] >= 160 && scale['MO'] >= 140 && scale['CF'] >= 120) {
    return 'AFFETTO';
  }
  
  // SICUREZZA: SV basso + CF basso (zona stress) - cerca rassicurazioni
  if (stressZone || (scale['SV'] < 100 && scale['CF'] < 100)) {
    return 'SICUREZZA';
  }
  
  // COMODITA: EF medio + QN basso + delega (vuole soluzioni semplici)
  if (scale['QN'] < 100 && scale['EF'] >= 100 && scale['EF'] < 140) {
    return 'COMODITA';
  }
  
  // SVAGO: SP alto + equilibrio vita-lavoro
  if (scale['SP'] >= 140 && scale['SV'] >= 120 && avgAction < avgPlanning) {
    return 'SVAGO';
  }
  
  // RISPARMIO: Tutti i punteggi medio-bassi, orientato al budget
  const avgAll = (avgResults + avgPlanning + avgAction) / 3;
  if (avgAll < 110) {
    return 'RISPARMIO';
  }
  
  // Default: determina in base al pattern dominante
  if (avgResults > avgPlanning && avgResults > avgAction) {
    return 'PRESTIGIO'; // Orientato ai risultati
  } else if (avgPlanning > avgAction) {
    return 'CONSERVATORE'; // Orientato alla pianificazione
  } else {
    return 'ORIGINALE'; // Orientato all'azione/innovazione
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
  return labels[tipo];
}

export function getProfiloTipoDescription(tipo: ProfiloTipo): string {
  const descriptions: Record<ProfiloTipo, string> = {
    'PRESTIGIO': 'Cerca esclusività e status. Vuole sentirsi unico e privilegiato. Ruoli ideali: Direzione, Account Manager VIP, Rappresentanza.',
    'ORIGINALE': 'Innovativo e pioniere. Vuole essere il primo e anticipare le tendenze. Ruoli ideali: R&D, Product Development, Marketing.',
    'ANALITICO': 'Razionale e metodico. Basa tutto su dati e logica. Ruoli ideali: Controller, Analista, Quality Assurance.',
    'ESTETA': 'Attento all\'estetica e all\'immagine. Cerca armonia e design. Ruoli ideali: Marketing, Comunicazione, Customer Experience.',
    'CONSERVATORE': 'Prudente e strategico. Cerca valore duraturo e sicurezza. Ruoli ideali: Amministrazione, Finanza, Operations.',
    'AFFETTO': 'Relazionale e empatico. Cerca armonia e approvazione. Ruoli ideali: HR, Customer Care, Team Leader.',
    'SICUREZZA': 'Cerca stabilità e rassicurazioni. Preferisce procedure chiare. Ruoli ideali: Compliance, Back Office, Controllo Qualità.',
    'COMODITA': 'Cerca soluzioni semplici e immediate. Delega volentieri. Ruoli ideali: Management, Direzione Commerciale.',
    'SVAGO': 'Cerca equilibrio vita-lavoro. Valorizza la flessibilità. Ruoli ideali: Consulenza, Ruoli creativi, Marketing.',
    'RISPARMIO': 'Orientato al costo e al budget. Cerca ottimizzazione. Ruoli ideali: Acquisti, Procurement, Cost Controller.'
  };
  return descriptions[tipo];
}
