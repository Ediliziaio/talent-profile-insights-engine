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
  LEADER_NATURALE: {
    label: 'Leader Naturale',
    macrocategoria: 'ALTA_PERFORMANCE',
    motto: "Voglio GUIDARE e ISPIRARE il team",
    descrizione_breve: 'Candidato con spiccata attitudine alla leadership. Assume naturalmente responsabilità (QR>140), coinvolge il team (PA>130), gestisce la pressione (CF>120) mantenendo equilibrio (SC bilanciata). Ideale per ruoli direttivi e di coordinamento.',
    cosa_vuole: [
      'Ruoli di responsabilità e visibilità',
      'Team da guidare e sviluppare',
      'Obiettivi sfidanti e misurabili',
      'Autonomia decisionale e fiducia'
    ],
    paura_principale: 'Essere sottovalutato o confinato in ruoli esecutivi senza possibilità di influenzare',
    come_riconoscerlo: [
      'Parla naturalmente di team e risultati collettivi',
      'Chiede informazioni su percorsi di carriera',
      'Mostra sicurezza senza arroganza',
      'Propone soluzioni invece di evidenziare solo problemi'
    ],
    come_gestirlo: [
      'Assegnare progetti con alta visibilità e impatto',
      'Coinvolgerlo nelle decisioni strategiche',
      'Fornire feedback costruttivi regolari',
      'Offrire un percorso di crescita chiaro'
    ],
    errori_da_evitare: [
      'Micromanagement e controllo eccessivo',
      'Assegnare solo compiti operativi ripetitivi',
      'Ignorare le sue proposte di miglioramento',
      'Non riconoscere pubblicamente i successi'
    ],
    ruoli_ideali: ['Direzione', 'Team Leader', 'Project Manager', 'Account Director', 'Operations Manager'],
    colore: 'bg-purple-500',
    colorBg: 'bg-purple-50',
    colorText: 'text-purple-700'
  },
  
  COMMERCIALE_NATURALE: {
    label: 'Commerciale Naturale',
    macrocategoria: 'ALTA_PERFORMANCE',
    motto: 'Voglio CONVINCERE e VINCERE',
    descrizione_breve: 'Candidato con naturale predisposizione alla vendita. Alta partecipazione (PA>150), spazio personale (SP>140), motivazione (MO>130) e resilienza (CF>120). Gestisce i rifiuti senza demotivarsi e costruisce relazioni commerciali durature.',
    cosa_vuole: [
      'Contatto diretto con clienti',
      'Obiettivi commerciali sfidanti',
      'Sistema premiante basato sui risultati',
      'Libertà di gestione del proprio portafoglio'
    ],
    paura_principale: 'Essere confinato in ruoli senza contatto cliente o senza incentivi variabili',
    come_riconoscerlo: [
      'Chiede subito del sistema premiante',
      'Parla di performance passate con numeri',
      'Mostra entusiasmo per la sfida commerciale',
      'Ha naturale propensione al networking'
    ],
    come_gestirlo: [
      'Definire obiettivi commerciali chiari e premianti',
      'Lasciare autonomia nella gestione clienti',
      'Fornire strumenti per il CRM e follow-up',
      'Celebrare pubblicamente i successi di vendita'
    ],
    errori_da_evitare: [
      'Troppa burocrazia e reportistica',
      'Obiettivi irrealistici senza supporto',
      'Sistema incentivante poco trasparente',
      'Limitare il contatto diretto con i clienti'
    ],
    ruoli_ideali: ['Sales', 'Business Development', 'Account Manager', 'Key Account', 'Export Manager'],
    colore: 'bg-green-500',
    colorBg: 'bg-green-50',
    colorText: 'text-green-700'
  },
  
  ESECUTORE_AFFIDABILE: {
    label: 'Esecutore Affidabile',
    macrocategoria: 'ALTA_PERFORMANCE',
    motto: 'Voglio FARE BENE il mio lavoro',
    descrizione_breve: 'Candidato altamente affidabile nell\'esecuzione. Efficienza elevata (EF>140), determinazione (EC>130), schematicità equilibrata (100-150). Non cerca ruoli di leadership (QR<120) ma garantisce risultati costanti e puntuali.',
    cosa_vuole: [
      'Compiti chiari e scadenze definite',
      'Riconoscimento della propria affidabilità',
      'Ambiente stabile e prevedibile',
      'Strumenti adeguati per lavorare bene'
    ],
    paura_principale: 'Essere considerato poco importante o intercambiabile',
    come_riconoscerlo: [
      'Chiede dettagli sulle procedure',
      'Prende appunti durante i colloqui',
      'Parla di come ha risolto problemi operativi',
      'Mostra attenzione ai dettagli'
    ],
    come_gestirlo: [
      'Assegnare responsabilità operative chiare',
      'Fornire feedback sulla qualità del lavoro',
      'Coinvolgerlo nel miglioramento dei processi',
      'Riconoscere il contributo alla stabilità del team'
    ],
    errori_da_evitare: [
      'Cambiare spesso procedure e priorità',
      'Aspettarsi iniziativa strategica',
      'Sottovalutare il suo contributo quotidiano',
      'Forzarlo in ruoli di leadership'
    ],
    ruoli_ideali: ['Operations', 'Quality Control', 'Produzione', 'Customer Service', 'Logistica'],
    colore: 'bg-blue-500',
    colorBg: 'bg-blue-50',
    colorText: 'text-blue-700'
  },
  
  TECNICO_SPECIALISTA: {
    label: 'Tecnico Specialista',
    macrocategoria: 'ALTA_PERFORMANCE',
    motto: 'Voglio ECCELLERE nel mio campo',
    descrizione_breve: 'Candidato con forte competenza tecnica. Alta schematicità (SC>160), efficienza (EF>140), determinazione (EC>130). Preferisce il lavoro individuale (PA<100). Eccelle in ambiti specialistici ma può avere difficoltà relazionali.',
    cosa_vuole: [
      'Sfide tecniche complesse',
      'Riconoscimento della competenza',
      'Tempo per approfondire e perfezionare',
      'Autonomia operativa'
    ],
    paura_principale: 'Essere costretto a ruoli generalisti o troppo relazionali',
    come_riconoscerlo: [
      'Approfondisce aspetti tecnici',
      'Mostra insofferenza per le generalizzazioni',
      'Preferisce dimostrare con fatti e dati',
      'Può sembrare riservato o distaccato'
    ],
    come_gestirlo: [
      'Assegnare progetti tecnici sfidanti',
      'Riconoscere la competenza specialistica',
      'Non forzare la socializzazione',
      'Fornire tempo per l\'analisi approfondita'
    ],
    errori_da_evitare: [
      'Ruoli con forte esposizione relazionale',
      'Decisioni affrettate senza analisi',
      'Sottovalutare il bisogno di approfondimento',
      'Troppi meeting e interruzioni'
    ],
    ruoli_ideali: ['R&D', 'IT Specialist', 'Engineering', 'Quality Assurance', 'Analista'],
    alert_hr: 'Nota: La bassa partecipazione (PA) può creare difficoltà in team molto collaborativi. Valutare il contesto.',
    colore: 'bg-cyan-500',
    colorBg: 'bg-cyan-50',
    colorText: 'text-cyan-700'
  },
  
  CREATIVO_DESTABILIZZANTE: {
    label: 'Creativo',
    macrocategoria: 'CRESCITA',
    motto: 'Voglio INNOVARE e CAMBIARE le regole',
    descrizione_breve: 'Candidato con forte spinta creativa. Bassa schematicità (SC<80), alta motivazione (MO>130), spazio personale (SP>140), partecipazione (PA>130). Genera idee innovative ma può destabilizzare processi consolidati (EF<100).',
    cosa_vuole: [
      'Libertà di sperimentare',
      'Progetti innovativi e sfidanti',
      'Ambiente che valorizza le idee',
      'Poca burocrazia e procedure rigide'
    ],
    paura_principale: 'Essere costretto in schemi rigidi che soffocano la creatività',
    come_riconoscerlo: [
      'Propone approcci non convenzionali',
      'Mostra insofferenza per le procedure',
      'Chiede spazio per sperimentare',
      'Ha un portfolio di idee e progetti'
    ],
    come_gestirlo: [
      'Canalizzare la creatività verso obiettivi',
      'Affiancare con profili più strutturati',
      'Valorizzare le idee ma richiedere risultati',
      'Definire confini chiari ma con spazio'
    ],
    errori_da_evitare: [
      'Procedure troppo rigide',
      'Bocciare le idee senza ascolto',
      'Ruoli puramente esecutivi',
      'Aspettarsi precisione amministrativa'
    ],
    ruoli_ideali: ['Marketing Strategico', 'Product Development', 'Innovation', 'Design', 'Consulenza'],
    alert_hr: 'ATTENZIONE: La bassa efficienza (EF) richiede supervisione sui deliverable. Affiancare con profili operativi.',
    colore: 'bg-orange-500',
    colorBg: 'bg-orange-50',
    colorText: 'text-orange-700'
  },
  
  AMMINISTRATIVO_METODICO: {
    label: 'Amministrativo',
    macrocategoria: 'ALTA_PERFORMANCE',
    motto: 'Voglio ORDINE e PRECISIONE',
    descrizione_breve: 'Candidato ideale per ruoli di back-office. Alta schematicità (SC>130), efficienza (EF>140), determinazione equilibrata (EC>110). Gestisce carichi contenuti (QN 90-120) con grande precisione. Affidabile nei processi ripetitivi.',
    cosa_vuole: [
      'Procedure chiare e stabili',
      'Ambiente ordinato e prevedibile',
      'Riconoscimento della precisione',
      'Compiti definiti con scadenze'
    ],
    paura_principale: 'Caos organizzativo e cambiamenti continui',
    come_riconoscerlo: [
      'Molto ordinato e metodico',
      'Chiede dettagli sulle procedure',
      'Prende appunti sistematicamente',
      'Mostra disagio per l\'improvvisazione'
    ],
    come_gestirlo: [
      'Fornire procedure documentate',
      'Comunicare i cambiamenti con anticipo',
      'Valorizzare la precisione e l\'ordine',
      'Assegnare responsabilità di controllo'
    ],
    errori_da_evitare: [
      'Cambiamenti improvvisi e frequenti',
      'Ruoli con alta improvvisazione',
      'Sottovalutare il bisogno di stabilità',
      'Carichi di lavoro eccessivi'
    ],
    ruoli_ideali: ['Amministrazione', 'Contabilità', 'HR Operations', 'Compliance', 'Data Entry'],
    colore: 'bg-slate-500',
    colorBg: 'bg-slate-50',
    colorText: 'text-slate-700'
  },
  
  COLLABORATORE_CRESCITA: {
    label: 'In Crescita',
    macrocategoria: 'CRESCITA',
    motto: 'Voglio IMPARARE e MIGLIORARE',
    descrizione_breve: 'Candidato con punteggi medi (90-130) ma con almeno un punto di forza. Potenziale da sviluppare con formazione adeguata. Adattabile a diversi ruoli in base all\'accompagnamento fornito.',
    cosa_vuole: [
      'Opportunità di apprendimento',
      'Mentorship e affiancamento',
      'Percorso di crescita chiaro',
      'Feedback costruttivi regolari'
    ],
    paura_principale: 'Non avere opportunità di crescita e restare bloccato',
    come_riconoscerlo: [
      'Mostra curiosità e voglia di imparare',
      'Chiede informazioni sulla formazione',
      'Accetta feedback con apertura',
      'Ha consapevolezza dei propri limiti'
    ],
    come_gestirlo: [
      'Investire in formazione mirata',
      'Assegnare un mentor o buddy',
      'Definire step di crescita misurabili',
      'Dare responsabilità crescenti'
    ],
    errori_da_evitare: [
      'Ruoli troppo sfidanti subito',
      'Mancanza di supporto e formazione',
      'Non fornire feedback',
      'Aspettarsi autonomia immediata'
    ],
    ruoli_ideali: ['Junior in vari ambiti', 'Trainee', 'Ruoli di affiancamento', 'Stage to Hire'],
    colore: 'bg-teal-500',
    colorBg: 'bg-teal-50',
    colorText: 'text-teal-700'
  },
  
  PROFESSIONISTA_AUTONOMO: {
    label: 'Professionista Autonomo',
    macrocategoria: 'ALTA_PERFORMANCE',
    motto: 'Voglio LAVORARE in AUTONOMIA',
    descrizione_breve: 'Candidato efficace in autonomia. Alta efficacia (EC>140), efficienza (EF>130), spazio personale (SP>130). Non ama carichi eccessivi (QN<100) né team numerosi. Ottimo per ruoli di consulenza o progetti individuali.',
    cosa_vuole: [
      'Autonomia operativa',
      'Obiettivi chiari senza micromanagement',
      'Tempo per lavorare senza interruzioni',
      'Riconoscimento dei risultati'
    ],
    paura_principale: 'Essere costretto in team affollati con continue interruzioni',
    come_riconoscerlo: [
      'Preferisce lavorare da solo',
      'Chiede informazioni su smart working',
      'Parla di risultati individuali',
      'Mostra insofferenza per meeting prolungati'
    ],
    come_gestirlo: [
      'Definire obiettivi e lasciare autonomia',
      'Limitare i meeting al necessario',
      'Valutare sui risultati non sulla presenza',
      'Rispettare il bisogno di concentrazione'
    ],
    errori_da_evitare: [
      'Micromanagement',
      'Troppi meeting e interruzioni',
      'Forzare il lavoro di gruppo',
      'Controllare le ore invece dei risultati'
    ],
    ruoli_ideali: ['Consulente', 'Analyst', 'Freelance interno', 'Project Work', 'Remote'],
    colore: 'bg-indigo-500',
    colorBg: 'bg-indigo-50',
    colorText: 'text-indigo-700'
  },
  
  SUPPORTO_OPERATIVO: {
    label: 'Supporto Operativo',
    macrocategoria: 'CRESCITA',
    motto: 'Voglio CONTRIBUIRE con COSTANZA',
    descrizione_breve: 'Candidato adatto a ruoli esecutivi strutturati. Punteggi nella media senza particolari eccellenze né criticità. Affidabile per mansioni definite con supervisione. Può crescere con formazione adeguata.',
    cosa_vuole: [
      'Mansioni chiare e definite',
      'Supervisione di riferimento',
      'Ambiente stabile e sicuro',
      'Riconoscimento del contributo quotidiano'
    ],
    paura_principale: 'Responsabilità eccessive senza supporto adeguato',
    come_riconoscerlo: [
      'Chiede chiarimenti sulle aspettative',
      'Preferisce sapere esattamente cosa fare',
      'Non cerca visibilità',
      'Apprezza la routine e la stabilità'
    ],
    come_gestirlo: [
      'Assegnare compiti chiari con scadenze',
      'Fornire supervisione accessibile',
      'Dare feedback regolari',
      'Costruire gradualmente responsabilità'
    ],
    errori_da_evitare: [
      'Troppe responsabilità subito',
      'Mancanza di supervisione',
      'Aspettarsi iniziativa autonoma',
      'Ruoli ad alta esposizione'
    ],
    ruoli_ideali: ['Back Office', 'Data Entry', 'Supporto Clienti', 'Magazzino', 'Produzione'],
    colore: 'bg-gray-500',
    colorBg: 'bg-gray-50',
    colorText: 'text-gray-700'
  },
  
  IN_TRANSIZIONE: {
    label: 'In Transizione',
    macrocategoria: 'ATTENZIONE',
    motto: 'Ho bisogno di STABILITÀ e SUPPORTO',
    descrizione_breve: 'Candidato in condizione di vulnerabilità. Stress Zone attiva (SV<100 e CF<100) oppure >2 scale critiche (<70). Richiede valutazione approfondita e inserimento graduale con supporto. Non idoneo per ruoli ad alta pressione.',
    cosa_vuole: [
      'Ambiente protetto e supportivo',
      'Tempo per stabilizzarsi',
      'Compiti semplici inizialmente',
      'Riferimenti chiari e accessibili'
    ],
    paura_principale: 'Pressioni eccessive che peggiorino la situazione',
    come_riconoscerlo: [
      'Segnali di stress o disagio',
      'Risposte incerte o contraddittorie',
      'Richiesta di rassicurazioni',
      'Difficoltà a proiettarsi nel futuro'
    ],
    come_gestirlo: [
      'Colloquio approfondito obbligatorio',
      'Inserimento graduale con buddy',
      'Evitare pressioni iniziali',
      'Valutare supporto HR/welfare',
      'Monitoraggio più frequente'
    ],
    errori_da_evitare: [
      'Ruoli ad alta pressione',
      'Inserimento senza affiancamento',
      'Aspettarsi performance immediate',
      'Ignorare i segnali di disagio'
    ],
    ruoli_ideali: ['Ruoli protetti', 'Part-time iniziale', 'Affiancamento prolungato', 'Valutare caso per caso'],
    alert_hr: 'ATTENZIONE: Stress Zone o aree critiche multiple rilevate. Colloquio approfondito OBBLIGATORIO. Valutare attentamente capacità di inserimento e eventuale supporto welfare aziendale.',
    colore: 'bg-red-500',
    colorBg: 'bg-red-50',
    colorText: 'text-red-700'
  }
};

export const MACROCATEGORIA_INFO: Record<MacroCategoria, { label: string; descrizione: string; colore: string }> = {
  ALTA_PERFORMANCE: {
    label: 'Alta Performance',
    descrizione: 'Profili con caratteristiche consolidate, pronti per ruoli di responsabilità o specialistici',
    colore: 'bg-primary text-primary-foreground'
  },
  CRESCITA: {
    label: 'Potenziale di Crescita',
    descrizione: 'Profili con margini di sviluppo, richiedono investimento formativo ma promettenti',
    colore: 'bg-accent text-accent-foreground'
  },
  ATTENZIONE: {
    label: 'Richiede Attenzione',
    descrizione: 'Profili con criticità da approfondire, inserimento solo con adeguato supporto',
    colore: 'bg-destructive text-destructive-foreground'
  }
};

// Default profile for unknown/legacy types
const DEFAULT_PROFILE: ProfiloDescription = {
  label: 'In valutazione',
  macrocategoria: 'CRESCITA',
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
    return 'CRESCITA';
  }
  return PROFILO_DESCRIPTIONS[tipo as ProfiloTipo].macrocategoria;
}

export function getProfiloColor(tipo: ProfiloTipo | string | null | undefined): string {
  if (!tipo || !(tipo in PROFILO_DESCRIPTIONS)) {
    return 'bg-gray-500';
  }
  return PROFILO_DESCRIPTIONS[tipo as ProfiloTipo].colore;
}
