/**
 * FAQ master del portale, raggruppate per tema.
 *
 * Sono scritte in forma di domanda diretta e con risposte autoconclusive:
 * ogni risposta deve funzionare anche estratta dal contesto, perché è così
 * che la usano i motori generativi (AI Overviews, ChatGPT, Perplexity).
 */

export interface FaqGruppo {
  id: string;
  titolo: string;
  domande: { q: string; a: string }[];
  /** Pagina che tratta a fondo il tema: rende esplicito il rapporto hub → pagina */
  approfondimento?: { label: string; to: string };
}

export const FAQ_GRUPPI: FaqGruppo[] = [
  {
    id: 'generale',
    approfondimento: { label: 'I tre modi di lavorare con noi', to: '/' },
    titolo: 'Talenti Edili in generale',
    domande: [
      {
        q: 'Che cos’è Talenti Edili?',
        a: 'Talenti Edili è il sistema di selezione e gestione del personale per le imprese edili che unisce Intelligenza Artificiale e analisi psicoattitudinale. Funziona in tre modi: una banca dei talenti di profili già analizzati, un servizio di ricerca e selezione chiavi in mano, e il Talent Profile System utilizzabile in autonomia.',
      },
      {
        q: 'Talenti Edili è solo un software?',
        a: 'No. È un sistema: un metodo di analisi psicoattitudinale validato, un livello di Intelligenza Artificiale che interpreta i dati e strumenti operativi per il colloquio e l’inserimento. La piattaforma online è il modo in cui il sistema viene erogato, non il sistema stesso. Quando serve mettiamo anche le persone, con il servizio di ricerca e selezione.',
      },
      {
        q: 'Che differenza c’è fra Banca Talenti, ricerca e selezione e Talent Profile System?',
        a: 'La Banca Talenti è il bacino di profili già analizzati in cui cerchi tu. La ricerca e selezione è il servizio in cui cerchiamo, verifichiamo e analizziamo noi, consegnandoti tre finalisti. Il Talent Profile System è il sistema di analisi che usi in autonomia sui tuoi candidati. I tre si possono usare insieme o separatamente.',
      },
      {
        q: 'Serve solo alle imprese edili?',
        a: 'Il modello di compatibilità è tarato sui ruoli dell’edilizia — cantiere, ufficio tecnico, amministrazione di impresa edile — ed è lì che dà il massimo. Lo usano anche imprese impiantistiche, artigiane e di manutenzioni, che condividono gli stessi ruoli e le stesse dinamiche di cantiere.',
      },
    ],
  },
  {
    id: 'metodo',
    approfondimento: { label: 'Come funziona il Talent Profile System', to: '/talent-profile-system' },
    titolo: 'Il metodo e l’Intelligenza Artificiale',
    domande: [
      {
        q: 'Che cos’è il Talent Profile System?',
        a: 'È il motore di analisi su cui si basa Talenti Edili: un questionario psicoattitudinale di 242 domande che misura 15 tratti della persona su tre aree — Essere, Fare, Avere — e un livello di Intelligenza Artificiale che incrocia il profilo con oltre 30 ruoli edili, generando il report in tempo reale.',
      },
      {
        q: 'Che differenza c’è fra analisi psicoattitudinale e test della personalità?',
        a: 'Un test della personalità descrive come sei; un’analisi psicoattitudinale misura come quei tratti si traducono in comportamento sul lavoro e li confronta con i requisiti di un ruolo specifico. Il risultato non è un’etichetta, è un punteggio di compatibilità con la posizione che devi coprire.',
      },
      {
        q: 'Che ruolo ha esattamente l’Intelligenza Artificiale?',
        a: 'L’AI non inventa il profilo: parte dai punteggi calcolati dal modello psicometrico e li traduce in indicazioni operative — quale ruolo, quali rischi, quali domande fare al colloquio, come gestire quella persona nei primi 90 giorni. Fa in tempo reale il lavoro che prima richiedeva ore di un consulente.',
      },
      {
        q: 'È validato scientificamente?',
        a: 'Sì. Il Talent Profile System si basa su modelli psicometrici riconosciuti, con un coefficiente di validazione di .75 su 1. Le domande sono costruite per rendere inefficaci le risposte di comodo.',
      },
      {
        q: 'Il candidato può barare?',
        a: 'È molto difficile. Le 242 domande contengono item di controllo incrociati: rispondere in modo strategico su una scala genera incoerenze rilevabili su altre. Il sistema segnala i profili con risposte non coerenti.',
      },
      {
        q: 'Perché lo stesso candidato è compatibile con un ruolo e non con un altro?',
        a: 'Perché ogni ruolo pesa i 15 tratti in modo diverso. Su un capocantiere contano decisione, gestione dello stress e leadership; su un preventivista contano precisione, metodo e onestà nei numeri. Il punteggio non è un giudizio sulla persona, è una misura di adattamento a una posizione precisa.',
      },
    ],
  },
  {
    id: 'operativo',
    approfondimento: { label: 'I ruoli edili coperti dal sistema', to: '/ruoli' },
    titolo: 'Uso quotidiano',
    domande: [
      {
        q: 'Quanto dura l’analisi psicoattitudinale?',
        a: 'Circa 15 minuti, da telefono o da PC, quando il candidato preferisce. Il report elaborato dall’Intelligenza Artificiale è disponibile subito dopo l’invio, senza attese e senza intervento di un consulente.',
      },
      {
        q: 'Come invio l’analisi a un candidato?',
        a: 'Crei il candidato dalla dashboard e il sistema genera un link unico. Glielo mandi su WhatsApp o via email, lui compila in autonomia e tu ricevi la notifica quando il report è pronto.',
      },
      {
        q: 'Serve una struttura HR per usarlo?',
        a: 'No. È pensato per imprese edili senza ufficio del personale: il report è scritto in linguaggio operativo, non in gergo psicologico, e chiunque in azienda può leggerlo e usarlo.',
      },
      {
        q: 'Quanto tempo serve per partire?',
        a: 'Nessuno. Talenti Edili è interamente in cloud: niente da installare, niente da integrare con i tuoi gestionali. Crei l’account e mandi la prima analisi lo stesso giorno.',
      },
      {
        q: 'Posso usarlo sulle persone che ho già in azienda?',
        a: 'Sì, ed è uno degli usi più frequenti: mappare squadre e capisquadra già in forza per capire chi è nel ruolo sbagliato, come gestire ciascuno e su chi investire per farlo crescere.',
      },
      {
        q: 'Per quali ruoli dell’edilizia funziona?',
        a: 'Oltre 30 ruoli: operaio specializzato, muratore, carpentiere, ferraiolo, gruista, autista mezzi d’opera, capisquadra, capocantiere, geometra, direttore tecnico, project manager, responsabile sicurezza, preventivista, ufficio acquisti, amministrazione e commerciale.',
      },
    ],
  },
  {
    id: 'servizio',
    approfondimento: { label: 'Il servizio di ricerca e selezione', to: '/ricerca-e-selezione-personale-edile' },
    titolo: 'Banca Talenti e servizio di selezione',
    domande: [
      {
        q: 'Come finiscono i candidati nella Banca Talenti?',
        a: 'I candidati si registrano gratuitamente, completano l’analisi psicoattitudinale in 15 minuti e autorizzano esplicitamente la visibilità del proprio profilo alle imprese. Nessun profilo è presente senza consenso.',
      },
      {
        q: 'Quanto tempo serve per ricevere la rosa di candidati?',
        a: 'Di norma consegniamo la short list di tre finalisti entro 21 giorni dal briefing. Sui ruoli molto specialistici o in zone con poca offerta i tempi possono allungarsi: te lo diciamo prima di partire, non dopo.',
      },
      {
        q: 'In cosa siete diversi da un’agenzia interinale?',
        a: 'Un’agenzia ti manda persone; noi ti diciamo perché quella persona funzionerà in quel ruolo e cosa rischi con lei. Ogni finalista arriva con un’analisi psicoattitudinale su 15 tratti e un report elaborato dall’AI. E la persona la assumi tu, direttamente: non c’è somministrazione.',
      },
      {
        q: 'Cosa succede se la persona assunta se ne va dopo due mesi?',
        a: 'Riapriamo la ricerca senza costi aggiuntivi entro il periodo di garanzia concordato in fase di incarico.',
      },
    ],
  },
  {
    id: 'prezzi',
    approfondimento: { label: 'Piani e prezzi in dettaglio', to: '/prezzi' },
    titolo: 'Prezzi e garanzie',
    domande: [
      {
        q: 'Quanto costa Talenti Edili?',
        a: 'L’abbonamento al sistema parte da 49 € al mese per 5 analisi psicoattitudinali e arriva a 97 € al mese per 20 analisi con tutti i report avanzati. Per volumi superiori c’è il piano Enterprise su misura. Il servizio di ricerca e selezione è quotato a incarico in base al ruolo.',
      },
      {
        q: 'C’è un vincolo di durata?',
        a: 'No. I piani sono mensili e si disdicono quando vuoi. Nei primi 30 giorni vale la garanzia: se non ti fa risparmiare almeno un’assunzione sbagliata, ti rimborsiamo l’intero importo.',
      },
      {
        q: 'Il candidato paga qualcosa?',
        a: 'Mai. Per chi cerca lavoro l’analisi psicoattitudinale e la presenza nella Banca Talenti sono gratuite e restano gratuite.',
      },
      {
        q: 'Posso provarlo prima di decidere?',
        a: 'Sì. Facciamo una demo gratuita di 30 minuti in cui vedi il sistema applicato alla tua impresa e ai tuoi ruoli reali, senza impegno.',
      },
    ],
  },
  {
    id: 'privacy',
    approfondimento: { label: 'Informativa privacy completa', to: '/privacy-policy' },
    titolo: 'Dati e privacy',
    domande: [
      {
        q: 'I dati dei candidati sono al sicuro?',
        a: 'Sì. Tutti i dati sono crittografati e conservati su server europei, nel pieno rispetto del GDPR. Il candidato presta consenso esplicito prima di iniziare l’analisi psicoattitudinale.',
      },
      {
        q: 'L’impresa vede i dati personali di tutti i candidati della Banca Talenti?',
        a: 'No. In elenco i profili sono anonimi: si vede la parte professionale e psicoattitudinale. I dati di contatto compaiono solo quando l’impresa sblocca quel profilo specifico.',
      },
      {
        q: 'Il mio datore di lavoro attuale può vedere il mio profilo?',
        a: 'Solo se lo autorizzi. Il profilo compare in forma anonima e puoi escludere singole imprese dalla visibilità.',
      },
      {
        q: 'Per quanto tempo conservate i dati?',
        a: 'I profili dei candidati restano attivi finché il candidato li mantiene tali; in ogni momento può richiederne la cancellazione scrivendo all’indirizzo privacy indicato nella Privacy Policy.',
      },
    ],
  },
];

export const TUTTE_LE_FAQ = FAQ_GRUPPI.flatMap((g) => g.domande);
