import { ProfiloTipo, MacroCategoria } from '@/types/database';

export interface ProfiloDescription {
  label: string;
  macrocategoria: MacroCategoria;
  motto: string;
  descrizione_breve: string;
  cosa_vuole: string[];
  paura_principale: string;
  come_riconoscerlo: string[];
  come_gestirlo: string[];
  errori_da_evitare: string[];
  ruoli_ideali: string[];
  colore: string;
  colorBg: string;
  colorText: string;
}

export const PROFILO_DESCRIPTIONS: Record<ProfiloTipo, ProfiloDescription> = {
  PRESTIGIO: {
    label: 'Prestigio',
    macrocategoria: 'PROTAGONISTA',
    motto: "Voglio essere L'UNICO",
    descrizione_breve: 'Persona che cerca esclusività e status. Vuole sentirsi unico, superiore e privilegiato. Non cerca prodotti o ruoli comuni: cerca ESCLUSIVITÀ.',
    cosa_vuole: [
      'Sentirsi UNICO e irripetibile',
      'Essere SUPERIORE agli altri',
      'Trattamento PRIVILEGIATO',
      'Far parte di un CLUB esclusivo'
    ],
    paura_principale: 'Essere SCAVALCATO o trattato come tutti gli altri',
    come_riconoscerlo: [
      'Chiede accesso esclusivo o trattamento speciale',
      'Parla di brand di lusso o esperienze esclusive',
      'Non vuole essere paragonato agli altri'
    ],
    come_gestirlo: [
      'Farlo sentire parte di un gruppo ristretto ed elitario',
      'Assegnargli progetti speciali o responsabilità esclusive',
      'Riconoscimenti pubblici e visibilità',
      'Evitare paragoni con altri dipendenti'
    ],
    errori_da_evitare: [
      'Dire che "TUTTI" fanno così',
      'Paragonarlo ad altri candidati o colleghi',
      'Farlo sentire parte della massa'
    ],
    ruoli_ideali: ['Direzione', 'Account Manager VIP', 'Brand Ambassador', 'Ruoli di rappresentanza'],
    colore: 'bg-purple-500',
    colorBg: 'bg-purple-100',
    colorText: 'text-purple-700'
  },
  
  ORIGINALE: {
    label: 'Originale',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio essere IL PRIMO',
    descrizione_breve: 'Persona innovativa che vuole distinguersi per originalità. Cerca sempre la novità, l\'avanguardia, essere il pioniere. Non segue: guida.',
    cosa_vuole: [
      'Essere il PRIMO a provare cose nuove',
      'Distinguersi dalla massa per ORIGINALITÀ',
      'Anticipare le tendenze',
      'Essere riconosciuto come INNOVATORE'
    ],
    paura_principale: 'Essere SUPERATO o considerato "già visto"',
    come_riconoscerlo: [
      'Parla sempre di novità e innovazione',
      'Chiede se esistono versioni beta o anteprime',
      'Vuole essere coinvolto in progetti pilota'
    ],
    come_gestirlo: [
      'Coinvolgerlo nei progetti di innovazione',
      'Dargli accesso anticipato a nuove iniziative',
      'Valorizzare le sue idee creative',
      'Assegnargli ruoli di sperimentazione'
    ],
    errori_da_evitare: [
      'Proporre soluzioni "standard" o "consolidate"',
      'Ignorare le sue proposte innovative',
      'Metterlo in ruoli troppo proceduralizzati'
    ],
    ruoli_ideali: ['R&D', 'Product Development', 'Marketing Innovativo', 'Startup interne'],
    colore: 'bg-cyan-500',
    colorBg: 'bg-cyan-100',
    colorText: 'text-cyan-700'
  },
  
  ANALITICO: {
    label: 'Analitico',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio essere IL PIÙ INTELLIGENTE',
    descrizione_breve: 'Persona razionale che basa tutto su dati e logica. Analizza, confronta, valuta. Non decide d\'impulso: studia. Vuole capire il "perché" di tutto.',
    cosa_vuole: [
      'Dati, numeri, prove CONCRETE',
      'Tempo per analizzare e confrontare',
      'Spiegazioni LOGICHE e dettagliate',
      'Essere riconosciuto per la sua COMPETENZA'
    ],
    paura_principale: 'Prendere decisioni SBAGLIATE o essere colto impreparato',
    come_riconoscerlo: [
      'Fa molte domande tecniche e dettagliate',
      'Chiede documentazione e specifiche',
      'Prende appunti e confronta opzioni'
    ],
    come_gestirlo: [
      'Fornire dati e analisi dettagliate',
      'Dargli tempo per elaborare le decisioni',
      'Rispettare il suo bisogno di approfondimento',
      'Valorizzare la sua capacità analitica'
    ],
    errori_da_evitare: [
      'Pressarlo per decisioni rapide',
      'Essere vaghi o superficiali',
      'Sottovalutare le sue domande'
    ],
    ruoli_ideali: ['Controller', 'Analista', 'Quality Assurance', 'Consulenza strategica'],
    colore: 'bg-blue-600',
    colorBg: 'bg-blue-100',
    colorText: 'text-blue-700'
  },
  
  ESTETA: {
    label: 'Esteta',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio essere IL PIÙ BELLO',
    descrizione_breve: 'Persona attenta all\'estetica e all\'immagine. L\'apparenza conta quanto la sostanza. Cerca armonia, design, eleganza in tutto ciò che fa.',
    cosa_vuole: [
      'Ambienti di lavoro CURATI ed eleganti',
      'Attenzione all\'IMMAGINE e alla presentazione',
      'Prodotti e strumenti dal design RAFFINATO',
      'Essere apprezzato per il suo GUSTO'
    ],
    paura_principale: 'Essere associato a cose BRUTTE o di cattivo gusto',
    come_riconoscerlo: [
      'Molto curato nell\'aspetto personale',
      'Nota i dettagli estetici dell\'ambiente',
      'Preferisce la qualità alla quantità'
    ],
    come_gestirlo: [
      'Curare l\'ambiente e la presentazione',
      'Valorizzare il suo senso estetico',
      'Assegnargli compiti che richiedono cura del dettaglio',
      'Coinvolgerlo nelle scelte di immagine aziendale'
    ],
    errori_da_evitare: [
      'Ambienti trascurati o disordinati',
      'Presentazioni approssimative',
      'Ignorare l\'importanza dell\'immagine'
    ],
    ruoli_ideali: ['Marketing', 'Comunicazione', 'Eventi', 'Customer Experience'],
    colore: 'bg-pink-500',
    colorBg: 'bg-pink-100',
    colorText: 'text-pink-700'
  },
  
  CONSERVATORE: {
    label: 'Conservatore',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio essere IL PIÙ FURBO',
    descrizione_breve: 'Persona prudente che investe, non spreca. Cerca il valore duraturo, la solidità. Non è tirchio: è STRATEGICO. Pensa al lungo termine.',
    cosa_vuole: [
      'Investimenti SICURI e duraturi',
      'Valore nel TEMPO',
      'Garanzie e AFFIDABILITÀ',
      'Essere considerato SAGGIO nelle scelte'
    ],
    paura_principale: 'SPRECARE risorse o essere ingannato',
    come_riconoscerlo: [
      'Chiede informazioni sulla durata e affidabilità',
      'Valuta attentamente costi e benefici',
      'Preferisce soluzioni consolidate'
    ],
    come_gestirlo: [
      'Presentare investimenti a lungo termine',
      'Fornire garanzie e track record',
      'Mostrare il ritorno sull\'investimento',
      'Valorizzare le sue scelte prudenti'
    ],
    errori_da_evitare: [
      'Proporre soluzioni effimere o trendy',
      'Essere pressanti o aggressivi',
      'Sottovalutare la sua prudenza'
    ],
    ruoli_ideali: ['Amministrazione', 'Finanza', 'Operations', 'Gestione patrimonio'],
    colore: 'bg-amber-600',
    colorBg: 'bg-amber-100',
    colorText: 'text-amber-700'
  },
  
  AFFETTO: {
    label: 'Affetto',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio essere AMATO',
    descrizione_breve: 'Persona relazionale che cerca approvazione e armonia. Le relazioni vengono prima di tutto. Vuole piacere e far felici gli altri.',
    cosa_vuole: [
      'APPROVAZIONE dai colleghi e superiori',
      'Ambiente di lavoro ARMONIOSO',
      'Sentirsi PARTE della famiglia aziendale',
      'Riconoscimento del suo contributo UMANO'
    ],
    paura_principale: 'Essere RIFIUTATO o creare conflitti',
    come_riconoscerlo: [
      'Parla molto delle relazioni personali',
      'Cerca consenso prima di decidere',
      'Evita i conflitti e media le situazioni'
    ],
    come_gestirlo: [
      'Creare un ambiente familiare e accogliente',
      'Coinvolgerlo nelle attività di team building',
      'Apprezzare pubblicamente il suo contributo',
      'Gestire i conflitti con delicatezza'
    ],
    errori_da_evitare: [
      'Essere freddi o distaccati',
      'Creare situazioni di conflitto',
      'Ignorare l\'aspetto umano del lavoro'
    ],
    ruoli_ideali: ['HR', 'Customer Care', 'Team Leader', 'Formazione'],
    colore: 'bg-rose-500',
    colorBg: 'bg-rose-100',
    colorText: 'text-rose-700'
  },
  
  SICUREZZA: {
    label: 'Sicurezza',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio essere PROTETTO',
    descrizione_breve: 'Persona che cerca stabilità e rassicurazioni. Il mondo è incerto e cerca punti fermi. Ha bisogno di certezze e protezione.',
    cosa_vuole: [
      'STABILITÀ e prevedibilità',
      'RASSICURAZIONI continue',
      'Procedure CHIARE e definite',
      'Protezione dai RISCHI'
    ],
    paura_principale: 'L\'INCERTEZZA e i cambiamenti improvvisi',
    come_riconoscerlo: [
      'Chiede garanzie e conferme',
      'Preferisce procedure consolidate',
      'È cauto di fronte alle novità'
    ],
    come_gestirlo: [
      'Fornire procedure chiare e documentate',
      'Comunicare con anticipo i cambiamenti',
      'Rassicurare con frequenza',
      'Creare un ambiente stabile'
    ],
    errori_da_evitare: [
      'Cambiamenti improvvisi senza preavviso',
      'Lasciarlo nell\'incertezza',
      'Sottovalutare le sue preoccupazioni'
    ],
    ruoli_ideali: ['Compliance', 'Back Office', 'Amministrazione', 'Controllo Qualità'],
    colore: 'bg-slate-500',
    colorBg: 'bg-slate-100',
    colorText: 'text-slate-700'
  },
  
  COMODITA: {
    label: 'Comodità',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio essere SERVITO',
    descrizione_breve: 'Persona che cerca soluzioni chiavi in mano. Non vuole complicazioni: vuole che tutto sia FACILE. Delega volentieri e apprezza il servizio.',
    cosa_vuole: [
      'Soluzioni SEMPLICI e immediate',
      'Qualcuno che si occupi dei DETTAGLI',
      'Processi SNELLI e senza intoppi',
      'Il minimo sforzo per il massimo risultato'
    ],
    paura_principale: 'Le COMPLICAZIONI e le procedure farraginose',
    come_riconoscerlo: [
      'Chiede "quanto è semplice?"',
      'Preferisce delegare',
      'Evita i dettagli tecnici'
    ],
    come_gestirlo: [
      'Offrire soluzioni chiavi in mano',
      'Semplificare processi e comunicazioni',
      'Occuparsi dei dettagli al suo posto',
      'Essere proattivi nell\'assistenza'
    ],
    errori_da_evitare: [
      'Procedure complesse e burocratiche',
      'Richiedere troppo impegno personale',
      'Complicare le cose semplici'
    ],
    ruoli_ideali: ['Management', 'Direzione Commerciale', 'Ruoli deleganti'],
    colore: 'bg-teal-500',
    colorBg: 'bg-teal-100',
    colorText: 'text-teal-700'
  },
  
  SVAGO: {
    label: 'Svago',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio essere LIBERO',
    descrizione_breve: 'Persona che cerca equilibrio vita-lavoro. Il lavoro non è tutto: c\'è la vita! Cerca libertà, flessibilità, tempo per sé.',
    cosa_vuole: [
      'FLESSIBILITÀ negli orari e modalità',
      'Tempo LIBERO da dedicare alle passioni',
      'Ambiente di lavoro DIVERTENTE',
      'Work-life BALANCE'
    ],
    paura_principale: 'Essere INGABBIATO in routine rigide',
    come_riconoscerlo: [
      'Chiede informazioni su smart working e flessibilità',
      'Parla dei suoi hobby e interessi',
      'Valuta molto il clima aziendale'
    ],
    come_gestirlo: [
      'Offrire flessibilità dove possibile',
      'Rispettare il suo tempo personale',
      'Creare momenti di svago aziendale',
      'Valorizzare i risultati più che la presenza'
    ],
    errori_da_evitare: [
      'Orari rigidi e controllo eccessivo',
      'Ignorare il suo bisogno di equilibrio',
      'Sovraccaricare costantemente'
    ],
    ruoli_ideali: ['Consulente esterno', 'Freelance interno', 'Ruoli creativi', 'Marketing'],
    colore: 'bg-green-500',
    colorBg: 'bg-green-100',
    colorText: 'text-green-700'
  },
  
  RISPARMIO: {
    label: 'Risparmio',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio NON SPENDERE',
    descrizione_breve: 'Persona orientata al costo. Il prezzo è il fattore determinante. Non cerca il meglio: cerca il più conveniente. Budget-oriented al 100%.',
    cosa_vuole: [
      'Il PREZZO più basso possibile',
      'SCONTI e agevolazioni',
      'Massimizzare il RISPARMIO',
      'Ottimizzare i COSTI'
    ],
    paura_principale: 'PAGARE troppo o sprecare denaro',
    come_riconoscerlo: [
      'La prima domanda è sempre sul prezzo',
      'Confronta costantemente i costi',
      'Negozia sempre'
    ],
    come_gestirlo: [
      'Essere trasparenti sui costi',
      'Mostrare il value for money',
      'Proporre ottimizzazioni di budget',
      'Coinvolgerlo nelle scelte economiche'
    ],
    errori_da_evitare: [
      'Proposte costose senza giustificazione',
      'Nascondere i costi',
      'Sottovalutare la sua attenzione al budget'
    ],
    ruoli_ideali: ['Acquisti', 'Procurement', 'Cost Controller', 'Operations'],
    colore: 'bg-orange-500',
    colorBg: 'bg-orange-100',
    colorText: 'text-orange-700'
  }
};

export const MACROCATEGORIA_INFO: Record<MacroCategoria, { label: string; descrizione: string; colore: string }> = {
  PROTAGONISTA: {
    label: 'Protagonista',
    descrizione: 'Cerca di distinguersi, essere riconosciuto, emergere dalla massa',
    colore: 'bg-primary text-primary-foreground'
  },
  APPARTENENTE: {
    label: 'Appartenente',
    descrizione: 'Cerca di far parte di un gruppo, essere accettato, sentirsi al sicuro',
    colore: 'bg-accent text-accent-foreground'
  }
};

export function getProfiloDescription(tipo: ProfiloTipo): ProfiloDescription {
  return PROFILO_DESCRIPTIONS[tipo];
}

export function getMacrocategoria(tipo: ProfiloTipo): MacroCategoria {
  return PROFILO_DESCRIPTIONS[tipo].macrocategoria;
}

export function getProfiloColor(tipo: ProfiloTipo): string {
  return PROFILO_DESCRIPTIONS[tipo].colore;
}
