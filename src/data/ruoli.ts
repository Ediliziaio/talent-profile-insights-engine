/**
 * Ruoli edili coperti dal Talent Profile System.
 *
 * Ogni voce genera una pagina indicizzabile su /ruoli/:slug. I testi sono
 * scritti per rispondere in modo autoconclusivo alle domande che un
 * imprenditore edile digita ("come si seleziona un capocantiere", "che
 * caratteristiche deve avere un capisquadra") — è la base dell'AEO.
 */

export type CategoriaRuolo = 'Cantiere' | 'Tecnico' | 'Ufficio';

export interface Ruolo {
  slug: string;
  nome: string;
  categoria: CategoriaRuolo;
  /** Riassunto breve, usato nelle card dell'hub /ruoli */
  sintesi: string;
  metaTitle: string;
  metaDescription: string;
  /** Risposta diretta alla domanda "che cosa fa e come si seleziona" — blocco AEO */
  definizione: string;
  /** I tratti che pesano di più nel abbinamento per questo ruolo */
  tratti: { nome: string; perche: string }[];
  /** Segnali che il candidato non regge il ruolo */
  rischi: string[];
  /** Domande che il sistema genera per il colloquio */
  domande: string[];
  /** Errore tipico che le imprese fanno selezionando questo ruolo */
  erroreTipico: string;
  faq: { q: string; a: string }[];
}

export const RUOLI: Ruolo[] = [
  {
    slug: 'capocantiere',
    nome: 'Capocantiere',
    categoria: 'Cantiere',
    sintesi:
      'Tiene insieme squadre, fornitori e cronoprogramma. Il ruolo dove un errore di selezione costa di più.',
    metaTitle: 'Come selezionare un capocantiere | Talenti Edili',
    metaDescription:
      'Che caratteristiche deve avere un capocantiere e come si valuta prima di assumerlo. I tratti che contano, i segnali di rischio e le domande da fare al colloquio.',
    definizione:
      'Il capocantiere è la persona che traduce il progetto in lavoro quotidiano: coordina squadre e subappaltatori, gestisce forniture e tempi, tiene i rapporti con direzione lavori e committente. È il ruolo in cui l’errore di selezione costa di più, perché un capocantiere sbagliato non rallenta se stesso: rallenta tutto il cantiere. Selezionarlo bene significa misurare tre cose che il curriculum non dice — capacità di decidere sotto pressione, autorevolezza senza conflitto e gestione dell’imprevisto.',
    tratti: [
      { nome: 'Leadership operativa', perche: 'Deve farsi seguire da squadre che non ha scelto lui, spesso di imprese diverse.' },
      { nome: 'Gestione dello stress', perche: 'Ritardi, forniture che saltano e committenti che chiamano sono la normalità, non l’eccezione.' },
      { nome: 'Decisione rapida', perche: 'In cantiere una decisione mediocre presa subito vale più di una perfetta presa domani.' },
      { nome: 'Orientamento alla regola', perche: 'Sicurezza e procedure non possono dipendere dall’umore della giornata.' },
      { nome: 'Comunicazione diretta', perche: 'Deve dire le cose come stanno a operai, fornitori e direzione lavori, senza creare fratture.' },
    ],
    rischi: [
      'Autorevolezza che sconfina in autoritarismo: la squadra esegue ma smette di segnalare i problemi.',
      'Evitamento del conflitto: accumula tensioni fino a esplodere o a lasciare il cantiere.',
      'Rigidità sotto stress: quando il piano salta si blocca invece di ripianificare.',
      'Delega assente: fa tutto lui, diventa il collo di bottiglia del cantiere.',
    ],
    domande: [
      'Raccontami l’ultima volta che una fornitura è saltata a due giorni dalla consegna. Cosa hai fatto nelle prime due ore?',
      'Come ti sei comportato con un operaio bravo tecnicamente ma che non rispettava le regole di sicurezza?',
      'Quando hai dovuto dire alla direzione lavori che il cronoprogramma non reggeva, come gliel’hai comunicato?',
      'Qual è stata la decisione più impopolare che hai preso in cantiere e come è finita?',
    ],
    erroreTipico:
      'Promuovere il muratore più bravo. La competenza tecnica non predice la capacità di coordinare persone: è il singolo errore più costoso che vediamo nelle imprese edili.',
    faq: [
      {
        q: 'Che caratteristiche deve avere un buon capocantiere?',
        a: 'Leadership operativa, quanto regge lo stress, capacità di decidere in fretta, rispetto rigoroso delle regole di sicurezza e comunicazione diretta. Sono tratti psicoattitudinali, non tecnici: si misurano, non si intuiscono al colloquio.',
      },
      {
        q: 'Si può capire prima se un capocantiere reggerà il ruolo?',
        a: 'Sì. L’analisi psicoattitudinale Talent Profile misura i 15 tratti e restituisce un punteggio di compatibilità con il ruolo di capocantiere, insieme ai rischi comportamentali specifici di quella persona.',
      },
      {
        q: 'Conviene promuovere un operaio interno a capocantiere?',
        a: 'Dipende dai tratti, non dagli anni di esperienza. Molte imprese usano l’analisi proprio per capire, fra le persone già in forza, chi ha davvero il profilo per il salto e chi renderebbe di più restando dov’è.',
      },
    ],
  },
  {
    slug: 'capisquadra',
    nome: 'Capisquadra',
    categoria: 'Cantiere',
    sintesi:
      'Il ponte fra chi decide e chi esegue. Sbagliarlo significa perdere i migliori operai della squadra.',
    metaTitle: 'Come selezionare un capisquadra in edilizia | Talenti Edili',
    metaDescription:
      'Come si valuta un capisquadra prima di promuoverlo o assumerlo: tratti psicoattitudinali che contano, rischi tipici e domande da fare al colloquio.',
    definizione:
      'Il capisquadra guida un gruppo ristretto di operai sul pezzo di lavorazione assegnato: distribuisce i compiti, mantiene il ritmo, corregge in tempo reale. È il ruolo che determina il clima quotidiano della squadra — e quindi chi resta e chi se ne va. Un capisquadra tecnicamente bravo ma relazionalmente tossico non fa danni visibili sul cronoprogramma: li fa sul turnover, sei mesi dopo, quando gli operai migliori se ne vanno senza spiegare il vero motivo.',
    tratti: [
      { nome: 'Empatia operativa', perche: 'Deve accorgersi quando un operaio è in difficoltà prima che l’errore diventi un infortunio.' },
      { nome: 'Fermezza', perche: 'Il ritmo lo detta lui: se cede, cede tutta la squadra.' },
      { nome: 'Costanza', perche: 'La squadra si regola sulla sua prevedibilità, non sulla sua bravura nei giorni buoni.' },
      { nome: 'Capacità di istruire', perche: 'Gran parte della formazione reale in edilizia passa da lui, non dai corsi.' },
      { nome: 'Tolleranza alla frustrazione', perche: 'Riceve pressione dall’alto e resistenze dal basso, tutti i giorni.' },
    ],
    rischi: [
      'Gestione per intimidazione: risultati nel breve, turnover nel medio.',
      'Favoritismi dentro la squadra: spacca il gruppo e demotiva chi lavora meglio.',
      'Incapacità di dire no al capocantiere: accetta carichi impossibili e li scarica sugli operai.',
      'Trattenere le informazioni per restare indispensabile.',
    ],
    domande: [
      'Come hai gestito l’ultimo operaio della tua squadra che non teneva il ritmo?',
      'Raccontami una volta in cui hai detto di no a una richiesta del capocantiere. Come è andata?',
      'Chi hai formato in questi anni e cosa fa oggi quella persona?',
      'Quando la squadra sbaglia, come lo comunichi al gruppo?',
    ],
    erroreTipico:
      'Scegliere chi ha più anni di cantiere. L’anzianità non predice la capacità di tenere insieme un gruppo: predice solo che conosce il mestiere.',
    faq: [
      {
        q: 'Qual è la differenza fra capisquadra e capocantiere?',
        a: 'Il capisquadra guida un gruppo ristretto sulla singola lavorazione ed è dentro il lavoro fisico; il capocantiere coordina più squadre, fornitori e tempi ed è responsabile del cantiere nel suo insieme. Richiedono profili psicoattitudinali diversi: il primo pesa di più su empatia e costanza, il secondo su decisione e gestione dello stress.',
      },
      {
        q: 'Come capisco se un capisquadra sta facendo scappare le persone?',
        a: 'Il segnale non è il conflitto aperto, è il turnover silenzioso nella sua squadra. L’analisi psicoattitudinale evidenzia i tratti che generano quel comportamento — rigidità relazionale, gestione per intimidazione, scarsa tolleranza all’errore altrui — prima che diventino dimissioni.',
      },
    ],
  },
  {
    slug: 'muratore',
    nome: 'Muratore',
    categoria: 'Cantiere',
    sintesi:
      'Il mestiere dove la selezione sembra facile e invece decide affidabilità, sicurezza e ritmo del cantiere.',
    metaTitle: 'Come selezionare un muratore affidabile | Talenti Edili',
    metaDescription:
      'Selezionare un muratore non significa solo valutare la mano. Come si misurano affidabilità, rispetto della sicurezza e costanza nel tempo prima di assumerlo.',
    definizione:
      'Il muratore è la spina dorsale operativa del cantiere. La prova pratica dice se sa lavorare; non dice se si presenterà lunedì, se rispetterà le procedure di sicurezza quando nessuno guarda, se reggerà tre mesi consecutivi allo stesso ritmo. Sono esattamente le variabili che fanno saltare i cronoprogrammi — e sono variabili psicoattitudinali, misurabili prima dell’assunzione.',
    tratti: [
      { nome: 'Affidabilità', perche: 'La presenza costante vale più della velocità: una squadra si programma sulle presenze.' },
      { nome: 'Rispetto della procedura', perche: 'Chi salta i passaggi quando ha fretta è il profilo statisticamente più esposto agli infortuni.' },
      { nome: 'Resistenza alla fatica', perche: 'Il calo nel terzo mese è il vero test, non la prima settimana.' },
      { nome: 'Collaborazione', perche: 'In cantiere si lavora fianco a fianco: un solitario rallenta tutti.' },
      { nome: 'Precisione', perche: 'Il rifacimento è il costo nascosto più sottovalutato in edilizia.' },
    ],
    rischi: [
      'Ottima prima settimana e crollo al secondo mese: profilo con motivazione instabile.',
      'Insofferenza alle regole di sicurezza percepite come "perdita di tempo".',
      'Conflittualità con i colleghi mascherata da schiettezza.',
      'Cronologia lavorativa frammentata senza una ragione riconducibile al settore.',
    ],
    domande: [
      'Qual è il lavoro più lungo che hai fatto con la stessa impresa e perché è finito?',
      'Raccontami una volta in cui non avevi il DPI corretto e dovevi comunque finire. Cosa hai fatto?',
      'Ti è mai capitato di dover rifare un lavoro? Di chi era l’errore e come è andata?',
      'Cosa ti fa restare in un’impresa più di due anni?',
    ],
    erroreTipico:
      'Assumere sulla prova pratica di mezza giornata. Misura la mano, non la tenuta: e il costo di chi molla dopo otto settimane è quasi identico a quello di un errore su un ruolo di responsabilità.',
    faq: [
      {
        q: 'Serve davvero un test psicoattitudinale per un operaio?',
        a: 'Serve se il problema che hai non è la manualità ma il turnover. La prova pratica valuta la competenza; l’analisi psicoattitudinale valuta affidabilità, rispetto della sicurezza e costanza nel tempo — cioè le ragioni per cui le persone se ne vanno o si fanno male.',
      },
      {
        q: 'Quanto tempo richiede al candidato?',
        a: 'Circa 15 minuti dal telefono, in italiano semplice. Non è un test di cultura generale e non richiede di saper usare un computer.',
      },
    ],
  },
  {
    slug: 'carpentiere',
    nome: 'Carpentiere',
    categoria: 'Cantiere',
    sintesi:
      'Precisione e sicurezza sotto pressione di tempo: il profilo dove l’approssimazione si paga subito.',
    metaTitle: 'Come selezionare un carpentiere edile | Talenti Edili',
    metaDescription:
      'Come valutare un carpentiere prima di assumerlo: precisione, rispetto delle procedure di sicurezza, quanto regge la pressione e domande da fare al colloquio.',
    definizione:
      'Il carpentiere costruisce ciò che regge il getto: casseforme, banchinaggi, strutture provvisorie. È un ruolo dove l’errore non si vede finché non è tardi, e dove la fretta è la principale nemica della sicurezza. Il profilo che funziona unisce precisione ostinata e capacità di lavorare in altezza sotto pressione di tempo senza abbassare gli standard.',
    tratti: [
      { nome: 'Precisione', perche: 'Una cassaforma fuori squadra si paga sul getto, non prima.' },
      { nome: 'Rispetto della procedura', perche: 'Lavoro in quota: la scorciatoia non è un rischio teorico.' },
      { nome: 'Lettura dello spazio', perche: 'Deve tradurre il disegno in struttura senza continue verifiche.' },
      { nome: 'Tenuta sotto pressione di tempo', perche: 'Il getto ha una data e non si sposta.' },
      { nome: 'Autonomia', perche: 'Spesso lavora su indicazioni sintetiche e deve completare il ragionamento da solo.' },
    ],
    rischi: [
      'Velocità a scapito della verifica: profilo che "recupera dopo".',
      'Sicurezza vissuta come burocrazia da aggirare quando si è in ritardo.',
      'Difficoltà ad ammettere un errore prima che diventi visibile.',
      'Autonomia che diventa isolamento: non allinea la squadra sulle modifiche.',
    ],
    domande: [
      'Raccontami l’ultima volta che hai trovato un errore in una struttura già montata. Cosa hai fatto?',
      'Come ti organizzi quando il getto è fissato e sei in ritardo di mezza giornata?',
      'Qual è la procedura di sicurezza che secondo te viene saltata più spesso, e perché?',
      'Preferisci lavorare da solo o in coppia? Raccontami un caso in cui è andata male.',
    ],
    erroreTipico:
      'Valutare solo la velocità di montaggio. Il carpentiere veloce ma approssimativo genera costi di rifacimento e rischio infortunio che non compaiono in nessun preventivo.',
    faq: [
      {
        q: 'Come si valuta la propensione alla sicurezza di un carpentiere?',
        a: 'Non chiedendogli se rispetta le regole — risponderanno tutti di sì. Si misura il tratto "orientamento alla procedura" e lo si incrocia con la tolleranza alla pressione: la combinazione bassa procedura + bassa tolleranza allo stress è il profilo statisticamente più esposto.',
      },
    ],
  },
  {
    slug: 'geometra-di-cantiere',
    nome: 'Geometra di cantiere',
    categoria: 'Tecnico',
    sintesi:
      'Sta in mezzo fra ufficio tecnico e cantiere: serve rigore, ma soprattutto capacità di farsi ascoltare.',
    metaTitle: 'Come selezionare un geometra di cantiere | Talenti Edili',
    metaDescription:
      'Il geometra di cantiere fa da ponte fra ufficio tecnico e squadre. Come valutarne rigore, autorevolezza e gestione del conflitto prima di assumerlo.',
    definizione:
      'Il geometra di cantiere presidia misure, contabilità di cantiere, avanzamento lavori e rapporti con la direzione lavori. Sulla carta è un ruolo tecnico; nella pratica il 60% del lavoro è far accettare a squadre e fornitori decisioni che non hanno preso loro. Per questo la selezione basata solo sul titolo e sull’esperienza software produce persone precise che nessuno in cantiere ascolta.',
    tratti: [
      { nome: 'Rigore', perche: 'Un errore di misura o di contabilità si moltiplica lungo tutta la commessa.' },
      { nome: 'Autorevolezza tecnica', perche: 'Deve farsi seguire da chi ha trent’anni di cantiere e nessun titolo.' },
      { nome: 'Gestione del conflitto', perche: 'Sta strutturalmente in mezzo fra chi progetta e chi esegue.' },
      { nome: 'Organizzazione', perche: 'Gestisce scadenze parallele su più fronti e nessuna può slittare in silenzio.' },
      { nome: 'Chiarezza comunicativa', perche: 'Deve tradurre il disegno in istruzioni che una squadra applica senza interpretare.' },
    ],
    rischi: [
      'Precisione senza autorevolezza: ha ragione ma non viene applicato niente di ciò che dice.',
      'Evita il cantiere e si rifugia in ufficio: i problemi emergono a lavoro fatto.',
      'Perfezionismo che blocca le decisioni operative.',
      'Riporta i problemi solo quando sono già irrecuperabili.',
    ],
    domande: [
      'Raccontami una volta in cui il capisquadra ha fatto il contrario di quello che avevi indicato. Come è finita?',
      'Come gestisci una variante che il committente vuole ma che la squadra considera impraticabile?',
      'Qual è l’errore di misura più costoso che hai visto o commesso?',
      'Quanto tempo passi in cantiere rispetto all’ufficio, e perché?',
    ],
    erroreTipico:
      'Selezionare sul software (CAD, computo, contabilità) e dare per scontata la parte relazionale. Il software si impara in due settimane, l’autorevolezza no.',
    faq: [
      {
        q: 'Che differenza c’è fra geometra di cantiere e direttore tecnico?',
        a: 'Il geometra di cantiere presidia misure, contabilità e avanzamento su una o poche commesse; il direttore tecnico ha responsabilità sull’intero portafoglio lavori e sulle scelte tecniche dell’impresa. Il secondo richiede molto più peso su visione d’insieme e assunzione di responsabilità.',
      },
    ],
  },
  {
    slug: 'project-manager-edile',
    nome: 'Project Manager edile',
    categoria: 'Tecnico',
    sintesi:
      'Tiene insieme tempi, costi e committente. Sbagliarlo si vede sul margine, non sul cantiere.',
    metaTitle: 'Come selezionare un project manager edile | Talenti Edili',
    metaDescription:
      'Come valutare un project manager per l’edilizia: gestione di tempi e costi, rapporto con il committente, tenuta decisionale. Tratti, rischi e domande.',
    definizione:
      'Il project manager edile è responsabile del risultato economico della commessa: pianifica, controlla l’avanzamento, gestisce varianti e tiene il rapporto con il committente. È il ruolo dove l’errore di selezione non si vede in cantiere ma a consuntivo, quando il margine è evaporato. Il profilo che regge unisce visione d’insieme, freddezza nella negoziazione e la disciplina di guardare i numeri anche quando dicono cose scomode.',
    tratti: [
      { nome: 'Visione d’insieme', perche: 'Deve vedere l’effetto di una decisione di oggi sul mese otto.' },
      { nome: 'Disciplina sui numeri', perche: 'Chi evita di aggiornare il consuntivo scopre i problemi quando non sono più risolvibili.' },
      { nome: 'Fermezza negoziale', perche: 'Le varianti non riconosciute sono la prima causa di margine perso.' },
      { nome: 'Gestione dell’incertezza', perche: 'Nessuna commessa va come da cronoprogramma iniziale.' },
      { nome: 'Assunzione di responsabilità', perche: 'Deve portare le brutte notizie presto, non tardi.' },
    ],
    rischi: [
      'Ottimismo sistematico nelle previsioni: rassicura fino al disastro.',
      'Evitamento del confronto con il committente sulle varianti.',
      'Micromanagement sul cantiere e assenza sul controllo economico.',
      'Reporting difensivo: i numeri arrivano corretti ma sempre in ritardo.',
    ],
    domande: [
      'Raccontami una commessa chiusa in perdita. Quando te ne sei accorto e cosa hai fatto?',
      'Come hai gestito l’ultima variante che il committente non voleva riconoscere?',
      'Con che frequenza aggiorni il consuntivo e chi lo vede oltre a te?',
      'Qual è la brutta notizia più difficile che hai dovuto dare alla proprietà?',
    ],
    erroreTipico:
      'Promuovere il tecnico più competente. La gestione della commessa è per il 70% negoziazione e controllo economico: sono tratti diversi dalla bravura tecnica.',
    faq: [
      {
        q: 'Serve un project manager in un’impresa edile da 30 dipendenti?',
        a: 'Serve nel momento in cui il titolare non riesce più a seguire personalmente tutte le commesse. Il problema non è la dimensione: è il numero di cantieri aperti in contemporanea.',
      },
    ],
  },
  {
    slug: 'responsabile-sicurezza',
    nome: 'Responsabile sicurezza (RSPP / CSE)',
    categoria: 'Tecnico',
    sintesi:
      'Il ruolo dove il profilo sbagliato non genera conflitto: genera silenzio, e il silenzio precede l’infortunio.',
    metaTitle: 'Come selezionare un RSPP in edilizia | Talenti Edili',
    metaDescription:
      'RSPP e CSE: come valutare rigore, autorevolezza e capacità di far rispettare le procedure prima di affidare la sicurezza del cantiere.',
    definizione:
      'Il responsabile sicurezza presidia valutazione dei rischi, procedure, formazione e vigilanza in cantiere. È il ruolo in cui la competenza normativa è necessaria ma non sufficiente: la differenza fra un cantiere sicuro e uno che ha solo i documenti in ordine sta nella capacità di far cambiare comportamento a persone che hanno sempre lavorato in un altro modo. È una variabile psicoattitudinale, non normativa.',
    tratti: [
      { nome: 'Rigore inflessibile', perche: 'Sulla sicurezza l’eccezione una volta diventa la regola sempre.' },
      { nome: 'Autorevolezza', perche: 'Deve fermare un lavoro sapendo che sta bloccando il cronoprogramma.' },
      { nome: 'Capacità didattica', perche: 'La formazione che funziona non è il corso: è quella fatta sul pezzo.' },
      { nome: 'Indipendenza di giudizio', perche: 'Deve poter dire di no anche alla proprietà.' },
      { nome: 'Attenzione al dettaglio', perche: 'I quasi-infortuni sono segnali, e vanno letti prima.' },
    ],
    rischi: [
      'Compiacenza verso la produzione: firma e lascia correre per non rallentare.',
      'Rigore solo formale: documenti perfetti, cantiere reale non presidiato.',
      'Incapacità di farsi ascoltare: viene percepito come un ostacolo burocratico.',
      'Isolamento: non riceve più segnalazioni perché tutti sanno che ferma i lavori.',
    ],
    domande: [
      'Raccontami l’ultima volta che hai fermato una lavorazione. Chi si è opposto e come è finita?',
      'Come hai convinto una squadra abituata a lavorare in un certo modo a cambiare procedura?',
      'Qual è stato l’ultimo quasi-infortunio che hai gestito e cosa hai cambiato dopo?',
      'Ti è mai stato chiesto di chiudere un occhio? Cosa hai risposto?',
    ],
    erroreTipico:
      'Selezionare sul curriculum normativo. Le abilitazioni sono un prerequisito, non un criterio: due RSPP con le stesse certificazioni producono cantieri con livelli di sicurezza reale completamente diversi.',
    faq: [
      {
        q: 'Come si valuta se un RSPP saprà farsi rispettare in cantiere?',
        a: 'Misurando indipendenza di giudizio e autorevolezza, e verificando che non convivano con un’alta tendenza a evitare il conflitto. È la combinazione che distingue chi presidia davvero da chi si limita a tenere in ordine i documenti.',
      },
    ],
  },
  {
    slug: 'preventivista',
    nome: 'Preventivista / Computista',
    categoria: 'Ufficio',
    sintesi:
      'Ogni suo errore diventa margine perso. Precisione e onestà valgono più della velocità.',
    metaTitle: 'Come selezionare un preventivista edile | Talenti Edili',
    metaDescription:
      'Preventivista e computista: come valutare precisione, gestione della pressione sui tempi di gara e onestà nei numeri prima di assumere.',
    definizione:
      'Il preventivista traduce un progetto in numeri: computi, analisi prezzi, offerte di gara. È il ruolo in cui un errore silenzioso diventa una commessa in perdita firmata da qualcun altro. Il profilo che funziona unisce precisione ostinata, capacità di reggere scadenze di gara compresse e — soprattutto — l’onestà di dichiarare un’incertezza invece di coprirla con un’ipotesi ottimistica.',
    tratti: [
      { nome: 'Precisione', perche: 'La differenza fra margine e perdita spesso sta in due voci di computo.' },
      { nome: 'Tenuta sulle scadenze', perche: 'Le gare hanno una data e i progetti arrivano sempre tardi.' },
      { nome: 'Onestà nei numeri', perche: 'Un’ipotesi ottimistica non dichiarata è il modo più comune di perdere una commessa.' },
      { nome: 'Metodo', perche: 'Senza un metodo replicabile ogni preventivo dipende dalla giornata.' },
      { nome: 'Curiosità tecnica', perche: 'Deve capire cosa succede davvero in cantiere per prezzare in modo realistico.' },
    ],
    rischi: [
      'Ottimismo sistematico per far quadrare l’offerta.',
      'Perfezionismo che fa saltare le scadenze di gara.',
      'Isolamento dal cantiere: prezza su carta e non su realtà.',
      'Difficoltà a segnalare le incertezze prima della firma.',
    ],
    domande: [
      'Raccontami un preventivo che si è rivelato sbagliato. Quando l’hai scoperto?',
      'Come ti comporti quando mancano informazioni e la gara scade domani?',
      'Ogni quanto vai in cantiere a verificare i prezzi che usi?',
      'Come segnali alla proprietà che un’offerta è al limite?',
    ],
    erroreTipico:
      'Valutare solo la velocità e la padronanza del software di computo. Un preventivista veloce che non dichiara le incertezze è più costoso di uno lento.',
    faq: [
      {
        q: 'Il preventivista va valutato diversamente da un ruolo di cantiere?',
        a: 'Sì: pesano molto di più precisione, metodo e onestà nei numeri, e molto meno leadership e gestione del gruppo. Il Talent Profile System usa un peso diverso sui 15 tratti a seconda del ruolo, ed è per questo che la stessa persona può risultare compatibile con un ruolo e non con un altro.',
      },
    ],
  },
  {
    slug: 'gruista',
    nome: 'Gruista',
    categoria: 'Cantiere',
    sintesi:
      'Muove carichi sopra la testa dei colleghi. È il ruolo dove la concentrazione vale più dell’esperienza.',
    metaTitle: 'Come selezionare un gruista | Talenti Edili',
    metaDescription:
      'Selezionare un gruista significa valutare concentrazione, sangue freddo e rispetto assoluto delle procedure. Tratti che contano, rischi e domande da fare.',
    definizione:
      'Il gruista manovra la gru di cantiere: solleva, trasla e posiziona carichi coordinandosi a voce o a gesti con chi sta a terra. È uno dei pochi ruoli in cui un singolo errore di attenzione può costare una vita, e in cui la routine è il nemico principale: dopo qualche mese il rischio non è l’inesperienza, è l’automatismo. Per questo la selezione deve misurare concentrazione che regge nel tempo e rapporto con la procedura, non solo il patentino.',
    tratti: [
      { nome: 'Concentrazione prolungata', perche: 'Otto ore di attenzione costante valgono più di un’ora di manovra brillante.' },
      { nome: 'Sangue freddo', perche: 'Quando un carico oscilla, la reazione impulsiva è quella sbagliata.' },
      { nome: 'Rispetto della procedura', perche: 'Le regole di imbracatura e i limiti di carico non ammettono interpretazioni.' },
      { nome: 'Comunicazione essenziale', perche: 'Deve capirsi con chi sta a terra in poche parole o pochi gesti, senza margine di ambiguità.' },
      { nome: 'Tolleranza alla monotonia', perche: 'Il calo di vigilanza dopo il terzo mese è il vero rischio, non il primo giorno.' },
    ],
    rischi: [
      'Sicurezza di sé che diventa scorciatoia: "la conosco, questa manovra".',
      'Insofferenza alle verifiche di inizio turno percepite come perdita di tempo.',
      'Difficoltà a fermarsi quando le condizioni meteo peggiorano, per non rallentare il cantiere.',
      'Scarsa tolleranza alla monotonia: cala l’attenzione proprio quando il rischio è più alto.',
    ],
    domande: [
      'Raccontami l’ultima volta che ti sei rifiutato di fare una manovra. Chi te l’aveva chiesta?',
      'Come ti comporti quando chi è a terra ti dà un segnale che non capisci?',
      'Che cosa fai nei primi dieci minuti del turno, prima di iniziare a sollevare?',
      'Come tieni l’attenzione alta in una giornata in cui fai sempre lo stesso movimento?',
    ],
    erroreTipico:
      'Selezionare sul patentino e sugli anni di gru. L’abilitazione è un prerequisito di legge, non un criterio: dice che sa manovrare, non che si fermerà quando serve fermarsi.',
    faq: [
      {
        q: 'Basta il patentino per valutare un gruista?',
        a: 'No. Il patentino certifica la capacità tecnica di manovra, obbligatoria per legge. Non dice nulla su concentrazione che regge nel tempo, gestione della pressione del cantiere e propensione a saltare i controlli quando si è in ritardo: sono queste le variabili che precedono gli incidenti, e si misurano con un’analisi psicoattitudinale.',
      },
      {
        q: 'Come si valuta la propensione al rischio di un gruista?',
        a: 'Incrociando il tratto "orientamento alla procedura" con la tolleranza alla pressione di tempo. Il profilo più esposto non è quello imprudente in generale: è quello che rispetta le regole finché il cantiere non è in ritardo.',
      },
    ],
  },
  {
    slug: 'ferraiolo',
    nome: 'Ferraiolo',
    categoria: 'Cantiere',
    sintesi:
      'Lavoro fisico durissimo su schemi che non ammettono errori. Resistenza e precisione insieme, non alternate.',
    metaTitle: 'Come selezionare un ferraiolo | Talenti Edili',
    metaDescription:
      'Il ferraiolo unisce fatica fisica e precisione millimetrica. Come valutare resistenza, costanza nel tempo e attenzione al dettaglio prima di assumere.',
    definizione:
      'Il ferraiolo sagoma e posa l’armatura in ferro che verrà annegata nel getto: legature, staffe, copriferro, interferri. È un ruolo che chiede due qualità che raramente convivono — resistenza fisica elevata e precisione millimetrica su schemi tecnici — e in cui l’errore diventa invisibile appena arriva il calcestruzzo. Selezionarlo bene significa verificare che la precisione regga anche quando la fatica è alta, non solo alla prima ora del mattino.',
    tratti: [
      { nome: 'Resistenza fisica', perche: 'È fra i mestieri più duri del cantiere: il calo si vede sulla qualità, non sulla velocità.' },
      { nome: 'Precisione sotto fatica', perche: 'Copriferro e interferri sbagliati compromettono la struttura e non si vedono più dopo il getto.' },
      { nome: 'Lettura del disegno', perche: 'Deve tradurre lo schema di armatura senza chiedere conferma a ogni staffa.' },
      { nome: 'Costanza', perche: 'La produttività di una squadra ferraioli si misura sulla settimana, non sulla giornata buona.' },
      { nome: 'Collaborazione', perche: 'Si lavora in coppia o in terzetto, con ritmi che devono coincidere.' },
    ],
    rischi: [
      'Velocità premiata a scapito del rispetto delle quote: l’errore si scopre a getto fatto.',
      'Crollo di rendimento fra la sesta e l’ottava settimana.',
      'Insofferenza al controllo del direttore lavori vissuto come sfiducia personale.',
      'Difficoltà a segnalare un dubbio sul disegno per non sembrare incompetente.',
    ],
    domande: [
      'Ti è mai capitato di accorgerti di un errore di armatura poco prima del getto? Cosa hai fatto?',
      'Come fai a mantenere le quote quando sei stanco e la squadra spinge sul ritmo?',
      'Quando lo schema non è chiaro, a chi chiedi e in che momento?',
      'Qual è stato il periodo più lungo che hai lavorato di fila sullo stesso cantiere?',
    ],
    erroreTipico:
      'Valutare la produttività della prima settimana. Il ferraiolo si giudica al secondo mese: quando la fatica è cumulata, si vede chi tiene la precisione e chi comincia ad approssimare.',
    faq: [
      {
        q: 'Come si valuta la resistenza fisica di un ferraiolo prima di assumerlo?',
        a: 'Non con una prova pratica, che misura la giornata buona. L’analisi psicoattitudinale misura resistenza alla fatica e costanza come tratti stabili, e li incrocia con la storia lavorativa: la durata dei rapporti precedenti dice più di qualunque test di forza.',
      },
    ],
  },
  {
    slug: 'direttore-tecnico',
    nome: 'Direttore tecnico',
    categoria: 'Tecnico',
    sintesi:
      'Risponde delle scelte tecniche di tutta l’impresa. Un errore qui non tocca un cantiere: li tocca tutti.',
    metaTitle: 'Come selezionare un direttore tecnico | Talenti Edili',
    metaDescription:
      'Il direttore tecnico risponde delle scelte tecniche dell’impresa. Come valutarne visione d’insieme, assunzione di responsabilità e capacità di delega.',
    definizione:
      'Il direttore tecnico è responsabile delle scelte tecniche dell’impresa nel suo insieme: valuta la fattibilità delle commesse, presidia la qualità esecutiva, coordina capicantiere e ufficio tecnico, risponde verso committenti e organi di controllo. È il ruolo con il raggio d’errore più ampio dell’intera azienda — una decisione sbagliata non rallenta un cantiere, si propaga su tutto il portafoglio lavori. Va selezionato su capacità di delega e assunzione di responsabilità, non sulla bravura tecnica individuale.',
    tratti: [
      { nome: 'Visione d’insieme', perche: 'Deve arbitrare fra cantieri che competono per le stesse risorse.' },
      { nome: 'Assunzione di responsabilità', perche: 'Firma scelte tecniche di cui risponde personalmente, anche in sede legale.' },
      { nome: 'Capacità di delega', perche: 'Se accentra diventa il collo di bottiglia di tutta l’impresa.' },
      { nome: 'Fermezza sui criteri', perche: 'Deve saper dire che una commessa non è fattibile alle condizioni proposte.' },
      { nome: 'Sviluppo delle persone', perche: 'La sua eredità reale sono i capicantiere che ha formato.' },
    ],
    rischi: [
      'Accentramento: fa tutto lui, l’impresa non cresce oltre la sua capienza personale.',
      'Difficoltà a dire di no alla proprietà su commesse tecnicamente insostenibili.',
      'Aggiornamento tecnico fermo: applica soluzioni valide dieci anni fa.',
      'Delega senza controllo, che è l’altra faccia dello stesso problema.',
    ],
    domande: [
      'Raccontami una commessa che hai sconsigliato di prendere. Come è finita?',
      'Chi, fra i capicantiere che hai formato, oggi decide senza chiamarti?',
      'Qual è stata la scelta tecnica più rischiosa che hai firmato e perché l’hai fatta?',
      'Come ti tieni aggiornato su materiali e normative, concretamente?',
    ],
    erroreTipico:
      'Promuovere il capocantiere migliore. Coordinare un cantiere e coordinare chi coordina i cantieri sono due mestieri diversi: il secondo si regge su delega e visione, non su presenza.',
    faq: [
      {
        q: 'Che differenza c’è fra direttore tecnico e capocantiere?',
        a: 'Il capocantiere presidia un cantiere e la sua esecuzione quotidiana; il direttore tecnico risponde delle scelte tecniche dell’intera impresa e coordina più cantieri e più capicantiere. Il primo pesa su decisione e gestione dello stress, il secondo su visione d’insieme, delega e assunzione di responsabilità.',
      },
      {
        q: 'Quando un’impresa edile ha bisogno di un direttore tecnico?',
        a: 'Quando il titolare non riesce più a presidiare personalmente la qualità tecnica di tutte le commesse aperte. Il segnale non è il fatturato: è il numero di decisioni tecniche che restano ferme in attesa di una sola persona.',
      },
    ],
  },
  {
    slug: 'assistente-di-cantiere',
    nome: 'Assistente di cantiere',
    categoria: 'Tecnico',
    sintesi:
      'Il ruolo di ingresso da cui nascono i futuri capicantiere. Si seleziona sul potenziale, non sull’esperienza.',
    metaTitle: 'Come selezionare un assistente di cantiere | Talenti Edili',
    metaDescription:
      'L’assistente di cantiere è il vivaio dei futuri capicantiere. Come valutare potenziale, capacità di apprendimento e tenuta prima di assumere.',
    definizione:
      'L’assistente di cantiere affianca il capocantiere: rilievi, controllo delle lavorazioni, gestione delle consegne, aggiornamento dei documenti. È quasi sempre un ruolo di ingresso, e questo cambia completamente il criterio di selezione: non si valuta cosa la persona sa fare oggi, ma quanto velocemente imparerà e se fra tre anni reggerà un cantiere da sola. È l’unico ruolo edile in cui la compatibilità va letta sul potenziale, non sulla prestazione attuale.',
    tratti: [
      { nome: 'Capacità di apprendimento', perche: 'In due anni deve assorbire quello che il capocantiere ha imparato in dieci.' },
      { nome: 'Iniziativa', perche: 'Chi aspetta istruzioni per ogni cosa in cantiere resta assistente per sempre.' },
      { nome: 'Umiltà operativa', perche: 'Deve farsi insegnare da operai che non hanno il suo titolo di studio.' },
      { nome: 'Organizzazione', perche: 'Gestisce le scadenze che il capocantiere non ha tempo di seguire.' },
      { nome: 'Tenuta', perche: 'Il cantiere seleziona in fretta: i primi sei mesi sono duri per chiunque.' },
    ],
    rischi: [
      'Titolo di studio vissuto come superiorità sugli operai: si isola e non impara niente.',
      'Attesa passiva di istruzioni, che il capocantiere legge come scarso interesse.',
      'Fragilità al primo richiamo pubblico, frequente nella cultura di cantiere.',
      'Aspettative di carriera sproporzionate rispetto ai tempi reali del mestiere.',
    ],
    domande: [
      'Che cosa hai imparato da un operaio che non ti aveva insegnato nessuno all’istituto?',
      'Raccontami una volta in cui hai preso un’iniziativa senza che te l’avessero chiesta.',
      'Come hai reagito l’ultima volta che ti hanno ripreso davanti ad altri?',
      'Dove ti immagini fra tre anni, concretamente?',
    ],
    erroreTipico:
      'Selezionare sul voto di diploma o laurea. In un ruolo di ingresso il titolo dice cosa la persona ha studiato, non se imparerà in cantiere: sono due attitudini diverse e la seconda si misura.',
    faq: [
      {
        q: 'Come si seleziona un profilo junior senza esperienza?',
        a: 'Spostando la valutazione dalla prestazione al potenziale. L’analisi psicoattitudinale misura capacità di apprendimento, iniziativa e tenuta — tratti stabili che predicono la crescita — e li confronta con il profilo dei capicantiere che in quell’impresa hanno funzionato.',
      },
      {
        q: 'Conviene far fare l’analisi anche a un neodiplomato?',
        a: 'Sì, ed è il caso in cui rende di più: proprio perché non c’è una storia professionale da leggere, l’analisi è l’unica fonte di dati oggettivi disponibile.',
      },
    ],
  },
];

export const getRuolo = (slug?: string) => RUOLI.find((r) => r.slug === slug);

export const CATEGORIE: CategoriaRuolo[] = ['Cantiere', 'Tecnico', 'Ufficio'];

/** Ruoli aggiuntivi coperti dal abbinamento ma senza pagina dedicata */
export const ALTRI_RUOLI = [
  'Autista mezzi d’opera',
  'Operaio specializzato',
  'Responsabile acquisti',
  'Contabilità di cantiere',
  'Impiegato amministrativo',
  'Commerciale tecnico',
  'Addetto qualità',
  'Magazziniere di cantiere',
  'Piastrellista',
  'Intonacatore',
  'Impiantista elettrico',
  'Impiantista termoidraulico',
  'Serramentista',
  'Lattoniere',
  'Escavatorista',
  'Addetto ponteggi',
  'Restauratore edile',
  'Tecnico BIM',
];
