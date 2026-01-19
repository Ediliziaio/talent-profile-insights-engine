import { ProfiloCandidato, ScalaCode, SCALE_LABELS } from '@/types/database';

export interface InterpretazioneItem {
  scala: string;
  valore: number;
  tipo: 'critico' | 'attenzione' | 'forza' | 'info';
  titolo: string;
  descrizione: string;
}

/**
 * Genera interpretazioni personalizzate basate sui dati reali del candidato
 */
export function generateInterpretazione(
  scalePunteggi: Record<string, number>,
  schematicita: number,
  stressZone: boolean,
  outPoints: string[],
  strengthPoints: string[]
): InterpretazioneItem[] {
  const interpretazioni: InterpretazioneItem[] = [];

  // Analisi Stress Zone
  if (stressZone) {
    interpretazioni.push({
      scala: 'Stress Zone',
      valore: 0,
      tipo: 'critico',
      titolo: 'Zona Stress Attiva',
      descrizione: `Stile di Vita (${scalePunteggi['SV']}) e Capacità di Fronteggiare (${scalePunteggi['CF']}) sono entrambi sotto la soglia critica di 100. Questo indica possibili difficoltà nella sfera personale o professionale che potrebbero impattare le performance. Si raccomanda un colloquio approfondito per valutare la situazione.`
    });
  }

  // Analisi Out Points critici
  if (scalePunteggi['SV'] < 80) {
    interpretazioni.push({
      scala: 'SV',
      valore: scalePunteggi['SV'],
      tipo: 'critico',
      titolo: 'Stile di Vita Critico',
      descrizione: `Punteggio ${scalePunteggi['SV']}/200 indica possibili problemi nella sfera personale: difficoltà familiari, relazionali o di equilibrio vita-lavoro che potrebbero impattare la concentrazione e la costanza lavorativa.`
    });
  }

  if (scalePunteggi['CF'] < 80) {
    interpretazioni.push({
      scala: 'CF',
      valore: scalePunteggi['CF'],
      tipo: 'critico',
      titolo: 'Capacità di Fronteggiare Critica',
      descrizione: `Punteggio ${scalePunteggi['CF']}/200 indica bassa resilienza allo stress. Sotto pressione potrebbe avere cali significativi di performance o difficoltà nella gestione dei conflitti interpersonali.`
    });
  }

  if (scalePunteggi['MO'] < 80) {
    interpretazioni.push({
      scala: 'MO',
      valore: scalePunteggi['MO'],
      tipo: 'critico',
      titolo: 'Motivazione Critica',
      descrizione: `Punteggio ${scalePunteggi['MO']}/200 indica bassa motivazione intrinseca. Potrebbe faticare a mantenere l'impegno nel tempo senza stimoli esterni costanti.`
    });
  }

  if (scalePunteggi['QR'] < 80) {
    interpretazioni.push({
      scala: 'QR',
      valore: scalePunteggi['QR'],
      tipo: 'critico',
      titolo: 'Qualità Responsabilità Critica',
      descrizione: `Punteggio ${scalePunteggi['QR']}/200 indica difficoltà nell'assumersi responsabilità di alto livello. Preferisce ruoli esecutivi con supervisione piuttosto che posizioni di leadership.`
    });
  }

  // Analisi Schematicità
  if (schematicita > 170) {
    interpretazioni.push({
      scala: 'SC',
      valore: schematicita,
      tipo: 'attenzione',
      titolo: 'Schematicità Molto Alta',
      descrizione: `Punteggio ${schematicita}/200 indica una persona molto rigida che fatica ad adattarsi ai cambiamenti. Ideale per ruoli con procedure definite e stabili, sconsigliata per contesti altamente dinamici o innovativi.`
    });
  } else if (schematicita < 70) {
    interpretazioni.push({
      scala: 'SC',
      valore: schematicita,
      tipo: 'attenzione',
      titolo: 'Schematicità Molto Bassa',
      descrizione: `Punteggio ${schematicita}/200 indica grande flessibilità ma possibile difficoltà nel seguire procedure strutturate. Ottimo per ruoli creativi, meno adatto per compliance o amministrazione.`
    });
  }

  // Analisi Strength Points
  if (scalePunteggi['EC'] > 160) {
    interpretazioni.push({
      scala: 'EC',
      valore: scalePunteggi['EC'],
      tipo: 'forza',
      titolo: 'Efficacia Eccellente',
      descrizione: `Punteggio ${scalePunteggi['EC']}/200 - PUNTO DI FORZA. Persona altamente determinata nel raggiungere gli obiettivi. Non si arrende facilmente di fronte agli ostacoli e porta a termine i compiti assegnati.`
    });
  }

  if (scalePunteggi['EF'] > 160) {
    interpretazioni.push({
      scala: 'EF',
      valore: scalePunteggi['EF'],
      tipo: 'forza',
      titolo: 'Efficienza Eccellente',
      descrizione: `Punteggio ${scalePunteggi['EF']}/200 - PUNTO DI FORZA. Elevata autodisciplina e capacità di ottimizzare tempo e risorse. Rispetta scadenze e procedure con precisione.`
    });
  }

  if (scalePunteggi['PA'] > 160) {
    interpretazioni.push({
      scala: 'PA',
      valore: scalePunteggi['PA'],
      tipo: 'forza',
      titolo: 'Partecipazione Eccellente',
      descrizione: `Punteggio ${scalePunteggi['PA']}/200 - PUNTO DI FORZA. Forte orientamento relazionale e capacità di coinvolgimento. Eccellente nel lavoro di squadra e nella costruzione di network professionali.`
    });
  }

  if (scalePunteggi['SP'] > 160) {
    interpretazioni.push({
      scala: 'SP',
      valore: scalePunteggi['SP'],
      tipo: 'forza',
      titolo: 'Spazio Personale Eccellente',
      descrizione: `Punteggio ${scalePunteggi['SP']}/200 - PUNTO DI FORZA. Elevata consapevolezza di sé e del proprio valore. Sa gestire i propri spazi e confini con assertività.`
    });
  }

  if (scalePunteggi['MO'] > 160) {
    interpretazioni.push({
      scala: 'MO',
      valore: scalePunteggi['MO'],
      tipo: 'forza',
      titolo: 'Motivazione Eccellente',
      descrizione: `Punteggio ${scalePunteggi['MO']}/200 - PUNTO DI FORZA. Altamente motivato con forte spinta intrinseca. Mantiene l'impegno nel tempo anche senza stimoli esterni.`
    });
  }

  // Info su aree nella norma ma con note
  if (scalePunteggi['QN'] < 100 && scalePunteggi['QN'] >= 80) {
    interpretazioni.push({
      scala: 'QN',
      valore: scalePunteggi['QN'],
      tipo: 'info',
      titolo: 'Quantità Responsabilità Sotto Media',
      descrizione: `Punteggio ${scalePunteggi['QN']}/200 indica preferenza per un carico di lavoro contenuto. Non ama essere sovraccaricato e lavora meglio con obiettivi definiti e ragionevoli.`
    });
  }

  return interpretazioni;
}

/**
 * Calcola indici secondari per il report
 */
export function calculateSecondaryIndices(scalePunteggi: Record<string, number>): {
  leadershipNaturale: number;
  workerIndex: number;
  attitudineVendita: number;
  resistenzaCambiamento: number;
} {
  // Leadership Naturale: media di QR, PA, SP
  const leadershipNaturale = Math.round(
    ((scalePunteggi['QR'] || 100) + (scalePunteggi['PA'] || 100) + (scalePunteggi['SP'] || 100)) / 3
  );

  // Worker Index: media di EF, EC, MO
  const workerIndex = Math.round(
    ((scalePunteggi['EF'] || 100) + (scalePunteggi['EC'] || 100) + (scalePunteggi['MO'] || 100)) / 3
  );

  // Attitudine Vendita: media di PA, SP, CF
  const attitudineVendita = Math.round(
    ((scalePunteggi['PA'] || 100) + (scalePunteggi['SP'] || 100) + (scalePunteggi['CF'] || 100)) / 3
  );

  // Resistenza al Cambiamento: basato sulla schematicità (invertito)
  const sc = scalePunteggi['SC'] || 100;
  const resistenzaCambiamento = sc; // Più alto = più resistente

  return {
    leadershipNaturale,
    workerIndex,
    attitudineVendita,
    resistenzaCambiamento
  };
}
