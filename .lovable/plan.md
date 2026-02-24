

# Fix Pagine Bianche nel PDF Premium

## Diagnosi

Le pagine bianche/quasi vuote (pagine 4, 10, 12, 14 in entrambi i PDF) sono causate dalla logica di slicing nel file `PremiumReportPDFButton.tsx`.

Quando una sezione HTML è leggermente più alta di una pagina A4 (es. 275mm + 5mm di padding), il canvas viene tagliato in 2 slice:
- Slice 1: pagina piena di contenuto
- Slice 2: pochi pixel di padding/testo residuo (es. "del profilo. Intervento prioritario.")

Questo produce una pagina quasi vuota con solo header, footer e una riga di testo.

## Soluzione

Aggiungere un **filtro sulla dimensione minima dell'ultimo slice** nel loop di slicing. Se l'ultimo slice è inferiore all'8% dell'altezza di una pagina, viene scartato. I pochi pixel di contenuto persi sono padding o frasi di chiusura già visibili nella pagina precedente.

### File: `src/components/PremiumReportPDFButton.tsx`

**Modifica nel loop di slicing (linee 200-226)** — aggiungere check prima di creare lo slice:

```typescript
// Nel while loop, prima di creare lo slice canvas:
while (srcY < canvas.height) {
  const remainingH = canvas.height - srcY;
  const sliceH = Math.min(pxPerPage, remainingH);

  // Skip last slice if it's too small (< 8% of page = just padding/overflow)
  if (remainingH < pxPerPage * 0.08 && srcY > 0) {
    break;  // Don't create a near-empty page
  }

  // ... rest of slicing logic unchanged
}
```

**Anche il conteggio totalPages deve usare la stessa logica (linee 152-164)**:

```typescript
// Nella sezione "Count total pages"
const pxPerPage = maxContentH / ratio;
const effectiveHeight = canvas.height;
let pages = Math.ceil(effectiveHeight / pxPerPage);
// If last slice would be < 8%, don't count it
const lastSliceH = effectiveHeight - (pages - 1) * pxPerPage;
if (pages > 1 && lastSliceH < pxPerPage * 0.08) {
  pages -= 1;
}
totalPages += pages;
```

## Impatto

- Elimina 4 pagine bianche/quasi vuote per report
- Elena: da 23 a 19 pagine
- Florin: da 22 a 18 pagine
- Zero regressioni: la soglia dell'8% equivale a ~22mm, sufficiente per catturare qualsiasi contenuto reale ma abbastanza bassa da filtrare padding e overflow di 1-2 righe
- La numerazione "Pagina X di Y" si aggiorna automaticamente perché il conteggio usa la stessa logica

