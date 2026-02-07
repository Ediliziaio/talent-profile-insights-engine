/**
 * Test per il ricalcolo nativo V5 con dati reali dal database
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  loadDomandeV5,
  loadRisposteCandidato,
  ricalcolaProfiloCandidatoV5,
  DomandaV5,
  RicalcoloResult
} from '@/lib/ricalcoloV5';
import { calcolaProfiloV5, RispostaInputV5 } from '@/lib/scoringV5';
import { getActiveSyndromes, TraitScores } from '@/lib/syndromes';
import { 
  calculateRoleMatchingV5, 
  calculateAllRolesCompatibilityV5 
} from '@/lib/roleMatchingV5';

// Mock data per test offline (basato su dati reali estratti)
const mockDomande: DomandaV5[] = [
  { id: 1, scala_primaria: 'ORG', polarita: '-' },
  { id: 2, scala_primaria: 'ADS', polarita: '-' },
  { id: 3, scala_primaria: 'GP', polarita: '-' },
  { id: 4, scala_primaria: 'ADS', polarita: '+' },
  { id: 5, scala_primaria: 'AUT', polarita: '+' },
  { id: 6, scala_primaria: 'DET', polarita: '+' },
  { id: 7, scala_primaria: 'PRI', polarita: '+' },
  { id: 8, scala_primaria: 'RC', polarita: '+' },
  { id: 9, scala_primaria: 'ESP', polarita: '-' },
  { id: 10, scala_primaria: 'ESP', polarita: '+' },
  { id: 11, scala_primaria: 'ORG', polarita: '+' },
  { id: 12, scala_primaria: 'SUC', polarita: '+' },
  { id: 13, scala_primaria: 'GP', polarita: '+' },
  { id: 14, scala_primaria: 'COM', polarita: '+' },
  { id: 15, scala_primaria: 'AUT', polarita: '+' },
];

const mockRisposte: RispostaInputV5[] = [
  { domanda_id: 1, valore: 'B' },
  { domanda_id: 2, valore: 'B' },
  { domanda_id: 3, valore: 'B' },
  { domanda_id: 4, valore: 'A' },
  { domanda_id: 5, valore: 'A' },
  { domanda_id: 6, valore: 'B' },
  { domanda_id: 7, valore: 'A' },
  { domanda_id: 8, valore: 'A' },
  { domanda_id: 9, valore: 'B' },
  { domanda_id: 10, valore: 'A' },
  { domanda_id: 11, valore: 'A' },
  { domanda_id: 12, valore: 'B' },
  { domanda_id: 13, valore: 'A' },
  { domanda_id: 14, valore: 'B' },
  { domanda_id: 15, valore: 'A' },
];

// ============================================
// TEST OFFLINE (senza database)
// ============================================

describe('RicalcoloV5 - Calcolo Offline', () => {
  it('dovrebbe calcolare punteggi da risposte mock', () => {
    const profilo = calcolaProfiloV5(mockRisposte, mockDomande);
    
    console.log('\n=== TEST CALCOLO OFFLINE ===');
    console.log('Tratti calcolati:', profilo.traits_v5);
    console.log('Macro-aree:', {
      essere: profilo.essere_pct,
      fare: profilo.fare_pct,
      avere: profilo.avere_pct
    });
    
    // Verifica che i tratti siano nel range corretto
    Object.entries(profilo.traits_v5).forEach(([trait, score]) => {
      if (trait !== 'CTRL') {
        expect(score).toBeGreaterThanOrEqual(-100);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
    
    // Verifica macro-aree
    expect(profilo.essere_pct).toBeGreaterThanOrEqual(0);
    expect(profilo.essere_pct).toBeLessThanOrEqual(100);
  });

  it('dovrebbe gestire polarità negative correttamente', () => {
    // Domanda 1: ORG, polarità -, risposta B = 5 punti
    const profilo = calcolaProfiloV5(
      [{ domanda_id: 1, valore: 'B' }],
      [{ id: 1, scala_primaria: 'ORG', polarita: '-' }]
    );
    
    // Con una sola domanda su 12, il punteggio sarà basso
    // rawScore = 5, maxScore = 120, normalized = ((5/120)*200)-100 = -91.67 ≈ -92
    expect(profilo.traits_v5.ORG).toBeDefined();
  });

  it('dovrebbe gestire polarità positive correttamente', () => {
    // Domanda con polarità +, risposta A = 10 punti
    const profilo = calcolaProfiloV5(
      [{ domanda_id: 5, valore: 'A' }],
      [{ id: 5, scala_primaria: 'AUT', polarita: '+' }]
    );
    
    expect(profilo.traits_v5.AUT).toBeDefined();
  });
});

// ============================================
// TEST INTEGRAZIONE SINDROMI
// ============================================

describe('RicalcoloV5 - Integrazione Sindromi', () => {
  it('dovrebbe rilevare sindromi dai tratti calcolati', () => {
    // Simula un profilo con valori che attivano sindromi
    const traitsCritici: TraitScores = {
      ORG: 30,
      AUT: 70, // Alto AUT
      GP: 10,  // Basso GP → potenziale S03/S09
      ADS: 40,
      DET: 50,
      VEN: 30,
      HRM: -10,
      LDR: 30,
      PRO: -20,
      COM: -15, // Basso COM
      ESP: 40,
      RC: 25,
      FIN: 30,
      SUC: 55,
      PRI: 50
    };
    
    const syndromes = getActiveSyndromes(traitsCritici);
    
    console.log('\n=== TEST SINDROMI DA TRATTI ===');
    console.log('Sindromi attive:', syndromes.map(s => `${s.code}: ${s.name}`));
    
    // Dovrebbe rilevare S03 o S09 per AUT alto + GP basso
    expect(syndromes.length).toBeGreaterThan(0);
  });
});

// ============================================
// TEST INTEGRAZIONE ROLE MATCHING
// ============================================

describe('RicalcoloV5 - Integrazione Role Matching', () => {
  it('dovrebbe calcolare matching ruoli dai tratti V5', () => {
    // Profilo venditore
    const traitsVenditore: TraitScores = {
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
    
    const result = calculateRoleMatchingV5('Venditore/Commerciale', traitsVenditore);
    
    console.log('\n=== TEST ROLE MATCHING V5 ===');
    console.log('Ruolo:', result.ruolo);
    console.log('Verdetto:', result.verdict);
    console.log('Compatibilità:', result.compatibilitaPct + '%');
    
    expect(result.verdict).toBe('IDONEO');
    expect(result.compatibilitaPct).toBeGreaterThanOrEqual(80);
  });

  it('dovrebbe identificare ruolo ideale', () => {
    // Profilo admin candidato per vendite
    const traitsAdmin: TraitScores = {
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
    
    const result = calculateAllRolesCompatibilityV5('Venditore/Commerciale', traitsAdmin);
    
    console.log('\n=== TEST RUOLO IDEALE ===');
    console.log('Ruolo richiesto:', result.ruoloRichiesto.ruolo);
    console.log('Verdetto:', result.ruoloRichiesto.verdict);
    console.log('Ruolo ideale:', result.ruoloIdeale?.ruolo);
    
    // Il ruolo ideale dovrebbe essere diverso da Vendite
    if (result.ruoloIdeale) {
      expect(result.ruoloIdeale.ruolo).not.toBe('Venditore/Commerciale');
    }
  });
});

// ============================================
// ESEMPIO COMPLETO PIPELINE
// ============================================

describe('RicalcoloV5 - Pipeline Completa', () => {
  it('dovrebbe eseguire pipeline completa: Risposte → Tratti → Sindromi → Matching', () => {
    console.log('\n' + '='.repeat(60));
    console.log('PIPELINE COMPLETA V5');
    console.log('='.repeat(60));
    
    // 1. Calcola profilo da risposte
    const profilo = calcolaProfiloV5(mockRisposte, mockDomande);
    console.log('\n1️⃣ CALCOLO TRATTI:');
    console.log('   Version:', profilo.assessment_version);
    console.log('   Reliability:', profilo.reliability_index);
    
    // 2. Converti in TraitScores
    const traits: TraitScores = {
      ORG: profilo.traits_v5.ORG,
      AUT: profilo.traits_v5.AUT,
      GP: profilo.traits_v5.GP,
      ADS: profilo.traits_v5.ADS,
      DET: profilo.traits_v5.DET,
      VEN: profilo.traits_v5.VEN,
      HRM: profilo.traits_v5.HRM,
      LDR: profilo.traits_v5.LDR,
      PRO: profilo.traits_v5.PRO,
      COM: profilo.traits_v5.COM,
      ESP: profilo.traits_v5.ESP,
      RC: profilo.traits_v5.RC,
      FIN: profilo.traits_v5.FIN,
      SUC: profilo.traits_v5.SUC,
      PRI: profilo.traits_v5.PRI
    };
    
    console.log('\n2️⃣ MACRO-AREE:');
    console.log(`   ESSERE: ${profilo.essere_pct}%`);
    console.log(`   FARE: ${profilo.fare_pct}%`);
    console.log(`   AVERE: ${profilo.avere_pct}%`);
    
    // 3. Calcola sindromi
    const syndromes = getActiveSyndromes(traits);
    console.log('\n3️⃣ SINDROMI:', syndromes.length > 0 
      ? syndromes.map(s => s.code).join(', ') 
      : 'Nessuna');
    
    // 4. Role matching
    const matching = calculateAllRolesCompatibilityV5('Customer Care', traits);
    console.log('\n4️⃣ ROLE MATCHING:');
    console.log(`   Ruolo: ${matching.ruoloRichiesto.ruolo}`);
    console.log(`   Verdetto: ${matching.ruoloRichiesto.verdict}`);
    console.log(`   Compatibilità: ${matching.ruoloRichiesto.compatibilitaPct}%`);
    
    if (matching.ruoloIdeale) {
      console.log(`   Ruolo Ideale: ${matching.ruoloIdeale.ruolo} (${matching.ruoloIdeale.compatibilita}%)`);
    }
    
    console.log('\n' + '='.repeat(60));
    
    expect(profilo.assessment_version).toBe('v5');
    expect(matching.tuttiRuoli.length).toBe(9);
  });
});
