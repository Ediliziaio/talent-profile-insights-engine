

# Sezioni Mancanti -- Ispirate a ristrutturazionidebiti.it

## Panoramica

La Home attuale ha 10 sezioni ma ne mancano 5 chiave presenti nel sito di riferimento. Queste sezioni aggiungono: carico emotivo (lettera aperta), credibilita' (chi siamo, casi reali, garanzie), confronto competitivo (tabella vs concorrenti) e urgenza (timeline "cosa succede se non agisci").

---

## Sezioni da Aggiungere (in ordine di inserimento nella pagina)

### A. LETTERA APERTA EMOTIVA (dopo Hero, prima di "Problema")
Sezione con sfondo bianco, tono diretto in seconda persona come ristrutturazionidebiti. Domande retoriche che colpiscono i pain point HR:

- "Quante volte hai assunto qualcuno che al colloquio sembrava perfetto... e dopo 3 mesi era un disastro?"
- "Quante volte hai perso il candidato giusto perche' non avevi dati per decidere in fretta?"
- "Quante volte hai sentito dire: 'Tanto il CV parla chiaro...' -- e poi il CV non aveva detto NIENTE?"

Chiusura con frase in grassetto: "La verita' e' questa: senza uno strumento scientifico, stai giocando d'azzardo con il futuro della tua azienda."

Stile: testo grande (text-xl/2xl), interlinea generosa, icone "?" animate come nel sito di riferimento.

### B. "C'E' UNA BUONA NOTIZIA" (dopo la lettera, prima del Metodo)
Transizione emotiva positiva con sfondo leggero (gradiente azzurro chiaro). Titolo: "Anzi, Un'Ottima Notizia."

4 blocchi con checkmark verde:
1. "Mappare il profilo psicologico reale di ogni candidato" -- in 15 minuti, non in settimane
2. "Sapere PRIMA se la persona e' adatta al ruolo" -- con dati, non con l'istinto
3. "Ridurre il turnover fino al 40%" -- casi documentati dai nostri clienti
4. "Andare al colloquio preparato" -- con domande mirate generate dall'assessment

Chiusura: "Il problema? Questi risultati li ottieni SOLO se usi uno strumento validato, costruito da esperti di psicologia del lavoro."

### C. CASI REALI / CASE STUDIES (dopo Testimonianze)
Titolo: "Risultati Reali. Aziende Reali."

3-4 card con struttura before/after come ristrutturazionidebiti:
1. "Tech Startup -- 25 dipendenti" -- Turnover -40%, badge "-40%", descrizione: "Assumevano a sensazione, 1 errore su 3. Con TalentProfile: zero errori di selezione in 12 mesi."
2. "Gruppo Industriale -- 200 dipendenti" -- Tempo selezione -60%, badge "-60%", descrizione: "Il processo di selezione durava 3 settimane. Ora decidono in 3 giorni con dati oggettivi."
3. "Retail Chain -- 50 punti vendita" -- Costo hiring -35%, badge "-35%", descrizione: "Il costo per assunzione sbagliata era 2x lo stipendio annuo. Ridotto del 35% nel primo anno."

Ogni card con: titolo azienda, badge percentuale grande colorato, descrizione, 2-3 risultati con checkmark.

### D. TABELLA COMPARATIVA "GLI ALTRI VS TALENTPROFILE" (dopo Casi Reali)
Sfondo bianco, titolo: "Perche' Scegliere TalentProfile?"

Tabella responsive con 7 righe:
| Aspetto | Gli Altri | TalentProfile |
|---------|-----------|---------------|
| Metodo | Colloquio + CV | Assessment psicologico validato |
| Tempo | Settimane di valutazione | 15 minuti, report istantaneo |
| Oggettivita' | Opinioni soggettive | 14 scale con scoring numerico |
| Profondita' | Superficie (competenze) | Psicologia profonda (identita', difese, attaccamento) |
| Role Matching | Manuale e approssimativo | Automatico su 30+ ruoli |
| Colloquio | Domande generiche | Guida personalizzata dall'assessment |
| Report | Appunti informali | PDF esecutivo professionale |

Colonna "Gli Altri" con sfondo rosso chiaro e X rossa, colonna TalentProfile con sfondo verde chiaro e checkmark verde.

### E. "COSA SUCCEDE SE NON AGISCI?" -- URGENCY TIMELINE (prima della CTA finale)
Sfondo grigio scuro/blu scuro, titolo in bianco: "Cosa Succede Se Continui ad Assumere Senza Dati?"

Timeline verticale progressiva (come ristrutturazionidebiti) con 4 step:
1. "Mese 1-3" -- "L'assunzione sembra ok" -- "Il nuovo assunto e' in luna di miele. I problemi non si vedono ancora."
2. "Mese 3-6" -- "I segnali arrivano" -- "Performance sotto le aspettative, conflitti nel team, feedback negativi dai colleghi."
3. "Mese 6-12" -- "Il costo esplode" -- "Turnover, riassunzione, formazione persa. Costo reale: fino a 2x lo stipendio annuo."
4. "Oltre 1 anno" -- "Il danno e' fatto" -- "Team destabilizzato, cultura aziendale compromessa, talenti che se ne vanno."

Chiusura con box verde: "Ma C'e' Ancora Tempo. In questo momento puoi cambiare il tuo processo di selezione. Basta un assessment."

### F. TRUST BADGES sulla CTA FINALE (upgrade sezione esistente)
Aggiungere sotto il bottone "Richiedi una Demo" 3 micro-badge come nel sito di riferimento:
- "Risposta in 24h"
- "100% Riservato"
- "Senza Impegno"

---

## Ordine Finale delle Sezioni (16 totali)

1. Navbar (esistente)
2. Hero (esistente)
3. **NUOVA: Lettera Aperta Emotiva**
4. Problema - 4 motivi (esistente)
5. **NUOVA: "C'e' Una Buona Notizia"**
6. Il Metodo - 4 Step (esistente)
7. Funzionalita' (esistente)
8. Numeri (esistente)
9. Testimonianze (esistente)
10. **NUOVA: Casi Reali / Case Studies**
11. **NUOVA: Tabella Comparativa**
12. Per Chi E' / Non E' (esistente)
13. **NUOVA: Urgency Timeline**
14. FAQ (esistente)
15. CTA Finale con trust badges (esistente, upgrade)
16. Footer (esistente)

---

## Dettaglio Tecnico

### File da modificare
Solo `src/pages/Home.tsx` -- tutte le nuove sezioni vengono aggiunte nel componente esistente con lo stesso pattern (Section wrapper con fade-in, dati in costanti in cima al file).

### Stile
- Lettera aperta: `text-xl md:text-2xl leading-relaxed` con icone `?` in cerchi arancioni animati (pulse)
- Buona notizia: sfondo `bg-blue-50`, checkmark verdi `text-success`
- Case studies: card con badge percentuale grande (`text-4xl font-black text-accent`) posizionato in alto a destra
- Tabella comparativa: righe alternate, colonna sinistra con `bg-destructive/5` e `XCircle`, colonna destra con `bg-success/5` e `CheckCircle2`
- Urgency timeline: sfondo `#1e3a5f`, pallini numerati arancioni, linea verticale come il metodo ma con colori che degradano da verde a rosso
- Trust badges: `flex gap-4` con icone piccole e testo `text-sm text-white/80`

### Nessuna dipendenza aggiuntiva
Tutto implementato con Tailwind, lucide-react e componenti shadcn gia' presenti.

