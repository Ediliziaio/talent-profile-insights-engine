

# Aggiornamento Completo Copy Landing Page

## Panoramica

Aggiornamento massivo di tutti i testi della landing per allinearli al copy fornito dall'utente. Le modifiche riguardano esclusivamente i contenuti testuali e i dati -- nessun cambiamento strutturale o di layout.

---

## File da modificare

Solo `src/pages/Home.tsx`

---

## Modifiche ai dati (costanti in cima al file)

### Hero (sezione JSX)
- Sottotitolo: aggiungere i numeri chiave: "242 item, 15 tratti misurati, 24 sindromi comportamentali identificate. Report istantaneo, confronto candidati, guida al colloquio personalizzata."
- Micro-badge: "1.000+ Aziende clienti" (era "100+ Aziende")

### PROBLEMS (4 card)
Riscrivere le descrizioni con il copy fornito, molto piu' dettagliato e specifico:
- "Assumi a sensazione": aggiungere "Parla bene, stringe la mano forte, ti guarda negli occhi. Poi dopo 90 giorni scopri che era tutto un copione..."
- "Turnover alle stelle": aggiungere "Circa 30.000 euro tra formazione, produttivita' persa e riassunzione"
- "Zero dati oggettivi": "Non ti dice come si comportera' sotto pressione, come gestira' il team, se e' un leader o un esecutore..."
- "Team disfunzionali": "Un solo inserimento sbagliato puo' destabilizzare un team intero che funzionava"

### URGENCY_STEPS (4 step timeline)
Riscrivere le descrizioni con il copy fornito, piu' lungo e narrativo:
- Mese 1-3: "Luna di miele. Il nuovo assunto sorride, annuisce, fa bella figura. I problemi ci sono gia' -- ma non li vedi ancora. Il suo 'software mentale' e' in esecuzione, ma non l'hai mai testato."
- Mese 3-6: "Performance sotto le aspettative. Conflitti con i colleghi. Non regge la pressione..."
- Mese 6-12: "Turnover, riassunzione, formazione persa. Costo reale: fino a 2x lo stipendio annuo. Circa 30.000 euro bruciati..."
- Oltre 12 mesi: "Team destabilizzato. Cultura aziendale compromessa. I talenti veri..."
- Aggiungere titoli nuovi: "L'assunzione 'sembra' ok", "I segnali arrivano", "Il costo esplode", "Il danno e' strutturale"
- Label "Oltre 1 anno" diventa "Oltre 12 mesi"

### Sezione URGENCY -- titolo
Aggiungere sottotitolo "Il Costo Dell'Inazione" come pretitolo

### LETTERA APERTA
Trasformare in lettera completa "Caro imprenditore" come da copy fornito:
- Aprire con "Caro imprenditore,"
- Testo narrativo empatico in 4 paragrafi
- Chiusura con le specifiche: "242 domande. 15 tratti misurati. 24 sindromi comportamentali identificate. Report istantaneo."
- Firma "Il Team TalentProfile"
- Sotto-firma: "Psicologia del lavoro applicata alla realta' dell'impresa"
- Rimuovere le 3 domande retoriche (LETTERA_DOMANDE) e il formato attuale con icone "?"

### STEPS (4 step del metodo)
Riscrivere con copy piu' dettagliato:
- Step 1: "Invii un link personalizzato. Il candidato compila in autonomia, da smartphone, tablet o PC. Zero logistica, zero presenza fisica richiesta."
- Step 2: "242 domande a risposta chiusa. 15 minuti di compilazione. Validato scientificamente con coefficiente .75/1. Il candidato risponde in modo naturale e spontaneo -- niente da preparare, niente da fingere."
- Step 3: "Profilo psicologico completo: 15 tratti, 3 macro-aree (Essere, Fare, Avere), 24 sindromi comportamentali, mappa interiore, punti di forza e aree critiche. Tutto in tempo reale."
- Step 4: "Compatibilita' automatica con i ruoli della tua azienda. Guida personalizzata al colloquio con domande mirate. Confronto tra candidati. Assumi con i dati -- non con il dubbio."
- Aggiungere sottotitolo alla sezione: "Dal link al report completo. 15 minuti. Zero logistica. Dati che nessun colloquio potrebbe darti."

### FEATURES (6 card)
Riscrivere descrizioni piu' specifiche:
- Profilo 360: "15 tratti, 3 macro-aree, 24 sindromi comportamentali. Non le solite 4 dimensioni vaghe. Analisi completa della personalita' professionale in un report esecutivo che puoi leggere in 5 minuti."
- Mappa Interiore: "La funzionalita' che ci rende unici. 7 profili psicologici profondi: identita', emozioni, stile di attaccamento, meccanismi difensivi. Cosa guida questa persona? Cosa la blocca? Dove sta il potenziale inespresso?"
- Role Matching: "Compatibilita' istantanea con 30+ ruoli aziendali -- dal commerciale al caposquadra, dal responsabile HR al direttore tecnico. Scopri subito dove il candidato performa meglio."
- Guida Colloquio: "Domande personalizzate generate dall'assessment. Non vai piu' al colloquio alla cieca. Sai esattamente cosa chiedere, dove approfondire, quali aree indagare per quel candidato specifico."
- Confronto: "Confronta fino a 4 candidati fianco a fianco su tutte le dimensioni psicologiche. Devi scegliere tra 3 candidati per un ruolo? In 30 secondi vedi chi e' piu' adatto -- con i numeri, non con le opinioni."
- Report PDF: "Scaricabile, condivisibile, pronto per il management. Include piano d'azione post-assunzione: cosa fare nei primi 90 giorni per ottenere il massimo da ogni nuova risorsa."
- Aggiungere sottotitolo sezione: "Non un test generico. Un sistema completo di intelligence HR costruito per darti vantaggio competitivo nelle decisioni sulle persone."

### TESTIMONIALS
Riscrivere le quote con versioni piu' lunghe e specifiche:
- Marco Rinaldi: "Da quando usiamo TalentProfile, il turnover nei primi 6 mesi e' calato del 40%. Finalmente abbiamo dati oggettivi per le nostre decisioni -- e il team HR ha smesso di navigare a vista."
- Aggiungere "(200 dip.)" al ruolo
- Chiara Fontana: "Assumevamo a sensazione e sbagliavamo 1 volta su 3. Con TalentProfile abbiamo ridotto gli errori di selezione quasi a zero. In 12 mesi, zero errori di hiring. Il ROI? Incalcolabile."
- Aggiungere "(25 dip.)" al ruolo
- Luca Ferretti: "La mappa interiore ci ha rivelato dinamiche che nessun colloquio avrebbe fatto emergere. Abbiamo capito perche' certi talenti non performavano: erano nel ruolo sbagliato. Spostati, sono diventati i migliori."
- Aggiungere "(50 PV)" al ruolo

### COMPARISON_ROWS (tabella comparativa)
- Cambiare "Metodo" in "Strumento" e aggiornare: "Colloquio + CV" vs "Assessment 242 item validato"
- Aggiungere riga "Post-assunzione": "Speri che vada bene" vs "Piano inserimento su misura"
- Cambiare header da "Gli Altri" a "Metodo tradizionale", da "TalentProfile" a "TalentProfile 360°"

### CASE_STUDIES
- Terzo case study: badge da "-35%" a "€180K", badgeLabel da "Costo hiring" a "Risparmio nel primo anno"
- Aggiungere settore a ogni card: "Settore: Software B2B", "Settore: Manifatturiero", "Settore: Retail / GDO"
- Aggiungere "HR team piu' efficiente del 70%" al secondo case study

### Contatori (NUMERI)
- c1: da `useCountUp(100)` a `useCountUp(1000)` con label "Aziende clienti"
- Aggiungere quarto contatore: ".75/1" con label "Validazione scientifica"
- Nota: c4 attuale (15 min) va tenuto ma riordinato

### FOR_NOT_FOR
Espandere a 5 items per lista come da copy:
- NOT: aggiungere "Cerchi una soluzione magica che faccia tutto da sola" e "Non sei disposto a usare i dati per prendere decisioni"
- YES: aggiungere "Sai che le persone giuste fanno crescere l'azienda -- e quelle sbagliate la distruggono" e "Vuoi anche gestire e sviluppare il team attuale, non solo selezionare"

### FAQ
- Aggiungere icone emoji ai titoli delle domande come da copy
- Aggiornare sottotitolo FAQ: "Le stesse domande che ci fanno tutti. Le risposte sincere che diamo sempre."

### CTA FINALE
Riscrivere il testo:
- Titolo: "Il futuro del tuo team inizia da qui."
- Sottotitolo: "Ogni giorno che passi senza dati oggettivi sulle persone e' un giorno in cui rischi un'altra assunzione sbagliata. Un altro 30.000 euro bruciato. Un altro talento perso."
- Aggiungere riga: "La demo e' gratuita, dura 30 minuti e ti mostra esattamente come funziona il sistema sulla tua realta'. Nessun impegno. Nessun venditore aggressivo. Solo dati."
- Pretitolo: "Inizia Ora"

### Sezione PROBLEMA
- Titolo: "Stai scommettendo il futuro della tua azienda su una sensazione."
- Sottotitolo: "Lo sai anche tu. Al colloquio sembrava perfetto. Dopo 3 mesi era un disastro. Il CV diceva tutto -- tranne la verita'. Quante volte e' successo?"

---

## Nessun cambiamento strutturale

Layout, stili, immagini, animazioni e responsiveness restano invariati. Solo contenuti testuali aggiornati.

