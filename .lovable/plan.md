

# Fix: Contenuto PDF che sfora oltre header/footer

## Problema

Quando una sezione e piu alta di una pagina A4, il codice attuale (linee 188-201 di `PremiumReportPDFButton.tsx`) ri-aggiunge l'intera immagine con un offset Y negativo per mostrare la continuazione. Ma `jsPDF.addImage()` **non fa clipping** — l'immagine viene renderizzata per intero, sforando sia nell'area header che nell'area footer. Questo e esattamente quello che si vede negli screenshot: testo che arriva fino in fondo, sovrapposto al footer, e che continua sopra l'header nella pagina successiva.

## Soluzione

Sostituire l'approccio "immagine intera con offset negativo" con un sistema di **clipping rettangolare** usando le API native di jsPDF (`rect` + `clip`). Per ogni "fetta" di pagina:

1. Salvare il contesto grafico (`pdf.internal.getCanvas().getContext` → no, jsPDF usa `doc.save()`)
2. Definire un rettangolo di clipping che copre solo l'area utile (da `headerH` a `pdfH - footerH`)
3. Aggiungere l'immagine con l'offset negativo (come prima)
4. Il clipping impedisce al contenuto di invadere header/footer

In pratica, il pattern jsPDF per clipping e:

```typescript
// Save graphics state
const ctx = pdf.context2d; // not available in jsPDF directly
```

Dato che jsPDF non ha un API di clipping nativa semplice, l'approccio migliore e **tagliare il canvas in sotto-canvas** (uno per pagina) prima di aggiungerli al PDF. Questo garantisce che ogni immagine aggiunta sia esattamente della dimensione giusta.

### Approccio: Canvas Slicing

Per ogni sezione che sfora:

```
canvas originale (es. 3000px di altezza)
  ↓
Calcolo quanti pixel corrispondono a usableH in mm
  ↓
Taglio il canvas in fette (slice1: 0→maxPx, slice2: maxPx→2*maxPx, ecc.)
  ↓
Ogni fetta diventa un'immagine separata, alta esattamente quanto lo spazio disponibile
  ↓
Ogni fetta va su una pagina diversa, posizionata a Y=headerH
```

### Modifiche in `src/components/PremiumReportPDFButton.tsx`

Riscrivere il blocco linee 159-208 (il loop delle sezioni) con questa logica:

```typescript
for (let i = 0; i < sections.length; i++) {
  const section = sections[i] as HTMLElement;
  const sectionId = section.getAttribute('data-section');
  const isCover = sectionId === 'cover';

  const canvas = await html2canvas(section, { scale: 2, ... });
  
  const ratio = contentW / canvas.width;
  const scaledH = canvas.height * ratio;
  const maxContentH = isCover ? pdfH : usableH;
  
  // How many pixels of canvas correspond to one page of usable space
  const pxPerPage = maxContentH / ratio;
  
  if (scaledH <= maxContentH) {
    // Fits on one page — add normally
    if (i > 0) { pdf.addPage(); currentPage++; }
    const yOffset = isCover ? 0 : headerH;
    pdf.addImage(imgData, 'JPEG', margin, yOffset, contentW, scaledH);
    addHeaderFooter(currentPage, isCover);
  } else {
    // Need multiple pages — slice the canvas
    let srcY = 0;
    let isFirstSlice = true;
    
    while (srcY < canvas.height) {
      const sliceH = Math.min(pxPerPage, canvas.height - srcY);
      
      // Create sub-canvas for this slice
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceH;
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      
      const sliceImg = sliceCanvas.toDataURL('image/jpeg', 0.92);
      const sliceScaledH = sliceH * ratio;
      
      if (!isFirstSlice || i > 0) {
        pdf.addPage();
        currentPage++;
      }
      
      const yOffset = isCover && isFirstSlice ? 0 : headerH;
      pdf.addImage(sliceImg, 'JPEG', margin, yOffset, contentW, sliceScaledH);
      addHeaderFooter(currentPage, isCover && isFirstSlice);
      
      srcY += sliceH;
      isFirstSlice = false;
    }
  }
}
```

Questo approccio:
- Taglia fisicamente il canvas in fette della dimensione giusta
- Ogni fetta e un'immagine indipendente che non puo sforare
- Header e footer sono sempre visibili e mai coperti
- Nessuna sovrapposizione tra contenuto e aree riservate

