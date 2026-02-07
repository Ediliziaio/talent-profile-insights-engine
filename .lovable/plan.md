

# Piano: Analisi Codebase e Ottimizzazione Performance

## Riepilogo Analisi

Ho analizzato il codebase verificando lo stato dopo le pulizie precedenti. Ecco lo stato attuale:

---

## Stato Attuale - Pulizie GIÀ Completate

Le seguenti ottimizzazioni sono già state applicate:

| File | Stato |
|------|-------|
| `src/lib/scoring.ts` | Pulito - rimossi `getScoreColor`, `getScoreColorClass`, `getProfiloTipoDescription`, `getZonaInterpretazione` |
| `src/lib/scaleTexts.ts` | Pulito - rimossi `getCriticalScaleTexts`, `getExcellenceScaleTexts` |
| `src/pages/CandidatoDettaglio.tsx` | Pulito - rimossi `ExecutiveSummaryCard` inline e `mapFitVerdictToExecutive` |
| `src/components/PDFExportButton.tsx` | Pulito - rimosso `useEffect` inutilizzato e `containerRef` |
| `src/components/DateRangePicker.tsx` | Estratto correttamente |
| `src/components/CandidatiFilters.tsx` | Estratto correttamente |

---

## Problema Identificato: Performance `sortedCandidati`

Nel file `src/pages/Candidati.tsx` (linee 547-568), la variabile `sortedCandidati` viene calcolata inline senza `useMemo`:

```typescript
// PROBLEMA: ricalcolato ad ogni render
const sortedCandidati = candidati ? [...candidati].sort((a, b) => {
  // ... logica sorting
}) : [];
```

Questa logica dovrebbe essere wrappata in `useMemo` per evitare ri-calcoli inutili.

### Modifica Proposta

**Prima:**
```typescript
const sortedCandidati = candidati ? [...candidati].sort((a, b) => {
  // ... sorting logic
}) : [];
```

**Dopo:**
```typescript
const sortedCandidati = useMemo(() => {
  if (!candidati) return [];
  return [...candidati].sort((a, b) => {
    // ... sorting logic
  });
}, [candidati, sortField, sortOrder]);
```

---

## Funzioni V5 Non Utilizzate (Mantenere per Ora)

In `src/lib/scoringV5.ts` ci sono 5 funzioni esportate ma non ancora importate:

| Funzione | Linee | Stato |
|----------|-------|-------|
| `getScoreColorV5` | 440-445 | Definita, non usata |
| `getScoreClassV5` | 450-455 | Definita, non usata |
| `getFasciaInterpretativa` | 460-497 | Definita, non usata |
| `getProfiloTipoV5Description` | 512-524 | Definita, non usata |
| `getReliabilityBadge` | 528-545 | Definita, non usata |

**RACCOMANDAZIONE**: NON rimuovere queste funzioni. Sono helper per la visualizzazione V5 e potrebbero essere necessarie quando si implementano nuove UI per i profili V5. La loro rimozione ora potrebbe richiedere riscrittura in futuro.

---

## Riepilogo Modifiche da Fare

| File | Modifica | Priorità |
|------|----------|----------|
| `src/pages/Candidati.tsx` | Wrappare `sortedCandidati` in `useMemo` | Alta |

---

## Verifica Performance

La pagina `Candidati.tsx` ora ha:
- 1595 linee (ridotte da 1788)
- Componenti estratti (`DateRangePicker`, `CandidatiFilters`)
- Statistiche con `useMemo` (linea 629)

L'unico problema rimasto è il sorting che non usa `useMemo`.

---

## Test da Eseguire Post-Modifica

1. Aprire pagina Candidati e verificare caricamento veloce
2. Testare ordinamento colonne (non deve causare lag)
3. Testare filtri (devono rispondere immediatamente)
4. Verificare che il Report Sindromi PDF funzioni ancora

---

## Nessun Errore Rilevato nei Log

I log della console e le richieste di rete non mostrano errori. L'applicazione è stabile.

