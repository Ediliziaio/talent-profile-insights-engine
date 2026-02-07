

# Piano: Analisi Codebase e Ottimizzazione Performance

## Riepilogo Analisi

Ho completato un'analisi approfondita del codebase identificando:
1. **Codice duplicato** tra file lib
2. **Funzioni esportate ma mai utilizzate**
3. **Pagine molto grandi** che potrebbero causare lentezza
4. **Potenziali ottimizzazioni** per migliorare le performance

---

## 1. Codice Duplicato Identificato

### File: `src/lib/scoring.ts` vs `src/lib/interpretazioneProfile.ts`

| Funzione | scoring.ts | interpretazioneProfile.ts | Usato da |
|----------|-----------|--------------------------|----------|
| `getZonaInterpretazione()` | Linee 280-316 | Linee 18-28 | Solo interpretazioneProfile.ts |
| `ZonaInterpretazione` type | Linea 278 | Linea 16 | Entrambi |

**Problema**: La versione in `scoring.ts` include una proprietà `classe` extra ma non viene mai importata da altri file. Solo la versione in `interpretazioneProfile.ts` è usata (importata da `PDFReportLayout.tsx`).

**Azione**: Rimuovere la funzione duplicata da `scoring.ts` (circa 40 linee)

---

## 2. Funzioni Esportate Mai Utilizzate

### File: `src/lib/scaleTexts.ts`

| Funzione | Linee | Stato |
|----------|-------|-------|
| `getCriticalScaleTexts()` | 699-714 | Definita ma MAI importata |
| `getExcellenceScaleTexts()` | 719-734 | Definita ma MAI importata |

**Azione**: Rimuovere entrambe le funzioni (circa 30 linee totali)

### File: `src/lib/scoring.ts`

| Funzione | Linee | Stato |
|----------|-------|-------|
| `getProfiloTipoDescription()` | 259-274 | Definita ma MAI importata |
| `getScoreColor()` | 227-232 | Definita ma MAI importata |
| `getScoreColorClass()` | 235-240 | Definita ma MAI importata |

**Azione**: Rimuovere le 3 funzioni inutilizzate (circa 25 linee totali)

---

## 3. Pagine con Potenziali Problemi di Performance

### File: `src/pages/Candidati.tsx` (1788 linee)

Questa è la pagina più grande del progetto e potrebbe causare lentezza.

**Problemi identificati**:
- **Query multipla nella stessa pagina**: 4 `useQuery` separate
- **Componenti inline pesanti**: `FiltersContent`, `DateRangePicker` definiti inline
- **Sorting client-side**: `sortedCandidati` ricalcolato ad ogni render
- **Componenti duplicati**: `DateRangePicker` definito come funzione inline invece che come componente separato

**Azioni proposte**:
1. Estrarre `FiltersContent` in componente separato
2. Estrarre `DateRangePicker` in componente separato
3. Memorizzare `sortedCandidati` con `useMemo` (già fatto, ma verificare dipendenze)
4. Considerare paginazione server-side per grandi volumi di dati

### File: `src/pages/CandidatoDettaglio.tsx` (785 linee)

**Stato**: Già pulito nella sessione precedente - rimosso ~110 linee di codice morto

---

## 4. Modifiche Tecniche Dettagliate

### Modifica 1: Pulire `src/lib/scoring.ts`

Rimuovere le seguenti funzioni/tipi non utilizzati:

```typescript
// RIMUOVERE: Linee 227-240
export function getScoreColor(score: number): string { ... }
export function getScoreColorClass(score: number): string { ... }

// RIMUOVERE: Linee 259-274
export function getProfiloTipoDescription(tipo: ProfiloTipo): string { ... }

// RIMUOVERE: Linee 278-316
export type ZonaInterpretazione = ...
export function getZonaInterpretazione(score: number) { ... }
```

**Linee totali rimosse**: ~65

### Modifica 2: Pulire `src/lib/scaleTexts.ts`

Rimuovere le funzioni helper mai usate:

```typescript
// RIMUOVERE: Linee 697-714
export function getCriticalScaleTexts(scalePunteggi: Record<string, number>): ScaleRangeText[] { ... }

// RIMUOVERE: Linee 719-734
export function getExcellenceScaleTexts(scalePunteggi: Record<string, number>): ScaleRangeText[] { ... }
```

**Linee totali rimosse**: ~30

### Modifica 3: Ottimizzare `src/pages/Candidati.tsx`

Estrarre componenti inline in file separati:

**Nuovo file**: `src/components/DateRangePicker.tsx`
- Componente riutilizzabile per selezione range date
- Riduce la dimensione di Candidati.tsx di ~70 linee

**Nuovo file**: `src/components/CandidatiFilters.tsx`
- Estrae `FiltersContent` in componente separato
- Riduce la dimensione di Candidati.tsx di ~200 linee

---

## 5. Riepilogo Impatto

| Metrica | Prima | Dopo |
|---------|-------|------|
| Linee rimosse (codice morto) | 0 | ~95 |
| Funzioni inutilizzate | 6 | 0 |
| Duplicazioni codice | 1 | 0 |
| Componenti estratti | 0 | 2 |
| Dimensione Candidati.tsx | 1788 | ~1520 |

---

## 6. Priorità delle Modifiche

| Priorità | Modifica | Rischio | Impatto |
|----------|----------|---------|---------|
| Alta | Rimuovere funzioni inutilizzate | Basso | Codebase più pulita |
| Alta | Rimuovere duplicazione getZonaInterpretazione | Basso | Manutenibilità |
| Media | Estrarre DateRangePicker | Basso | Performance + Riusabilità |
| Media | Estrarre CandidatiFilters | Medio | Performance |

---

## 7. Verifiche Post-Pulizia

1. **Build senza errori**: `npm run build` deve completarsi senza errori
2. **Test**: Eseguire `npm run test` per verificare che non ci siano regressioni
3. **Pagina Candidati**: Verificare funzionamento filtri e ordinamento
4. **PDFReportLayout**: Verificare che `getZonaInterpretazione` continui a funzionare
5. **Performance**: Misurare tempo di caricamento pagina Candidati prima/dopo

---

## 8. File da Modificare

| File | Azione | Linee Impattate |
|------|--------|-----------------|
| `src/lib/scoring.ts` | Rimuovere 4 funzioni + 1 tipo | ~65 linee |
| `src/lib/scaleTexts.ts` | Rimuovere 2 funzioni | ~30 linee |
| `src/pages/Candidati.tsx` | Estrarre componenti | ~270 linee spostate |
| `src/components/DateRangePicker.tsx` | Nuovo file | ~80 linee |
| `src/components/CandidatiFilters.tsx` | Nuovo file | ~220 linee |

---

## 9. Note sulla Performance

La pagina `Candidati.tsx` con 1788 linee è il principale bottleneck. Le cause della lentezza potrebbero essere:

1. **Query simultanee**: 4 query Supabase in parallelo
2. **Rendering tabella grande**: Nessuna virtualizzazione per liste lunghe
3. **Re-render frequenti**: Molti stati che cambiano insieme
4. **Componenti inline**: Ricreati ad ogni render

**Raccomandazioni aggiuntive** (da valutare in futuro):
- Implementare virtualizzazione con `react-virtual` per tabelle con 100+ righe
- Considerare paginazione server-side per dataset grandi
- Usare `React.memo` per righe della tabella

