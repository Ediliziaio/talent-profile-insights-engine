

# Analisi Completa: Manuale V2.0 vs Codebase — Discrepanze Identificate

Ho confrontato ogni sezione del Manuale TalentProfile V2.0 Definitivo con il codice sorgente. Di seguito le discrepanze trovate, organizzate per gravita.

---

## 1. PROFILI TIPO V5 — LOGICA COMPLETAMENTE ERRATA (CRITICO)

**File:** `src/lib/scoringV5.ts` — funzione `determinaProfiloTipoV5()`

La logica attuale usa le macro-aree percentuali. Il manuale usa criteri completamente diversi basati sui tratti individuali e le sindromi.

| Profilo | Manuale V2.0 (Corretto) | Codice Attuale (Errato) |
|---------|-------------------------|------------------------|
| LEADER | 5+ tratti sopra +45 E nessuna S01-S04 | Tutte le aree >= 60% |
| STRATEGIST | ORG>50 E AUT>40 E (ADS>40 o DET>40) E no S01-S04 | ESSERE>=60% E FARE<50% |
| EXECUTOR | SS4 attivo (ORG>=30, GP>=30, PRO>=20) E no S01-S05 | FARE>=60% E ESSERE<50% |
| SPECIALIST | ADS>44 E ORG>40 E RC 20-45 E (VEN<30 o ESP<15) | Una area>=70%, altre<50% |
| GROWTH_POTENTIAL | Media tratti 15-35 E no S01-S05 | Tutte le aree 40-60% |
| IN_TRANSIZIONE | GP<21 oppure S15 E no S01-S03 | Fallback generico |
| CRITICAL | Qualsiasi S01-S04 | OK (gia corretto) |

**Azione:** Riscrivere completamente la funzione `determinaProfiloTipoV5()` con i criteri del manuale. Richiede accesso alle sindromi nel punto di chiamata.

---

## 2. FASCE INTERPRETATIVE — SOGLIE ERRATE (CRITICO)

**File:** `src/lib/scoringV5.ts` — funzione `getFasciaInterpretativa()`

Molte soglie non corrispondono al manuale:

| Tratto | Soglia | Manuale V2.0 | Codice Attuale | Errore |
|--------|--------|-------------|----------------|--------|
| ADS | eccellente | 55 | 44 | -11 punti |
| DET | eccellente | 55 | 44 | -11 punti |
| VEN | eccellente | 60 | 70 | +10 punti |
| VEN | buono | 40 | 50 | +10 punti |
| HRM | eccellente | 40 | 30 | -10 punti |
| HRM | buono | 20 | 15 | -5 punti |
| HRM | discreto | 10 | 0 | -10 punti |
| LDR | eccellente | 55 | 44 | -11 punti |
| LDR | buono | 44 | 20 | -24 punti! |
| LDR | discreto | 30 | 0 | -30 punti! |
| COM | eccellente | 40 | 30 | -10 punti |
| COM | buono | 25 | 15 | -10 punti |
| ESP | eccellente | 50 | 60 | +10 punti |
| FIN | eccellente | 50 | 30 | -20 punti! |
| FIN | buono | 30 | 15 | -15 punti! |
| SUC | buono | 50 | 30 | -20 punti! |
| PRI | eccellente | 60 | 70 | +10 punti |
| PRI | buono | 40 | 45 | +5 punti |

**Azione:** Aggiornare tutte le soglie nella mappa `soglie` dentro `getFasciaInterpretativa()`.

---

## 3. SINDROMI — NUMERAZIONE ERRATA (ALTO)

**File:** `src/lib/syndromes.ts`

Il manuale definisce S19 e S20 diversamente dal codice:

| Codice | Manuale V2.0 | Codice Attuale |
|--------|-------------|----------------|
| S19 | RC MOLTO ALTA (RC >= 45) | RC GRAVE (RC <= -29) — Questa e S20! |
| S20 | RC MOLTO BASSA (RC < -29) | Non esiste — implementata come S19 |
| SS6 | Non esiste nel manuale | RC ELEVATA (RC >= 45) — Questa e S19! |

Il codice ha invertito S19 e S20, e ha messo S19 come SS6.

**Azione:**
- Rinominare `checkS19_RCGrave` in `checkS20_RCMoltoBassa` (codice S20, RC<=-29)
- Rinominare `checkSS6_RCElevata` in `checkS19_RCMoltoAlta` (codice S19, RC>=45)
- Spostare S19 tra le sindromi primarie e rimuovere SS6

---

## 4. CROSS PATTERNS — 6 PATTERN MANCANTI (MEDIO)

**File:** `src/lib/crossPatternsV5.ts`

Pattern presenti nel manuale ma assenti nel codice:

| Pattern | Condizione Manuale | Descrizione |
|---------|-------------------|-------------|
| VEN alta + PRI bassi | VEN alta E PRI bassi | Il Venditore Senza Etica: vende bene ma senza principi |
| ORG alta + ESP bassa | ORG alta E ESP bassa | Il Pianificatore Solitario: piani perfetti, nessuno coinvolto |
| AUT alta + PRO bassa | AUT alta E PRO bassa | L'Ambizioso Reattivo: ambizioso ma prende critiche come attacchi |
| ESP alta + ORG bassa + AUT bassa | ESP>49, ORG<26, AUT<30 | L'Avere > Essere: conosce tutti ma senza direzione |
| GP alto (piu alto) + DET bassa | GP = tratto piu alto E DET bassa | Il Non-Affrontatore: non chiude mai le situazioni |
| PRO alta + COM alta + ESP alta | PRO alta, COM alta, ESP alta | Il Costruttore di Relazioni (pattern positivo) |

Pattern con condizioni errate nel codice:

| Pattern Codice | Condizione Codice | Condizione Manuale |
|---------------|------------------|-------------------|
| base_eccellenza | ORG>40, ADS>40, DET>35 | ORG alta + AUT alta + ADS alta (Il Realizzatore) |
| collante_team | PRO>20, COM>15, HRM>10 | PRO alta + COM alta + ESP alta (Costruttore Relazioni) |

**Azione:** Aggiungere i 6 pattern mancanti e correggere le condizioni dei 2 esistenti.

---

## 5. ROLE MATCHING — DISCREPANZE SOGLIE (MEDIO)

**File:** `src/lib/roleMatchingV5.ts`

### Ruoli con soglie errate rispetto al manuale:

**Responsabile Produzione** (Manuale pag. 30-31):

| Tratto | Manuale | Codice |
|--------|---------|--------|
| ORG | > 44 | >= 50 |
| GP | >= 21 | >= 35 |
| ADS | > 44 | >= 45 |
| DET | >= 30 | Non presente |
| PRO | >= 10 | Non presente |
| COM | >= -10 | Non presente |
| RC | > -19 | Non presente |
| PRI | >= 39 | Non presente |
| Disqualifiers | S01-S06, S08, RC<=-19 | Solo ORG<35 e GP<21 |

**Impiegato Amministrativo** (Manuale pag. 31):

| Tratto | Manuale | Codice |
|--------|---------|--------|
| ORG | >= 30 | >= 40 |
| ADS | >= 30 | >= 40 |
| PRO | >= 10 | >= 20 |
| RC | > -19 | <= 65 (max) |
| PRI | >= 30 | Non presente |
| Disqualifiers | S01-S05, S06, S14, RC<=-19 | Solo ORG<25, ADS<25 |

**Operaio/Installatore** (Manuale pag. 31):

| Tratto | Manuale | Codice |
|--------|---------|--------|
| ORG | >= 30 | >= 30 |
| GP | >= 30 | >= 25 |
| PRO | >= 20 | >= 15 |
| Disqualifiers | S01, S02, S06 (varianti a/b/c) | Solo S01, S04 |

**HR Recruiter / Selezionatore** (Manuale pag. 32):

| Tratto | Manuale | Codice |
|--------|---------|--------|
| COM | >= 20 | >= 50 |
| ESP | >= 20 | >= 35 |
| PRO | >= 20 | >= 40 |
| DET | >= 30 | Non presente |
| ORG | >= 30 | >= 35 |
| VEN | >= 20 | Non presente |
| Disqualifiers | S01-S06, S08 | Solo S01, S04, S16 |

**Addetto Marketing** (Manuale pag. 32):

| Tratto | Manuale | Codice |
|--------|---------|--------|
| ORG | >= 30 | Non presente (code has ESP>=45, AUT>=40, PRO>=40) |
| AUT | >= 25 | >= 40 |
| VEN | >= 25 | Non presente |
| ESP | >= 15 | >= 45 |
| Disqualifiers | S01-S04, S06, S15 | Solo ESP<30, RC>55 |

**Responsabile Vendite / Dir. Commerciale / DG** (Manuale pag. 30):
Il manuale definisce un unico ruolo combinato con: ORG>40, AUT>=35, ADS>39, DET>=35, PRI>=45, e PRO>=20 o COM>=30. Il codice ha ruoli separati (Direttore Commerciale e Direttore Generale) con soglie molto diverse.

**Azione:** Aggiornare le soglie di tutti i ruoli con i valori esatti dal manuale. Aggiornare i disqualifier mancanti.

---

## 6. RUOLI EXTRA NON NEL MANUALE (BASSO)

Il codice include 8 ruoli non definiti nel manuale V2.0:
- Direttore Generale
- HR Manager
- Responsabile Tecnico
- Buyer/Acquisti
- Direttore Commerciale
- Capocantiere
- Commerciale Edilizia
- Project Manager
- Assistente di Direzione

Questi ruoli hanno soglie inventate (non validate dal manuale). Non vanno rimossi ma vanno segnalati come "non validati dal Manuale V2.0".

---

## 7. RIEPILOGO MODIFICHE NECESSARIE

| File | Modifica | Priorita |
|------|----------|----------|
| `src/lib/scoringV5.ts` | Riscrivere `determinaProfiloTipoV5()` con criteri manuale | CRITICA |
| `src/lib/scoringV5.ts` | Correggere tutte le soglie in `getFasciaInterpretativa()` | CRITICA |
| `src/lib/syndromes.ts` | Correggere numerazione S19/S20/SS6 | ALTA |
| `src/lib/crossPatternsV5.ts` | Aggiungere 6 pattern mancanti, correggere 2 esistenti | MEDIA |
| `src/lib/roleMatchingV5.ts` | Aggiornare soglie e disqualifier per 6+ ruoli | MEDIA |
| `src/lib/profiloTipoV5Extended.ts` | Aggiornare testi descrittivi per riflettere nuovi criteri | BASSA |

### Cosa e gia corretto e allineato:

- Scoring V5 (scala 0-10, formula normalizzazione, SPECIAL_SCORING)
- 242 domande sincronizzate con database
- Soglie attendibilita (0-1/2-3/4-5 del Manuale V2.0)
- Macro-aree ESSERE/FARE/AVERE (formula di calcolo)
- Logica valli/forza/miglioramento
- Struttura report 10 sezioni
- 15 tratti + CTRL
- Domande di controllo 238-242

---

## 8. IMPATTO POST-IMPLEMENTAZIONE

Dopo le modifiche sara necessario:
1. Ricalcolo batch di tutti i profili (per aggiornare profilo_tipo_v5)
2. Verifica che i report candidato riflettano le nuove fasce
3. Test delle sindromi con profili reali
4. Verifica dei match ruolo con i nuovi disqualifier

