/**
 * Attendibilità estesa — segnali di validità oltre le 5 domande di controllo.
 *
 * L'indice ufficiale (calcolaAttendibilita in scoringV5) resta l'unico
 * validato dal manuale e NON viene toccato: questi segnali lo AFFIANCANO.
 * Un candidato che riconosce le domande di controllo e risponde "bene" a
 * quelle può comunque tradirsi qui, perché questi controlli non si possono
 * aggirare rispondendo con furbizia a 5 item:
 *
 *  1. Coerenza intra-tratto — gli item di uno stesso tratto, corretti per
 *     polarità, devono raccontare la stessa storia. Risposte casuali o
 *     strategiche producono dispersione alta.
 *  2. Straight-lining — sequenze lunghe della stessa lettera e distribuzioni
 *     schiacciate su una sola risposta.
 *  3. Tempi di risposta — sotto ~2 secondi a domanda non si legge il testo.
 *     Disponibile solo se il client ha registrato i tempi (tempo_ms).
 *
 * Tutti i calcoli usano solo dati già raccolti: nessuna domanda nuova,
 * nessun impatto sulla taratura del questionario.
 */

import { TraitCode } from '@/types/database';
import {
  RispostaInputV5,
  DomandaV5,
  calcolaPunteggioRisposta,
} from './scoringV5';

export type LivelloValidita = 'OK' | 'ATTENZIONE' | 'CRITICO';

export interface SegnaleValidita {
  codice: 'COERENZA' | 'STRAIGHT_LINING' | 'TEMPI';
  livello: LivelloValidita;
  titolo: string;
  dettaglio: string;
}

export interface CoerenzaIntraTratto {
  /** Dispersione media (0–5) per tratto: item score in {0,5,10}, MAD dal medio */
  perTratto: Partial<Record<TraitCode, number>>;
  trattiIncoerenti: TraitCode[];
  /** Media delle dispersioni sui tratti valutabili */
  dispersioneMedia: number;
}

export interface StraightLining {
  /** Run massimo di lettere identiche consecutive — descrittivo, NON genera segnale
   *  da solo: nel questionario esistono sequenze lunghe a polarità costante, quindi
   *  un profilo genuino "forte" produce run lunghi legittimi. */
  maxRun: number;
  /** Lettera della sequenza più lunga */
  runLetter: string | null;
  /** Quota della lettera più usata (0–1) */
  dominanza: number;
  letteraDominante: string | null;
  /** Il segnale vero: quota di coppie consecutive a polarità INVERTITA in cui la
   *  risposta resta identica. Chi legge cambia lettera quando la domanda si
   *  inverte; chi compila a raffica no. Random ≈ 0.33, genuino < 0.3, raffica → 1. */
  insensibilitaPolarita: number | null;
  /** Numero di coppie consecutive a polarità invertita valutate */
  coppieInvertite: number;
}

export interface AnalisiTempi {
  disponibile: boolean;
  medianaMs: number | null;
  /** Quota di risposte sotto 1000 ms (0–1) */
  quotaLampo: number | null;
  risposteMisurate: number;
}

export interface ValiditaEstesa {
  livello: LivelloValidita;
  segnali: SegnaleValidita[];
  coerenza: CoerenzaIntraTratto;
  straightLining: StraightLining;
  tempi: AnalisiTempi;
  /** Versione dell'algoritmo, salvata nel DB per poter rileggere i dati storici */
  algoritmo: 'validity-v1';
}

/* ─────────────────── Soglie ───────────────────
 * Item score ∈ {0,5,10} dopo correzione di polarità.
 * Un responder coerente si concentra su un lato della scala: MAD tipico < 2.5.
 * Risposte uniformi casuali: MAD atteso ≈ 3.7. Soglia per tratto: 3.4.
 */
const SOGLIA_DISPERSIONE_TRATTO = 3.4;
const MIN_ITEM_PER_TRATTO = 6;
const SOGLIA_TRATTI_INCOERENTI_WARN = 3;
const SOGLIA_TRATTI_INCOERENTI_CRIT = 6;

/* L'insensibilità alla polarità è il discriminante: random ≈ 0.33 (coperto dal
 * segnale di coerenza), lettura reale < 0.3, compilazione a raffica → 1.
 * La dominanza da sola non basta: un profilo genuino tutto positivo arriva a
 * ~0.70 di "A" perché il 70% delle domande ha polarità +. */
const INSENSIBILITA_WARN = 0.6;
const INSENSIBILITA_CRIT = 0.8;
const MIN_COPPIE_INVERTITE = 20;
const DOMINANZA_CORROBORANTE = 0.85;

const MEDIANA_MS_CRIT = 1500;
const MEDIANA_MS_WARN = 2500;
const QUOTA_LAMPO_WARN = 0.3;
/** Tempi oltre questa soglia sono pause (telefono, interruzioni): esclusi dalla mediana */
export const TEMPO_MS_MAX_VALIDO = 120_000;

export function analizzaCoerenzaIntraTratto(
  risposte: RispostaInputV5[],
  domande: DomandaV5[]
): CoerenzaIntraTratto {
  const byId = new Map(risposte.map((r) => [r.domanda_id, r.valore]));
  const perTratto: Partial<Record<TraitCode, number>> = {};
  const trattiIncoerenti: TraitCode[] = [];

  const gruppi = new Map<TraitCode, DomandaV5[]>();
  for (const d of domande) {
    // Solo item con polarità direzionale: S e C non descrivono il tratto in modo lineare
    if (d.polarita !== '+' && d.polarita !== '-') continue;
    const g = gruppi.get(d.scala_primaria) ?? [];
    g.push(d);
    gruppi.set(d.scala_primaria, g);
  }

  const dispersioni: number[] = [];
  for (const [trait, items] of gruppi) {
    const scores: number[] = [];
    for (const item of items) {
      const v = byId.get(item.id);
      if (!v) continue;
      scores.push(calcolaPunteggioRisposta(item.id, v, item.polarita));
    }
    if (scores.length < MIN_ITEM_PER_TRATTO) continue;

    const media = scores.reduce((a, b) => a + b, 0) / scores.length;
    const mad = scores.reduce((a, b) => a + Math.abs(b - media), 0) / scores.length;
    const arrotondata = Math.round(mad * 100) / 100;
    perTratto[trait] = arrotondata;
    dispersioni.push(arrotondata);
    if (arrotondata > SOGLIA_DISPERSIONE_TRATTO) trattiIncoerenti.push(trait);
  }

  return {
    perTratto,
    trattiIncoerenti,
    dispersioneMedia: dispersioni.length
      ? Math.round((dispersioni.reduce((a, b) => a + b, 0) / dispersioni.length) * 100) / 100
      : 0,
  };
}

export function analizzaStraightLining(
  risposte: RispostaInputV5[],
  domande?: DomandaV5[]
): StraightLining {
  const ordinate = [...risposte].sort((a, b) => a.domanda_id - b.domanda_id);
  const polarita = new Map((domande ?? []).map((d) => [d.id, d.polarita]));
  let maxRun = 0;
  let runLetter: string | null = null;
  let run = 0;
  let prev: string | null = null;
  const conteggi = new Map<string, number>();

  // Coppie consecutive in cui la polarità si inverte (+→− o −→+)
  let coppieInvertite = 0;
  let stesseSuInvertite = 0;

  for (let i = 0; i < ordinate.length; i++) {
    const r = ordinate[i];
    // D vale come B anche qui, per coerenza con lo scoring
    const v = r.valore === 'D' ? 'B' : r.valore;
    conteggi.set(v, (conteggi.get(v) ?? 0) + 1);
    if (v === prev) {
      run++;
    } else {
      run = 1;
      prev = v;
    }
    if (run > maxRun) {
      maxRun = run;
      runLetter = v;
    }

    if (i > 0) {
      const pPrev = polarita.get(ordinate[i - 1].domanda_id);
      const pCur = polarita.get(r.domanda_id);
      const invertita =
        (pPrev === '+' && pCur === '-') || (pPrev === '-' && pCur === '+');
      if (invertita) {
        coppieInvertite++;
        const vPrev = ordinate[i - 1].valore === 'D' ? 'B' : ordinate[i - 1].valore;
        if (vPrev === v) stesseSuInvertite++;
      }
    }
  }

  let letteraDominante: string | null = null;
  let dominanza = 0;
  for (const [lettera, n] of conteggi) {
    const quota = ordinate.length ? n / ordinate.length : 0;
    if (quota > dominanza) {
      dominanza = quota;
      letteraDominante = lettera;
    }
  }

  return {
    maxRun,
    runLetter,
    dominanza: Math.round(dominanza * 1000) / 1000,
    letteraDominante,
    insensibilitaPolarita:
      coppieInvertite >= MIN_COPPIE_INVERTITE
        ? Math.round((stesseSuInvertite / coppieInvertite) * 1000) / 1000
        : null,
    coppieInvertite,
  };
}

export function analizzaTempi(tempiMs: Record<number, number> | undefined): AnalisiTempi {
  const valori = Object.values(tempiMs ?? {}).filter(
    (t) => Number.isFinite(t) && t > 0 && t <= TEMPO_MS_MAX_VALIDO
  );
  // Sotto le 30 misure la mediana non è rappresentativa del questionario
  if (valori.length < 30) {
    return { disponibile: false, medianaMs: null, quotaLampo: null, risposteMisurate: valori.length };
  }
  const ordinati = [...valori].sort((a, b) => a - b);
  const mid = Math.floor(ordinati.length / 2);
  const mediana =
    ordinati.length % 2 ? ordinati[mid] : Math.round((ordinati[mid - 1] + ordinati[mid]) / 2);
  const lampo = valori.filter((t) => t < 1000).length / valori.length;

  return {
    disponibile: true,
    medianaMs: mediana,
    quotaLampo: Math.round(lampo * 1000) / 1000,
    risposteMisurate: valori.length,
  };
}

export function calcolaValiditaEstesa(
  risposte: RispostaInputV5[],
  domande: DomandaV5[],
  tempiMs?: Record<number, number>
): ValiditaEstesa {
  const coerenza = analizzaCoerenzaIntraTratto(risposte, domande);
  const straightLining = analizzaStraightLining(risposte, domande);
  const tempi = analizzaTempi(tempiMs);
  const segnali: SegnaleValidita[] = [];

  if (coerenza.trattiIncoerenti.length >= SOGLIA_TRATTI_INCOERENTI_CRIT) {
    segnali.push({
      codice: 'COERENZA',
      livello: 'CRITICO',
      titolo: 'Risposte incoerenti su molti tratti',
      dettaglio: `${coerenza.trattiIncoerenti.length} tratti su ${Object.keys(coerenza.perTratto).length} mostrano risposte contraddittorie fra domande che misurano la stessa cosa. Il profilo va letto con estrema cautela.`,
    });
  } else if (coerenza.trattiIncoerenti.length >= SOGLIA_TRATTI_INCOERENTI_WARN) {
    segnali.push({
      codice: 'COERENZA',
      livello: 'ATTENZIONE',
      titolo: 'Incoerenze su alcuni tratti',
      dettaglio: `Risposte contraddittorie su: ${coerenza.trattiIncoerenti.join(', ')}. I punteggi di questi tratti sono meno affidabili degli altri.`,
    });
  }

  const ins = straightLining.insensibilitaPolarita;
  if (ins !== null && ins >= INSENSIBILITA_CRIT) {
    segnali.push({
      codice: 'STRAIGHT_LINING',
      livello: 'CRITICO',
      titolo: 'Risposte in serie',
      dettaglio: `Nel ${Math.round(ins * 100)}% dei casi in cui la domanda si inverte, la risposta resta identica (${straightLining.coppieInvertite} inversioni valutate)${straightLining.dominanza >= DOMINANZA_CORROBORANTE ? `; la risposta "${straightLining.letteraDominante}" copre il ${Math.round(straightLining.dominanza * 100)}% del questionario` : ''}. Pattern tipico di compilazione senza lettura.`,
    });
  } else if (ins !== null && ins >= INSENSIBILITA_WARN) {
    segnali.push({
      codice: 'STRAIGHT_LINING',
      livello: 'ATTENZIONE',
      titolo: 'Possibili risposte in serie',
      dettaglio: `La risposta resta identica nel ${Math.round(ins * 100)}% delle inversioni di polarità: una parte del questionario potrebbe essere stata compilata senza leggere. Da incrociare con gli altri segnali.`,
    });
  }

  if (tempi.disponibile && tempi.medianaMs !== null && tempi.quotaLampo !== null) {
    if (tempi.medianaMs < MEDIANA_MS_CRIT) {
      segnali.push({
        codice: 'TEMPI',
        livello: 'CRITICO',
        titolo: 'Compilazione troppo rapida',
        dettaglio: `Tempo mediano di ${(tempi.medianaMs / 1000).toFixed(1)}s a domanda: sotto questa soglia non è materialmente possibile leggere i testi. Consigliata la ricompilazione.`,
      });
    } else if (tempi.medianaMs < MEDIANA_MS_WARN || tempi.quotaLampo > QUOTA_LAMPO_WARN) {
      segnali.push({
        codice: 'TEMPI',
        livello: 'ATTENZIONE',
        titolo: 'Ritmo di compilazione sostenuto',
        dettaglio: `Mediana ${(tempi.medianaMs / 1000).toFixed(1)}s a domanda, ${Math.round((tempi.quotaLampo ?? 0) * 100)}% di risposte sotto il secondo. Alcune risposte potrebbero non riflettere una lettura reale.`,
      });
    }
  }

  const critici = segnali.filter((s) => s.livello === 'CRITICO').length;
  const avvisi = segnali.filter((s) => s.livello === 'ATTENZIONE').length;
  const livello: LivelloValidita =
    critici > 0 ? 'CRITICO' : avvisi >= 2 ? 'CRITICO' : avvisi === 1 ? 'ATTENZIONE' : 'OK';

  return { livello, segnali, coerenza, straightLining, tempi, algoritmo: 'validity-v1' };
}
