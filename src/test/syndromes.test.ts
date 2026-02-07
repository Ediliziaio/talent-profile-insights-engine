/**
 * Test per src/lib/syndromes.ts
 * Verifica compilazione TypeScript e logica di calcolo sindromi V5
 */

import { describe, it, expect } from 'vitest';
import {
  checkAllSyndromes,
  getActiveSyndromes,
  hasCriticalSyndromes,
  getMostSevereSyndrome,
  getCriticalityLevel,
  getSeverityBadgeClass,
  getSeverityColor,
  formatSyndromesForDB,
  TraitScores,
  SyndromeResult
} from '@/lib/syndromes';

// ============================================
// PROFILI FITTIZI PER TEST
// ============================================

// Profilo SANO - Nessuna sindrome attiva
const healthyProfile: TraitScores = {
  ORG: 50,
  AUT: 45,
  GP: 55,
  ADS: 50,
  DET: 40,
  VEN: 35,
  HRM: 50,
  LDR: 45,
  PRO: 40,
  COM: 45,
  ESP: 35,
  RC: 30,
  FIN: 45,
  SUC: 75,
  PRI: 60
};

// Profilo S01 - Demotivante Cronica (RED)
const s01Profile: TraitScores = {
  ORG: 30,
  AUT: 40,
  GP: 30,
  ADS: 35,
  DET: 25,
  VEN: 20,
  HRM: -10, // < 0
  LDR: 30,
  PRO: -15, // < 0
  COM: -20, // < 0
  ESP: -10, // < 0
  RC: 35,
  FIN: 20,
  SUC: 50,
  PRI: 40
};

// Profilo S02 - SP/Soppressiva (RED)
const s02Profile: TraitScores = {
  ORG: 40,
  AUT: 65, // >= 60
  GP: 15,  // < 21
  ADS: 30,
  DET: 40,
  VEN: 35,
  HRM: 25,
  LDR: 50,
  PRO: 30,
  COM: -5, // <= 0
  ESP: 40,
  RC: 50,  // > 45
  FIN: 30,
  SUC: 60,
  PRI: 55
};

// Profilo S03 - Trouble (RED)
const s03Profile: TraitScores = {
  ORG: 35,
  AUT: 70, // >= 60
  GP: 15,  // < 21
  ADS: 40,
  DET: 45,
  VEN: 30,
  HRM: 35,
  LDR: 40,
  PRO: 25,
  COM: -10, // <= 0
  ESP: 30,
  RC: 30,   // Not > 45, so Trouble not SP
  FIN: 25,
  SUC: 55,
  PRI: 50
};

// Profilo S06 - Problemi Etica (ORANGE) - Variante S06f
const s06Profile: TraitScores = {
  ORG: 40,
  AUT: 45,
  GP: 35,
  ADS: 40,
  DET: 35,
  VEN: 30,
  HRM: 25,
  LDR: 30,
  PRO: -55, // < -50
  COM: -55, // < -50
  ESP: 20,
  RC: 25,
  FIN: 35,
  SUC: 60,
  PRI: 55
};

// Profilo S08 - Ghost (ORANGE)
const s08Profile: TraitScores = {
  ORG: 50, // > 44
  AUT: 50, // > 44
  GP: 50,  // > 44
  ADS: 50, // > 44
  DET: 50, // > 44
  VEN: 50, // > 44
  HRM: 40,
  LDR: 40,
  PRO: 50, // > 44
  COM: 45,
  ESP: 40,
  RC: 35,
  FIN: 45,
  SUC: 70,
  PRI: 55
};

// Profilo S17 - GP Più Alto (YELLOW)
const s17Profile: TraitScores = {
  ORG: 30,
  AUT: 35,
  GP: 60, // GP è il più alto
  ADS: 40,
  DET: 25,
  VEN: 30,
  HRM: 35,
  LDR: 25,
  PRO: 30,
  COM: 35,
  ESP: 25,
  RC: 30,
  FIN: 40,
  SUC: 55,
  PRI: 50
};

// Profilo SS4 - Esecutore (YELLOW, positiva)
const ss4Profile: TraitScores = {
  ORG: 45, // >= 30
  AUT: 40,
  GP: 50,  // >= 30
  ADS: 45,
  DET: 35,
  VEN: 30,
  HRM: 35,
  LDR: 40,
  PRO: 35, // >= 20
  COM: 45,
  ESP: 30,
  RC: 25,
  FIN: 45,
  SUC: 70,
  PRI: 60
};

// ============================================
// TEST COMPILAZIONE E TIPI
// ============================================

describe('Syndromes - Compilazione TypeScript', () => {
  it('dovrebbe compilare correttamente le interfacce', () => {
    const result: SyndromeResult = {
      code: 'S01',
      name: 'Test',
      severity: 'RED',
      description: 'Test description',
      isActive: true,
      category: 'primary'
    };
    expect(result.code).toBe('S01');
    expect(result.severity).toBe('RED');
  });

  it('dovrebbe esportare tutte le funzioni principali', () => {
    expect(typeof checkAllSyndromes).toBe('function');
    expect(typeof getActiveSyndromes).toBe('function');
    expect(typeof hasCriticalSyndromes).toBe('function');
    expect(typeof getMostSevereSyndrome).toBe('function');
    expect(typeof getCriticalityLevel).toBe('function');
    expect(typeof getSeverityBadgeClass).toBe('function');
    expect(typeof getSeverityColor).toBe('function');
    expect(typeof formatSyndromesForDB).toBe('function');
  });
});

// ============================================
// TEST CALCOLO SINDROMI
// ============================================

describe('Syndromes - Calcolo Sindromi', () => {
  it('profilo sano non dovrebbe avere sindromi RED', () => {
    const syndromes = getActiveSyndromes(healthyProfile);
    const redSyndromes = syndromes.filter(s => s.severity === 'RED');
    expect(redSyndromes.length).toBe(0);
  });

  it('S01 - Demotivante Cronica dovrebbe attivarsi', () => {
    const syndromes = getActiveSyndromes(s01Profile);
    const s01 = syndromes.find(s => s.code === 'S01');
    expect(s01).toBeDefined();
    expect(s01?.severity).toBe('RED');
    expect(s01?.name).toContain('DEMOTIVANTE CRONICA');
  });

  it('S02 - SP dovrebbe attivarsi', () => {
    const syndromes = getActiveSyndromes(s02Profile);
    const s02 = syndromes.find(s => s.code === 'S02');
    expect(s02).toBeDefined();
    expect(s02?.severity).toBe('RED');
  });

  it('S03 - Trouble dovrebbe attivarsi', () => {
    const syndromes = getActiveSyndromes(s03Profile);
    const s03 = syndromes.find(s => s.code === 'S03');
    expect(s03).toBeDefined();
    expect(s03?.severity).toBe('RED');
  });

  it('S06 - Problemi Etica dovrebbe attivarsi (variante f)', () => {
    const syndromes = getActiveSyndromes(s06Profile);
    const s06 = syndromes.find(s => s.code === 'S06');
    expect(s06).toBeDefined();
    expect(s06?.severity).toBe('ORANGE');
  });

  it('S08 - Ghost dovrebbe attivarsi', () => {
    const syndromes = getActiveSyndromes(s08Profile);
    const s08 = syndromes.find(s => s.code === 'S08');
    expect(s08).toBeDefined();
    expect(s08?.severity).toBe('ORANGE');
  });

  it('S17 - GP Più Alto dovrebbe attivarsi', () => {
    const syndromes = getActiveSyndromes(s17Profile);
    const s17 = syndromes.find(s => s.code === 'S17');
    expect(s17).toBeDefined();
    expect(s17?.severity).toBe('YELLOW');
  });

  it('SS4 - Esecutore dovrebbe attivarsi (sindrome positiva)', () => {
    const syndromes = getActiveSyndromes(ss4Profile);
    const ss4 = syndromes.find(s => s.code === 'SS4');
    expect(ss4).toBeDefined();
  });
});

// ============================================
// TEST FUNZIONI HELPER
// ============================================

describe('Syndromes - Funzioni Helper', () => {
  it('hasCriticalSyndromes dovrebbe rilevare sindromi critiche', () => {
    expect(hasCriticalSyndromes(s01Profile)).toBe(true);
    expect(hasCriticalSyndromes(s02Profile)).toBe(true);
    expect(hasCriticalSyndromes(healthyProfile)).toBe(false);
  });

  it('getMostSevereSyndrome dovrebbe ritornare la sindrome più grave', () => {
    const mostSevere = getMostSevereSyndrome(s01Profile);
    expect(mostSevere).toBeDefined();
    expect(mostSevere?.severity).toBe('RED');
  });

  it('getCriticalityLevel dovrebbe calcolare il livello corretto', () => {
    const s01Level = getCriticalityLevel(s01Profile);
    expect(s01Level?.level).toBe(1); // S01 = Livello 1

    const s02Level = getCriticalityLevel(s02Profile);
    expect(s02Level?.level).toBe(2); // S02 = Livello 2

    const healthyLevel = getCriticalityLevel(healthyProfile);
    expect(healthyLevel).toBeNull();
  });

  it('getSeverityBadgeClass dovrebbe ritornare le classi corrette', () => {
    expect(getSeverityBadgeClass('RED')).toContain('red');
    expect(getSeverityBadgeClass('ORANGE')).toContain('orange');
    expect(getSeverityBadgeClass('YELLOW')).toContain('yellow');
  });

  it('getSeverityColor dovrebbe ritornare i colori corretti', () => {
    expect(getSeverityColor('RED')).toBe('#DC2626');
    expect(getSeverityColor('ORANGE')).toBe('#EA580C');
    expect(getSeverityColor('YELLOW')).toBe('#CA8A04');
  });

  it('formatSyndromesForDB dovrebbe formattare correttamente', () => {
    const syndromes = checkAllSyndromes(s01Profile);
    const formatted = formatSyndromesForDB(syndromes);
    
    expect(Array.isArray(formatted)).toBe(true);
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted[0]).toHaveProperty('code');
    expect(formatted[0]).toHaveProperty('name');
    expect(formatted[0]).toHaveProperty('severity');
  });

  it('checkAllSyndromes dovrebbe ritornare 24 sindromi totali', () => {
    const allSyndromes = checkAllSyndromes(healthyProfile);
    expect(allSyndromes.length).toBe(24); // 18 primarie + 6 secondarie
  });
});

// ============================================
// ESEMPIO CALCOLO COMPLETO (per log)
// ============================================

describe('Syndromes - Esempio Calcolo Completo', () => {
  it('dovrebbe mostrare esempio di calcolo per profilo critico', () => {
    console.log('\n========================================');
    console.log('ESEMPIO CALCOLO SINDROMI V5');
    console.log('========================================\n');
    
    console.log('PROFILO TEST (S01 - Demotivante Cronica):');
    console.log(JSON.stringify(s01Profile, null, 2));
    
    const activeSyndromes = getActiveSyndromes(s01Profile);
    console.log('\nSINDROMI ATTIVE:', activeSyndromes.length);
    
    activeSyndromes.forEach(s => {
      console.log(`\n[${s.severity}] ${s.code}: ${s.name}`);
      console.log(`   Categoria: ${s.category}`);
      console.log(`   Descrizione: ${s.description}`);
    });
    
    const mostSevere = getMostSevereSyndrome(s01Profile);
    console.log('\nSINDROME PIÙ GRAVE:', mostSevere?.name);
    
    const criticalityLevel = getCriticalityLevel(s01Profile);
    console.log('LIVELLO CRITICITÀ:', criticalityLevel?.level, '-', criticalityLevel?.description);
    
    console.log('\n========================================\n');
    
    expect(activeSyndromes.length).toBeGreaterThan(0);
  });
});
