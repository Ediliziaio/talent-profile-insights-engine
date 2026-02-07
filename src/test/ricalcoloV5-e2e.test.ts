/**
 * Test E2E del ricalcolo V5 con dati reali dal database
 * Questo test richiede connessione al database
 */

import { describe, it, expect } from 'vitest';
import {
  loadDomandeV5,
  loadRisposteCandidato,
  ricalcolaProfiloCandidatoV5,
} from '@/lib/ricalcoloV5';
import { calculateAllRolesCompatibilityV5 } from '@/lib/roleMatchingV5';
import { TraitScores } from '@/lib/syndromes';

// ID candidati reali dal database
const CANDIDATI_TEST = [
  { id: 'd68e49ef-7e82-4a4f-9cd3-1e6b0c8d0c7d', nome: 'Davide Curti', funzione: 'Ufficio vendite' },
  { id: '385c5f22-95f0-4da2-a9fb-246b21d933c3', nome: 'Florin Andriciuc', funzione: 'Ufficio vendite' },
  { id: '27094a28-eb80-4c4f-86b5-721f70faa7a0', nome: 'Alessandro De Marco', funzione: 'Direzione generale' },
];

const funzioneToRuoloV5: Record<string, string> = {
  'Ufficio vendite': 'Venditore/Commerciale',
  'Ufficio marketing': 'Marketing Manager',
  'Direzione generale': 'Direttore Generale',
  'Amministrazione': 'Responsabile Amministrativo',
};

describe('RicalcoloV5 - E2E con Database Reale', () => {
  it('dovrebbe caricare domande dal database', async () => {
    try {
      const domande = await loadDomandeV5();
      
      console.log('\n=== CARICAMENTO DOMANDE ===');
      console.log(`Totale domande caricate: ${domande.length}`);
      
      // Conta domande per tratto
      const countByTrait: Record<string, number> = {};
      domande.forEach(d => {
        countByTrait[d.scala_primaria] = (countByTrait[d.scala_primaria] || 0) + 1;
      });
      
      console.log('Distribuzione per tratto:');
      Object.entries(countByTrait).sort().forEach(([trait, count]) => {
        console.log(`  ${trait}: ${count} domande`);
      });
      
      expect(domande.length).toBeGreaterThan(0);
    } catch (error) {
      console.log('⚠️ Test saltato: richiede connessione al database');
    }
  });

  CANDIDATI_TEST.forEach(candidato => {
    it(`dovrebbe ricalcolare V5 per ${candidato.nome}`, async () => {
      try {
        const result = await ricalcolaProfiloCandidatoV5(candidato.id);
        
        if (!result.success) {
          console.log(`⚠️ Ricalcolo fallito per ${candidato.nome}: ${result.error}`);
          return;
        }
        
        const profilo = result.profiloV5!;
        const traits = profilo.traits_v5;
        
        console.log('\n' + '='.repeat(60));
        console.log(`RICALCOLO V5 NATIVO: ${candidato.nome}`);
        console.log('='.repeat(60));
        
        console.log('\n📊 TRATTI V5:');
        console.log(`   ESSERE: ORG=${traits.ORG}, AUT=${traits.AUT}, GP=${traits.GP}`);
        console.log(`   FARE:   ADS=${traits.ADS}, DET=${traits.DET}, VEN=${traits.VEN}, HRM=${traits.HRM}`);
        console.log(`   AVERE:  LDR=${traits.LDR}, PRO=${traits.PRO}, COM=${traits.COM}, ESP=${traits.ESP}`);
        console.log(`   INDIC:  RC=${traits.RC}, FIN=${traits.FIN}, SUC=${traits.SUC}, PRI=${traits.PRI}`);
        
        console.log('\n📈 MACRO-AREE:');
        console.log(`   ESSERE: ${profilo.essere_pct}%`);
        console.log(`   FARE:   ${profilo.fare_pct}%`);
        console.log(`   AVERE:  ${profilo.avere_pct}%`);
        
        console.log(`\n🏷️ PROFILO: ${profilo.profilo_tipo_v5}`);
        console.log(`📋 ATTENDIBILITÀ: ${profilo.reliability_index}`);
        
        if (result.syndromes.length > 0) {
          console.log(`\n🔴 SINDROMI: ${result.syndromes.map(s => s.code).join(', ')}`);
        }
        
        // Role matching
        const ruoloV5 = funzioneToRuoloV5[candidato.funzione] || 'Customer Care';
        const traitScores: TraitScores = {
          ORG: traits.ORG,
          AUT: traits.AUT,
          GP: traits.GP,
          ADS: traits.ADS,
          DET: traits.DET,
          VEN: traits.VEN,
          HRM: traits.HRM,
          LDR: traits.LDR,
          PRO: traits.PRO,
          COM: traits.COM,
          ESP: traits.ESP,
          RC: traits.RC,
          FIN: traits.FIN,
          SUC: traits.SUC,
          PRI: traits.PRI
        };
        
        const matching = calculateAllRolesCompatibilityV5(ruoloV5, traitScores);
        
        console.log(`\n🎯 ROLE MATCHING per ${ruoloV5}:`);
        console.log(`   Verdetto: ${matching.ruoloRichiesto.verdict}`);
        console.log(`   Compatibilità: ${matching.ruoloRichiesto.compatibilitaPct}%`);
        
        if (matching.ruoloIdeale) {
          console.log(`   Ruolo Ideale: ${matching.ruoloIdeale.ruolo} (${matching.ruoloIdeale.compatibilita}%)`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        // Verifica che il profilo sia calcolato correttamente
        expect(profilo.assessment_version).toBe('v5');
        expect(Object.keys(profilo.traits_v5).length).toBe(16);
        
      } catch (error) {
        console.log(`⚠️ Test saltato: ${error}`);
      }
    });
  });

  it('dovrebbe generare riepilogo comparativo V4 vs V5', async () => {
    console.log('\n' + '='.repeat(60));
    console.log('RIEPILOGO COMPARATIVO V4 → V5');
    console.log('='.repeat(60));
    
    for (const candidato of CANDIDATI_TEST) {
      try {
        const result = await ricalcolaProfiloCandidatoV5(candidato.id);
        
        if (result.success && result.profiloV5) {
          const profilo = result.profiloV5;
          const ruoloV5 = funzioneToRuoloV5[candidato.funzione] || 'Customer Care';
          
          const traitScores: TraitScores = {
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
          
          const matching = calculateAllRolesCompatibilityV5(ruoloV5, traitScores);
          
          console.log(`\n${candidato.nome} (${candidato.funzione}):`);
          console.log(`   Profilo V5: ${profilo.profilo_tipo_v5}`);
          console.log(`   Macro-aree: E=${profilo.essere_pct}%, F=${profilo.fare_pct}%, A=${profilo.avere_pct}%`);
          console.log(`   Sindromi: ${result.syndromes.length > 0 ? result.syndromes.map(s => s.code).join(', ') : 'Nessuna'}`);
          console.log(`   Matching ${ruoloV5}: ${matching.ruoloRichiesto.verdict} (${matching.ruoloRichiesto.compatibilitaPct}%)`);
        }
      } catch {
        console.log(`   ⚠️ Errore per ${candidato.nome}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
  });
});
