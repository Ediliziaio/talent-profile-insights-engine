
# Piano di Pulizia, Fix e Ottimizzazione UX - TalentProfile V5

## Analisi Eseguita

Ho analizzato l'intero codebase, il database, i log console, le network requests e il flusso utente. Di seguito il piano dettagliato per la pulizia, correzione bug e miglioramenti UX.

---

## 1. CODICE NON UTILIZZATO DA RIMUOVERE

### File Legacy Completamente Inutilizzati

| File | Motivo | Impatto |
|------|--------|---------|
| `src/lib/scoring.ts` | Codice V4 legacy. La funzione `calcolaProfilo()` non e importata da nessun file. Solo `scoring.ts` stesso usa le sue funzioni. | Rimuovere completamente (~220 righe) |

**Verifica effettuata**: Ho cercato `from '@/lib/scoring'` e `calcolaProfilo(` nel codebase - nessun import esterno trovato.

### Import Inutili da Pulire

| File | Import da Rimuovere | Note |
|------|---------------------|------|
| `src/pages/Candidati.tsx` | `DateRangePicker` (riga 11) | Gia importato tramite CandidatiFilters |
| `src/lib/scoring.ts` | Intero file | Legacy V4, nessun utilizzo |

---

## 2. FIX FUNZIONALI (BUG IDENTIFICATI)

### Bug Critici

#### 2.1 Warning Console: postMessage Origin
**Problema**: 4 warning sulla console relativi a `postMessage` con origin mismatch.
**Causa**: Comunicazione iframe Lovable, non e un bug del progetto.
**Azione**: Nessuna azione richiesta, warning di sistema.

#### 2.2 Gestione Candidati Senza Risposte di Controllo (Legacy)
**Problema**: I candidati legacy (pre-V5) hanno solo 200 risposte, non le 5 domande di controllo (238-242).
**Impatto**: La funzione `calcolaAttendibilita()` conta come "inattese" le risposte mancanti.
**Fix proposto**: Modificare la logica per gestire candidati con <242 risposte:

```typescript
// In scoringV5.ts - calcolaAttendibilita()
export function calcolaAttendibilita(risposte: RispostaInputV5[]): {
  index: ReliabilityIndex;
  unexpectedCount: number;
} {
  let unexpectedCount = 0;
  let answeredControlQuestions = 0;
  
  for (const questionId of CONTROL_QUESTIONS) {
    const risposta = risposte.find(r => r.domanda_id === questionId);
    if (risposta) {
      answeredControlQuestions++;
      if (risposta.valore !== 'A') {
        unexpectedCount++;
      }
    }
  }
  
  // Se nessuna domanda di controllo risposta (legacy), ritorna CAUTION
  if (answeredControlQuestions === 0) {
    return { index: 'CAUTION', unexpectedCount: 0 };
  }
  
  // Soglie Manuale V2.0 (basate sulle domande effettivamente risposte)
  if (unexpectedCount <= 1) {
    return { index: 'YES', unexpectedCount };
  } else if (unexpectedCount <= 3) {
    return { index: 'CAUTION', unexpectedCount };
  } else if (unexpectedCount <= 5) {
    return { index: 'NO', unexpectedCount };
  } else {
    return { index: 'ZERO', unexpectedCount };
  }
}
```

#### 2.3 Validazione Form Anagrafico
**Problema**: La validazione client-side nel form anagrafico non usa gli schemi Zod centralizzati.
**File**: `src/pages/FormAnagrafico.tsx`
**Fix**: Integrare `formAnagraficoSchema` da `validationSchemas.ts` con react-hook-form.

---

## 3. MIGLIORAMENTI UX ESPERIENZIALE

### 3.1 Feedback Visivo Durante Salvataggio Risposte
**Stato attuale**: Il componente `AnswerButton` ha `animate-pulse` su `isSaving`, ma la transizione potrebbe essere piu evidente.
**Miglioramento**: Aggiungere micro-feedback con checkmark animato dopo salvataggio.

### 3.2 Progress Bar Questionario
**Stato attuale**: Barra di progresso funzionante.
**Miglioramento**: Aggiungere colore gradient piu evidente e label con stima tempo rimanente.

### 3.3 Transizioni tra Pagine
**Stato attuale**: `animate-in fade-in-50 slide-in-from-bottom-1` sulle card domande.
**Verifica**: Transizioni fluide gia implementate.

### 3.4 Loading States
**Stato attuale**: Skeleton loading implementati per tutte le pagine principali.
**Verifica**: `QuestionarioSkeleton`, `CandidatiSkeleton`, `DashboardSkeleton` funzionanti.

### 3.5 Sticky Footer Questionario
**Stato attuale**: Footer sticky con navigazione implementato.
**Verifica**: Funziona correttamente con `safe-area-bottom` per dispositivi con notch.

---

## 4. VERIFICHE FINALI

### Smoke Test Percorso Candidato
1. `/auth` - Login candidato
2. `/test/anagrafica` - Form dati anagrafici
3. `/test/privacy` - Consenso privacy
4. `/test/questionario` - 242 domande (12+ pagine)
5. `/test/completato` - Conferma completamento

### Responsiveness
- Mobile first design verificato
- Touch targets >= 44px su tutti i bottoni
- Layout grid responsive (2 cols mobile, 4 cols desktop)

### Performance
- Lazy loading implementato per tutte le pagine pesanti
- React Query con cache 5 minuti
- useMemo su operazioni di sorting/filtering pesanti

---

## 5. RIEPILOGO MODIFICHE

### File da Eliminare

| File | Righe | Motivo |
|------|-------|--------|
| `src/lib/scoring.ts` | 221 | Legacy V4, nessun utilizzo |

### File da Modificare

| File | Modifica | Priorita |
|------|----------|----------|
| `src/lib/scoringV5.ts` | Fix attendibilita candidati legacy | ALTA |
| `src/pages/FormAnagrafico.tsx` | Integrare validazione Zod | MEDIA |
| `src/pages/Candidati.tsx` | Rimuovere import duplicato DateRangePicker | BASSA |

### Nessuna Modifica Necessaria

| Area | Stato |
|------|-------|
| Questionario 242 domande | OK - sincronizzato con DB |
| Soglie attendibilita | OK - allineate a Manuale V2.0 |
| Funzioni dropdown | OK - 9 funzioni presenti |
| Skeleton loading | OK - implementati |
| Error handling | OK - ErrorBoundary + retry logic |
| Mobile UX | OK - touch targets, safe areas |

---

## 6. DETTAGLI TECNICI

### Struttura Domande V5

Il file `src/data/questionario.ts` contiene tutte le 242 domande sincronizzate:
- Blocco 1-200: Questionario base
- Blocco 201-237: Approfondimenti VEN, FIN, SUC, AUT, PRI
- Blocco 238-242: Domande di controllo (CTRL)

### Scoring V5 Verificato

La funzione `calcolaProfiloV5()` in `scoringV5.ts`:
- Usa scala 0-10 (A=10, B=5, C=0)
- Gestisce polarita SPECIAL per domande 72, 73, 211-213, 228
- Normalizza a range -100/+100
- Calcola macro-aree ESSERE/FARE/AVERE
- Determina profilo tipo V5

### Edge Function Sincronizzata

`batch-ricalcolo-v5` e stato aggiornato per usare:
- Scala 0-10 invece di 0-2
- SPECIAL_SCORING per domande speciali
- TRAIT_MAX_SCORES per normalizzazione corretta
- Soglie attendibilita V2.0

---

## 7. CONFERMA TEST FINALE

Prima di confermare "TUTTO OK", eseguiro:

1. **Test Questionario**: Navigazione completa 242 domande
2. **Test Scoring**: Verifica calcolo punteggi V5
3. **Test Attendibilita**: Verifica soglie 0-1/2-3/4-5
4. **Test Mobile**: Verifica responsiveness e touch targets
5. **Console Check**: Verifica assenza errori JavaScript

---

## OUTPUT ATTESO

Dopo implementazione:

| Metrica | Prima | Dopo |
|---------|-------|------|
| File legacy | 1 | 0 |
| Import inutili | 1 | 0 |
| Bug attendibilita legacy | 1 | 0 |
| Warning console (progetto) | 0 | 0 |
| Copertura validazione | Parziale | Completa |

**Stima impatto bundle**: -3KB circa (rimozione scoring.ts legacy)
