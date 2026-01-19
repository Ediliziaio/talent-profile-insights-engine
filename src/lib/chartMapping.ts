// Mappatura dalle scale del test alle macro-aree del grafico a candele
import { ScalaCode, SCALE_LABELS } from '@/types/database';

export interface MacroArea {
  id: string;
  label: string;
  description: string;
  scaleSource: ScalaCode[];
  tooltipPositive: string;
  tooltipNegative: string;
}

export const MACRO_AREAS: MacroArea[] = [
  {
    id: 'organizzazione',
    label: 'Organizzazione',
    description: 'Capacità di strutturare il lavoro e mantenere ordine',
    scaleSource: ['SV', 'SC'],
    tooltipPositive: 'Eccellente capacità organizzativa. Sa strutturare il lavoro efficacemente.',
    tooltipNegative: 'Difficoltà nella gestione organizzativa. Tende al disordine operativo.',
  },
  {
    id: 'motivazione',
    label: 'Motivazione',
    description: 'Spinta interiore e determinazione nel raggiungere obiettivi',
    scaleSource: ['MO'],
    tooltipPositive: 'Altamente motivato e determinato. Persegue gli obiettivi con costanza.',
    tooltipNegative: 'Bassa motivazione intrinseca. Fatica a mantenere la spinta nel tempo.',
  },
  {
    id: 'stress',
    label: 'Gestione Stress',
    description: 'Capacità di gestire la pressione e le situazioni difficili',
    scaleSource: ['CF'],
    tooltipPositive: 'Eccellente gestione dello stress. Rimane lucido sotto pressione.',
    tooltipNegative: 'Vulnerabilità allo stress. Rischio di calo prestazionale sotto pressione.',
  },
  {
    id: 'autodisciplina',
    label: 'Autodisciplina',
    description: 'Controllo di sé e rispetto delle regole',
    scaleSource: ['EF'],
    tooltipPositive: 'Forte autodisciplina. Rispetta scadenze e procedure autonomamente.',
    tooltipNegative: 'Scarsa autodisciplina. Necessita supervisione costante.',
  },
  {
    id: 'determinazione',
    label: 'Determinazione',
    description: 'Capacità di portare a termine gli obiettivi',
    scaleSource: ['EC'],
    tooltipPositive: 'Altamente determinato. Non si arrende di fronte agli ostacoli.',
    tooltipNegative: 'Tendenza ad abbandonare quando le cose si complicano.',
  },
  {
    id: 'attitudine_vendita',
    label: 'Attitudine Vendita',
    description: 'Propensione alla persuasione e al contatto commerciale',
    scaleSource: ['PA', 'SP'],
    tooltipPositive: 'Naturale predisposizione commerciale. Ottimo nel convincere e negoziare.',
    tooltipNegative: 'Scarsa attitudine commerciale. Difficoltà nella persuasione.',
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Capacità di guidare e influenzare gli altri',
    scaleSource: ['QR', 'PA'],
    tooltipPositive: 'Forte leadership naturale. Sa guidare e ispirare il team.',
    tooltipNegative: 'Tendenza a seguire piuttosto che guidare.',
  },
  {
    id: 'produttivita',
    label: 'Produttività',
    description: 'Efficienza nel completare le attività',
    scaleSource: ['QN', 'EF'],
    tooltipPositive: 'Altamente produttivo. Ottimizza tempo e risorse.',
    tooltipNegative: 'Produttività sotto la media. Rischio di rallentamenti operativi.',
  },
  {
    id: 'empatia',
    label: 'Empatia',
    description: 'Capacità di comprendere e connettersi con gli altri',
    scaleSource: ['SP'],
    tooltipPositive: 'Elevata empatia. Costruisce relazioni autentiche.',
    tooltipNegative: 'Difficoltà nella connessione emotiva con colleghi e clienti.',
  },
  {
    id: 'espansivita',
    label: 'Espansività',
    description: 'Apertura verso nuove esperienze e persone',
    scaleSource: ['PA'],
    tooltipPositive: 'Persona aperta e socievole. Si integra facilmente nei team.',
    tooltipNegative: 'Tendenza all\'introversione. Può faticare nei ruoli di contatto.',
  },
];

// Calcola il valore di una macro-area dai punteggi delle scale
export function calculateMacroAreaValue(
  macroArea: MacroArea,
  scalePunteggi: Record<string, number>
): number {
  const values = macroArea.scaleSource
    .map(scale => scalePunteggi[scale])
    .filter(v => v !== undefined);
  
  if (values.length === 0) return 100; // Default neutro
  
  // Media delle scale coinvolte, normalizzata a -100/+100
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg - 100; // Converte da 0-200 a -100/+100
}

// Genera i dati per il grafico a candele
export interface CandleData {
  id: string;
  label: string;
  value: number; // -100 a +100
  isPositive: boolean;
  tooltipText: string;
  description: string;
}

export function generateCandleChartData(
  scalePunteggi: Record<string, number>
): CandleData[] {
  return MACRO_AREAS.map(area => {
    const value = calculateMacroAreaValue(area, scalePunteggi);
    const isPositive = value >= 0;
    
    return {
      id: area.id,
      label: area.label,
      value,
      isPositive,
      tooltipText: isPositive ? area.tooltipPositive : area.tooltipNegative,
      description: area.description,
    };
  });
}

// Colori per il grafico
export const CANDLE_COLORS = {
  positive: 'hsl(var(--primary))', // Blu
  negative: 'hsl(var(--accent))', // Arancione
  neutral: 'hsl(var(--muted-foreground))',
};
