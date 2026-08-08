import { describe, it, expect } from 'vitest';
import {
  analizzaCoerenzaIntraTratto,
  analizzaStraightLining,
  analizzaTempi,
  calcolaValiditaEstesa,
} from '@/lib/validityV5';
import { DOMANDE } from '@/data/questionario';
import { RispostaInputV5 } from '@/lib/scoringV5';
import { RispostaValueV5 } from '@/types/database';

const domandeV5 = DOMANDE.map((d) => ({
  id: d.id,
  scala_primaria: d.scala_primaria,
  polarita: d.polarita,
}));

/** Risposte coerenti: asseconda la polarità (A sui +, C sui −) → punteggi alti e uniformi */
function risposteCoerenti(): RispostaInputV5[] {
  return DOMANDE.map((d) => ({
    domanda_id: d.id,
    valore: (d.polarita === '-' ? 'C' : 'A') as RispostaValueV5,
  }));
}

/** Risposte pseudo-casuali deterministiche (LCG, così possono ripetersi lettere consecutive) */
function rispostePseudoCasuali(): RispostaInputV5[] {
  const lettere: RispostaValueV5[] = ['A', 'B', 'C'];
  let seed = 42;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed;
  };
  return DOMANDE.map((d) => ({
    domanda_id: d.id,
    valore: lettere[next() % 3],
  }));
}

/** Tutte uguali: lo straight-lining puro */
function risposteTutteA(): RispostaInputV5[] {
  return DOMANDE.map((d) => ({ domanda_id: d.id, valore: 'A' as RispostaValueV5 }));
}

describe('analizzaCoerenzaIntraTratto', () => {
  it('risposte coerenti → nessun tratto incoerente', () => {
    const r = analizzaCoerenzaIntraTratto(risposteCoerenti(), domandeV5);
    expect(r.trattiIncoerenti).toHaveLength(0);
    expect(r.dispersioneMedia).toBeLessThan(2);
  });

  it('risposte casuali → dispersione alta e tratti incoerenti', () => {
    const r = analizzaCoerenzaIntraTratto(rispostePseudoCasuali(), domandeV5);
    expect(r.dispersioneMedia).toBeGreaterThan(2.5);
    expect(r.trattiIncoerenti.length).toBeGreaterThanOrEqual(3);
  });

  it('tutte A → incoerenza rilevata (le polarità si contraddicono)', () => {
    const r = analizzaCoerenzaIntraTratto(risposteTutteA(), domandeV5);
    // Con item + e − nello stesso tratto, "tutte A" produce punteggi 10 e 0 mescolati
    expect(r.trattiIncoerenti.length).toBeGreaterThanOrEqual(3);
  });

  it('tratti con meno di 6 risposte non vengono valutati', () => {
    const poche = risposteCoerenti().slice(0, 10);
    const r = analizzaCoerenzaIntraTratto(poche, domandeV5);
    expect(Object.keys(r.perTratto).length).toBeLessThanOrEqual(2);
  });
});

describe('analizzaStraightLining', () => {
  it('tutte A → run massimo, dominanza 1 e insensibilità 1', () => {
    const r = analizzaStraightLining(risposteTutteA(), domandeV5);
    expect(r.maxRun).toBe(DOMANDE.length);
    expect(r.dominanza).toBe(1);
    expect(r.letteraDominante).toBe('A');
    expect(r.insensibilitaPolarita).toBe(1);
  });

  it('rispondente genuino: run lunghi legittimi ma insensibilità bassa', () => {
    const r = analizzaStraightLining(risposteCoerenti(), domandeV5);
    // Il questionario ha sequenze a polarità costante: il run bruto può essere lungo…
    expect(r.maxRun).toBeGreaterThan(12);
    // …ma chi legge cambia lettera a ogni inversione di polarità.
    expect(r.insensibilitaPolarita).toBe(0);
  });

  it('risposte casuali: insensibilità vicina a 1/3, nessun allarme raffica', () => {
    const r = analizzaStraightLining(rispostePseudoCasuali(), domandeV5);
    expect(r.insensibilitaPolarita).toBeGreaterThan(0.15);
    expect(r.insensibilitaPolarita!).toBeLessThan(0.55);
  });

  it('la risposta D conta come B', () => {
    const risposte: RispostaInputV5[] = [
      { domanda_id: 1, valore: 'B' },
      { domanda_id: 2, valore: 'D' },
      { domanda_id: 3, valore: 'B' },
    ];
    const r = analizzaStraightLining(risposte, domandeV5);
    expect(r.maxRun).toBe(3);
    expect(r.runLetter).toBe('B');
  });
});

describe('analizzaTempi', () => {
  it('meno di 30 misure → non disponibile', () => {
    const tempi = Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, 3000]));
    expect(analizzaTempi(tempi).disponibile).toBe(false);
  });

  it('nessun dato → non disponibile senza errori', () => {
    expect(analizzaTempi(undefined).disponibile).toBe(false);
    expect(analizzaTempi({}).disponibile).toBe(false);
  });

  it('calcola mediana e quota lampo', () => {
    const tempi: Record<number, number> = {};
    for (let i = 1; i <= 100; i++) tempi[i] = i <= 50 ? 800 : 4000;
    const r = analizzaTempi(tempi);
    expect(r.disponibile).toBe(true);
    expect(r.medianaMs).toBe(2400);
    expect(r.quotaLampo).toBe(0.5);
  });

  it('scarta i tempi oltre il massimo valido (pause)', () => {
    const tempi: Record<number, number> = {};
    for (let i = 1; i <= 40; i++) tempi[i] = 3000;
    tempi[41] = 500_000; // pausa pranzo
    const r = analizzaTempi(tempi);
    expect(r.risposteMisurate).toBe(40);
  });
});

describe('calcolaValiditaEstesa', () => {
  it('compilazione onesta e ragionata → OK', () => {
    const tempi = Object.fromEntries(DOMANDE.map((d) => [d.id, 4000]));
    const r = calcolaValiditaEstesa(risposteCoerenti(), domandeV5, tempi);
    expect(r.livello).toBe('OK');
    expect(r.segnali).toHaveLength(0);
  });

  it('tutte A → CRITICO per straight-lining (e coerenza)', () => {
    const r = calcolaValiditaEstesa(risposteTutteA(), domandeV5);
    expect(r.livello).toBe('CRITICO');
    expect(r.segnali.some((s) => s.codice === 'STRAIGHT_LINING' && s.livello === 'CRITICO')).toBe(true);
  });

  it('risposte casuali → almeno ATTENZIONE per coerenza', () => {
    const r = calcolaValiditaEstesa(rispostePseudoCasuali(), domandeV5);
    expect(['ATTENZIONE', 'CRITICO']).toContain(r.livello);
    expect(r.segnali.some((s) => s.codice === 'COERENZA')).toBe(true);
  });

  it('tempi mediani impossibili → CRITICO', () => {
    const tempi = Object.fromEntries(DOMANDE.map((d) => [d.id, 900]));
    const r = calcolaValiditaEstesa(risposteCoerenti(), domandeV5, tempi);
    expect(r.segnali.some((s) => s.codice === 'TEMPI' && s.livello === 'CRITICO')).toBe(true);
    expect(r.livello).toBe('CRITICO');
  });

  it('senza tempi il segnale TEMPI non compare', () => {
    const r = calcolaValiditaEstesa(risposteCoerenti(), domandeV5);
    expect(r.segnali.some((s) => s.codice === 'TEMPI')).toBe(false);
    expect(r.tempi.disponibile).toBe(false);
  });

  it('il risultato è serializzabile per il salvataggio in jsonb', () => {
    const r = calcolaValiditaEstesa(risposteCoerenti(), domandeV5);
    expect(() => JSON.stringify(r)).not.toThrow();
    expect(r.algoritmo).toBe('validity-v1');
  });
});
