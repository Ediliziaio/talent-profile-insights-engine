
# Piano: Ottimizzazione Performance - Rimozione Codice Obsoleto V4

## Analisi Problemi Identificati

### 1. DUPLICAZIONE COMPONENTI V4/V5

Ci sono componenti duplicati che vengono entrambi caricati ma solo uno viene usato:

| Componente V4 (Legacy) | Componente V5 (Attuale) | File |
|------------------------|-------------------------|------|
| `ExecutiveSummaryCardV5` | `ExecutiveSummaryCardV5Updated` | src/components/ |
| `RoleMatchingCard` | `RoleMatchingCardV5` | src/components/ |

**Problema**: In `CandidatoDettaglio.tsx` entrambe le versioni sono importate, ma solo una viene usata in base a `isV5`:
```typescript
import { RoleMatchingCard } from '@/components/RoleMatchingCard';  // 568 righe
import { RoleMatchingCardV5 } from '@/components/RoleMatchingCardV5';
import { ExecutiveSummaryCardV5 } from '@/components/ExecutiveSummaryCardV5';  // 256 righe
import { ExecutiveSummaryCardV5Updated } from '@/components/ExecutiveSummaryCardV5Updated';
```

### 2. DUPLICAZIONE LOGICA SCORING/MATCHING

| File V4 (Legacy) | File V5 (Attuale) | Righe |
|------------------|-------------------|-------|
| `src/lib/roleMatching.ts` | `src/lib/roleMatchingV5.ts` | ~599 |
| `src/lib/fitScoring.ts` | (incluso in scoringV5) | ~353 |

**Problema**: `roleMatching.ts` contiene scale V4 (0-200) ed è ancora importato in 4 file per fallback V4. Ma dato che tutti i candidati ora usano V5, questo codice è quasi mai eseguito.

### 3. FILE DI DATI MOLTO GRANDI

| File | Righe | Note |
|------|-------|------|
| `src/lib/syndromesV5Data.ts` | 1023 | Contiene tutte le 24 sindromi con testi estesi |
| `src/lib/profiloDetailedDescriptions.ts` | 717 | 10 profili con descrizioni complete |
| `src/lib/profiloDescriptions.ts` | 441 | Versione più vecchia, ancora usata |
| `src/data/questionario.ts` | 219 | 200 domande |

### 4. CODICE ORFANO

| File | Usato in | Note |
|------|----------|------|
| `src/pages/Index.tsx` | Nessuno | Placeholder mai usato, nessuna rotta lo richiama |
| `src/lib/chartMapping.ts` | ? | Da verificare |

---

## Piano di Ottimizzazione

### FASE 1: Rimuovere File/Componenti Non Usati (Priorità ALTA)

1. **Eliminare `src/pages/Index.tsx`**
   - È un placeholder vuoto ("Welcome to Your Blank App")
   - Nessuna rotta lo usa (la home è gestita da `CandidatoRedirect`)

2. **Verificare `src/lib/chartMapping.ts`**
   - Controllare se è ancora usato da qualche componente

### FASE 2: Lazy Loading per File Dati Pesanti (Priorità ALTA)

Convertire i file dati più grandi in lazy imports per evitare che vengano caricati al primo avvio:

```typescript
// Prima (caricato sempre all'avvio)
import { SYNDROMES_V5_DATA } from '@/lib/syndromesV5Data';

// Dopo (caricato solo quando serve)
const getSyndromeData = async (code: string) => {
  const { SYNDROMES_V5_DATA } = await import('@/lib/syndromesV5Data');
  return SYNDROMES_V5_DATA[code];
};
```

### FASE 3: Consolidare Componenti V4/V5 (Priorità MEDIA)

1. **`ExecutiveSummaryCardV5.tsx` può essere rimosso**
   - È usato solo come fallback per candidati V4
   - Con la migrazione completa a V5, `ExecutiveSummaryCardV5Updated` gestisce tutto

2. **`RoleMatchingCard.tsx` può essere rimosso**
   - Stessa logica: il componente V5 gestisce tutto

### FASE 4: Consolidare Logica Matching (Priorità MEDIA)

1. **`src/lib/roleMatching.ts`** - Verificare se ancora necessario
   - Usato da: `ExecutiveSummaryCardV5.tsx`, `SintesiFinaleCard.tsx`, `fitScoring.ts`
   - Se tutti i candidati sono V5, questo file può essere rimosso

2. **`src/lib/fitScoring.ts`** - Potrebbe essere integrato in `roleMatchingV5.ts`
   - Usato solo da `ExecutiveSummaryCardV5.tsx` e `ExecutiveSummaryCardV5Updated.tsx`

### FASE 5: Ottimizzare Imports in CandidatoDettaglio (Priorità ALTA)

Il file `CandidatoDettaglio.tsx` importa TUTTO:
- Entrambe le versioni V4 e V5 dei componenti
- Tutti i tipi di layout
- Tutte le funzioni di scoring

**Soluzione**: Dynamic imports per i componenti V4:
```typescript
// Solo quando isV5 è false, carica i componenti legacy
const LegacyCard = isV5 ? null : await import('./LegacyCard');
```

---

## File da Eliminare

| File | Motivo | Impatto Bundle |
|------|--------|----------------|
| `src/pages/Index.tsx` | Mai usato | Minimo |
| `src/components/ExecutiveSummaryCardV5.tsx` | Sostituito da V5Updated | ~256 righe |
| `src/components/RoleMatchingCard.tsx` | Sostituito da V5 | ~568 righe |
| `src/lib/roleMatching.ts` | Sostituito da roleMatchingV5 | ~599 righe |
| `src/lib/fitScoring.ts` | Logica integrata in V5 | ~353 righe |

**Totale righe eliminabili**: ~1800 righe di codice legacy

---

## File da Modificare

1. **`src/pages/CandidatoDettaglio.tsx`**
   - Rimuovere imports V4
   - Usare solo componenti V5

2. **`src/pages/Candidati.tsx`**
   - Rimuovere import `getProfiloTipoLabel` da `scoring.ts`
   - Usare `getProfiloTipoV5Label` da `scoringV5.ts`

3. **`src/components/CandidatoDrawer.tsx`**
   - Stessa modifica per label profilo

4. **`src/components/SintesiFinaleCard.tsx`**
   - Sostituire import da `roleMatching.ts` con `roleMatchingV5.ts`

---

## Risultato Atteso

- Riduzione bundle size: ~15-20%
- Tempo di caricamento iniziale: -1-2 secondi
- Meno complessità nel codice
- Un solo percorso di rendering (V5 only)

---

## Ordine di Implementazione

1. Eliminare `Index.tsx` (impatto zero, cleanup)
2. Aggiornare imports in `CandidatoDettaglio.tsx` per usare solo V5
3. Eliminare `ExecutiveSummaryCardV5.tsx` e `RoleMatchingCard.tsx`
4. Eliminare `roleMatching.ts` e `fitScoring.ts`
5. Aggiornare `Candidati.tsx` e `CandidatoDrawer.tsx`
6. Testare che tutto funzioni correttamente
