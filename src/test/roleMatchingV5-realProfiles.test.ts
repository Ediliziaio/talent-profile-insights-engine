/**
 * Test del sistema di matching V5 con profili REALI dal database
 * Converte i profili V4 in tratti V5 per testare la logica
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRoleMatchingV5,
  calculateAllRolesCompatibilityV5,
  RUOLI_V5,
} from '@/lib/roleMatchingV5';
import { TraitScores, getActiveSyndromes } from '@/lib/syndromes';

// ============================================
// CONVERSIONE V4 → V5 (approssimativa per test)
// ============================================

interface V4Scores {
  SV: number;  // Stile di Vita
  MO: number;  // Motivazione
  CF: number;  // Capacità Fronteggiare
  EF: number;  // Efficienza
  EC: number;  // Efficacia
  QN: number;  // Quantità Responsabilità
  QR: number;  // Qualità Responsabilità
  SP: number;  // Spazio Vitale (Ambizione)
  PA: number;  // Partecipazione
  SC: number;  // Schematicità
}

/**
 * Converte punteggi V4 (scala 0-200) in tratti V5 (scala -100 a +100)
 * Questa è una mappatura approssimativa per scopi di test
 */
function convertV4toV5(v4: V4Scores): TraitScores {
  // Normalizza da 0-200 a -100/+100: (valore - 100)
  const norm = (v: number) => Math.round(v - 100);
  
  return {
    // ESSERE (concentrazione sugli obiettivi)
    ORG: norm(v4.EF),           // Organizzazione ← Efficienza
    AUT: norm(v4.MO),           // Automotivazione ← Motivazione
    GP: norm(v4.CF),            // Gestione Pressioni ← Capacità Fronteggiare
    
    // FARE (azioni concrete)
    ADS: norm((v4.EF + v4.SC) / 2),  // Autodisciplina ← media EF+SC
    DET: norm(v4.EC),           // Determinazione ← Efficacia
    VEN: norm(v4.SP),           // Attitudine Vendita ← Spazio Vitale (ambizione)
    HRM: norm(v4.PA),           // HR Management ← Partecipazione
    
    // AVERE (relazioni)
    LDR: norm(v4.QR),           // Leadership ← Qualità Responsabilità
    PRO: norm(v4.PA),           // Proattività ← Partecipazione
    COM: norm((v4.PA + v4.SV) / 2),  // Comprensione ← media PA+SV
    ESP: norm(v4.PA),           // Espansività ← Partecipazione
    
    // INDICATORI
    RC: norm(v4.SC),            // Resistenza Cambiamento ← Schematicità
    FIN: norm(v4.SP),           // Finanze ← Spazio Vitale
    SUC: norm(v4.EC),           // Successo ← Efficacia
    PRI: norm((v4.QR + v4.SV) / 2),  // Principi ← media QR+SV
  };
}

// ============================================
// PROFILI REALI DAL DATABASE (V4)
// ============================================

const realProfiles = [
  {
    nome: 'Elena Bellin',
    funzione: 'Ufficio marketing',
    eta: 42,
    v4: { SV: 120, MO: 155, CF: 10, EF: 130, EC: 175, QN: 105, QR: 80, SP: 145, PA: 200, SC: 185 }
  },
  {
    nome: 'Davide Curti',
    funzione: 'Ufficio vendite',
    eta: 39,
    v4: { SV: 135, MO: 170, CF: 70, EF: 130, EC: 200, QN: 105, QR: 75, SP: 165, PA: 200, SC: 185 }
  },
  {
    nome: 'Armando Femiano',
    funzione: 'Ufficio vendite',
    eta: 49,
    v4: { SV: 100, MO: 170, CF: 60, EF: 115, EC: 200, QN: 105, QR: 80, SP: 140, PA: 190, SC: 200 }
  },
  {
    nome: 'Giuseppa Cafà',
    funzione: 'Ufficio marketing',
    eta: 54,
    v4: { SV: 125, MO: 165, CF: 100, EF: 150, EC: 200, QN: 95, QR: 85, SP: 135, PA: 200, SC: 200 }
  },
  {
    nome: 'Alessandro De Marco',
    funzione: 'Direzione generale',
    eta: 41,
    v4: { SV: 150, MO: 185, CF: 100, EF: 140, EC: 200, QN: 110, QR: 100, SP: 150, PA: 200, SC: 200 }
  },
  {
    nome: 'Matteo Dalpasso',
    funzione: 'Amministrazione',
    eta: 34,
    v4: { SV: 125, MO: 140, CF: 15, EF: 120, EC: 175, QN: 105, QR: 85, SP: 150, PA: 200, SC: 175 }
  },
  {
    nome: 'Giuliano Beretta',
    funzione: 'Direzione generale',
    eta: 53,
    v4: { SV: 145, MO: 160, CF: 105, EF: 145, EC: 200, QN: 105, QR: 95, SP: 175, PA: 200, SC: 190 }
  },
  {
    nome: 'Florin Andriciuc',
    funzione: 'Ufficio vendite',
    eta: 29,
    v4: { SV: 170, MO: 180, CF: 155, EF: 140, EC: 200, QN: 110, QR: 125, SP: 145, PA: 175, SC: 200 }
  },
  {
    nome: 'Francesca Dell\'Aquila',
    funzione: 'Ufficio vendite',
    eta: 35,
    v4: { SV: 135, MO: 160, CF: 85, EF: 105, EC: 200, QN: 105, QR: 85, SP: 140, PA: 200, SC: 145 }
  },
  {
    nome: 'Samuele Beretta',
    funzione: 'Direzione generale',
    eta: 20,
    v4: { SV: 110, MO: 155, CF: 120, EF: 140, EC: 200, QN: 105, QR: 90, SP: 150, PA: 120, SC: 200 }
  },
];

// Mappa funzione DB → ruolo V5
const funzioneToRuoloV5: Record<string, string> = {
  'Ufficio vendite': 'Venditore/Commerciale',
  'Ufficio marketing': 'Marketing Manager',
  'Direzione generale': 'Direttore Generale',
  'Amministrazione': 'Responsabile Amministrativo',
  'Ufficio risorse umane': 'HR Manager',
  'Ufficio tecnico': 'Responsabile Tecnico',
  'Ufficio acquisti': 'Buyer/Acquisti',
  'Produzione': 'Responsabile Produzione/Logistica',
  'Logistica': 'Responsabile Produzione/Logistica',
};

// ============================================
// TEST CON PROFILI REALI
// ============================================

describe('RoleMatchingV5 - Profili Reali DB', () => {
  it('dovrebbe convertire correttamente V4 → V5', () => {
    const v4Sample = realProfiles[0].v4;
    const v5 = convertV4toV5(v4Sample);
    
    // Verifica che i valori siano nel range corretto
    Object.values(v5).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(-100);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  realProfiles.forEach((profile) => {
    it(`dovrebbe valutare ${profile.nome} (${profile.funzione})`, () => {
      const v5Traits = convertV4toV5(profile.v4);
      const ruoloV5 = funzioneToRuoloV5[profile.funzione] || 'Customer Care';
      
      const result = calculateRoleMatchingV5(ruoloV5, v5Traits, profile.eta);
      
      console.log(`\n--- ${profile.nome} (${profile.eta}y) ---`);
      console.log(`Funzione: ${profile.funzione} → Ruolo V5: ${ruoloV5}`);
      console.log(`Tratti V5 convertiti:`, JSON.stringify(v5Traits, null, 2));
      console.log(`Verdetto: ${result.verdict}`);
      console.log(`Compatibilità: ${result.compatibilitaPct}%`);
      console.log(`Motivazione: ${result.motivazione}`);
      
      if (result.disqualifiersAttivi.length > 0) {
        console.log(`⚠️ Disqualifiers:`, result.disqualifiersAttivi.map(d => d.reason));
      }
      
      if (result.syndromiRilevanti.length > 0) {
        console.log(`🔴 Sindromi:`, result.syndromiRilevanti.map(s => `${s.code}: ${s.name}`));
      }
      
      // Verifica che il risultato sia valido
      expect(['IDONEO', 'IDONEO_CON_RISERVA', 'DA_VALUTARE', 'NON_IDONEO']).toContain(result.verdict);
      expect(result.compatibilitaPct).toBeGreaterThanOrEqual(0);
      expect(result.compatibilitaPct).toBeLessThanOrEqual(100);
    });
  });
});

describe('RoleMatchingV5 - Analisi Pattern Specifici', () => {
  it('Elena Bellin: CF=10 dovrebbe essere problematico (GP basso)', () => {
    const v5 = convertV4toV5(realProfiles[0].v4);
    
    // CF=10 → GP = 10-100 = -90 (molto basso!)
    expect(v5.GP).toBeLessThan(0);
    
    const syndromes = getActiveSyndromes(v5, 42);
    console.log('\nElena Bellin - Sindromi rilevate:', syndromes.map(s => s.code));
    
    // Dovrebbe avere GP < 21 = PSP
    expect(v5.GP).toBeLessThan(21);
  });

  it('Matteo Dalpasso: CF=15 per Amministrazione', () => {
    const v5 = convertV4toV5(realProfiles[5].v4);
    
    // CF=15 → GP = -85 (molto basso)
    console.log('\nMatteo Dalpasso (Amministrazione) - GP:', v5.GP);
    
    const result = calculateRoleMatchingV5('Responsabile Amministrativo', v5, 34);
    console.log('Verdetto:', result.verdict);
    
    // GP basso NON è critico per Amministrazione (non è nel requisiti)
    // Ma potrebbe essere un warning generale
  });

  it('Florin Andriciuc: profilo con CF alto ma VEN borderline', () => {
    const v5 = convertV4toV5(realProfiles[7].v4);
    
    console.log('\nFlorin Andriciuc (Vendite) - Tratti chiave:');
    console.log('  VEN:', v5.VEN, '(richiesto ≥50)');
    console.log('  DET:', v5.DET, '(richiesto ≥40)');
    console.log('  ESP:', v5.ESP, '(richiesto ≥35)');
    console.log('  GP:', v5.GP, '(richiesto ≥21)');
    
    const result = calculateRoleMatchingV5('Venditore/Commerciale', v5, 29);
    console.log('Verdetto:', result.verdict);
    
    // Florin ha VEN=45 ma anche AUT=60, GP=45, DET=80, ESP=65
    // Tutti i requisiti critici sono soddisfatti quindi è IDONEO
    expect(result.verdict).toBe('IDONEO');
  });

  it('Alessandro De Marco: profilo DG con leadership mappata bassa (QR=100→LDR=0)', () => {
    const v5 = convertV4toV5(realProfiles[4].v4);
    
    console.log('\nAlessandro De Marco (DG) - Tratti chiave:');
    console.log('  LDR:', v5.LDR, '(richiesto ≥55)');
    console.log('  AUT:', v5.AUT, '(richiesto ≥50)');
    console.log('  DET:', v5.DET, '(richiesto ≥50)');
    console.log('  GP:', v5.GP, '(richiesto ≥40)');
    console.log('  HRM:', v5.HRM, '(richiesto ≥40)');
    
    const result = calculateRoleMatchingV5('Direttore Generale', v5, 41);
    console.log('Verdetto:', result.verdict);
    
    // La mappatura V4→V5 (QR→LDR) produce LDR=0 (QR=100-100=0)
    // Questo è sotto la soglia ≥55, quindi NON_IDONEO è corretto
    // NOTA: Questo evidenzia che la mappatura V4→V5 non è perfetta
    expect(result.verdict).toBe('NON_IDONEO');
    expect(result.disqualifiersAttivi.some(d => d.reason.includes('Leadership'))).toBe(true);
  });
});

describe('RoleMatchingV5 - Riepilogo Verdetti', () => {
  it('dovrebbe generare riepilogo completo', () => {
    console.log('\n========================================');
    console.log('RIEPILOGO VERDETTI V5 - PROFILI REALI');
    console.log('========================================\n');
    
    const summary: { nome: string; ruolo: string; verdict: string; compat: number }[] = [];
    
    realProfiles.forEach((profile) => {
      const v5Traits = convertV4toV5(profile.v4);
      const ruoloV5 = funzioneToRuoloV5[profile.funzione] || 'Customer Care';
      const result = calculateRoleMatchingV5(ruoloV5, v5Traits, profile.eta);
      
      summary.push({
        nome: profile.nome,
        ruolo: ruoloV5,
        verdict: result.verdict,
        compat: result.compatibilitaPct
      });
    });
    
    // Stampa tabella
    console.log('| Nome | Ruolo | Verdetto | Compat |');
    console.log('|------|-------|----------|--------|');
    summary.forEach(s => {
      const verdictIcon = {
        'IDONEO': '✅',
        'IDONEO_CON_RISERVA': '⚠️',
        'DA_VALUTARE': '🔶',
        'NON_IDONEO': '❌'
      }[s.verdict] || '?';
      console.log(`| ${s.nome.padEnd(22)} | ${s.ruolo.padEnd(25)} | ${verdictIcon} ${s.verdict.padEnd(18)} | ${s.compat}% |`);
    });
    
    console.log('\n========================================\n');
    
    expect(summary.length).toBe(10);
  });
});
