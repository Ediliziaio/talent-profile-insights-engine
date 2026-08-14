/**
 * Fasi della selezione — un solo posto dove sono definite etichette, ordine
 * e colori, così lista, filtri, dashboard ed export non divergono.
 *
 * Il valore vive nella colonna `candidati.fase` (migration
 * 20260814130000_stato_selezione.sql). Finché la migration non è applicata,
 * la colonna non esiste: `faseDi()` risponde 'nuovo' e la pagina funziona
 * comunque.
 */

export type Fase = 'nuovo' | 'contattato' | 'colloquio' | 'assunto' | 'scartato';

export const FASI: { valore: Fase; label: string; descrizione: string; classe: string }[] = [
  {
    valore: 'nuovo',
    label: 'Da sentire',
    descrizione: 'Inserito, non l’hai ancora sentito.',
    classe: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  {
    valore: 'contattato',
    label: 'Sentito',
    descrizione: 'L’hai sentito, aspetti di incontrarlo.',
    classe: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    valore: 'colloquio',
    label: 'Colloquio',
    descrizione: 'Colloquio fissato o già fatto.',
    classe: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    valore: 'assunto',
    label: 'Assunto',
    descrizione: 'È entrato in azienda.',
    classe: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    valore: 'scartato',
    label: 'Scartato',
    descrizione: 'Non va avanti.',
    classe: 'bg-red-100 text-red-800 border-red-200',
  },
];

const PER_VALORE = new Map(FASI.map((f) => [f.valore, f]));

export function faseInfo(fase: Fase) {
  return PER_VALORE.get(fase) ?? FASI[0];
}

/** Legge la fase da una riga candidato, tollerando la colonna assente. */
export function faseDi(riga: unknown): Fase {
  const v = (riga as { fase?: unknown } | null)?.fase;
  return typeof v === 'string' && PER_VALORE.has(v as Fase) ? (v as Fase) : 'nuovo';
}

/** Motivi di scarto ricorrenti, per non costringere a scrivere ogni volta. */
export const MOTIVI_SCARTO = [
  'Non ha risposto',
  'Ha rifiutato la proposta',
  'Chiedeva troppo di stipendio',
  'Troppo lontano',
  'Non aveva l’esperienza dichiarata',
  'Non convinto al colloquio',
  'Ha accettato altrove',
];
