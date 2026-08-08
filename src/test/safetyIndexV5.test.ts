import { describe, it, expect } from 'vitest';
import { calcolaSafetyIndex, DISCLAIMER_IPS } from '@/lib/safetyIndexV5';
import { TraitCode } from '@/types/database';

const traits = (over: Partial<Record<TraitCode, number>> = {}): Partial<Record<TraitCode, number>> => ({
  ADS: 0,
  GP: 0,
  PRI: 0,
  RC: 0,
  ...over,
});

describe('calcolaSafetyIndex', () => {
  it('profilo con tutti i fattori alti → fascia AFFIDABILE', () => {
    const r = calcolaSafetyIndex(traits({ ADS: 80, GP: 70, PRI: 60, RC: 50 }));
    expect(r.indice).not.toBeNull();
    expect(r.indice!).toBeGreaterThanOrEqual(70);
    expect(r.fascia).toBe('AFFIDABILE');
    expect(r.penalitaInterazione).toBe(0);
  });

  it('profilo con tutti i fattori bassi → fascia CRITICO', () => {
    const r = calcolaSafetyIndex(traits({ ADS: -70, GP: -60, PRI: -50, RC: -40 }));
    expect(r.fascia).toBe('CRITICO');
    expect(r.indice!).toBeLessThan(35);
  });

  it('tratti neutri (0) → indice 50, fascia ADEGUATO', () => {
    const r = calcolaSafetyIndex(traits());
    expect(r.indice).toBe(50);
    expect(r.fascia).toBe('ADEGUATO');
  });

  it('applica la penalità di interazione solo con ADS e GP entrambi bassi', () => {
    const conEntrambi = calcolaSafetyIndex(traits({ ADS: -30, GP: -30 }));
    expect(conEntrambi.penalitaInterazione).toBe(8);

    const soloAds = calcolaSafetyIndex(traits({ ADS: -30, GP: 10 }));
    expect(soloAds.penalitaInterazione).toBe(0);
  });

  it('la penalità sposta effettivamente l’indice', () => {
    const base = calcolaSafetyIndex(traits({ ADS: -21, GP: -21, PRI: 40, RC: 40 }));
    const senza = calcolaSafetyIndex(traits({ ADS: -21, GP: -19, PRI: 40, RC: 40 }));
    // stessi input a meno di 1 punto su GP: la differenza deve includere gli 8 punti di penalità
    expect(senza.indice! - base.indice!).toBeGreaterThanOrEqual(8);
  });

  it('reliability NO o ZERO → indice non calcolato', () => {
    for (const rel of ['NO', 'ZERO'] as const) {
      const r = calcolaSafetyIndex(traits({ ADS: 80, GP: 80 }), rel);
      expect(r.indice).toBeNull();
      expect(r.fascia).toBeNull();
      expect(r.label).toBe('Non calcolabile');
    }
  });

  it('reliability YES e CAUTION → indice calcolato', () => {
    for (const rel of ['YES', 'CAUTION'] as const) {
      const r = calcolaSafetyIndex(traits(), rel);
      expect(r.indice).not.toBeNull();
    }
  });

  it('indice sempre nel range 0–100 anche con tratti fuori scala', () => {
    const alto = calcolaSafetyIndex(traits({ ADS: 150, GP: 150, PRI: 150, RC: 150 }));
    const basso = calcolaSafetyIndex(traits({ ADS: -150, GP: -150, PRI: -150, RC: -150 }));
    expect(alto.indice!).toBeLessThanOrEqual(100);
    expect(basso.indice!).toBeGreaterThanOrEqual(0);
  });

  it('fascia non AFFIDABILE → leve operative presenti', () => {
    const r = calcolaSafetyIndex(traits({ ADS: -50, GP: -50 }));
    expect(r.leve.length).toBeGreaterThan(0);
  });

  it('il disclaimer è sempre presente', () => {
    expect(calcolaSafetyIndex(traits()).disclaimer).toBe(DISCLAIMER_IPS);
    expect(calcolaSafetyIndex(traits(), 'ZERO').disclaimer).toBe(DISCLAIMER_IPS);
  });

  it('quattro fattori sempre restituiti, con pesi che sommano a 1', () => {
    const r = calcolaSafetyIndex(traits());
    expect(r.fattori).toHaveLength(4);
    const sommaPesi = r.fattori.reduce((a, f) => a + f.peso, 0);
    expect(sommaPesi).toBeCloseTo(1, 5);
  });
});
