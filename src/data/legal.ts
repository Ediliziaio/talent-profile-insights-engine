/**
 * Testi legali del portale.
 *
 * ATTENZIONE: sono documenti-base, non pareri legali. I campi fra parentesi
 * quadre vanno compilati con i dati reali della società e l'intero testo va
 * validato dal consulente privacy prima della messa online.
 */

export interface LegalDoc {
  slug: string;
  titolo: string;
  metaTitle: string;
  metaDescription: string;
  aggiornato: string;
  intro: string;
  sezioni: { titolo: string; paragrafi: string[]; elenco?: string[] }[];
}

const TITOLARE = '[RAGIONE SOCIALE], [INDIRIZZO SEDE LEGALE], P.IVA [P.IVA]';

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'privacy-policy',
    titolo: 'Privacy Policy',
    metaTitle: 'Privacy Policy — Talenti Edili',
    metaDescription:
      'Come Talenti Edili tratta i dati personali di imprese e candidati: finalità, basi giuridiche, conservazione e diritti dell’interessato ai sensi del GDPR.',
    aggiornato: '7 agosto 2026',
    intro:
      'Questa informativa descrive come Talenti Edili tratta i dati personali di chi visita il sito, delle imprese clienti e dei candidati che completano l’analisi psicoattitudinale, ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679 (GDPR).',
    sezioni: [
      {
        titolo: 'Titolare del trattamento',
        paragrafi: [
          `Il titolare del trattamento è ${TITOLARE}.`,
          'Per esercitare i tuoi diritti o per qualsiasi domanda sul trattamento dei dati puoi scrivere a privacy@talentiedili.it.',
        ],
      },
      {
        titolo: 'Quali dati trattiamo',
        paragrafi: ['A seconda del tuo rapporto con noi trattiamo categorie diverse di dati:'],
        elenco: [
          'Visitatori del sito: dati di navigazione (indirizzo IP, tipo di browser, pagine visitate) e dati forniti volontariamente tramite i moduli di contatto (nome, email, impresa, numero di dipendenti).',
          'Imprese clienti: dati di contatto del referente, dati di fatturazione, dati di utilizzo della piattaforma.',
          'Candidati: dati anagrafici e di contatto, esperienza professionale dichiarata e risposte al questionario psicoattitudinale, dalle quali viene elaborato il profilo su 15 tratti.',
        ],
      },
      {
        titolo: 'Finalità e basi giuridiche',
        paragrafi: [
          'Trattiamo i dati per le seguenti finalità:',
        ],
        elenco: [
          'Erogazione del servizio richiesto — base giuridica: esecuzione del contratto (art. 6.1.b GDPR).',
          'Elaborazione del profilo psicoattitudinale e calcolo della compatibilità di ruolo — base giuridica: consenso esplicito del candidato (art. 6.1.a GDPR), prestato prima dell’inizio del questionario.',
          'Visibilità del profilo del candidato alle imprese iscritte al marketplace — base giuridica: consenso esplicito e revocabile del candidato.',
          'Riscontro alle richieste di contatto e di demo — base giuridica: misure precontrattuali su richiesta dell’interessato (art. 6.1.b GDPR).',
          'Adempimenti di legge, contabili e fiscali — base giuridica: obbligo legale (art. 6.1.c GDPR).',
          'Sicurezza della piattaforma e prevenzione degli abusi — base giuridica: legittimo interesse (art. 6.1.f GDPR).',
        ],
      },
      {
        titolo: 'Decisioni automatizzate e Intelligenza Artificiale',
        paragrafi: [
          'Il Talent Profile System elabora automaticamente le risposte al questionario per produrre un profilo su 15 tratti e un punteggio di compatibilità con determinati ruoli.',
          'Il risultato è uno strumento di supporto alla decisione: non costituisce una decisione automatizzata che produce effetti giuridici sull’interessato ai sensi dell’art. 22 GDPR, poiché la decisione di assunzione resta sempre in capo a una persona fisica dell’impresa cliente.',
          'Il candidato ha diritto di ricevere il proprio report, di ottenere spiegazioni sulla logica del profilo e di contestarne il contenuto scrivendo a privacy@talentiedili.it.',
        ],
      },
      {
        titolo: 'Comunicazione dei dati',
        paragrafi: [
          'I dati dei candidati sono visibili alle imprese iscritte in forma anonima. I dati di contatto sono comunicati alla singola impresa soltanto a seguito dello sblocco del profilo e nei limiti autorizzati dal candidato.',
          'I dati possono essere trattati da fornitori che agiscono come responsabili del trattamento (hosting, invio email, strumenti di supporto), nominati ai sensi dell’art. 28 GDPR. L’elenco aggiornato è disponibile su richiesta.',
        ],
      },
      {
        titolo: 'Dove sono conservati i dati',
        paragrafi: [
          'I dati sono conservati su infrastrutture situate nell’Unione Europea e protetti con crittografia in transito e a riposo.',
          'Non è previsto un trasferimento sistematico dei dati verso Paesi terzi. Qualora si rendesse necessario, avverrebbe esclusivamente sulla base delle garanzie previste dal Capo V del GDPR.',
        ],
      },
      {
        titolo: 'Per quanto tempo li conserviamo',
        paragrafi: ['I periodi di conservazione sono i seguenti:'],
        elenco: [
          'Dati dei candidati e report psicoattitudinali: finché il profilo resta attivo e comunque non oltre 24 mesi dall’ultimo accesso, salvo rinnovo del consenso.',
          'Dati delle imprese clienti: per la durata del rapporto contrattuale e per i 10 anni successivi, per obblighi fiscali e contabili.',
          'Richieste di contatto non trasformate in rapporto contrattuale: 24 mesi.',
          'Dati di navigazione: secondo quanto indicato nella Cookie Policy.',
        ],
      },
      {
        titolo: 'I tuoi diritti',
        paragrafi: [
          'In qualsiasi momento puoi esercitare i diritti previsti dagli articoli 15–22 del GDPR: accesso, rettifica, cancellazione, limitazione del trattamento, portabilità, opposizione e revoca del consenso.',
          'La revoca del consenso non pregiudica la liceità del trattamento effettuato prima della revoca.',
          'Per esercitare i tuoi diritti scrivi a privacy@talentiedili.it. Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
        ],
      },
      {
        titolo: 'Modifiche a questa informativa',
        paragrafi: [
          'Possiamo aggiornare questa informativa per adeguarla a modifiche normative o del servizio. La data in testa al documento indica l’ultimo aggiornamento; in caso di modifiche sostanziali gli interessati vengono informati per email.',
        ],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    titolo: 'Cookie Policy',
    metaTitle: 'Cookie Policy — Talenti Edili',
    metaDescription:
      'Quali cookie utilizza il sito Talenti Edili, a cosa servono e come gestire le preferenze dal browser.',
    aggiornato: '7 agosto 2026',
    intro:
      'Questa pagina descrive i cookie e le tecnologie analoghe utilizzati dal sito talentiedili.it, a cosa servono e come puoi gestirli.',
    sezioni: [
      {
        titolo: 'Che cosa sono i cookie',
        paragrafi: [
          'I cookie sono piccoli file di testo che i siti salvano sul dispositivo di chi li visita. Servono a far funzionare il sito, a ricordare le preferenze e, in alcuni casi, a misurarne l’utilizzo.',
        ],
      },
      {
        titolo: 'Cookie tecnici',
        paragrafi: [
          'Sono necessari al funzionamento del sito e dell’area riservata e non richiedono consenso.',
        ],
        elenco: [
          'Cookie di sessione e di autenticazione, che mantengono l’accesso all’area riservata.',
          'Cookie di sicurezza, che proteggono da accessi non autorizzati.',
          'Cookie di preferenza, che ricordano scelte come la chiusura di un avviso.',
        ],
      },
      {
        titolo: 'Cookie analitici e di terze parti',
        paragrafi: [
          'Se attivati, i cookie analitici ci aiutano a capire quali pagine sono utili e dove il sito non funziona. Vengono installati solo previo consenso, che puoi negare o revocare in qualsiasi momento.',
          'Il sito non utilizza cookie di profilazione pubblicitaria per finalità di remarketing senza consenso esplicito.',
        ],
      },
      {
        titolo: 'Come gestire i cookie',
        paragrafi: [
          'Puoi gestire o eliminare i cookie dalle impostazioni del tuo browser. La disattivazione dei cookie tecnici può compromettere il funzionamento dell’area riservata.',
          'Per revocare un consenso già prestato puoi cancellare i cookie dal browser e ricaricare la pagina.',
        ],
      },
      {
        titolo: 'Aggiornamenti',
        paragrafi: [
          'L’elenco dei cookie può variare nel tempo. Questa pagina viene aggiornata a ogni modifica sostanziale.',
        ],
      },
    ],
  },
  {
    slug: 'termini-e-condizioni',
    titolo: 'Termini e Condizioni',
    metaTitle: 'Termini e Condizioni — Talenti Edili',
    metaDescription:
      'Condizioni di utilizzo del portale Talenti Edili per imprese e candidati: servizi, obblighi delle parti, garanzia e limitazioni di responsabilità.',
    aggiornato: '7 agosto 2026',
    intro:
      'Queste condizioni regolano l’utilizzo del portale talentiedili.it e dei servizi offerti da Talenti Edili. Utilizzando il sito o sottoscrivendo un piano ne accetti il contenuto.',
    sezioni: [
      {
        titolo: 'Oggetto',
        paragrafi: [
          `I servizi sono erogati da ${TITOLARE}.`,
          'Talenti Edili mette a disposizione: (a) il Talent Profile System, sistema di analisi psicoattitudinale con elaborazione tramite Intelligenza Artificiale; (b) un marketplace di profili professionali del settore edile; (c) servizi di ricerca e selezione del personale, regolati da specifico incarico scritto.',
        ],
      },
      {
        titolo: 'Natura del servizio e limiti',
        paragrafi: [
          'I report generati dal sistema sono strumenti di supporto alla decisione. La decisione di assunzione, promozione o gestione del personale resta esclusivamente in capo all’impresa cliente, che se ne assume la piena responsabilità.',
          'Talenti Edili non garantisce l’esito delle assunzioni né la permanenza in azienda delle persone selezionate, fatte salve le garanzie espressamente previste dal piano sottoscritto o dall’incarico di ricerca.',
          'I servizi non costituiscono attività di somministrazione di lavoro.',
        ],
      },
      {
        titolo: 'Obblighi dell’impresa cliente',
        paragrafi: ['Sottoscrivendo il servizio l’impresa si impegna a:'],
        elenco: [
          'Utilizzare i report esclusivamente per finalità di selezione e gestione del personale, nel rispetto della normativa sul lavoro e sulla privacy.',
          'Non comunicare a terzi i report ricevuti al di fuori della propria organizzazione.',
          'Non utilizzare i dati per finalità discriminatorie vietate dalla legge.',
          'Custodire le credenziali di accesso e rispondere dell’uso che ne viene fatto.',
        ],
      },
      {
        titolo: 'Obblighi del candidato',
        paragrafi: [
          'Il candidato si impegna a fornire informazioni veritiere e a rispondere personalmente al questionario. Risposte fornite da terzi o palesemente incoerenti possono comportare la sospensione del profilo.',
          'L’accesso del candidato all’analisi psicoattitudinale e al marketplace è gratuito.',
        ],
      },
      {
        titolo: 'Piani, pagamenti e recesso',
        paragrafi: [
          'I piani in abbonamento sono mensili, si rinnovano automaticamente e possono essere disdetti in qualsiasi momento con effetto dalla scadenza del periodo in corso.',
          'Nei primi 30 giorni dalla sottoscrizione è possibile richiedere il rimborso integrale secondo quanto indicato nella pagina Garanzia.',
          'Le analisi incluse nel piano non sono cumulabili da un mese all’altro salvo diverso accordo scritto.',
        ],
      },
      {
        titolo: 'Proprietà intellettuale',
        paragrafi: [
          'Il metodo Talent Profile System, il modello di matching, i testi dei report, il marchio e i contenuti del sito sono di proprietà del titolare. L’abbonamento concede un diritto d’uso non esclusivo e non trasferibile, limitato alla durata del rapporto.',
        ],
      },
      {
        titolo: 'Limitazione di responsabilità',
        paragrafi: [
          'Nei limiti consentiti dalla legge, la responsabilità complessiva del titolare è limitata ai corrispettivi versati dal cliente nei 12 mesi precedenti l’evento.',
          'Nessuna limitazione si applica in caso di dolo o colpa grave.',
        ],
      },
      {
        titolo: 'Legge applicabile e foro competente',
        paragrafi: [
          'Il rapporto è regolato dalla legge italiana. Per le controversie con clienti professionali è competente in via esclusiva il Foro di [FORO COMPETENTE]. Per i consumatori resta fermo il foro del luogo di residenza o domicilio.',
        ],
      },
    ],
  },
];

export const getLegalDoc = (slug?: string) => LEGAL_DOCS.find((d) => d.slug === slug);
