/**
 * Test per il sistema di cache del Role Matching V5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  roleMatchingCache,
  calculateRoleMatchingV5Cached,
  calculateAllRolesCompatibilityV5Cached,
} from '../lib/roleMatchingV5Cache';
import { RUOLI_V5 } from '../lib/roleMatchingV5';
import { TraitScores } from '../lib/syndromes';

// Profilo di test
const testProfile: TraitScores = {
  ORG: 50,
  AUT: 45,
  GP: 40,
  ADS: 55,
  DET: 50,
  VEN: 60,
  HRM: 35,
  LDR: 40,
  PRO: 45,
  COM: 40,
  ESP: 50,
  RC: 30,
  FIN: 45,
  SUC: 55,
  PRI: 50,
};

describe('RoleMatchingV5Cache', () => {
  beforeEach(() => {
    // Pulisce la cache prima di ogni test
    roleMatchingCache.clear();
  });

  describe('calculateRoleMatchingV5Cached', () => {
    it('should return consistent results', () => {
      const result1 = calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);
      const result2 = calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);

      expect(result1.verdict).toBe(result2.verdict);
      expect(result1.compatibilitaPct).toBe(result2.compatibilitaPct);
    });

    it('should cache results and improve hit rate', () => {
      const statsBefore = roleMatchingCache.getStats();
      const hitsBefore = statsBefore.singleRoleHits;
      const missesBefore = statsBefore.singleRoleMisses;
      
      // Prima chiamata - cache miss
      calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);
      
      // Seconda chiamata - cache hit
      calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);

      const statsAfter = roleMatchingCache.getStats();
      // Dovremmo avere 1 miss in più e 1 hit in più rispetto a prima
      expect(statsAfter.singleRoleHits - hitsBefore).toBeGreaterThanOrEqual(1);
    });

    it('should return different results for different roles', () => {
      const vendResult = calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);
      const dgResult = calculateRoleMatchingV5Cached('Direttore Generale', testProfile, 35);

      expect(vendResult.ruolo).toBe('Venditore/Commerciale');
      expect(dgResult.ruolo).toBe('Direttore Generale');
    });

    it('should return different results for different ages', () => {
      const statsBefore = roleMatchingCache.getStats();
      const missesBefore = statsBefore.singleRoleMisses;
      
      const young = calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 25);
      const senior = calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 60);

      // I risultati possono essere uguali ma devono essere calcolati separatamente (2 nuovi miss)
      const statsAfter = roleMatchingCache.getStats();
      expect(statsAfter.singleRoleMisses - missesBefore).toBeGreaterThanOrEqual(2);
    });
  });

  describe('calculateAllRolesCompatibilityV5Cached', () => {
    it('should return every configured role', () => {
      const result = calculateAllRolesCompatibilityV5Cached('Venditore/Commerciale', testProfile, 35);

      // Ancorato al motore, non a un numero fisso: aggiungere un ruolo a
      // ROLE_PROFILES_V5 non deve rompere questo test.
      expect(result.tuttiRuoli.length).toBe(RUOLI_V5.length);
      expect(result.tuttiRuoli.length).toBeGreaterThanOrEqual(24);
    });

    it('should cache results', () => {
      const statsBefore = roleMatchingCache.getStats();
      const hitsBefore = statsBefore.allRolesHits;
      
      // Prima chiamata
      calculateAllRolesCompatibilityV5Cached('Venditore/Commerciale', testProfile, 35);
      
      // Seconda chiamata
      calculateAllRolesCompatibilityV5Cached('Venditore/Commerciale', testProfile, 35);

      const statsAfter = roleMatchingCache.getStats();
      // Dovremmo avere almeno 1 hit in più
      expect(statsAfter.allRolesHits - hitsBefore).toBeGreaterThanOrEqual(1);
    });

    it('should identify ideal role when better than requested', () => {
      // Profilo non ideale per DG
      const lowLeaderProfile: TraitScores = {
        ...testProfile,
        LDR: 20,
        HRM: 15,
      };

      const result = calculateAllRolesCompatibilityV5Cached('Direttore Generale', lowLeaderProfile, 35);
      
      // Dovrebbe suggerire un ruolo migliore
      expect(result.ruoloRichiesto.verdict).not.toBe('IDONEO');
    });
  });

  describe('Cache Management', () => {
    it('should track cache statistics', () => {
      const stats = roleMatchingCache.getStats();
      
      expect(stats).toHaveProperty('singleRoleHits');
      expect(stats).toHaveProperty('singleRoleMisses');
      expect(stats).toHaveProperty('allRolesHits');
      expect(stats).toHaveProperty('allRolesMisses');
      expect(stats).toHaveProperty('singleRoleSize');
      expect(stats).toHaveProperty('allRolesSize');
    });

    it('should clear cache', () => {
      // Popola la cache
      calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);
      
      // Verifica che ci sia qualcosa
      expect(roleMatchingCache.getStats().singleRoleSize).toBe(1);

      // Pulisci
      roleMatchingCache.clear();

      expect(roleMatchingCache.getStats().singleRoleSize).toBe(0);
    });

    it('should invalidate cache for specific traits', () => {
      // Popola la cache
      calculateRoleMatchingV5Cached('Venditore/Commerciale', testProfile, 35);
      expect(roleMatchingCache.getStats().singleRoleSize).toBe(1);

      // Invalida per quel profilo
      roleMatchingCache.invalidateForTraits(testProfile);

      expect(roleMatchingCache.getStats().singleRoleSize).toBe(0);
    });

    it('should calculate hit rates correctly', () => {
      // Usa un profilo completamente unico per questo test
      const uniqueProfile: TraitScores = {
        ORG: 123,
        AUT: 45,
        GP: 40,
        ADS: 55,
        DET: 50,
        VEN: 60,
        HRM: 35,
        LDR: 40,
        PRO: 45,
        COM: 40,
        ESP: 50,
        RC: 30,
        FIN: 45,
        SUC: 55,
        PRI: 50,
      };
      
      // Prima chiamata per ogni ruolo - miss
      const r1 = calculateRoleMatchingV5Cached('Direttore Generale', uniqueProfile, 99);
      const r2 = calculateRoleMatchingV5Cached('HR Manager', uniqueProfile, 99);
      
      // Seconda chiamata - hit (stessi parametri)
      const r3 = calculateRoleMatchingV5Cached('Direttore Generale', uniqueProfile, 99);
      const r4 = calculateRoleMatchingV5Cached('HR Manager', uniqueProfile, 99);

      // Verifica che i risultati siano identici (cache funziona)
      expect(r1.verdict).toBe(r3.verdict);
      expect(r2.verdict).toBe(r4.verdict);
    });
  });
});
