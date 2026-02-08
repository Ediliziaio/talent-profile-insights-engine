

# Piano di Verifica Completa: Sistema V5 e Sincronizzazione

## Stato Attuale del Sistema

### Questionario

| Componente | Stato | Note |
|------------|-------|------|
| File `questionario.ts` | ✅ 242 domande | Sincronizzato con V5 |
| Database `domande` | ✅ 242 domande | Correttamente mappato |
| Scoring Engine | ✅ `scoringV5.ts` | Calcolo corretto |
| Submit Logic | ✅ Usa `calcolaProfiloV5` | Salva `assessment_version: 'v5'` |

### Ruoli Configurati

| N. | Ruolo | Presente in `ROLE_PROFILES_V5` |
|----|-------|-------------------------------|
| 1 | Responsabile Amministrativo | ✅ |
| 2 | Venditore/Commerciale | ✅ |
| 3 | Customer Care | ✅ |
| 4 | Direttore Generale | ✅ |
| 5 | HR Manager | ✅ |
| 6 | Marketing Manager | ✅ |
| 7 | Responsabile Tecnico | ✅ |
| 8 | Buyer/Acquisti | ✅ |
| 9 | Responsabile Produzione/Logistica | ✅ |
| 10 | Direttore Commerciale | ✅ |
| 11 | Capocantiere | ✅ |
| 12 | Commerciale Edilizia | ✅ |
| 13 | HR Recruiter | ✅ |
| 14 | Impiegato Amministrativo | ✅ |
| 15 | Operaio/Installatore | ✅ |
| 16 | Project Manager | ✅ |
| 17 | Assistente di Direzione | ✅ |

**Totale: 17 ruoli ✅**

L'export `RUOLI_V5 = Object.keys(ROLE_PROFILES_V5)` genera dinamicamente la lista di tutti i ruoli.

### Distribuzione Domande per Tratto (dal Database)

| Tratto | Conteggio | Polarità |
|--------|-----------|----------|
| ADS | 21 | 9 negative, 12 positive |
| AUT | 22 | 7 neg, 14 pos, 1 special |
| COM | 16 | 4 neg, 12 pos |
| CTRL | 5 | 5 controllo |
| DET | 19 | 6 neg, 13 pos |
| ESP | 13 | 7 neg, 6 pos |
| FIN | 14 | 3 neg, 7 pos, 4 special |
| GP | 17 | 16 neg, 1 pos |
| HRM | 7 | 2 neg, 5 pos |
| LDR | 11 | 1 neg, 10 pos |
| ORG | 12 | 2 neg, 10 pos |
| PRI | 17 | 8 neg, 9 pos |
| PRO | 16 | 12 neg, 4 pos |
| RC | 17 | 1 neg, 16 pos |
| SUC | 16 | 2 neg, 13 pos, 1 special |
| VEN | 19 | 4 neg, 15 pos |

**Totale: 242 domande ✅**

---

## Problemi Identificati e Azioni Correttive

### 1. Domande CTRL - Allineamento con Manuale V2

Il manuale specifica le domande CTRL con risposte "trappola":

| ID | Manuale V2 | File Attuale |
|----|------------|--------------|
| 238 | "A volte hai dovuto dire una bugia?" | "Stai rispondendo a questo questionario con attenzione?" |
| 239 | "Hai mai conosciuto una persona antipatica?" | "Hai letto questa domanda prima di rispondere?" |
| 240 | "Qualche volta ti capita di pensare a cose che poi non dici?" | "È vero che oggi non è ieri?" |
| 241 | "Qualche volta hai l'impressione di parlare troppo?" | "Sei una persona che esiste fisicamente?" |
| 242 | "Qualche volta ti capita di avere pensieri critici riguardo a qualcuno?" | "Stai compilando questo questionario in questo momento?" |

**Problema**: Le domande 238-242 nel file locale NON corrispondono al manuale V2.

**Azione**: Aggiornare le 5 domande CTRL in `questionario.ts` con i testi corretti dal manuale.

---

### 2. Domande con Scoring Speciale - Verifica Mappatura

Il manuale specifica scoring speciale per le domande:

| ID | Tratto | Descrizione | Presente |
|----|--------|-------------|----------|
| 72 | SUC | Età primo guadagno | ✅ |
| 73 | FIN | % risparmio | ✅ |
| 211 | FIN | Tempo investimenti | ✅ |
| 212 | FIN | Riserve finanziarie | ✅ |
| 213 | FIN | Autonomia finanziaria | ✅ |
| 228 | AUT | Potenziale successo | ✅ |

Tutti configurati in `SPECIAL_SCORING` di `scoringV5.ts`.

---

### 3. Allineamento Punteggi Massimi con Manuale

Il manuale V2 specifica:

| Tratto | Manuale | `TRAIT_MAX_SCORES` | Status |
|--------|---------|-------------------|--------|
| ORG | 16 dom = 160 | 120 (12 dom) | ⚠️ Disallineato |
| AUT | 18 dom = 180 | 220 (22 dom) | ⚠️ Disallineato |
| GP | 18 dom = 180 | 170 (17 dom) | ⚠️ Disallineato |
| ADS | 18 dom = 180 | 210 (21 dom) | ⚠️ Disallineato |
| DET | 16 dom = 160 | 190 (19 dom) | ⚠️ Disallineato |
| VEN | 16 dom = 160 | 190 (19 dom) | ⚠️ Disallineato |
| HRM | 8 dom = 80 | 70 (7 dom) | ⚠️ Disallineato |
| LDR | 12 dom = 120 | 110 (11 dom) | ⚠️ Disallineato |
| PRO | 14 dom = 140 | 160 (16 dom) | ⚠️ Disallineato |
| COM | 14 dom = 140 | 160 (16 dom) | ⚠️ Disallineato |
| ESP | 14 dom = 140 | 130 (13 dom) | ⚠️ Disallineato |
| RC | 16 dom = 160 | 170 (17 dom) | ⚠️ Disallineato |
| FIN | 14 dom = 140 | 140 (14 dom) | ✅ OK |
| SUC | 12 dom = 120 | 160 (16 dom) | ⚠️ Disallineato |
| PRI | 14 dom = 140 | 170 (17 dom) | ⚠️ Disallineato |

**Problema**: I punteggi massimi nel codice sono basati sul conteggio effettivo nel database, che differisce dal manuale.

**Nota**: Il codice attuale sembra usare i conteggi reali del database (242 domande totali), mentre il manuale specifica conteggi diversi. Questo potrebbe essere intenzionale se il database contiene la versione aggiornata del questionario.

**Azione Consigliata**: Verificare con il cliente se:
- Il database rappresenta la versione corretta e aggiornata
- Oppure il manuale V2 e il codice devono essere riallineati

---

## Test End-to-End Richiesti

### Test 1: Verifica Questionario 242 Domande

1. Accedere come candidato con test non completato
2. Navigare nel questionario
3. Verificare che mostri "Dom. X-Y di 242"
4. Verificare che tutte le 242 domande siano navigabili
5. Verificare che le domande 201-242 (indicatori avanzati e CTRL) siano presenti

### Test 2: Verifica Salvataggio V5

1. Completare il questionario come candidato
2. Verificare che `profili_candidato` contenga:
   - `assessment_version = 'v5'`
   - `traits_v5` con tutti i 15 tratti
   - `essere_pct`, `fare_pct`, `avere_pct`
   - `syndromes_detected` se applicabili
   - `reliability_index`

### Test 3: Verifica 17 Ruoli nella UI

1. Accedere alla pagina dettaglio candidato con profilo V5
2. Navigare alla tab "Match"
3. Aprire l'accordion "Compatibilita Tutti i Ruoli"
4. Verificare che siano elencati tutti e 17 i ruoli

---

## Riepilogo Modifiche da Implementare

### Priorita Alta

1. **Aggiornare domande CTRL (238-242)** in `questionario.ts` con i testi corretti dal manuale V2:
   - 238: "A volte hai dovuto dire una bugia?"
   - 239: "Hai mai conosciuto una persona antipatica?"
   - 240: "Qualche volta ti capita di pensare a cose che poi non dici?"
   - 241: "Qualche volta hai l'impressione di parlare troppo?"
   - 242: "Qualche volta ti capita di avere pensieri critici riguardo a qualcuno?"

2. **Sincronizzare database `domande`** con le domande CTRL corrette

### Priorita Media

3. **Verificare e allineare `TRAIT_MAX_SCORES`** in `scoringV5.ts` con il conteggio reale delle domande per tratto nel database

### Verifiche

4. Test end-to-end del flusso questionario completo
5. Verifica visibilita 17 ruoli nella pagina dettaglio candidato

---

## Sezione Tecnica

### Architettura Scoring V5

Il sistema segue questa pipeline:

```text
Risposte (242)
      |
      v
calcolaPunteggioRisposta()
  - Polarita '+' : A=10, B=5, C=0
  - Polarita '-' : A=0, B=5, C=10
  - Polarita 'S' : SPECIAL_SCORING[id]
  - Polarita 'C' : Solo conteggio inattese
      |
      v
calcolaPunteggioGrezzoTraito()
  - Somma punti per ogni tratto
      |
      v
normalizzaPunteggio()
  - Formula: ((raw/max) * 200) - 100
  - Range: -100 / +100
      |
      v
calcolaMacroAree()
  - ESSERE = ((ORG+AUT+GP+300)/600)*100
  - FARE = ((ADS+DET+VEN+HRM+400)/800)*100
  - AVERE = ((LDR+PRO+COM+ESP+400)/800)*100
      |
      v
getActiveSyndromes()
  - Verifica S01-S18 e SS1-SS6
      |
      v
determinaProfiloTipoV5()
  - LEADER / STRATEGIST / EXECUTOR / etc.
```

### Mappatura Ruoli - Disqualifier

Ogni ruolo ha:
- **Requisiti minimi** per tratto (con flag `isCritical`)
- **Disqualifier** (sindromi e soglie bloccanti)
- **Domande colloquio** suggerite

Il verdetto finale e:
- `IDONEO`: Tutti requisiti OK, nessun disqualifier
- `IDONEO_CON_RISERVA`: Requisiti critici OK, qualche warning
- `DA_VALUTARE`: Alcuni requisiti mancanti ma nessun blocking
- `NON_IDONEO`: Disqualifier blocking attivo o troppi requisiti critici mancanti

