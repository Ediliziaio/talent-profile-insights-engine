/**
 * Pagine commerciali del servizio di ricerca e selezione, per categoria:
 * "troviamo venditori", "troviamo amministrativi", ecc.
 *
 * Sono pagine di vendita (figlie di /ricerca-e-selezione-personale-edile),
 * distinte dalle pagine /ruoli/* che sono informative ("come si seleziona…").
 * Ogni voce genera /troviamo/:slug, prerenderizzata e in sitemap.
 */

export interface CategoriaSelezione {
  slug: string;
  /** "venditori", usato nei testi correnti */
  nomeBreve: string;
  /** H1: "Troviamo i venditori…" */
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Sottotitolo hero */
  intro: string;
  /** Risposta AEO autoconclusiva: cos'è il servizio per questa categoria */
  definizione: string;
  /** Perché trovare questa figura è difficile (pain riconoscibili) */
  difficolta: { titolo: string; testo: string }[];
  /** Come applichiamo il metodo a questa categoria */
  comeSelezioniamo: { titolo: string; testo: string }[];
  /** Figure tipiche coperte dalla categoria */
  figureTipiche: string[];
  faq: { q: string; a: string }[];
  /** Slug di pagine /ruoli correlate (facoltativo) */
  ruoliCorrelati: string[];
}

export const SELEZIONI: CategoriaSelezione[] = [
  {
    slug: 'venditori',
    nomeBreve: 'venditori',
    h1: 'Troviamo i venditori per la tua impresa edile',
    metaTitle: 'Ricerca e selezione venditori settore edilizia | Talenti Edili',
    metaDescription:
      'Troviamo venditori e commerciali per imprese edili, serramentisti e impiantisti: ricerca attiva, analisi psicoattitudinale e rosa di 3 finalisti in 21 giorni.',
    intro:
      'Commerciali tecnici, venditori di serramenti e impianti, account per il B2B edile. Cerchiamo noi, misuriamo noi: tu scegli fra tre finalisti con i numeri in mano.',
    definizione:
      'È il servizio di ricerca e selezione di Talenti Edili dedicato alle figure commerciali del settore edile: commerciale tecnico, venditore di serramenti e infissi, venditore di impianti e materiali, account B2B verso imprese e studi tecnici. Facciamo ricerca attiva sul territorio, verifichiamo i risultati di vendita dichiarati e sottoponiamo ogni finalista all’analisi psicoattitudinale Talent Profile — che sui commerciali misura le variabili decisive: tenuta al rifiuto, costanza, orientamento al risultato reale e onestà nel riportare i numeri. Consegniamo una rosa di tre finalisti entro 21 giorni, con report completo e domande da fare al colloquio.',
    difficolta: [
      {
        titolo: 'Al colloquio vendono benissimo — sé stessi',
        testo:
          'Il commerciale è l’unico candidato allenato per superare i colloqui: parlare bene è il suo mestiere. È il ruolo dove l’intervista tradizionale ha il tasso di errore più alto in assoluto.',
      },
      {
        titolo: 'I numeri dichiarati non si possono verificare',
        testo:
          '"Facevo 800.000 € di venduto" non è controllabile dal CV. Noi incrociamo referenze, storia contrattuale e coerenza del racconto — e l’analisi psicoattitudinale segnala i profili che tendono a gonfiare i risultati.',
      },
      {
        titolo: 'Vendere edilizia non è vendere qualsiasi cosa',
        testo:
          'Cicli lunghi, interlocutori tecnici, cantieri che slittano, incassi da seguire. Il venditore brillante da showroom spesso crolla al terzo mese di trattative con imprese e direttori lavori.',
      },
      {
        titolo: 'Il costo dell’errore è doppio',
        testo:
          'Un venditore sbagliato brucia lo stipendio e, insieme, il portafoglio contatti della zona: clienti visitati male oggi sono porte chiuse per chi arriva domani.',
      },
    ],
    comeSelezioniamo: [
      {
        titolo: 'Tenuta al rifiuto, non parlantina',
        testo:
          'Il Talent Profile misura la resilienza commerciale: come reagisce al no, quanto regge la costanza di visita quando gli ordini non arrivano, se molla dopo il secondo trimestre lento.',
      },
      {
        titolo: 'Attitudine alla vendita misurata (tratto VEN)',
        testo:
          'Fra i 15 tratti del sistema c’è l’attitudine commerciale specifica: chiusura, gestione dell’obiezione, spinta al risultato. Non è un’impressione: è un punteggio confrontato col profilo dei venditori che funzionano.',
      },
      {
        titolo: 'Onestà sui numeri',
        testo:
          'Incrociamo i tratti di coerenza e principi con la verifica delle referenze: il profilo che tende a raccontare risultati migliori di quelli reali emerge prima dell’assunzione, non al primo consuntivo.',
      },
      {
        titolo: 'Prova sul campo del settore',
        testo:
          'Ai finalisti chiediamo di ragionare su una trattativa edile vera: impresa che tira sul prezzo, capitolato che cambia, pagamento a 90 giorni. Chi conosce solo la vendita da manuale si vede subito.',
      },
    ],
    figureTipiche: [
      'Commerciale tecnico B2B',
      'Venditore serramenti e infissi',
      'Venditore impianti (elettrico, termoidraulico)',
      'Venditore materiali edili',
      'Account imprese e studi tecnici',
      'Agente di zona',
      'Responsabile commerciale',
    ],
    faq: [
      {
        q: 'Quanto tempo serve per trovare un venditore?',
        a: 'La rosa di tre finalisti arriva di norma entro 21 giorni dal briefing. Sui responsabili commerciali o su zone con poca offerta i tempi possono allungarsi: lo diciamo prima di partire.',
      },
      {
        q: 'Come verificate che un venditore sia davvero bravo?',
        a: 'Su tre livelli: verifica delle referenze e della storia contrattuale, analisi psicoattitudinale con il tratto specifico di attitudine alla vendita (VEN) e tenuta al rifiuto, e una prova di ragionamento su una trattativa edile reale. Il colloquio da solo non basta: il commerciale è l’unico candidato allenato a superarlo.',
      },
      {
        q: 'Trovate anche venditori porta a porta o solo tecnici?',
        a: 'Copriamo tutte le figure commerciali del settore edile: dal venditore di showroom all’agente di zona, dal commerciale tecnico B2B al responsabile commerciale. Il metodo si adatta: cambiano i pesi dei tratti, non il processo.',
      },
      {
        q: 'Cosa succede se il venditore non produce risultati?',
        a: 'Se lascia o viene lasciato entro il periodo di garanzia concordato, riapriamo la ricerca senza costi aggiuntivi. Sui risultati di vendita in sé la responsabilità resta condivisa: noi garantiamo la qualità della selezione, il campo dipende anche da zona, listino e affiancamento.',
      },
    ],
    ruoliCorrelati: ['preventivista'],
  },
  {
    slug: 'amministrativi',
    nomeBreve: 'amministrativi',
    h1: 'Troviamo gli amministrativi per la tua impresa edile',
    metaTitle: 'Ricerca e selezione impiegati amministrativi edilizia | Talenti Edili',
    metaDescription:
      'Troviamo impiegati amministrativi, contabili di cantiere e addetti paghe per imprese edili: selezione con analisi psicoattitudinale e rosa di 3 finalisti in 21 giorni.',
    intro:
      'Contabilità di cantiere, fatturazione con reverse charge e SAL, gestione fornitori e subappalti: l’amministrazione edile è un mestiere a sé. Troviamo chi lo sa fare — e chi regge il ritmo di un’impresa vera.',
    definizione:
      'È il servizio di ricerca e selezione di Talenti Edili per le figure amministrative delle imprese edili: impiegati amministrativi, contabili di cantiere, addetti a fatturazione e SAL, gestione fornitori e subappalti, supporto paghe. L’amministrazione edile ha specificità che un amministrativo generico non conosce — reverse charge, ritenute di garanzia, contabilità per commessa, DURC e congruità — e per questo verifichiamo le competenze sul campo, non sul CV. L’analisi psicoattitudinale misura le variabili che decidono la tenuta nel ruolo: precisione sotto scadenza, metodo, affidabilità e capacità di dire le cose scomode ai titolari. Rosa di tre finalisti entro 21 giorni.',
    difficolta: [
      {
        titolo: 'L’edilizia è un’amministrazione a parte',
        testo:
          'Reverse charge, ritenute di garanzia, SAL, contabilità per commessa, DURC dei subappaltatori: un ottimo amministrativo di un altro settore impiega mesi a diventare operativo — se ci arriva.',
      },
      {
        titolo: 'La precisione non si vede al colloquio',
        testo:
          'Tutti si dichiarano "precisi e organizzati". La differenza fra chi tiene il metodo sotto tre scadenze contemporanee e chi accumula arretrati silenziosi si misura, non si racconta.',
      },
      {
        titolo: 'È il ruolo che vede tutto',
        testo:
          'L’amministrativo passa da banche, fornitori, buste paga e margini. Serve una persona di cui fidarsi al cento per cento: i tratti di affidabilità e principi qui pesano più che ovunque.',
      },
      {
        titolo: 'Quando se ne va, si ferma l’azienda',
        testo:
          'Spesso è una persona sola con tutto in testa. Il turnover amministrativo in un’impresa edile non costa uno stipendio: costa settimane di fatture ferme e fornitori che chiamano il titolare.',
      },
    ],
    comeSelezioniamo: [
      {
        titolo: 'Precisione sotto scadenza, misurata',
        testo:
          'Il Talent Profile misura disciplina, metodo e tenuta alla pressione: la combinazione che distingue chi chiude il mese sempre da chi lo chiude quando è tranquillo.',
      },
      {
        titolo: 'Verifica delle competenze edili',
        testo:
          'Ai finalisti sottoponiamo casi reali del settore: una fattura in reverse charge, un SAL con ritenuta, un DURC scaduto di un subappaltatore. Chi conosce solo l’amministrazione generica si ferma lì.',
      },
      {
        titolo: 'Affidabilità e riservatezza',
        testo:
          'I tratti di principi e coerenza pesano il doppio su questo profilo: è la persona che vedrà conti, stipendi e margini. I segnali di rischio comportamentale emergono dall’analisi, non dopo.',
      },
      {
        titolo: 'Capacità di dire di no',
        testo:
          'Un buon amministrativo ferma una fattura sbagliata anche se ha fretta il titolare. Misuriamo la fermezza insieme alla precisione: la combinazione rara è proprio quella.',
      },
    ],
    figureTipiche: [
      'Impiegato amministrativo',
      'Contabile di cantiere',
      'Addetto fatturazione e SAL',
      'Gestione fornitori e subappalti',
      'Supporto paghe e presenze',
      'Segreteria tecnica-amministrativa',
      'Responsabile amministrativo',
    ],
    faq: [
      {
        q: 'Trovate amministrativi che conoscono già l’edilizia?',
        a: 'È la priorità della ricerca: reverse charge, SAL, ritenute di garanzia e contabilità per commessa si imparano in anni, non in un corso. Quando il mercato locale non offre esperienza edile, lo diciamo subito e selezioniamo sul potenziale di apprendimento misurato, con un piano di affiancamento realistico.',
      },
      {
        q: 'Come valutate la precisione di un amministrativo?',
        a: 'Con l’analisi psicoattitudinale (disciplina, metodo, tenuta alla pressione) e con una prova pratica su documenti edili reali. "Sono una persona precisa" detto al colloquio non è un dato: il punteggio sul tratto e la prova lo sono.',
      },
      {
        q: 'Serve anche per un part-time o solo full-time?',
        a: 'Entrambi. Molte imprese sotto i 15 dipendenti cercano un amministrativo part-time: il processo di selezione è identico, cambia solo il bacino di ricerca.',
      },
      {
        q: 'Potete valutare la persona che ho già in amministrazione?',
        a: 'Sì: l’analisi psicoattitudinale si usa anche sulle persone in forza, per capire se il carico è sostenibile, dove servono supporti e come organizzare la crescita o l’affiancamento di una seconda risorsa.',
      },
    ],
    ruoliCorrelati: ['preventivista'],
  },
  {
    slug: 'capicantiere-e-capisquadra',
    nomeBreve: 'capicantiere e capisquadra',
    h1: 'Troviamo capicantiere e capisquadra',
    metaTitle: 'Ricerca e selezione capicantiere e capisquadra | Talenti Edili',
    metaDescription:
      'Troviamo capicantiere e capisquadra per imprese edili: ricerca attiva fra chi non risponde agli annunci, analisi psicoattitudinale e rosa di 3 finalisti.',
    intro:
      'I ruoli che decidono se il cantiere consegna o slitta. Non stanno sui portali di annunci: vanno cercati attivamente — e misurati prima, perché qui l’errore costa una commessa.',
    definizione:
      'È il servizio di ricerca e selezione di Talenti Edili per i ruoli di guida del cantiere: capocantiere, capisquadra, assistente di cantiere in crescita. Sono le figure più difficili da trovare in Italia — chi è bravo è già al lavoro e non risponde agli annunci — e le più costose da sbagliare: un capocantiere inadatto non rallenta sé stesso, rallenta l’intero cantiere. Facciamo ricerca diretta sul territorio, verifichiamo i cantieri realmente gestiti e misuriamo con l’analisi psicoattitudinale le tre variabili che il curriculum non dice: capacità di decidere sotto pressione, autorevolezza senza conflitto, rispetto rigoroso della sicurezza. Rosa di tre finalisti con report completo e guida al colloquio.',
    difficolta: [
      {
        titolo: 'I bravi non cercano lavoro',
        testo:
          'Un capocantiere che funziona è il bene più difeso di un’impresa. Non risponde agli annunci: va individuato e contattato direttamente, con una proposta seria. È ricerca attiva, non pubblicazione.',
      },
      {
        titolo: 'L’errore più comune: promuovere il migliore operaio',
        testo:
          'La competenza tecnica non predice la capacità di coordinare persone. È l’errore singolo più costoso che vediamo nelle imprese edili — e il motivo per cui misuriamo i tratti, non gli anni di cantiere.',
      },
      {
        titolo: 'Il danno arriva in ritardo',
        testo:
          'Un capisquadra che gestisce per intimidazione produce nel breve: la squadra tiene il ritmo. Il conto arriva sei mesi dopo, quando gli operai migliori se ne vanno senza dire il vero motivo.',
      },
      {
        titolo: 'Sicurezza: il profilo conta più dei corsi',
        testo:
          'Le abilitazioni dicono che conosce le regole, non che le farà rispettare quando il cronoprogramma è in ritardo. La propensione alla sicurezza è un tratto misurabile — e noi la misuriamo.',
      },
    ],
    comeSelezioniamo: [
      {
        titolo: 'Ricerca diretta, non annunci',
        testo:
          'Mappiamo il territorio e i cantieri della zona, contattiamo direttamente chi guida squadre oggi. La maggioranza dei nostri finalisti su questi ruoli non era "in cerca di lavoro".',
      },
      {
        titolo: 'Cantieri verificati, non dichiarati',
        testo:
          'Chiediamo quali cantieri ha gestito, con che squadre, che importi e che committenti — e verifichiamo. La differenza fra "ho fatto il capocantiere" e "ho risposto di un cantiere da 2 milioni" emerge qui.',
      },
      {
        titolo: 'Decisione, autorevolezza, sicurezza: misurate',
        testo:
          'L’analisi psicoattitudinale pesa i tratti critici del ruolo: decisione rapida, gestione dello stress, leadership senza autoritarismo, orientamento alla regola. Più l’Indice di Propensione alla Sicurezza dedicato.',
      },
      {
        titolo: 'Guida al colloquio su episodi reali',
        testo:
          'Ti consegniamo le domande giuste per ciascun finalista: la fornitura saltata a due giorni dal getto, l’operaio bravo che ignora i DPI, il cronoprogramma da rinegoziare con la direzione lavori.',
      },
    ],
    figureTipiche: [
      'Capocantiere',
      'Capisquadra',
      'Assistente di cantiere',
      'Vice capocantiere in crescita',
      'Capo commessa operativo',
    ],
    faq: [
      {
        q: 'Perché è così difficile trovare un capocantiere?',
        a: 'Perché chi è bravo è già al lavoro, difeso dall’impresa che lo ha, e non risponde agli annunci. La ricerca funziona solo se è diretta: mappare il territorio, individuare chi guida cantieri oggi e presentare una proposta credibile. È esattamente quello che facciamo.',
      },
      {
        q: 'Meglio promuovere un interno o cercare fuori?',
        a: 'Dipende dai tratti, non dall’anzianità. Prima di aprire una ricerca esterna possiamo analizzare i tuoi interni: se qualcuno ha il profilo per il salto, la promozione costa meno e trattiene la persona. Se nessuno ce l’ha, lo sai prima di fare il danno.',
      },
      {
        q: 'Come valutate la gestione della sicurezza?',
        a: 'Con i tratti di orientamento alla regola e tenuta alla pressione, combinati nell’Indice di Propensione alla Sicurezza, e con domande su episodi reali: l’ultima volta che ha fermato una lavorazione, come ha gestito chi ignorava i DPI. Le abilitazioni sono un prerequisito, non un criterio.',
      },
      {
        q: 'Quanto costa sbagliare un capocantiere?',
        a: 'È l’errore più caro dell’edilizia: cronoprogrammi che slittano, committenti che si incrinano, operai bravi che se ne vanno. Il conto supera facilmente i 100.000 € per commessa — contro il costo di una selezione fatta con i dati.',
      },
    ],
    ruoliCorrelati: ['capocantiere', 'capisquadra', 'assistente-di-cantiere'],
  },
  {
    slug: 'operai-specializzati',
    nomeBreve: 'operai specializzati',
    h1: 'Troviamo operai specializzati',
    metaTitle: 'Ricerca e selezione operai specializzati edilizia | Talenti Edili',
    metaDescription:
      'Troviamo muratori, carpentieri, ferraioli e gruisti che restano: selezione con analisi psicoattitudinale su affidabilità, sicurezza e tenuta nel tempo.',
    intro:
      'Muratori, carpentieri, ferraioli, gruisti. Il problema non è trovarli: è trovare quelli che lunedì si presentano, rispettano la sicurezza e a marzo sono ancora lì.',
    definizione:
      'È il servizio di ricerca e selezione di Talenti Edili per gli operai specializzati: muratori, carpentieri, ferraioli, gruisti, piastrellisti, intonacatori, addetti ponteggi. Sulla manodopera specializzata la prova pratica dice se sanno lavorare; non dice se si presenteranno con costanza, se rispetteranno le procedure quando nessuno guarda e se reggeranno sei mesi allo stesso ritmo — le tre variabili che fanno saltare i cronoprogrammi. L’analisi psicoattitudinale misura esattamente queste: affidabilità, propensione alla sicurezza, tenuta nel tempo. Selezioniamo su chi resta, non solo su chi sa fare, e con la garanzia di sostituzione se il rapporto si interrompe nel periodo concordato.',
    difficolta: [
      {
        titolo: 'La prova pratica misura la mano, non la tenuta',
        testo:
          'Mezza giornata di prova dice come lavora oggi. Non dice se al secondo mese cala, se sparisce il lunedì o se taglia i passaggi di sicurezza quando è in ritardo. È lì che si perdono i cronoprogrammi.',
      },
      {
        titolo: 'Il turnover operaio sembra normale — non lo è',
        testo:
          'Ci si abitua a perdere due operai a stagione come fosse fisiologico. Non lo è: è selezione fatta solo sulla manualità, senza guardare affidabilità e compatibilità con la squadra.',
      },
      {
        titolo: 'La sicurezza dipende dal profilo, non dal corso',
        testo:
          'Il profilo statisticamente più esposto agli infortuni è chi rispetta le regole finché non ha fretta. Si individua prima, misurando disciplina e tenuta alla pressione insieme.',
      },
      {
        titolo: 'Squadra sbagliata, cantiere lento',
        testo:
          'Un solitario in una squadra affiatata o un conflittuale vicino a un capisquadra rigido rallentano tutti. La compatibilità di squadra si valuta, non si spera.',
      },
    ],
    comeSelezioniamo: [
      {
        titolo: 'Storia lavorativa verificata',
        testo:
          'La durata dei rapporti precedenti dice più di qualunque colloquio: verifichiamo dove ha lavorato, quanto è rimasto e perché è finita. I pattern di abbandono si vedono prima.',
      },
      {
        titolo: 'Affidabilità e costanza misurate',
        testo:
          'L’analisi psicoattitudinale — 15 minuti dal telefono, in italiano semplice — misura i tratti che predicono la presenza: disciplina, costanza, stabilità. Nessun test di cultura generale.',
      },
      {
        titolo: 'Indice di Propensione alla Sicurezza',
        testo:
          'Ogni finalista arriva con l’indice dedicato: la combinazione di disciplina, tenuta alla pressione e rispetto delle regole che distingue chi lavora in sicurezza da chi "di solito" lo fa.',
      },
      {
        titolo: 'Compatibilità con la tua squadra',
        testo:
          'Nel briefing capiamo chi c’è già in squadra e chi la guida: il matching tiene conto del contesto reale, non del ruolo astratto. Un ottimo operaio nella squadra sbagliata resta un problema.',
      },
    ],
    figureTipiche: [
      'Muratore',
      'Carpentiere',
      'Ferraiolo',
      'Gruista',
      'Piastrellista',
      'Intonacatore',
      'Addetto ponteggi',
      'Escavatorista',
      'Operaio polivalente',
    ],
    faq: [
      {
        q: 'Ha senso un’analisi psicoattitudinale per un operaio?',
        a: 'Sì, se il tuo problema è il turnover e la sicurezza più che la manualità. La prova pratica valuta la mano; l’analisi valuta se si presenterà con costanza, se rispetterà le procedure senza supervisione e se reggerà nel tempo. Sono le ragioni per cui gli operai se ne vanno o si fanno male.',
      },
      {
        q: 'L’analisi è troppo difficile per chi non usa il computer?',
        a: 'No: 242 domande in italiano semplice, dal telefono, circa 15 minuti. Non è un test di cultura generale e non serve saper scrivere: si risponde toccando una delle tre opzioni.',
      },
      {
        q: 'Trovate anche squadre complete?',
        a: 'Sì. Per aperture di cantiere o commesse nuove componiamo squadre intere, valutando anche la compatibilità interna fra i profili: la squadra funziona come sistema, non come somma di singoli.',
      },
      {
        q: 'E se l’operaio se ne va dopo un mese?',
        a: 'Vale la garanzia di sostituzione: riapriamo la ricerca senza costi aggiuntivi entro il periodo concordato nell’incarico. Selezionare su chi resta è esattamente il nostro lavoro.',
      },
    ],
    ruoliCorrelati: ['muratore', 'carpentiere', 'ferraiolo', 'gruista'],
  },
  {
    slug: 'geometri-e-tecnici',
    nomeBreve: 'geometri e tecnici',
    h1: 'Troviamo geometri e tecnici di cantiere',
    metaTitle: 'Ricerca e selezione geometri e tecnici di cantiere | Talenti Edili',
    metaDescription:
      'Troviamo geometri di cantiere, project manager e direttori tecnici: selezione su rigore, autorevolezza e gestione economica della commessa. Rosa di 3 finalisti.',
    intro:
      'Geometri di cantiere, project manager, direttori tecnici: le figure che tengono insieme disegno, numeri e squadre. Il titolo lo hanno in tanti; farsi ascoltare in cantiere è un’altra cosa.',
    definizione:
      'È il servizio di ricerca e selezione di Talenti Edili per i ruoli tecnici dell’impresa edile: geometra di cantiere, project manager, direttore tecnico, responsabile di commessa, tecnico BIM. Su queste figure il mercato seleziona quasi sempre sul titolo e sul software — e sbaglia, perché il 60% del lavoro reale è far accettare decisioni a squadre e fornitori che non le hanno prese, e tenere i numeri della commessa anche quando dicono cose scomode. L’analisi psicoattitudinale misura le variabili decisive: rigore, autorevolezza, gestione del conflitto, disciplina sui numeri. Rosa di tre finalisti in 21 giorni con report completo e guida al colloquio.',
    difficolta: [
      {
        titolo: 'Il titolo non predice l’autorevolezza',
        testo:
          'Un geometra preciso che nessuno in cantiere ascolta produce documenti perfetti e cantieri fermi. La capacità di farsi seguire da chi ha trent’anni di mestiere non sta nel curriculum.',
      },
      {
        titolo: 'Il software si impara, la fermezza no',
        testo:
          'CAD, computi e gestionali si imparano in settimane. La capacità di dire alla proprietà che una commessa sta andando in perdita — presto, non a consuntivo — è un tratto, e va misurato.',
      },
      {
        titolo: 'Ottimismo sistematico: il difetto più caro',
        testo:
          'Il tecnico che rassicura sempre è piacevole da avere e costosissimo da tenere: i problemi arrivano tutti insieme, quando non sono più recuperabili. L’onestà sui numeri si misura prima.',
      },
      {
        titolo: 'Mercato affollato di CV, povero di profili giusti',
        testo:
          'Di candidature tecniche ne arrivano tante; distinguere chi sta bene fra ufficio e cantiere da chi si rifugia in uno dei due richiede dati, non impressioni.',
      },
    ],
    comeSelezioniamo: [
      {
        titolo: 'Rigore e autorevolezza insieme',
        testo:
          'Il matching pesa la combinazione rara: precisione tecnica più capacità di farsi ascoltare. Uno dei due senza l’altro, su questi ruoli, è un problema annunciato.',
      },
      {
        titolo: 'Disciplina sui numeri',
        testo:
          'Misuriamo la tendenza a guardare i consuntivi anche quando sono brutti e a portare le notizie scomode presto. Sul project manager è la variabile che decide il margine.',
      },
      {
        titolo: 'Verifica delle commesse gestite',
        testo:
          'Importi, committenti, esiti: chiediamo e verifichiamo. "Ho seguito cantieri" e "ho risposto del margine di una commessa da 3 milioni" sono due mestieri diversi.',
      },
      {
        titolo: 'Colloquio su casi reali',
        testo:
          'La variante che il committente non vuole riconoscere, il capisquadra che fa di testa sua, il consuntivo in rosso: ogni finalista arriva con le domande giuste da fargli, generate sul suo profilo.',
      },
    ],
    figureTipiche: [
      'Geometra di cantiere',
      'Project manager edile',
      'Direttore tecnico',
      'Responsabile di commessa',
      'Tecnico BIM',
      'Direttore operativo',
      'Responsabile ufficio tecnico',
    ],
    faq: [
      {
        q: 'Trovate geometri disposti a stare in cantiere?',
        a: 'È il primo filtro della ricerca: nel briefing definiamo quanto cantiere reale prevede il ruolo e selezioniamo chi ci sta bene — misurandolo, perché la preferenza ufficio/cantiere emerge chiaramente dai tratti. Il geometra che si rifugia in ufficio è uno dei fallimenti più comuni su questa posizione.',
      },
      {
        q: 'Che differenza c’è fra selezionare un PM e un direttore tecnico?',
        a: 'Il project manager risponde del risultato economico di una o più commesse; il direttore tecnico delle scelte tecniche dell’intera impresa, e si regge su delega e visione. Il matching pesa i tratti in modo diverso: promuovere un ottimo PM a direttore tecnico senza misurare la capacità di delega è un errore frequente.',
      },
      {
        q: 'Valutate anche la conoscenza del BIM e dei software?',
        a: 'Sì, come prerequisito verificato nella parte tecnica della selezione. Ma non è il criterio di scelta: il software si impara in settimane, autorevolezza e disciplina sui numeri no. È il motivo per cui selezionare sul software produce tecnici precisi che nessuno ascolta.',
      },
      {
        q: 'Potete valutare il tecnico che vorrei promuovere?',
        a: 'Sì: prima di cercare fuori conviene misurare chi hai dentro. L’analisi dice se il profilo regge il salto — su un direttore tecnico, se sa delegare — e come impostare i primi 90 giorni nel nuovo ruolo.',
      },
    ],
    ruoliCorrelati: ['geometra-di-cantiere', 'project-manager-edile', 'direttore-tecnico'],
  },
  {
    slug: 'preventivisti',
    nomeBreve: 'preventivisti',
    h1: 'Troviamo preventivisti e computisti',
    metaTitle: 'Ricerca e selezione preventivisti e computisti | Talenti Edili',
    metaDescription:
      'Troviamo preventivisti e computisti per imprese edili: selezione su precisione, tenuta sulle scadenze di gara e onestà nei numeri. Rosa di 3 finalisti in 21 giorni.',
    intro:
      'Ogni errore del preventivista diventa una commessa firmata in perdita. Troviamo chi unisce precisione, tenuta sulle scadenze di gara e — la dote più rara — onestà nei numeri.',
    definizione:
      'È il servizio di ricerca e selezione di Talenti Edili per preventivisti e computisti: le figure che traducono i progetti in offerte e decidono, voce per voce, il margine dell’impresa. Un preventivista sbagliato non fa danni visibili: li firma qualcun altro mesi dopo, a consuntivo. Selezioniamo su tre variabili misurate — precisione ostinata, tenuta sotto le scadenze compresse delle gare e onestà intellettuale nel dichiarare le incertezze invece di coprirle con ipotesi ottimistiche — più la verifica pratica su un computo reale. Rosa di tre finalisti entro 21 giorni con report completo.',
    difficolta: [
      {
        titolo: 'L’errore è invisibile fino al consuntivo',
        testo:
          'Un preventivo sbagliato non si vede alla firma: si vede a fine commessa, quando il margine è evaporato. Il preventivista è il ruolo con il feedback più lento — e quindi il più difficile da valutare senza dati.',
      },
      {
        titolo: 'Veloce e ottimista: la combinazione peggiore',
        testo:
          'Sotto scadenza di gara, il preventivista in difficoltà fa quadrare l’offerta con ipotesi ottimistiche non dichiarate. È il modo più comune di vincere gare in perdita.',
      },
      {
        titolo: 'Prezzare su carta invece che su cantiere',
        testo:
          'Chi non va mai in cantiere prezza lavorazioni che non ha mai visto. La curiosità tecnica — quante volte verifica i prezzi sul campo — distingue il preventivista realistico da quello teorico.',
      },
      {
        titolo: 'Pochi sul mercato, molti improvvisati',
        testo:
          'I preventivisti esperti sono rari e trattenuti; le candidature abbondano di profili che hanno "fatto anche preventivi". La differenza si misura su un computo vero, non sul CV.',
      },
    ],
    comeSelezioniamo: [
      {
        titolo: 'Prova su un computo reale',
        testo:
          'Ai finalisti sottoponiamo un caso di preventivazione del tuo tipo di lavori: come imposta l’analisi prezzi, cosa chiede, quali incertezze dichiara. Chi improvvisa si vede alla seconda voce.',
      },
      {
        titolo: 'Onestà nei numeri, misurata',
        testo:
          'I tratti di coerenza e principi incrociati con la prova pratica: il profilo che tende a coprire le incertezze con ottimismo emerge prima di firmare offerte in perdita.',
      },
      {
        titolo: 'Tenuta sulle scadenze di gara',
        testo:
          'Le gare non aspettano. Misuriamo la combinazione di metodo e gestione della pressione: chi mantiene il rigore quando la scadenza è domani, e chi inizia a "stimare a occhio".',
      },
      {
        titolo: 'Rapporto con il cantiere',
        testo:
          'Verifichiamo quanto cantiere reale ha visto e come aggiorna i suoi prezzi. Il preventivista che non esce mai dall’ufficio prezza un’edilizia che non esiste.',
      },
    ],
    figureTipiche: [
      'Preventivista',
      'Computista',
      'Addetto gare e appalti',
      'Analista prezzi',
      'Preventivista serramenti/impianti',
      'Responsabile ufficio gare',
    ],
    faq: [
      {
        q: 'Come si valuta un preventivista prima di assumerlo?',
        a: 'Su tre livelli: una prova pratica su un computo del vostro tipo di lavori, l’analisi psicoattitudinale sui tratti decisivi (precisione, metodo, onestà nei numeri, tenuta alla pressione) e la verifica delle commesse realmente preventivate e del loro esito a consuntivo, quando disponibile.',
      },
      {
        q: 'Meglio un preventivista veloce o uno preciso?',
        a: 'La domanda giusta è: uno che dichiara le incertezze. Il veloce che copre i buchi con ottimismo è il più costoso di tutti; il lento perfetto fa saltare le scadenze di gara. Cerchiamo la combinazione misurabile di metodo e onestà — quella che vince gare che poi marginano.',
      },
      {
        q: 'Trovate preventivisti specializzati (serramenti, impianti)?',
        a: 'Sì: la specializzazione merceologica è un filtro del briefing. Un preventivista di serramenti e uno di opere strutturali condividono il metodo ma non i prezzi: cerchiamo nel bacino giusto.',
      },
      {
        q: 'Il preventivista può lavorare da remoto?',
        a: 'In parte sì, ed è un vantaggio nella ricerca: allarga il bacino. Ma il legame col cantiere resta necessario — nel briefing definiamo quanto campo prevede il ruolo e selezioniamo di conseguenza.',
      },
    ],
    ruoliCorrelati: ['preventivista', 'geometra-di-cantiere'],
  },
];

export const getSelezione = (slug?: string) => SELEZIONI.find((s) => s.slug === slug);
