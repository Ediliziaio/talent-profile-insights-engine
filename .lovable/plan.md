
# Piano: Verifica Report Sindromi e Pulizia Codebase

## Riepilogo Attività

Questo piano copre due obiettivi:
1. **Verifica funzionalità "Report Sindromi"** - Test manuale del bottone PDF
2. **Pulizia codice inutilizzato** - Rimozione di funzioni e import non più necessari

---

## 1. Verifica Report Sindromi (Test Manuale)

Per verificare il corretto funzionamento del Report Sindromi PDF:

1. **Effettuare login** nel preview con credenziali valide
2. **Navigare a Candidati** → selezionare un candidato V5 con sindromi (es. Marco Rossi)
3. **Verificare visibilità bottone** "Report Sindromi" nell'header con badge numerico
4. **Click sul bottone** → osservare:
   - Stato "Generando..." con spinner
   - Download PDF automatico
5. **Aprire il PDF** e verificare:
   - Pagina 1: Riepilogo con tabella sindromi e livello criticità (LIV 1-8)
   - Pagine 2-N: Dettagli per ogni sindrome RED/ORANGE
   - Pagina finale: Checklist decisionale e spazio note
   - Watermark logo in basso a destra su ogni pagina

---

## 2. Codice Inutilizzato Identificato

### File: `src/pages/CandidatoDettaglio.tsx`

| Linee | Elemento | Problema |
|-------|----------|----------|
| 56-152 | `ExecutiveSummaryCard` | Funzione definita ma MAI utilizzata |
| 155-164 | `mapFitVerdictToExecutive` | Funzione helper MAI chiamata |

**Azione**: Rimuovere entrambe le funzioni (circa 110 linee)

### File: `src/components/PDFExportButton.tsx`

| Linea | Elemento | Problema |
|-------|----------|----------|
| 1 | `useEffect` import | Importato ma mai usato nel file |
| 211 | `containerRef` | Variabile definita nel `PDFReportButton` ma mai utilizzata |

**Azione**: Rimuovere `useEffect` dall'import e la variabile `containerRef`

---

## 3. Modifiche Tecniche Dettagliate

### Modifica 1: Pulire CandidatoDettaglio.tsx

**Prima** (linee 1-165):
```typescript
// ... imports ...

// Executive Summary Component  <-- DA RIMUOVERE
function ExecutiveSummaryCard({ ... }) { ... }  // ~100 linee

// Helper function ...  <-- DA RIMUOVERE
function mapFitVerdictToExecutive(...) { ... }  // ~10 linee

export default function CandidatoDettaglio() { ...
```

**Dopo**:
```typescript
// ... imports ...

export default function CandidatoDettaglio() { ...
```

### Modifica 2: Pulire PDFExportButton.tsx

**Prima** (linea 1):
```typescript
import { useState, useRef, useEffect } from 'react';
```

**Dopo**:
```typescript
import { useState, useRef } from 'react';
```

**Prima** (linea 211):
```typescript
const [isExporting, setIsExporting] = useState(false);
const { toast } = useToast();
const containerRef = useRef<HTMLDivElement | null>(null);  // <-- RIMUOVERE
```

**Dopo**:
```typescript
const [isExporting, setIsExporting] = useState(false);
const { toast } = useToast();
```

---

## 4. Verifica Post-Pulizia

Dopo le modifiche, verificare:

1. **Build senza errori**: Il progetto compila correttamente
2. **CandidatoDettaglio**: Pagina funziona normalmente
3. **ExecutiveSummaryCardV5Updated**: Visualizza dati V5 correttamente
4. **ExecutiveSummaryCardV5**: Fallback V4 funziona
5. **Report PDF**: Tutti i report (Colloquio, Sindromi, Export) funzionano

---

## 5. Stato Attuale dei Componenti

```text
src/components/
├── ExecutiveSummaryCardV5.tsx       ✅ Usato (fallback V4)
├── ExecutiveSummaryCardV5Updated.tsx ✅ Usato (profili V5)
├── PDFExportButton.tsx              ✅ Usato (3 bottoni export)
├── PDFReportLayout.tsx              ✅ Usato (report colloquio)
├── PDFSyndromeReportLayout.tsx      ✅ Usato (report sindromi)
├── RoleMatchingCard.tsx             ✅ Usato (matching V4)
├── RoleMatchingCardV5.tsx           ✅ Usato (matching V5)
├── MacroAreasChartV5.tsx            ✅ Usato (macro-aree)
└── ... altri componenti             ✅ Tutti verificati
```

---

## 6. Impatto delle Modifiche

| Metrica | Prima | Dopo |
|---------|-------|------|
| Linee rimosse | - | ~115 |
| Import inutilizzati | 1 | 0 |
| Variabili non usate | 1 | 0 |
| Funzioni inutilizzate | 2 | 0 |

**Benefici**:
- Codebase più pulita e manutenibile
- Bundle size leggermente ridotto
- Nessun warning ESLint per codice non usato

---

## 7. Riepilogo File da Modificare

| File | Azione |
|------|--------|
| `src/pages/CandidatoDettaglio.tsx` | Rimuovere `ExecutiveSummaryCard` e `mapFitVerdictToExecutive` |
| `src/components/PDFExportButton.tsx` | Rimuovere `useEffect` import e `containerRef` |

Nessun nuovo file da creare. Nessuna modifica alla logica esistente.
