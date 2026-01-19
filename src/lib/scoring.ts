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
  impatto_organizzativo_pct: number;  // Ex leadership_pct - QR+SP+PA
  solidita_personale_pct: number;      // Ex maturita_pct - SV+MO+CF
  capacita_produttiva_pct: number;     // Ex potenziale_pct - QN+EC+EF
  // Manteniamo i nomi vecchi per compatibilità DB
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
  
  // Calculate percentage indicators (Manuale V2 - nuove denominazioni)
  // IMPATTO ORGANIZZATIVO (ex Leadership): QR + SP + PA
  const impatto_organizzativo_pct = ((scale_punteggi['QR'] + scale_punteggi['SP'] + scale_punteggi['PA']) / 600) * 100;
  
  // SOLIDITÀ PERSONALE (ex Maturità): SV + MO + CF
  const solidita_personale_pct = ((scale_punteggi['SV'] + scale_punteggi['MO'] + scale_punteggi['CF']) / 600) * 100;
  
  // CAPACITÀ PRODUTTIVA (ex Potenziale): QN + EC + EF
  const capacita_produttiva_pct = ((scale_punteggi['QN'] + scale_punteggi['EC'] + scale_punteggi['EF']) / 600) * 100;
  
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
  
  // Determine profile type (nuova logica Manuale V2)
  const profilo_tipo = determinaProfiloTipo(scale_punteggi, stress_zone, out_points, strength_points);
  
  return {
    scale_punteggi,
    impatto_organizzativo_pct: Math.round(impatto_organizzativo_pct * 10) / 10,
    solidita_personale_pct: Math.round(solidita_personale_pct * 10) / 10,
    capacita_produttiva_pct: Math.round(capacita_produttiva_pct * 10) / 10,
    // Manteniamo compatibilità con i nomi del DB
    leadership_pct: Math.round(impatto_organizzativo_pct * 10) / 10,
    maturita_pct: Math.round(solidita_personale_pct * 10) / 10,
    potenziale_pct: Math.round(capacita_produttiva_pct * 10) / 10,
    schematicita,
    stress_zone,
    profilo_tipo,
    out_points,
    strength_points
  };
}

/**
 * Determina il profilo psicologico secondo il Manuale di Elaborazione V2
 * 10 Profili Professionali con logica deterministica
 */
function determinaProfiloTipo(
  scale: Record<string, number>,
  stressZone: boolean,
  outPoints: string[],
  strengthPoints: string[]
): ProfiloTipo {
  const sc = scale['SC'] || 100;
  const sv = scale['SV'] || 100;
  const mo = scale['MO'] || 100;
  const cf = scale['CF'] || 100;
  const ef = scale['EF'] || 100;
  const ec = scale['EC'] || 100;
  const qn = scale['QN'] || 100;
  const qr = scale['QR'] || 100;
  const sp = scale['SP'] || 100;
  const pa = scale['PA'] || 100;
  
  // PRIORITÀ 1: IN_TRANSIZIONE - Stress Zone attiva O >2 scale sotto 70
  const scaleCritiche = Object.entries(scale)
    .filter(([k, v]) => k !== 'SC' && v < 70)
    .length;
  
  if (stressZone || scaleCritiche > 2) {
    return 'IN_TRANSIZIONE';
  }
  
  // PRIORITÀ 2: LEADER_NATURALE
  // QR>140, PA>130, CF>120, SC 90-140 (equilibrato)
  if (qr > 140 && pa > 130 && cf > 120 && sc >= 90 && sc <= 140) {
    return 'LEADER_NATURALE';
  }
  
  // PRIORITÀ 3: COMMERCIALE_NATURALE
  // PA>150, SP>140, MO>130, CF>120, QR>100
  if (pa > 150 && sp > 140 && mo > 130 && cf > 120 && qr > 100) {
    return 'COMMERCIALE_NATURALE';
  }
  
  // PRIORITÀ 4: CREATIVO_DESTABILIZZANTE
  // SC<80 (molto flessibile), SP>140, MO>130, PA>130, EF<100 (poco efficiente)
  if (sc < 80 && sp > 140 && mo > 130 && pa > 130 && ef < 100) {
    return 'CREATIVO_DESTABILIZZANTE';
  }
  
  // PRIORITÀ 5: TECNICO_SPECIALISTA
  // SC>160 (molto rigido), EF>140, EC>130, PA<100 (poco relazionale)
  if (sc > 160 && ef > 140 && ec > 130 && pa < 100) {
    return 'TECNICO_SPECIALISTA';
  }
  
  // PRIORITÀ 6: AMMINISTRATIVO_METODICO
  // SC>130, EF>140, QN 90-120 (carico contenuto), EC>110
  if (sc > 130 && ef > 140 && qn >= 90 && qn <= 120 && ec > 110) {
    return 'AMMINISTRATIVO_METODICO';
  }
  
  // PRIORITÀ 7: ESECUTORE_AFFIDABILE
  // EF>140, EC>130, SC 100-150, QR<120 (non cerca leadership)
  if (ef > 140 && ec > 130 && sc >= 100 && sc <= 150 && qr < 120) {
    return 'ESECUTORE_AFFIDABILE';
  }
  
  // PRIORITÀ 8: PROFESSIONISTA_AUTONOMO
  // EC>140, EF>130, QN<100 (non vuole sovraccarico), SP>130
  if (ec > 140 && ef > 130 && qn < 100 && sp > 130) {
    return 'PROFESSIONISTA_AUTONOMO';
  }
  
  // PRIORITÀ 9: COLLABORATORE_CRESCITA
  // Punteggi medi (90-130) con almeno 1 strength point
  const mediaScale = (sv + mo + cf + ef + ec + qn + qr + sp + pa) / 9;
  if (mediaScale >= 90 && mediaScale <= 130 && strengthPoints.length >= 1) {
    return 'COLLABORATORE_CRESCITA';
  }
  
  // DEFAULT: SUPPORTO_OPERATIVO
  // Preferisce ruoli strutturati con supervisione
  return 'SUPPORTO_OPERATIVO';
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
  if (score < 60) return 'hsl(var(--chart-danger))';
  if (score < 80) return 'hsl(var(--chart-warning))';
  if (score > 160) return 'hsl(var(--chart-strength))';
  if (score > 140) return 'hsl(var(--chart-normal))';
  return 'hsl(var(--muted-foreground))';
}

export function getScoreColorClass(score: number): string {
  if (score < 60) return 'text-destructive';
  if (score < 80) return 'text-orange-500';
  if (score > 160) return 'text-green-600';
  if (score > 140) return 'text-blue-600';
  return 'text-muted-foreground';
}

export function getProfiloTipoLabel(tipo: ProfiloTipo): string {
  const labels: Record<ProfiloTipo, string> = {
    'LEADER_NATURALE': 'Leader Naturale',
    'ESECUTORE_AFFIDABILE': 'Esecutore Affidabile',
    'CREATIVO_DESTABILIZZANTE': 'Creativo',
    'TECNICO_SPECIALISTA': 'Tecnico Specialista',
    'COMMERCIALE_NATURALE': 'Commerciale Naturale',
    'AMMINISTRATIVO_METODICO': 'Amministrativo',
    'COLLABORATORE_CRESCITA': 'Collaboratore in Crescita',
    'PROFESSIONISTA_AUTONOMO': 'Professionista Autonomo',
    'SUPPORTO_OPERATIVO': 'Supporto Operativo',
    'IN_TRANSIZIONE': 'In Transizione'
  };
  return labels[tipo] || 'Non definito';
}

export function getProfiloTipoDescription(tipo: ProfiloTipo): string {
  const descriptions: Record<ProfiloTipo, string> = {
    'LEADER_NATURALE': 'Elevata propensione alla guida. Assume responsabilità con naturalezza e influenza positivamente il team.',
    'ESECUTORE_AFFIDABILE': 'Affidabile e metodico. Porta a termine i compiti con precisione e costanza.',
    'CREATIVO_DESTABILIZZANTE': 'Innovativo e non convenzionale. Genera idee ma può destabilizzare processi consolidati.',
    'TECNICO_SPECIALISTA': 'Competente e preciso. Eccelle in ambiti tecnici, meno nelle relazioni.',
    'COMMERCIALE_NATURALE': 'Naturalmente orientato alla vendita. Persuasivo e resiliente ai rifiuti.',
    'AMMINISTRATIVO_METODICO': 'Organizzato e procedurale. Ideale per ruoli di back-office e compliance.',
    'COLLABORATORE_CRESCITA': 'Potenziale in sviluppo. Con formazione adeguata può crescere in diversi ruoli.',
    'PROFESSIONISTA_AUTONOMO': 'Preferisce lavorare in autonomia. Efficace ma non adatto a team numerosi.',
    'SUPPORTO_OPERATIVO': 'Adatto a ruoli esecutivi con supervisione. Affidabile nelle mansioni definite.',
    'IN_TRANSIZIONE': 'Situazione di vulnerabilità. Richiede valutazione approfondita prima dell\'inserimento.'
  };
  return descriptions[tipo] || 'Profilo in valutazione';
}

/**
 * Zone di interpretazione per ogni punteggio (Manuale V2)
 */
export type ZonaInterpretazione = 'critica' | 'attenzione' | 'norma' | 'sopra_media' | 'eccellenza';

export function getZonaInterpretazione(score: number): {
  zona: ZonaInterpretazione;
  colore: string;
  classe: string;
  descrizione: string;
} {
  if (score < 60) return { 
    zona: 'critica', 
    colore: 'red', 
    classe: 'text-destructive bg-destructive/10',
    descrizione: 'Carenza grave' 
  };
  if (score < 80) return { 
    zona: 'attenzione', 
    colore: 'orange', 
    classe: 'text-orange-600 bg-orange-50',
    descrizione: 'Carenza moderata' 
  };
  if (score < 120) return { 
    zona: 'norma', 
    colore: 'gray', 
    classe: 'text-muted-foreground bg-muted/30',
    descrizione: 'Nella norma' 
  };
  if (score < 160) return { 
    zona: 'sopra_media', 
    colore: 'blue', 
    classe: 'text-blue-600 bg-blue-50',
    descrizione: 'Sopra la media' 
  };
  return { 
    zona: 'eccellenza', 
    colore: 'green', 
    classe: 'text-green-600 bg-green-50',
    descrizione: 'Eccellenza' 
  };
}
