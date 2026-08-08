/**
 * Guide evergreen del portale.
 *
 * Intercettano le ricerche informazionali ("perché gli operai se ne vanno",
 * "quanto costa un'assunzione sbagliata") che precedono la ricerca commerciale.
 * Ogni guida apre con un `sommario`: è la risposta breve e autoconclusiva che
 * i motori generativi citano, prima dello sviluppo lungo.
 */

export interface Guida {
  slug: string;
  titolo: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Data di pubblicazione in formato ISO, usata nei dati strutturati */
  pubblicata: string;
  tempoLettura: string;
  categoria: string;
  /** Risposta breve in cima alla pagina — il blocco pensato per l'AEO */
  sommario: string;
  sezioni: { titolo: string; paragrafi: string[]; elenco?: string[] }[];
  faq: { q: string; a: string }[];
  /** Slug di ruoli correlati da linkare in fondo */
  ruoliCorrelati: string[];
}

export const GUIDE: Guida[] = [
  {
    slug: 'ridurre-turnover-cantiere',
    titolo: 'Come ridurre il turnover in cantiere',
    h1: 'Come ridurre il turnover in cantiere',
    metaTitle: 'Come ridurre il turnover in cantiere — guida per imprese edili',
    metaDescription:
      'Perché gli operai se ne vanno nei primi mesi e cosa funziona davvero per trattenerli. Le quattro cause reali del turnover in edilizia e come intervenire su ciascuna.',
    pubblicata: '2026-08-07',
    tempoLettura: '7 minuti',
    categoria: 'Gestione del personale',
    sommario:
      'Il turnover in cantiere raramente dipende dallo stipendio: dipende da inserimenti fatti male, capisquadra sbagliati, aspettative non dette e persone messe nel ruolo sbagliato. Intervenire significa agire prima dell’assunzione (misurare la compatibilità con il ruolo), nei primi 90 giorni (piano di inserimento esplicito) e sui capisquadra, che sono la variabile più sottovalutata: nella maggior parte delle imprese edili il turnover non è distribuito uniformemente, si concentra su poche squadre.',
    sezioni: [
      {
        titolo: 'Il turnover non è un problema di stipendio',
        paragrafi: [
          'È la prima risposta che danno quasi tutti gli imprenditori edili: “se ne vanno perché qualcuno offre cinquanta euro in più”. A volte è vero. Molto più spesso lo stipendio è la giustificazione che la persona dà uscendo, perché è l’unica socialmente accettabile: nessuno dice al titolare che se ne va per come lo tratta il capisquadra.',
          'Il segnale che smonta la spiegazione economica è la distribuzione. Se il problema fosse la retribuzione, il turnover sarebbe uniforme su tutta l’impresa. Nella pratica si concentra: alcune squadre non perdono nessuno per anni, altre bruciano tre persone a stagione, con gli stessi contratti e le stesse paghe.',
        ],
      },
      {
        titolo: 'Le quattro cause reali',
        paragrafi: [
          'Guardando le uscite dei primi dodici mesi nelle imprese edili, quasi tutto ricade in quattro categorie:',
        ],
        elenco: [
          'Persona nel ruolo sbagliato. Non è incapace: è brava in qualcosa che quel ruolo non le chiede. Un ottimo esecutore preciso messo a coordinare, o un profilo autonomo messo a fare solo quello che gli dicono.',
          'Capisquadra incompatibile. Il rapporto quotidiano con chi guida la squadra pesa più di qualunque altra variabile sul restare o andarsene.',
          'Inserimento assente. I primi giorni sono “vai con Giuseppe e guarda”. Chi ha bisogno di struttura per imparare, senza struttura non impara e si sente inadeguato.',
          'Aspettative non dette. Nessuno ha spiegato che il primo anno è duro, che si comincia dai lavori ingrati, che la crescita richiede tempo. La persona pensava a un percorso diverso.',
        ],
      },
      {
        titolo: 'Intervenire prima: misurare la compatibilità con il ruolo',
        paragrafi: [
          'Le prime due cause si affrontano solo prima dell’assunzione. Un colloquio, per quanto ben fatto, misura come una persona si racconta in mezz’ora — non come reagirà alla terza settimana di pioggia con il cronoprogramma in ritardo.',
          'L’analisi psicoattitudinale serve esattamente a questo: misura tratti stabili (quanto regge la pressione, bisogno di autonomia, tolleranza alla monotonia, reazione al richiamo) e li confronta con quello che quel ruolo, in quella squadra, chiederà davvero. Non produce un giudizio sulla persona: produce un punteggio di compatibilità con una posizione precisa.',
          'La domanda utile non è “questo candidato è bravo?”, è “questo candidato regge questo ruolo con questo capisquadra?”. Sono due domande diverse e solo la seconda predice il turnover.',
        ],
      },
      {
        titolo: 'I primi 90 giorni decidono quasi tutto',
        paragrafi: [
          'La finestra in cui si gioca la permanenza è molto più breve di quanto si pensi. Chi lascia entro l’anno, nella maggior parte dei casi ha deciso di lasciare entro il primo mese e mezzo — poi ha solo aspettato l’occasione.',
          'Un piano di inserimento non deve essere un documento aziendale: bastano quattro cose scritte e dette esplicitamente.',
        ],
        elenco: [
          'Chi è il riferimento diretto e a chi si chiede quando quel riferimento non c’è.',
          'Cosa ci si aspetta di preciso a 30, 60 e 90 giorni, in termini di lavorazioni, non di atteggiamento.',
          'Un momento di verifica fissato in calendario, non “se serve ci parliamo”.',
          'Cosa succede dopo i 90 giorni: cosa cambia, cosa può crescere, in quanto tempo.',
        ],
      },
      {
        titolo: 'Il capisquadra è la variabile che nessuno guarda',
        paragrafi: [
          'Se il turnover si concentra su una o due squadre, il problema non sono le persone che se ne vanno: è chi le guida. Ed è un problema difficile da vedere, perché quasi sempre quel capisquadra è tecnicamente bravo — spesso è stato promosso proprio per questo.',
          'Un capisquadra che gestisce per intimidazione produce risultati nel breve: la squadra tiene il ritmo. Il costo arriva sei mesi dopo, sotto forma di dimissioni che nessuno collega a lui, perché chi se ne va dice che ha trovato di meglio.',
          'Mappare i capisquadra già in forza con un’analisi psicoattitudinale è spesso l’intervento a più alto rendimento: costa poche decine di euro a persona e spiega perché una squadra perde gente e un’altra no.',
        ],
      },
      {
        titolo: 'Cosa aspettarsi come risultato',
        paragrafi: [
          'Le imprese edili che introducono una selezione basata sui dati e un inserimento strutturato vedono i primi effetti dopo circa sei mesi, ed è fisiologico: il turnover è un indicatore ritardato, misura decisioni prese mesi prima.',
          'Il numero da guardare non è il turnover complessivo, che è rumoroso: è la percentuale di uscite nei primi sei mesi. È quella che dipende direttamente dalla qualità della selezione e dell’inserimento, ed è quella che si muove per prima.',
        ],
      },
    ],
    faq: [
      {
        q: 'Qual è il tasso di turnover normale in edilizia?',
        a: 'Non esiste un valore di riferimento valido per tutti, perché dipende molto dal tipo di lavorazioni e dalla stagionalità. L’indicatore utile è un altro: la quota di persone che lascia entro i primi sei mesi. Se supera stabilmente un quinto degli ingressi, il problema è nella selezione o nell’inserimento, non nel mercato del lavoro.',
      },
      {
        q: 'Aumentare gli stipendi riduce il turnover?',
        a: 'Riduce le uscite di chi era già indeciso, ma non tocca le cause principali: ruolo sbagliato, capisquadra incompatibile, inserimento assente. È il motivo per cui molte imprese aumentano le paghe e vedono il turnover scendere per pochi mesi, poi tornare ai livelli di prima.',
      },
      {
        q: 'Come si capisce se il problema è un capisquadra?',
        a: 'Guardando dove si concentrano le uscite. Se due squadre su sei generano la maggior parte del turnover a parità di contratti, mansioni e paghe, la variabile che cambia è chi le guida. Un’analisi psicoattitudinale sui capisquadra dice quali tratti stanno producendo quell’effetto.',
      },
      {
        q: 'In quanto tempo si vedono i risultati?',
        a: 'Circa sei mesi per i primi segnali, perché il turnover misura decisioni prese in passato. Il primo indicatore a muoversi è la percentuale di uscite entro i sei mesi dall’assunzione.',
      },
    ],
    ruoliCorrelati: ['capisquadra', 'capocantiere', 'muratore'],
  },
  {
    slug: 'costo-assunzione-sbagliata',
    titolo: 'Quanto costa davvero un’assunzione sbagliata in edilizia',
    h1: 'Quanto costa davvero un’assunzione sbagliata in edilizia',
    metaTitle: 'Quanto costa un’assunzione sbagliata in edilizia',
    metaDescription:
      'Il costo di un errore di selezione in edilizia supera i 30.000 €. Le sei voci che lo compongono, comprese quelle che non finiscono in nessun bilancio.',
    pubblicata: '2026-08-07',
    tempoLettura: '6 minuti',
    categoria: 'Costi e ROI',
    sommario:
      'Un’assunzione sbagliata in edilizia costa in media intorno ai 30.000 €, ma la cifra che compare in contabilità è meno di un terzo del totale. Le voci sono sei: stipendio erogato senza resa, costo di ricerca, formazione bruciata, produttività persa della squadra, costo di sostituzione e — la più pesante e la meno misurata — l’effetto sul cronoprogramma e sugli altri. Su un ruolo di responsabilità il conto sale rapidamente oltre i 100.000 €.',
    sezioni: [
      {
        titolo: 'Perché la cifra in bilancio è sempre troppo bassa',
        paragrafi: [
          'Quando si chiede a un imprenditore edile quanto gli è costata l’ultima assunzione sbagliata, la risposta è quasi sempre lo stipendio erogato. È la voce visibile, quella che si può leggere da qualche parte.',
          'Il problema è che è la voce minore. Le altre cinque non hanno un conto dedicato in contabilità: si spalmano su produttività, ritardi e ore di altre persone, e per questo diventano invisibili proprio mentre sono le più pesanti.',
        ],
      },
      {
        titolo: 'Le sei voci del conto',
        paragrafi: [
          'Prendiamo un operaio specializzato con una retribuzione lorda annua di 30.000 €, che lascia — o viene lasciato andare — dopo tre mesi.',
        ],
        elenco: [
          'Stipendio erogato senza resa piena: circa 7.500 € per tre mesi, di cui una quota rilevante corrisponde a un rendimento sotto la soglia utile.',
          'Costo di ricerca: annunci, tempo di scrematura, colloqui. Difficilmente sotto i 2.000–3.000 € se si contano le ore di chi ha fatto la selezione.',
          'Formazione e affiancamento: le ore di un collega esperto sottratte al suo lavoro. Su tre mesi vale intorno al 15% della RAL, circa 4.500 €.',
          'Produttività persa della squadra: chi affianca rallenta, chi corregge errori rallenta. Stimabile intorno al 40% del costo del periodo, circa 3.000 €.',
          'Sostituzione: si ricomincia da capo, con gli stessi costi di ricerca e un’urgenza maggiore che di solito peggiora la qualità della scelta.',
          'Impatto sul cronoprogramma: la voce che non si riesce a stimare in astratto e che spesso da sola supera tutte le altre — penali, straordinari per recuperare, credibilità verso il committente.',
        ],
      },
      {
        titolo: 'Sui ruoli di responsabilità il conto cambia scala',
        paragrafi: [
          'Le cifre sopra valgono per un ruolo operativo. Su un capocantiere, un direttore tecnico o un project manager il meccanismo è diverso: l’errore non produce un buco di produttività, produce decisioni sbagliate che si propagano.',
          'Un capocantiere non adatto al ruolo può far slittare una commessa di mesi, incrinare il rapporto con un committente e far andare via due o tre persone valide che non reggono il suo modo di lavorare. Qui il conto parte da centomila euro e non ha un tetto teorico.',
          'È il motivo per cui l’investimento in selezione va tarato sul raggio d’errore del ruolo, non sulla retribuzione: un errore su un capocantiere costa molto più di quanto quel capocantiere costi.',
        ],
      },
      {
        titolo: 'Il costo che nessuno mette a bilancio',
        paragrafi: [
          'C’è una settima voce, e non è quantificabile: l’effetto su chi resta. Una persona sbagliata in squadra per tre mesi consuma energia di tutti — chi deve rimediare, chi deve mediare, chi si chiede perché l’azienda tollera quella situazione.',
          'Nelle imprese edili questo effetto è amplificato dalla dimensione delle squadre: in un gruppo di cinque persone, una che non funziona non è il 20% del problema, è la cosa di cui si parla ogni giorno.',
        ],
      },
      {
        titolo: 'Il confronto che conta',
        paragrafi: [
          'La domanda giusta non è “quanto costa fare selezione seriamente”, è “quanto costa non farla”. Un’analisi psicoattitudinale costa qualche decina di euro per candidato; un errore di selezione ne costa trentamila.',
          'Il ragionamento regge anche con ipotesi molto prudenti: non serve che il sistema eviti tutti gli errori. Basta che ne eviti uno all’anno perché il rapporto sia largamente favorevole.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quanto costa esattamente un’assunzione sbagliata?',
        a: 'Per un ruolo operativo con retribuzione intorno ai 30.000 € lordi annui, il costo complessivo si aggira sui 30.000 € considerando stipendio erogato, ricerca, formazione, produttività persa e sostituzione. Su ruoli di responsabilità come capocantiere o direttore tecnico il conto supera facilmente i 100.000 € per l’effetto sulle commesse.',
      },
      {
        q: 'Perché il costo è così alto rispetto allo stipendio erogato?',
        a: 'Perché lo stipendio è meno di un terzo del totale. Le voci maggiori — formazione bruciata, produttività persa della squadra, impatto sul cronoprogramma — non hanno un conto dedicato in contabilità e per questo restano invisibili.',
      },
      {
        q: 'Come si riduce concretamente questo costo?',
        a: 'Spostando la verifica prima dell’assunzione. Misurare la compatibilità con il ruolo prima della firma costa poche decine di euro per candidato; scoprire l’incompatibilità dopo tre mesi costa l’intero conto descritto qui.',
      },
    ],
    ruoliCorrelati: ['capocantiere', 'project-manager-edile', 'direttore-tecnico'],
  },
  {
    slug: 'colloquio-selezione-edilizia',
    titolo: 'Come fare un colloquio di selezione in edilizia',
    h1: 'Come fare un colloquio di selezione in edilizia',
    metaTitle: 'Colloquio di selezione in edilizia: domande e metodo',
    metaDescription:
      'Le domande che funzionano davvero in un colloquio di selezione in edilizia, quelle da evitare e come strutturare mezz’ora per capire chi hai davanti.',
    pubblicata: '2026-08-07',
    tempoLettura: '8 minuti',
    categoria: 'Selezione',
    sommario:
      'Un colloquio di selezione in edilizia funziona se smette di chiedere opinioni e comincia a chiedere episodi. Le domande ipotetiche (“come reagiresti se…”) misurano quanto bene il candidato immagina di essere; le domande su fatti accaduti (“raccontami l’ultima volta che…”) misurano cosa ha fatto davvero. La struttura che regge è: cinque minuti di contesto, venti di episodi concreti, cinque di aspettative esplicite — e un secondo colloquio in cantiere, non in ufficio.',
    sezioni: [
      {
        titolo: 'Il problema del colloquio tradizionale',
        paragrafi: [
          'Il colloquio è lo strumento di selezione più usato e fra i meno predittivi, per una ragione semplice: misura una competenza — sapersi raccontare — che nella maggior parte dei ruoli edili non serve a niente.',
          'Un capocantiere che si esprime bene non è necessariamente un capocantiere che decide bene sotto pressione. E un muratore che al colloquio dice due parole in croce può essere la persona più affidabile che assumerai. La correlazione fra come una persona si presenta e come lavora è molto più debole di quanto l’istinto suggerisca.',
          'Questo non significa eliminare il colloquio: significa smettere di chiedergli di fare un lavoro che non può fare, e usarlo per quello in cui è insostituibile — verificare episodi concreti e stabilire aspettative esplicite.',
        ],
      },
      {
        titolo: 'Domande che non funzionano',
        paragrafi: ['Queste occupano tempo e non producono informazione utile:'],
        elenco: [
          '“Quali sono i tuoi pregi e difetti?” — misura quanto il candidato si è preparato, niente altro.',
          '“Come reagiresti se un fornitore saltasse la consegna?” — le domande ipotetiche premiano chi immagina bene, non chi agisce bene.',
          '“Dove ti vedi fra cinque anni?” — in edilizia produce risposte di circostanza nella quasi totalità dei casi.',
          '“Sei una persona precisa?” — nessuno ha mai risposto di no.',
        ],
      },
      {
        titolo: 'Domande che funzionano: chiedere episodi, non opinioni',
        paragrafi: [
          'La regola è una sola: chiedere fatti accaduti, con un quando e un chi. Un episodio reale è difficile da inventare sul momento e contiene dettagli verificabili.',
          'La struttura che funziona è: cosa è successo, cosa hai fatto tu di preciso, come è finita. E soprattutto: insistere sul “tu”. Molti candidati rispondono al plurale (“abbiamo deciso di…”) proprio nei punti in cui il contributo personale è stato marginale.',
        ],
        elenco: [
          '“Raccontami l’ultima volta che una consegna è saltata a due giorni dal getto. Cosa hai fatto tu nelle prime due ore?”',
          '“Qual è stato l’ultimo errore tecnico che hai commesso e come te ne sei accorto?”',
          '“Chi hai formato negli ultimi anni, e cosa fa oggi quella persona?”',
          '“Raccontami una volta in cui hai detto di no a chi ti dava un ordine. Come è andata a finire?”',
          '“Qual è il lavoro più lungo che hai fatto con la stessa impresa e perché è finito?”',
        ],
      },
      {
        titolo: 'La struttura di mezz’ora',
        paragrafi: [
          'Un colloquio efficace in edilizia sta dentro i trenta minuti, se sono strutturati:',
        ],
        elenco: [
          'Cinque minuti — contesto reale: che cantiere, che squadra, che committente, cosa è andato storto le volte precedenti su questa posizione. Detto senza abbellimenti.',
          'Venti minuti — episodi: quattro o cinque domande su fatti accaduti, con richiesta di dettaglio su ciascuna. Qui si sta zitti e si ascolta.',
          'Cinque minuti — aspettative esplicite: cosa ci si aspetta a 30, 60 e 90 giorni, cosa è duro del ruolo, cosa può crescere e in quanto tempo.',
        ],
      },
      {
        titolo: 'Il secondo colloquio si fa in cantiere',
        paragrafi: [
          'Chi supera il primo passaggio va portato in cantiere, non richiamato in ufficio. Mezz’ora sul posto dice cose che nessuna domanda produce: come guarda le lavorazioni, cosa nota, che domande fa, come si rivolge agli operai, se mette il casco senza che glielo si dica.',
          'È anche il momento in cui il candidato capisce davvero cosa sta accettando, e in cui una parte delle rinunce avviene prima dell’assunzione invece che dopo tre settimane — il che è un ottimo risultato, non un fallimento.',
        ],
      },
      {
        titolo: 'Dove il colloquio non arriva',
        paragrafi: [
          'Anche condotto perfettamente, il colloquio ha un limite strutturale: vede la persona in una situazione che non assomiglia al lavoro. Non può misurare come reggerà tre mesi di pressione, se la precisione tiene sotto fatica, come reagirà a un richiamo davanti alla squadra.',
          'È lo spazio che copre l’analisi psicoattitudinale: misura tratti stabili che il colloquio non può osservare e li confronta con quello che il ruolo chiederà. I due strumenti non competono — l’analisi dice dove guardare, il colloquio verifica sul concreto.',
          'Nella pratica, l’ordine che funziona è: analisi prima, colloquio dopo. Arrivare al colloquio sapendo già quali sono i punti deboli di quella persona cambia completamente le domande che si fanno.',
        ],
      },
    ],
    faq: [
      {
        q: 'Quali domande fare a un colloquio in edilizia?',
        a: 'Domande su episodi accaduti, non su ipotesi. “Raccontami l’ultima volta che una consegna è saltata a due giorni dal getto: cosa hai fatto tu nelle prime due ore?” produce informazione verificabile; “come reagiresti se…” misura solo la capacità di immaginare. Vanno chiesti sempre un quando, un chi e come è finita.',
      },
      {
        q: 'Quanto deve durare un colloquio di selezione?',
        a: 'Circa trenta minuti se strutturati: cinque di contesto reale, venti di domande su episodi concreti, cinque di aspettative esplicite. Oltre i quaranta minuti si raccolgono soprattutto ripetizioni.',
      },
      {
        q: 'Meglio fare il colloquio in ufficio o in cantiere?',
        a: 'Entrambi, in quest’ordine. Il primo colloquio in ufficio serve a raccogliere episodi; il secondo in cantiere mostra come la persona osserva le lavorazioni, che domande fa e come si rivolge agli operai. È anche il momento in cui alcune rinunce avvengono prima dell’assunzione, il che fa risparmiare.',
      },
      {
        q: 'Il test attitudinale sostituisce il colloquio?',
        a: 'No, lo precede e lo indirizza. L’analisi psicoattitudinale misura tratti stabili che il colloquio non può osservare — quanto regge la pressione, precisione sotto fatica, reazione al richiamo — e indica dove approfondire. Il colloquio verifica quei punti su episodi reali.',
      },
    ],
    ruoliCorrelati: ['capocantiere', 'capisquadra', 'geometra-di-cantiere'],
  },
];

export const getGuida = (slug?: string) => GUIDE.find((g) => g.slug === slug);
