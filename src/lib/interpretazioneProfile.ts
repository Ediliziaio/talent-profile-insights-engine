import { ScalaCode, SCALE_LABELS } from '@/types/database';

export interface InterpretazioneItem {
  scala: string;
  valore: number;
  tipo: 'critico' | 'attenzione' | 'forza' | 'info';
  titolo: string;
  descrizione: string;
}

/**
 * Zona di interpretazione per ogni punteggio (Manuale V2)
 */
export type ZonaInterpretazione = 'critica' | 'attenzione' | 'norma' | 'sopra_media' | 'eccellenza';

export function getZonaInterpretazione(score: number): {
  zona: ZonaInterpretazione;
  colore: string;
  descrizione: string;
} {
  if (score < 60) return { zona: 'critica', colore: 'red', descrizione: 'Carenza grave - richiede intervento' };
  if (score < 80) return { zona: 'attenzione', colore: 'orange', descrizione: 'Carenza moderata - monitorare' };
  if (score < 120) return { zona: 'norma', colore: 'gray', descrizione: 'Nella norma' };
  if (score < 160) return { zona: 'sopra_media', colore: 'blue', descrizione: 'Sopra la media' };
  return { zona: 'eccellenza', colore: 'green', descrizione: 'Eccellenza' };
}

/**
 * Pattern combinati critici dal Manuale V2
 */
interface PatternCritico {
  id: string;
  nome: string;
  condizione: (scale: Record<string, number>) => boolean;
  descrizione: string;
  tipo: 'critico' | 'attenzione';
}

const PATTERN_CRITICI: PatternCritico[] = [
  {
    id: 'stress_zone_severa',
    nome: 'Stress Zone Severa',
    condizione: (s) => (s['SV'] || 100) < 60 && (s['CF'] || 100) < 60,
    descrizione: 'Condizione di elevata vulnerabilità. Sia la sfera personale (SV) che la resilienza (CF) sono critiche. Consigliato colloquio approfondito e valutazione supporto.',
    tipo: 'critico'
  },
  {
    id: 'combattente_sotto_pressione',
    nome: 'Combattente sotto Pressione',
    condizione: (s) => (s['SV'] || 100) < 80 && (s['MO'] || 100) > 140,
    descrizione: 'Nonostante difficoltà personali, mantiene alta motivazione. Possibile tendenza a sovracompensare. Rischio burnout nel medio termine.',
    tipo: 'attenzione'
  },
  {
    id: 'visionario_disorganizzato',
    nome: 'Visionario Disorganizzato',
    condizione: (s) => (s['EC'] || 100) > 150 && (s['EF'] || 100) < 80,
    descrizione: 'Alta determinazione (EC) ma bassa autodisciplina (EF). Grandi idee, difficoltà nell\'esecuzione ordinata. Richiede supporto organizzativo.',
    tipo: 'attenzione'
  },
  {
    id: 'esecutore_cieco',
    nome: 'Esecutore senza Visione',
    condizione: (s) => (s['EF'] || 100) > 150 && (s['EC'] || 100) < 80,
    descrizione: 'Altissima efficienza operativa ma poca determinazione strategica. Ottimo esecutore, scarso nel prendere iniziative.',
    tipo: 'attenzione'
  },
  {
    id: 'rigidita_fragile',
    nome: 'Rigidità Fragile',
    condizione: (s) => (s['SC'] || 100) > 170 && (s['CF'] || 100) < 80,
    descrizione: 'Estrema rigidità (SC alta) combinata con bassa resilienza. Rischio di crollo sotto pressione imprevista.',
    tipo: 'critico'
  },
  {
    id: 'leader_isolato',
    nome: 'Leader Isolato',
    condizione: (s) => (s['QR'] || 100) > 150 && (s['PA'] || 100) < 80,
    descrizione: 'Alta propensione alla responsabilità ma scarsa partecipazione relazionale. Rischia di imporsi senza coinvolgere il team.',
    tipo: 'attenzione'
  },
  {
    id: 'gregario_motivato',
    nome: 'Gregario Motivato',
    condizione: (s) => (s['QR'] || 100) < 80 && (s['MO'] || 100) > 140,
    descrizione: 'Alta motivazione senza ambizione di leadership. Ottimo elemento di supporto, non adatto a ruoli direttivi.',
    tipo: 'attenzione'
  },
  {
    id: 'workaholic_a_rischio',
    nome: 'Workaholic a Rischio',
    condizione: (s) => (s['SV'] || 100) < 70 && (s['EF'] || 100) > 150 && (s['EC'] || 100) > 150,
    descrizione: 'Altissima produttività (EF+EC) ma sfera personale trascurata. Rischio burnout elevato.',
    tipo: 'attenzione'
  }
];

/**
 * Genera interpretazioni personalizzate basate sui dati reali del candidato
 * Aggiornato secondo il Manuale di Elaborazione V2
 */
export function generateInterpretazione(
  scalePunteggi: Record<string, number>,
  schematicita: number,
  stressZone: boolean,
  outPoints: string[],
  strengthPoints: string[]
): InterpretazioneItem[] {
  const interpretazioni: InterpretazioneItem[] = [];

  // Analisi Pattern Combinati (priorità alta)
  for (const pattern of PATTERN_CRITICI) {
    if (pattern.condizione(scalePunteggi)) {
      interpretazioni.push({
        scala: pattern.id,
        valore: 0,
        tipo: pattern.tipo as 'critico' | 'attenzione',
        titolo: pattern.nome,
        descrizione: pattern.descrizione
      });
    }
  }

  // Analisi Stress Zone
  if (stressZone && !interpretazioni.some(i => i.scala === 'stress_zone_severa')) {
    interpretazioni.push({
      scala: 'Stress Zone',
      valore: 0,
      tipo: 'critico',
      titolo: 'Zona Stress Attiva',
      descrizione: `Stile di Vita (${scalePunteggi['SV']}) e Capacità di Fronteggiare (${scalePunteggi['CF']}) sono entrambi sotto la soglia critica di 100. Questo indica possibili difficoltà nella sfera personale o professionale che potrebbero impattare le performance.`
    });
  }

  // Analisi Out Points critici (< 80)
  const scaleToCheck: ScalaCode[] = ['SV', 'MO', 'CF', 'QR', 'EF', 'EC', 'QN', 'SP', 'PA'];
  
  for (const scala of scaleToCheck) {
    const valore = scalePunteggi[scala];
    if (valore === undefined) continue;
    
    const zona = getZonaInterpretazione(valore);
    
    if (zona.zona === 'critica') {
      interpretazioni.push({
        scala,
        valore,
        tipo: 'critico',
        titolo: `${SCALE_LABELS[scala]} Critico`,
        descrizione: getDescrizioneCritica(scala, valore)
      });
    } else if (zona.zona === 'attenzione' && !stressZone) {
      // Aggiungi solo se non già segnalato dalla stress zone
      if (!['SV', 'CF'].includes(scala) || !stressZone) {
        interpretazioni.push({
          scala,
          valore,
          tipo: 'attenzione',
          titolo: `${SCALE_LABELS[scala]} Sotto Media`,
          descrizione: getDescrizioneAttenzione(scala, valore)
        });
      }
    } else if (zona.zona === 'eccellenza') {
      interpretazioni.push({
        scala,
        valore,
        tipo: 'forza',
        titolo: `${SCALE_LABELS[scala]} Eccellente`,
        descrizione: getDescrizioneForza(scala, valore)
      });
    }
  }

  // Analisi Schematicità (Flessibilità al Cambiamento)
  const flessibilita = 200 - schematicita;
  if (schematicita > 170) {
    interpretazioni.push({
      scala: 'SC',
      valore: schematicita,
      tipo: 'attenzione',
      titolo: 'Flessibilità Molto Bassa',
      descrizione: `Schematicità ${schematicita}/200 (Flessibilità ${flessibilita}/200). Persona molto rigida che fatica ad adattarsi ai cambiamenti. Ideale per ruoli con procedure definite e stabili, sconsigliata per contesti altamente dinamici.`
    });
  } else if (schematicita < 70) {
    interpretazioni.push({
      scala: 'SC',
      valore: schematicita,
      tipo: 'info',
      titolo: 'Flessibilità Molto Alta',
      descrizione: `Schematicità ${schematicita}/200 (Flessibilità ${flessibilita}/200). Grande adattabilità ma possibile difficoltà nel seguire procedure strutturate. Ottimo per ruoli creativi e dinamici.`
    });
  }

  return interpretazioni;
}

function getDescrizioneCritica(scala: ScalaCode, valore: number): string {
  const descrizioni: Record<ScalaCode, string> = {
    SV: `Punteggio ${valore}/200 indica possibili problemi nella sfera personale: difficoltà familiari, relazionali o di equilibrio vita-lavoro che impattano la concentrazione.`,
    CF: `Punteggio ${valore}/200 indica bassa resilienza allo stress. Sotto pressione potrebbe avere cali significativi di performance.`,
    MO: `Punteggio ${valore}/200 indica bassa motivazione intrinseca. Fatica a mantenere l'impegno senza stimoli esterni costanti.`,
    QR: `Punteggio ${valore}/200 indica difficoltà nell'assumersi responsabilità di alto livello. Preferisce ruoli esecutivi.`,
    EF: `Punteggio ${valore}/200 indica scarsa autodisciplina. Richiede supervisione costante per rispettare scadenze.`,
    EC: `Punteggio ${valore}/200 indica scarsa determinazione. Tende ad abbandonare di fronte agli ostacoli.`,
    QN: `Punteggio ${valore}/200 indica difficoltà nella gestione di carichi di lavoro multipli.`,
    SP: `Punteggio ${valore}/200 indica bassa consapevolezza di sé. Difficoltà nella gestione dei confini personali.`,
    PA: `Punteggio ${valore}/200 indica scarsa propensione relazionale. Fatica nel lavoro di squadra.`,
    SC: `Punteggio ${valore}/200 indica eccessiva rigidità cognitiva.`,
    ST: `Punteggio ${valore}/200 indica elevato livello di stress percepito.`,
    LE: `Punteggio ${valore}/200 indica bassa propensione alla leadership.`
  };
  return descrizioni[scala] || `Punteggio ${valore}/200 - Area critica da monitorare.`;
}

function getDescrizioneAttenzione(scala: ScalaCode, valore: number): string {
  const descrizioni: Record<ScalaCode, string> = {
    SV: `Punteggio ${valore}/200 - Equilibrio vita-lavoro sotto la media. Monitorare eventuali segnali di disagio.`,
    CF: `Punteggio ${valore}/200 - Resilienza moderata. Evitare esposizione prolungata a forte stress.`,
    MO: `Punteggio ${valore}/200 - Motivazione nella norma bassa. Beneficia di obiettivi chiari e feedback regolari.`,
    QR: `Punteggio ${valore}/200 - Preferisce non assumere responsabilità eccessive. Ruoli di supporto indicati.`,
    EF: `Punteggio ${valore}/200 - Autodisciplina da sviluppare. Utile affiancamento iniziale.`,
    EC: `Punteggio ${valore}/200 - Determinazione moderata. Supportare nei momenti difficili.`,
    QN: `Punteggio ${valore}/200 - Preferisce carichi contenuti. Non sovraccaricare inizialmente.`,
    SP: `Punteggio ${valore}/200 - Assertività da sviluppare. Supportare nell'espressione delle proprie esigenze.`,
    PA: `Punteggio ${valore}/200 - Partecipazione moderata. Favorire integrazione graduale nel team.`,
    SC: `Punteggio ${valore}/200 - Schematicità nella norma.`,
    ST: `Punteggio ${valore}/200 - Stress moderato.`,
    LE: `Punteggio ${valore}/200 - Leadership da sviluppare.`
  };
  return descrizioni[scala] || `Punteggio ${valore}/200 - Area nella norma bassa.`;
}

function getDescrizioneForza(scala: ScalaCode, valore: number): string {
  const descrizioni: Record<ScalaCode, string> = {
    SV: `Punteggio ${valore}/200 - PUNTO DI FORZA. Ottimo equilibrio vita-lavoro, persona serena e stabile.`,
    CF: `Punteggio ${valore}/200 - PUNTO DI FORZA. Eccellente resilienza, gestisce la pressione con lucidità.`,
    MO: `Punteggio ${valore}/200 - PUNTO DI FORZA. Altamente motivato, mantiene l'impegno nel tempo.`,
    QR: `Punteggio ${valore}/200 - PUNTO DI FORZA. Naturalmente orientato alla leadership e responsabilità.`,
    EF: `Punteggio ${valore}/200 - PUNTO DI FORZA. Elevata autodisciplina, rispetta scadenze con precisione.`,
    EC: `Punteggio ${valore}/200 - PUNTO DI FORZA. Altamente determinato, non si arrende di fronte agli ostacoli.`,
    QN: `Punteggio ${valore}/200 - PUNTO DI FORZA. Gestisce efficacemente carichi di lavoro elevati.`,
    SP: `Punteggio ${valore}/200 - PUNTO DI FORZA. Elevata consapevolezza di sé, gestisce i confini con assertività.`,
    PA: `Punteggio ${valore}/200 - PUNTO DI FORZA. Eccellente nel lavoro di squadra e nelle relazioni professionali.`,
    SC: `Punteggio ${valore}/200 - Alta strutturazione mentale.`,
    ST: `Punteggio ${valore}/200 - Gestione stress ottimale.`,
    LE: `Punteggio ${valore}/200 - PUNTO DI FORZA. Spiccata attitudine alla leadership.`
  };
  return descrizioni[scala] || `Punteggio ${valore}/200 - Punto di forza significativo.`;
}

/**
 * Calcola indici secondari secondo il Manuale V2
 */
export function calculateSecondaryIndices(scalePunteggi: Record<string, number>): {
  leadershipNaturale: number;
  workerIndex: number;
  attitudineVendita: number;
  flessibilitaCambiamento: number;
} {
  // Leadership Naturale: QR*0.4 + PA*0.3 + media(SP,MO)*0.3
  // Rappresenta la capacità di guidare e influenzare
  const leadershipNaturale = Math.round(
    (scalePunteggi['QR'] || 100) * 0.4 + 
    (scalePunteggi['PA'] || 100) * 0.3 + 
    (((scalePunteggi['SP'] || 100) + (scalePunteggi['MO'] || 100)) / 2) * 0.3
  );

  // Worker Index: EC*0.4 + EF*0.4 + QN*0.2
  // Rappresenta produttività e orientamento al risultato
  const workerIndex = Math.round(
    (scalePunteggi['EC'] || 100) * 0.4 + 
    (scalePunteggi['EF'] || 100) * 0.4 + 
    (scalePunteggi['QN'] || 100) * 0.2
  );

  // Attitudine Vendita: PA*0.3 + SP*0.3 + MO*0.2 + CF*0.2
  // Rappresenta propensione commerciale e resilienza al rifiuto
  const attitudineVendita = Math.round(
    (scalePunteggi['PA'] || 100) * 0.3 + 
    (scalePunteggi['SP'] || 100) * 0.3 + 
    (scalePunteggi['MO'] || 100) * 0.2 + 
    (scalePunteggi['CF'] || 100) * 0.2
  );

  // Flessibilità al Cambiamento: 200 - SC (INVERTITO rispetto a Resistenza)
  // Più alto = più flessibile (positivo per l'azienda)
  const sc = scalePunteggi['SC'] || 100;
  const flessibilitaCambiamento = 200 - sc;

  return {
    leadershipNaturale,
    workerIndex,
    attitudineVendita,
    flessibilitaCambiamento
  };
}
