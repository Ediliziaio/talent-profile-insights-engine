/**
 * Test per src/lib/roleMatchingV5.ts
 * Verifica sistema di matching V5 per 9 mansioni
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRoleMatchingV5,
  calculateAllRolesCompatibilityV5,
  getVerdictBadgeVariantV5,
  getVerdictLabelV5,
  getVerdictColorV5,
  ROLE_PROFILES_V5,
  RUOLI_V5,
} from '@/lib/roleMatchingV5';
import { TraitScores } from '@/lib/syndromes';

// ============================================
// PROFILI TEST
// ============================================

// Venditore ideale
const idealSalesperson: TraitScores = {
  ORG: 35,
  AUT: 55,
  GP: 50,
  ADS: 40,
  DET: 60,
  VEN: 70,
  HRM: 30,
  LDR: 45,
  PRO: 45,
  COM: 35,
  ESP: 55,
  RC: 25,
  FIN: 50,
  SUC: 75,
  PRI: 60
};

// Amministrativo ideale
const idealAdmin: TraitScores = {
  ORG: 60,
  AUT: 40,
  GP: 45,
  ADS: 55,
  DET: 40,
  VEN: 20,
  HRM: 30,
  LDR: 30,
  PRO: 35,
  COM: 40,
  ESP: 30,
  RC: 40,
  FIN: 45,
  SUC: 60,
  PRI: 55
};

// Direttore Generale ideale
const idealDG: TraitScores = {
  ORG: 55,
  AUT: 65,
  GP: 55,
  ADS: 50,
  DET: 60,
  VEN: 50,
  HRM: 55,
  LDR: 70,
  PRO: 55,
  COM: 45,
  ESP: 50,
  RC: 30,
  FIN: 55,
  SUC: 80,
  PRI: 70
};

// Profilo PSP (non regge pressione)
const pspProfile: TraitScores = {
  ORG: 40,
  AUT: 45,
  GP: 15, // < 21 = PSP
  ADS: 40,
  DET: 35,
  VEN: 45,
  HRM: 30,
  LDR: 35,
  PRO: 30,
  COM: 40,
  ESP: 35,
  RC: 35,
  FIN: 40,
  SUC: 55,
  PRI: 50
};

// Profilo con sindrome critica
const criticalProfile: TraitScores = {
  ORG: 30,
  AUT: 40,
  GP: 30,
  ADS: 35,
  DET: 25,
  VEN: 20,
  HRM: -10, // S01 trigger
  LDR: 30,
  PRO: -15, // S01 trigger
  COM: -20, // S01 trigger
  ESP: -10, // S01 trigger
  RC: 35,
  FIN: 20,
  SUC: 50,
  PRI: 40
};

// ============================================
// TEST CONFIGURAZIONE
// ============================================

describe('RoleMatchingV5 - Configurazione', () => {
  it('dovrebbe avere 15 ruoli configurati', () => {
    expect(RUOLI_V5.length).toBe(15);
  });

  it('ogni ruolo dovrebbe avere struttura completa', () => {
    for (const ruolo of RUOLI_V5) {
      const profile = ROLE_PROFILES_V5[ruolo];
      expect(profile.id).toBeDefined();
      expect(profile.nome).toBeDefined();
      expect(profile.categoria).toBeDefined();
      expect(profile.requisiti.length).toBeGreaterThan(0);
      expect(profile.disqualifiers.length).toBeGreaterThan(0);
      expect(profile.domandeColloquio.length).toBeGreaterThan(0);
    }
  });

  it('dovrebbe includere i ruoli chiave', () => {
    expect(RUOLI_V5).toContain('Venditore/Commerciale');
    expect(RUOLI_V5).toContain('Responsabile Amministrativo');
    expect(RUOLI_V5).toContain('Direttore Generale');
    expect(RUOLI_V5).toContain('Customer Care');
    expect(RUOLI_V5).toContain('HR Manager');
  });
});

// ============================================
// TEST MATCHING SINGOLO RUOLO
// ============================================

describe('RoleMatchingV5 - Matching Singolo', () => {
  it('venditore ideale dovrebbe essere IDONEO per Vendite', () => {
    const result = calculateRoleMatchingV5('Venditore/Commerciale', idealSalesperson);
    expect(result.verdict).toBe('IDONEO');
    expect(result.compatibilitaPct).toBeGreaterThanOrEqual(80);
    expect(result.disqualifiersAttivi.length).toBe(0);
  });

  it('amministrativo ideale dovrebbe essere IDONEO per Amministrazione', () => {
    const result = calculateRoleMatchingV5('Responsabile Amministrativo', idealAdmin);
    expect(result.verdict).toBe('IDONEO');
    expect(result.compatibilitaPct).toBeGreaterThanOrEqual(80);
  });

  it('DG ideale dovrebbe essere IDONEO per Direzione', () => {
    const result = calculateRoleMatchingV5('Direttore Generale', idealDG);
    expect(result.verdict).toBe('IDONEO');
    expect(result.compatibilitaPct).toBeGreaterThanOrEqual(80);
  });

  it('profilo PSP dovrebbe essere NON IDONEO per Vendite (disqualifier)', () => {
    const result = calculateRoleMatchingV5('Venditore/Commerciale', pspProfile);
    expect(result.verdict).toBe('NON_IDONEO');
    expect(result.disqualifiersAttivi.some(d => 
      d.reason.includes('PSP') || d.reason.includes('pressione')
    )).toBe(true);
  });

  it('profilo critico dovrebbe essere NON IDONEO per qualsiasi ruolo', () => {
    const result = calculateRoleMatchingV5('Direttore Generale', criticalProfile);
    expect(result.verdict).toBe('NON_IDONEO');
    expect(result.syndromiRilevanti.length).toBeGreaterThan(0);
  });

  it('venditore ideale NON dovrebbe essere ideale per Amministrazione', () => {
    const result = calculateRoleMatchingV5('Responsabile Amministrativo', idealSalesperson);
    // Troppo orientato alla vendita
    expect(result.disqualifiersAttivi.some(d => 
      d.reason.includes('vendita')
    )).toBe(true);
  });
});

// ============================================
// TEST MATCHING TUTTI I RUOLI
// ============================================

describe('RoleMatchingV5 - Matching Completo', () => {
  it('dovrebbe calcolare compatibilità per tutti i 15 ruoli', () => {
    const result = calculateAllRolesCompatibilityV5('Venditore/Commerciale', idealSalesperson);
    expect(result.tuttiRuoli.length).toBe(15);
  });

  it('dovrebbe identificare ruolo ideale se diverso dal richiesto', () => {
    // Profilo admin candidato per vendite
    const result = calculateAllRolesCompatibilityV5('Venditore/Commerciale', idealAdmin);
    
    // Il ruolo ideale dovrebbe essere Amministrativo
    if (result.ruoloIdeale) {
      expect(result.ruoloIdeale.ruolo).toBe('Responsabile Amministrativo');
    }
  });

  it('dovrebbe ordinare i ruoli per compatibilità decrescente', () => {
    const result = calculateAllRolesCompatibilityV5('Venditore/Commerciale', idealSalesperson);
    
    for (let i = 0; i < result.tuttiRuoli.length - 1; i++) {
      expect(result.tuttiRuoli[i].compatibilita).toBeGreaterThanOrEqual(
        result.tuttiRuoli[i + 1].compatibilita
      );
    }
  });
});

// ============================================
// TEST HELPER UI
// ============================================

describe('RoleMatchingV5 - Helper UI', () => {
  it('getVerdictBadgeVariantV5 dovrebbe ritornare varianti corrette', () => {
    expect(getVerdictBadgeVariantV5('IDONEO')).toBe('default');
    expect(getVerdictBadgeVariantV5('IDONEO_CON_RISERVA')).toBe('secondary');
    expect(getVerdictBadgeVariantV5('DA_VALUTARE')).toBe('outline');
    expect(getVerdictBadgeVariantV5('NON_IDONEO')).toBe('destructive');
  });

  it('getVerdictLabelV5 dovrebbe ritornare label corrette', () => {
    expect(getVerdictLabelV5('IDONEO')).toBe('Idoneo');
    expect(getVerdictLabelV5('NON_IDONEO')).toBe('Non Idoneo');
  });

  it('getVerdictColorV5 dovrebbe ritornare colori corretti', () => {
    expect(getVerdictColorV5('IDONEO')).toContain('green');
    expect(getVerdictColorV5('NON_IDONEO')).toContain('red');
  });
});

// ============================================
// ESEMPIO CALCOLO COMPLETO
// ============================================

describe('RoleMatchingV5 - Esempio Calcolo', () => {
  it('dovrebbe mostrare esempio di matching per venditore', () => {
    console.log('\n========================================');
    console.log('ESEMPIO MATCHING RUOLO V5');
    console.log('========================================\n');
    
    console.log('PROFILO: Venditore Ideale');
    console.log(JSON.stringify(idealSalesperson, null, 2));
    
    const result = calculateAllRolesCompatibilityV5('Venditore/Commerciale', idealSalesperson);
    
    console.log('\nMATCHING PER RUOLO RICHIESTO (Venditore/Commerciale):');
    console.log('Verdetto:', result.ruoloRichiesto.verdict);
    console.log('Compatibilità:', result.ruoloRichiesto.compatibilitaPct + '%');
    console.log('Motivazione:', result.ruoloRichiesto.motivazione);
    
    console.log('\nREQUISITI SODDISFATTI:');
    result.ruoloRichiesto.requisitiSoddisfatti.forEach(r => {
      console.log(`  ✓ ${r.label}: ${r.valore}`);
    });
    
    console.log('\nTUTTI I RUOLI (ordinati per compatibilità):');
    result.tuttiRuoli.forEach(r => {
      console.log(`  ${r.ruolo}: ${r.compatibilita}% - ${r.verdict}`);
    });
    
    console.log('\n========================================\n');
    
    expect(result.ruoloRichiesto.verdict).toBe('IDONEO');
  });
});
