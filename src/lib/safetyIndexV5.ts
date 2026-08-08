/**
 * Indice di Propensione alla Sicurezza (IPS) — derivato, non diagnostico.
 *
 * Stima la propensione a mantenere comportamenti sicuri in cantiere a partire
 * dai tratti V5 già misurati e validati. NON introduce domande nuove e NON è
 * uno screening clinico: descrive un pattern di comportamento lavorativo
 * atteso, da verificare al colloquio e durante l'inserimento.
 *
 * Base del modello (letteratura su safety behavior + esperienza di cantiere):
 * chi salta le procedure raramente lo fa per ignoranza — lo fa quando la
 * pressione supera la disciplina. I quattro tratti usati:
 *
 *  - ADS (Autodisciplina)      35% — la tenuta della procedura quando nessuno guarda
 *  - GP  (Gestione Pressioni)  30% — cosa succede alla disciplina sotto stress
 *  - PRI (Principi)            20% — il rapporto con le regole come valore, non come obbligo
 *  - RC  (Resistenza/Verifica) 15% — la tendenza a verificare prima di agire
 *
 * Penalità di interazione: ADS bassa E GP bassa insieme valgono peggio della
 * loro somma — è il profilo che in condizioni normali lavora bene e sotto
 * pressione taglia i passaggi.
 */

import { TraitCode, ReliabilityIndex } from '@/types/database';

export type FasciaSicurezza = 'AFFIDABILE' | 'ADEGUATO' | 'ATTENZIONE' | 'CRITICO';

export interface FattoreSicurezza {
  trait: TraitCode;
  label: string;
  /** Punteggio del tratto riportato in scala 0–100 */
  valore: number;
  peso: number;
  /** Lettura operativa del contributo di questo tratto */
  testo: string;
}

export interface SafetyIndexResult {
  /** 0–100; null se il profilo non è attendibile */
  indice: number | null;
  fascia: FasciaSicurezza | null;
  label: string;
  descrizione: string;
  fattori: FattoreSicurezza[];
  /** Penalità applicata per l'interazione ADS bassa + GP bassa */
  penalitaInterazione: number;
  /** Azioni operative suggerite per colloquio e inserimento */
  leve: string[];
  /** Sempre presente: il limite d'uso dell'indice */
  disclaimer: string;
}

const PESI: { trait: TraitCode; peso: number }[] = [
  { trait: 'ADS', peso: 0.35 },
  { trait: 'GP', peso: 0.3 },
  { trait: 'PRI', peso: 0.2 },
  { trait: 'RC', peso: 0.15 },
];

const LABELS: Record<string, string> = {
  ADS: 'Autodisciplina',
  GP: 'Gestione delle pressioni',
  PRI: 'Rapporto con le regole',
  RC: 'Tendenza alla verifica',
};

export const DISCLAIMER_IPS =
  'Indicazione di propensione comportamentale derivata dai tratti misurati. Non è una diagnosi, non è una previsione certa e non sostituisce formazione, DPI e vigilanza: orienta colloquio e piano di inserimento.';

/** Riporta un tratto da −100/+100 a 0–100. */
const a100 = (t: number) => Math.round(Math.min(100, Math.max(0, (t + 100) / 2)));

function testoFattore(trait: TraitCode, v: number): string {
  const basso = v < 40;
  const alto = v >= 65;
  switch (trait) {
    case 'ADS':
      if (basso) return 'Rischio di scorciatoie sulle procedure quando il controllo si allenta o il ritmo sale.';
      if (alto) return 'Tiene la procedura anche senza supervisione: è il fattore protettivo principale.';
      return 'Disciplina nella media: regge con una supervisione normale, va osservata nei picchi di lavoro.';
    case 'GP':
      if (basso) return 'Sotto pressione la lucidità cala: è nei momenti di ritardo che vanno previsti i controlli.';
      if (alto) return 'Mantiene lucidità nelle situazioni critiche: difficilmente la fretta gli fa saltare i passaggi.';
      return 'Tenuta media allo stress: attenzione nelle settimane di consegna.';
    case 'PRI':
      if (basso) return 'Le regole rischiano di essere vissute come ostacolo: serve far capire il perché, non solo il cosa.';
      if (alto) return 'Vive le regole come valore proprio: tende a farle rispettare anche agli altri.';
      return 'Rispetto delle regole nella media: risponde bene a un contesto dove la sicurezza è presa sul serio.';
    case 'RC':
      if (basso) return 'Tende a fidarsi della prima impressione: da affiancare a chi verifica sistematicamente.';
      if (alto) return 'Verifica prima di agire: difficile che dia per scontato che "andrà bene".';
      return 'Verifica nella media.';
    default:
      return '';
  }
}

function leveOperative(fascia: FasciaSicurezza, fattori: FattoreSicurezza[]): string[] {
  const deboli = fattori.filter((f) => f.valore < 40).map((f) => f.trait);
  const leve: string[] = [];

  if (fascia === 'AFFIDABILE') {
    leve.push('Profilo adatto anche a lavorazioni a rischio elevato, con il normale presidio.');
    leve.push('Valutabile come riferimento sicurezza informale dentro la squadra.');
    return leve;
  }

  if (deboli.includes('ADS')) {
    leve.push('Al colloquio: "Raccontami l’ultima volta che hai saltato un passaggio di procedura. Cosa era successo prima?"');
    leve.push('Inserimento: checklist esplicite e verifiche a campione nelle prime 8 settimane, non solo nella prima.');
  }
  if (deboli.includes('GP')) {
    leve.push('Al colloquio: "Come lavori quando il cantiere è in ritardo e tutti spingono?"');
    leve.push('Evitare, nei primi mesi, di assegnarlo alle lavorazioni critiche nelle settimane di consegna.');
  }
  if (deboli.includes('PRI')) {
    leve.push('Formazione sicurezza centrata sul perché delle regole, non sull’elenco degli obblighi.');
  }
  if (deboli.includes('RC')) {
    leve.push('Affiancarlo a una figura che verifica sistematicamente (capisquadra o collega esperto).');
  }
  if (fascia === 'CRITICO') {
    leve.push('Se assunto: affiancamento continuativo su lavorazioni a rischio finché i comportamenti osservati non smentiscono il profilo.');
  }
  return leve;
}

export function calcolaSafetyIndex(
  traits: Partial<Record<TraitCode, number>>,
  reliabilityIndex?: ReliabilityIndex | null
): SafetyIndexResult {
  const fattori: FattoreSicurezza[] = PESI.map(({ trait, peso }) => {
    const valore = a100(traits[trait] ?? 0);
    return { trait, label: LABELS[trait], valore, peso, testo: testoFattore(trait, valore) };
  });

  // Profilo non attendibile: l'indice non va mostrato come numero.
  if (reliabilityIndex === 'NO' || reliabilityIndex === 'ZERO') {
    return {
      indice: null,
      fascia: null,
      label: 'Non calcolabile',
      descrizione:
        'Il profilo non ha superato i controlli di attendibilità: l’indice di sicurezza non viene calcolato. Consigliata la ricompilazione del questionario.',
      fattori,
      penalitaInterazione: 0,
      leve: [],
      disclaimer: DISCLAIMER_IPS,
    };
  }

  let indice = fattori.reduce((acc, f) => acc + f.valore * f.peso, 0);

  // Interazione critica: disciplina bassa + tenuta bassa sotto stress.
  const adsBasso = (traits.ADS ?? 0) < -20;
  const gpBasso = (traits.GP ?? 0) < -20;
  const penalitaInterazione = adsBasso && gpBasso ? 8 : 0;
  indice = Math.round(Math.min(100, Math.max(0, indice - penalitaInterazione)));

  let fascia: FasciaSicurezza;
  let label: string;
  let descrizione: string;
  if (indice >= 70) {
    fascia = 'AFFIDABILE';
    label = 'Propensione affidabile';
    descrizione =
      'Il profilo indica disciplina stabile e tenuta sotto pressione: la propensione attesa è a mantenere le procedure anche senza supervisione diretta.';
  } else if (indice >= 50) {
    fascia = 'ADEGUATO';
    label = 'Propensione adeguata';
    descrizione =
      'Propensione nella norma: regge con un presidio ordinario. I punti da osservare sono indicati nei fattori qui sotto.';
  } else if (indice >= 35) {
    fascia = 'ATTENZIONE';
    label = 'Da presidiare';
    descrizione =
      'Uno o più fattori indicano rischio di comportamento non sicuro in condizioni di pressione o scarsa supervisione. Da approfondire al colloquio e presidiare nell’inserimento.';
  } else {
    fascia = 'CRITICO';
    label = 'Propensione critica';
    descrizione =
      'La combinazione dei fattori indica un rischio concreto di scorciatoie sulle procedure, soprattutto sotto pressione. Non è un giudizio sulla persona: è un’indicazione su come va inserita e presidiata.';
  }

  return {
    indice,
    fascia,
    label,
    descrizione,
    fattori,
    penalitaInterazione,
    leve: leveOperative(fascia, fattori),
    disclaimer: DISCLAIMER_IPS,
  };
}
