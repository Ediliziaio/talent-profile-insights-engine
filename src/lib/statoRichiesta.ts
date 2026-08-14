/**
 * Stati di una richiesta arrivata dal sito.
 *
 * Il valore vive in `leads.stato` (migration 20260814150000_richieste.sql).
 * Finché la migration non è applicata la colonna non esiste: `statoDi()`
 * risponde 'nuova' e la pagina funziona lo stesso.
 */

export type StatoRichiesta = 'nuova' | 'contattata' | 'cliente' | 'persa';

export const STATI_RICHIESTA: {
  valore: StatoRichiesta;
  label: string;
  descrizione: string;
  classe: string;
}[] = [
  {
    valore: 'nuova',
    label: 'Da contattare',
    descrizione: 'Arrivata, nessuno l’ha ancora presa.',
    classe: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    valore: 'contattata',
    label: 'Contattata',
    descrizione: 'Abbiamo risposto, è in corso.',
    classe: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    valore: 'cliente',
    label: 'Diventata cliente',
    descrizione: 'Ha aperto un account.',
    classe: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    valore: 'persa',
    label: 'Persa',
    descrizione: 'Non se n’è fatto niente.',
    classe: 'bg-slate-100 text-slate-600 border-slate-200',
  },
];

const PER_VALORE = new Map(STATI_RICHIESTA.map((s) => [s.valore, s]));

export function statoRichiestaInfo(stato: StatoRichiesta) {
  return PER_VALORE.get(stato) ?? STATI_RICHIESTA[0];
}

export function statoDi(riga: unknown): StatoRichiesta {
  const v = (riga as { stato?: unknown } | null)?.stato;
  return typeof v === 'string' && PER_VALORE.has(v as StatoRichiesta)
    ? (v as StatoRichiesta)
    : 'nuova';
}

/**
 * Da quante ore aspetta. Il form pubblico promette una risposta entro 24 ore
 * lavorative: senza questo numero la promessa non è verificabile.
 */
export function oreDaArrivo(createdAt: string | null | undefined): number {
  if (!createdAt) return 0;
  return (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
}
