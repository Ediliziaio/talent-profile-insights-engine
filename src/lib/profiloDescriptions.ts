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
  alert_hr?: string;
  colore: string;
  colorBg: string;
  colorText: string;
}

export const PROFILO_DESCRIPTIONS: Record<ProfiloTipo, ProfiloDescription> = {
  PRESTIGIO: {
    label: 'Prestigio',
    macrocategoria: 'PROTAGONISTA',
    motto: "Voglio GUIDARE e essere RICONOSCIUTO",
    descrizione_breve: 'Candidato con forte orientamento alla leadership e al riconoscimento. Cerca ruoli di responsabilità e visibilità. Ha elevate capacità relazionali e sa gestire situazioni complesse. Motivato dal raggiungimento di status e obiettivi ambiziosi.',
    cosa_vuole: [
      'Ruoli di responsabilità e visibilità',
      'Riconoscimento delle proprie competenze',
      'Obiettivi sfidanti e misurabili',
      'Autonomia decisionale'
    ],
    paura_principale: 'Essere sottovalutato o confinato in ruoli operativi senza crescita',
    come_riconoscerlo: [
      'Parla di risultati ottenuti in passato',
      'Chiede informazioni sulla crescita di carriera',
      'Mostra sicurezza nel presentare le proprie idee'
    ],
    come_gestirlo: [
      'Assegnare progetti con alta visibilità',
      'Definire obiettivi chiari e misurabili',
      'Riconoscere pubblicamente i successi',
      'Offrire un percorso di crescita definito'
    ],
    errori_da_evitare: [
      'Assegnare solo compiti operativi e ripetitivi',
      'Non fornire feedback sui risultati',
      'Limitare l\'autonomia decisionale',
      'Ignorare le sue proposte di miglioramento'
    ],
    ruoli_ideali: ['Direzione', 'Project Manager', 'Team Leader', 'Account Manager', 'Business Development'],
    colore: 'bg-purple-500',
    colorBg: 'bg-purple-100',
    colorText: 'text-purple-700'
  },
  
  ORIGINALE: {
    label: 'Originale',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio INNOVARE e fare la DIFFERENZA',
    descrizione_breve: 'Candidato creativo e orientato all\'innovazione. Non segue schemi predefiniti, preferisce sperimentare nuovi approcci. Alta motivazione e determinazione nel raggiungere obiettivi in modo non convenzionale. Adatto a contesti dinamici e in trasformazione.',
    cosa_vuole: [
      'Libertà di sperimentare nuovi approcci',
      'Essere coinvolto in progetti innovativi',
      'Ambiente che valorizzi le idee creative',
      'Sfide che richiedono soluzioni originali'
    ],
    paura_principale: 'Essere costretto in procedure rigide che limitano la creatività',
    come_riconoscerlo: [
      'Propone soluzioni non convenzionali',
      'Chiede se ci sono progetti pilota o sperimentazioni',
      'Mostra insofferenza per i processi troppo burocratici'
    ],
    come_gestirlo: [
      'Coinvolgerlo in progetti di innovazione',
      'Dare spazio alle sue proposte creative',
      'Non imporre procedure troppo rigide',
      'Valorizzare i risultati più che i metodi'
    ],
    errori_da_evitare: [
      'Imporre procedure standard senza flessibilità',
      'Ignorare o bocciare le sue proposte innovative',
      'Assegnarlo a ruoli troppo strutturati',
      'Richiedere conformità senza spiegare il perché'
    ],
    ruoli_ideali: ['R&D', 'Product Development', 'Marketing Strategico', 'Startup interne', 'Consulenza'],
    colore: 'bg-cyan-500',
    colorBg: 'bg-cyan-100',
    colorText: 'text-cyan-700'
  },
  
  ANALITICO: {
    label: 'Analitico',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio CAPIRE e decidere con DATI',
    descrizione_breve: 'Candidato metodico e razionale. Elevata schematicità indica preferenza per procedure definite e decisioni basate su dati. Affidabile nell\'esecuzione di compiti che richiedono precisione. Può risultare rigido di fronte ai cambiamenti improvvisi.',
    cosa_vuole: [
      'Informazioni complete prima di decidere',
      'Tempo per analizzare le situazioni',
      'Procedure chiare e documentate',
      'Riconoscimento della propria competenza tecnica'
    ],
    paura_principale: 'Prendere decisioni affrettate senza dati sufficienti',
    come_riconoscerlo: [
      'Fa molte domande tecniche e dettagliate',
      'Prende appunti e chiede documentazione',
      'Valuta attentamente pro e contro'
    ],
    come_gestirlo: [
      'Fornire dati e analisi a supporto delle richieste',
      'Concedere tempo per elaborare le decisioni',
      'Comunicare i cambiamenti con anticipo',
      'Valorizzare la sua precisione e affidabilità'
    ],
    errori_da_evitare: [
      'Pressare per decisioni immediate',
      'Cambiare spesso direzione senza spiegazioni',
      'Essere vaghi nelle comunicazioni',
      'Sottovalutare il suo bisogno di approfondimento'
    ],
    ruoli_ideali: ['Controller', 'Analista', 'Quality Assurance', 'Compliance', 'Revisione processi'],
    alert_hr: 'Nota: Alta schematicità può indicare difficoltà ad adattarsi in contesti molto dinamici',
    colore: 'bg-blue-600',
    colorBg: 'bg-blue-100',
    colorText: 'text-blue-700'
  },
  
  ESTETA: {
    label: 'Esteta',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio QUALITÀ e ECCELLENZA',
    descrizione_breve: 'Candidato attento alla qualità e all\'immagine. Elevati standard personali e professionali. Cerca ambienti di lavoro curati e ruoli che permettano di esprimere il proprio senso estetico. Orientato all\'eccellenza e al dettaglio.',
    cosa_vuole: [
      'Ambiente di lavoro curato e professionale',
      'Ruoli che richiedano attenzione al dettaglio',
      'Standard qualitativi elevati',
      'Riconoscimento del proprio buon gusto'
    ],
    paura_principale: 'Essere associato a lavori approssimativi o di bassa qualità',
    come_riconoscerlo: [
      'Curato nell\'aspetto e nella presentazione',
      'Nota i dettagli dell\'ambiente',
      'Preferisce la qualità alla quantità'
    ],
    come_gestirlo: [
      'Assegnare compiti che richiedono cura del dettaglio',
      'Coinvolgerlo in progetti di immagine aziendale',
      'Mantenere standard qualitativi elevati',
      'Apprezzare il suo contributo estetico'
    ],
    errori_da_evitare: [
      'Assegnare lavori frettolosi o approssimativi',
      'Ignorare l\'importanza della presentazione',
      'Ambienti trascurati o disorganizzati',
      'Sottovalutare l\'impatto del "come" oltre al "cosa"'
    ],
    ruoli_ideali: ['Marketing', 'Comunicazione', 'Customer Experience', 'Eventi', 'Design'],
    colore: 'bg-pink-500',
    colorBg: 'bg-pink-100',
    colorText: 'text-pink-700'
  },
  
  CONSERVATORE: {
    label: 'Conservatore',
    macrocategoria: 'PROTAGONISTA',
    motto: 'Voglio SOLIDITÀ e risultati DURATURI',
    descrizione_breve: 'Candidato prudente e strategico. Preferisce investire nel lungo termine piuttosto che ottenere risultati effimeri. Affidabile e metodico, valuta attentamente rischi e opportunità. Ideale per ruoli che richiedono stabilità e visione di lungo periodo.',
    cosa_vuole: [
      'Stabilità contrattuale e aziendale',
      'Progetti con impatto duraturo',
      'Tempo per valutare le decisioni importanti',
      'Garanzie e chiarezza sul futuro'
    ],
    paura_principale: 'Investire energie in progetti effimeri o aziende instabili',
    come_riconoscerlo: [
      'Chiede informazioni sulla solidità aziendale',
      'Valuta il rapporto costi/benefici di ogni scelta',
      'Preferisce la sicurezza alla velocità'
    ],
    come_gestirlo: [
      'Presentare piani a lungo termine',
      'Fornire garanzie e certezze dove possibile',
      'Mostrare il track record aziendale',
      'Valorizzare il suo approccio prudente'
    ],
    errori_da_evitare: [
      'Proporre cambiamenti frequenti senza motivo',
      'Essere pressanti sulle tempistiche',
      'Non comunicare la visione di lungo periodo',
      'Sottovalutare le sue preoccupazioni'
    ],
    ruoli_ideali: ['Amministrazione', 'Finanza', 'Operations', 'Gestione Risorse', 'Pianificazione'],
    colore: 'bg-amber-600',
    colorBg: 'bg-amber-100',
    colorText: 'text-amber-700'
  },
  
  AFFETTO: {
    label: 'Affetto',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio FAR PARTE del TEAM',
    descrizione_breve: 'Candidato con forte orientamento relazionale. Le connessioni umane sono prioritarie rispetto ai risultati individuali. Eccellente nel lavoro di squadra e nella mediazione. Cerca ambienti collaborativi dove sentirsi parte di una "famiglia" professionale.',
    cosa_vuole: [
      'Clima aziendale positivo e collaborativo',
      'Sentirsi parte integrante del team',
      'Relazioni autentiche con colleghi e superiori',
      'Riconoscimento del proprio contributo umano'
    ],
    paura_principale: 'Essere escluso dal gruppo o creare conflitti',
    come_riconoscerlo: [
      'Chiede informazioni sul clima aziendale',
      'Parla di esperienze di team del passato',
      'Evita i conflitti e cerca mediazione'
    ],
    come_gestirlo: [
      'Creare un ambiente accogliente e inclusivo',
      'Coinvolgerlo in attività di team building',
      'Apprezzare pubblicamente il suo contributo',
      'Gestire i conflitti con sensibilità'
    ],
    errori_da_evitare: [
      'Isolarlo in ruoli troppo autonomi',
      'Creare situazioni di competizione interna',
      'Essere freddi o distaccati',
      'Ignorare l\'importanza delle relazioni'
    ],
    ruoli_ideali: ['HR', 'Customer Care', 'Team Leader', 'Formazione', 'Accoglienza'],
    colore: 'bg-rose-500',
    colorBg: 'bg-rose-100',
    colorText: 'text-rose-700'
  },
  
  SICUREZZA: {
    label: 'Sicurezza',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio STABILITÀ e CERTEZZE',
    descrizione_breve: 'Candidato che attraversa un momento di vulnerabilità. I punteggi indicano difficoltà nello stile di vita e/o nella capacità di fronteggiare lo stress. Cerca un ambiente protetto, procedure chiare e rassicurazioni costanti. Richiede un inserimento graduale e supportivo.',
    cosa_vuole: [
      'Ambiente di lavoro stabile e prevedibile',
      'Procedure chiare e ruoli definiti',
      'Rassicurazioni costanti dal management',
      'Tempo per adattarsi ai cambiamenti'
    ],
    paura_principale: 'Instabilità e cambiamenti improvvisi che aumentino lo stress',
    come_riconoscerlo: [
      'Chiede molte garanzie e conferme',
      'Mostra incertezza nelle risposte',
      'Preferisce sapere esattamente cosa aspettarsi'
    ],
    come_gestirlo: [
      'Assegnare compiti con scadenze chiare e realistiche',
      'Fornire feedback frequenti e costruttivi',
      'Evitare sovraccarichi di responsabilità iniziali',
      'Creare un percorso di onboarding graduale',
      'Valutare supporto HR/welfare aziendale'
    ],
    errori_da_evitare: [
      'Inserirlo in ruoli ad alta pressione',
      'Aspettarsi autonomia decisionale immediata',
      'Cambiare spesso obiettivi o procedure',
      'Ignorare i segnali di stress'
    ],
    ruoli_ideali: ['Back Office', 'Supporto Amministrativo', 'Ruoli operativi strutturati', 'Data Entry', 'Archivio'],
    alert_hr: 'ATTENZIONE: Stress Zone o aree critiche rilevate. Consigliato colloquio approfondito per valutare situazione personale e capacità di inserimento.',
    colore: 'bg-slate-500',
    colorBg: 'bg-slate-100',
    colorText: 'text-slate-700'
  },
  
  COMODITA: {
    label: 'Comodità',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio SEMPLICITÀ ed EFFICIENZA',
    descrizione_breve: 'Candidato che preferisce la semplicità alla complessità. Tende a delegare e a cercare soluzioni chiavi in mano. Non ama le complicazioni burocratiche. Può essere efficace in ruoli di coordinamento dove altri eseguono le attività operative.',
    cosa_vuole: [
      'Processi semplificati e diretti',
      'Supporto operativo per le attività di dettaglio',
      'Risultati senza eccessive complicazioni',
      'Chiarezza su cosa ci si aspetta da lui/lei'
    ],
    paura_principale: 'Essere sovraccaricato di procedure complesse e burocratiche',
    come_riconoscerlo: [
      'Chiede "quanto è semplice?" o "chi mi supporta?"',
      'Preferisce delegare i dettagli operativi',
      'Evita approfondimenti troppo tecnici'
    ],
    come_gestirlo: [
      'Semplificare processi e comunicazioni',
      'Fornire supporto operativo strutturato',
      'Definire chiaramente responsabilità e limiti',
      'Essere proattivi nell\'assistenza'
    ],
    errori_da_evitare: [
      'Assegnare troppi compiti operativi di dettaglio',
      'Procedure complesse senza supporto',
      'Aspettarsi gestione autonoma di ogni aspetto',
      'Complicare le cose semplici'
    ],
    ruoli_ideali: ['Coordinamento', 'Supervisione', 'Ruoli di interfaccia', 'Project Oversight'],
    colore: 'bg-teal-500',
    colorBg: 'bg-teal-100',
    colorText: 'text-teal-700'
  },
  
  SVAGO: {
    label: 'Svago',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio EQUILIBRIO e QUALITÀ della vita',
    descrizione_breve: 'Candidato con forte attenzione al work-life balance. I punteggi mostrano buon equilibrio tra sfera personale e professionale. Cerca flessibilità e ambienti che rispettino i tempi personali. Produttivo quando ha la giusta autonomia.',
    cosa_vuole: [
      'Flessibilità negli orari e modalità di lavoro',
      'Rispetto del tempo personale',
      'Ambiente di lavoro positivo e non oppressivo',
      'Valutazione sui risultati, non sulla presenza'
    ],
    paura_principale: 'Essere intrappolato in routine rigide che sacrificano la vita privata',
    come_riconoscerlo: [
      'Chiede informazioni su smart working e flessibilità',
      'Parla dei suoi hobby e interessi personali',
      'Valuta molto il clima aziendale'
    ],
    come_gestirlo: [
      'Offrire flessibilità dove possibile',
      'Valutare i risultati più che la presenza',
      'Rispettare i confini tra lavoro e vita privata',
      'Creare momenti di socializzazione aziendale'
    ],
    errori_da_evitare: [
      'Orari rigidi e controllo eccessivo',
      'Straordinari costanti senza motivo',
      'Ignorare il suo bisogno di equilibrio',
      'Cultura del "sempre disponibile"'
    ],
    ruoli_ideali: ['Consulenza', 'Ruoli con obiettivi misurabili', 'Smart working', 'Project work'],
    colore: 'bg-green-500',
    colorBg: 'bg-green-100',
    colorText: 'text-green-700'
  },
  
  RISPARMIO: {
    label: 'Risparmio',
    macrocategoria: 'APPARTENENTE',
    motto: 'Voglio OTTIMIZZARE le risorse',
    descrizione_breve: 'Candidato orientato all\'efficienza e all\'ottimizzazione dei costi. I punteggi generalmente bassi possono indicare un approccio minimalista o difficoltà trasversali. Attento al rapporto costi/benefici di ogni azione. Può essere prezioso in ruoli di controllo budget.',
    cosa_vuole: [
      'Chiarezza sui costi e benefici',
      'Efficienza nei processi',
      'Evitare sprechi di tempo e risorse',
      'Riconoscimento della propria utilità pratica'
    ],
    paura_principale: 'Investire energie in attività senza ritorno misurabile',
    come_riconoscerlo: [
      'Chiede informazioni su budget e risorse',
      'Confronta sempre le alternative',
      'Cerca il modo più efficiente di fare le cose'
    ],
    come_gestirlo: [
      'Essere trasparenti sui costi e investimenti',
      'Mostrare il valore pratico delle attività',
      'Coinvolgerlo nelle ottimizzazioni',
      'Definire metriche chiare di successo'
    ],
    errori_da_evitare: [
      'Sprechi evidenti di risorse',
      'Progetti senza ROI chiaro',
      'Ignorare le sue proposte di ottimizzazione',
      'Richiedere sforzi senza mostrare il ritorno'
    ],
    ruoli_ideali: ['Acquisti', 'Procurement', 'Cost Controller', 'Operations', 'Logistica'],
    alert_hr: 'Nota: Punteggi generalmente bassi possono indicare necessità di approfondimento sulle motivazioni e le aspettative.',
    colore: 'bg-orange-500',
    colorBg: 'bg-orange-100',
    colorText: 'text-orange-700'
  }
};

export const MACROCATEGORIA_INFO: Record<MacroCategoria, { label: string; descrizione: string; colore: string }> = {
  PROTAGONISTA: {
    label: 'Protagonista',
    descrizione: 'Cerca di distinguersi, essere riconosciuto, emergere per le proprie qualità',
    colore: 'bg-primary text-primary-foreground'
  },
  APPARTENENTE: {
    label: 'Appartenente',
    descrizione: 'Cerca di far parte di un gruppo, essere accettato, sentirsi al sicuro',
    colore: 'bg-accent text-accent-foreground'
  }
};

// Default profile for unknown/legacy types
const DEFAULT_PROFILE: ProfiloDescription = {
  label: 'In valutazione',
  macrocategoria: 'APPARTENENTE',
  motto: 'Profilo in fase di analisi',
  descrizione_breve: 'Il profilo psicologico è in fase di elaborazione. I dati disponibili non permettono una classificazione definitiva. Si consiglia un colloquio approfondito.',
  cosa_vuole: ['Chiarezza sulle aspettative', 'Ambiente di lavoro stabile'],
  paura_principale: 'Incertezza sulla propria collocazione',
  come_riconoscerlo: ['Profilo da approfondire con colloquio'],
  come_gestirlo: ['Condurre un colloquio approfondito', 'Valutare caso per caso'],
  errori_da_evitare: ['Assumere senza ulteriori verifiche'],
  ruoli_ideali: ['Da valutare'],
  alert_hr: 'Profilo con dati incompleti o non classificabili. Richiede valutazione manuale.',
  colore: 'bg-gray-500',
  colorBg: 'bg-gray-100',
  colorText: 'text-gray-700'
};

export function getProfiloDescription(tipo: ProfiloTipo | string | null | undefined): ProfiloDescription {
  if (!tipo || !(tipo in PROFILO_DESCRIPTIONS)) {
    return DEFAULT_PROFILE;
  }
  return PROFILO_DESCRIPTIONS[tipo as ProfiloTipo];
}

export function getMacrocategoria(tipo: ProfiloTipo | string | null | undefined): MacroCategoria {
  if (!tipo || !(tipo in PROFILO_DESCRIPTIONS)) {
    return 'APPARTENENTE';
  }
  return PROFILO_DESCRIPTIONS[tipo as ProfiloTipo].macrocategoria;
}

export function getProfiloColor(tipo: ProfiloTipo | string | null | undefined): string {
  if (!tipo || !(tipo in PROFILO_DESCRIPTIONS)) {
    return 'bg-gray-500';
  }
  return PROFILO_DESCRIPTIONS[tipo as ProfiloTipo].colore;
}
