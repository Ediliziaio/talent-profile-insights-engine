

# Aggiunta Narrative Tratti al PDF Premium

## Cosa manca

La sezione "2. Profilo Comportamentale" del PDF contiene attualmente:
- Grafico barre tratti
- Segnalazioni sindromi
- Ruoli compatibili
- Profilo tipo esteso

Ma **non** contiene la narrativa "Chi è [Nome]" — i 4 capitoli con testo descrittivo per ogni tratto, che invece sono presenti nella UI (ProfiloUnificatoTab).

## Cosa aggiungo

Dopo il grafico barre e prima delle sindromi, inserisco una nuova sotto-sezione "Chi è [Nome]" con i 4 capitoli:

1. **Come Pensa** (ORG, AUT, GP) — icona cervello, sfondo blu chiaro
2. **Come Agisce** (ADS, DET, VEN, HRM) — icona fulmine, sfondo ambra chiaro
3. **Come si Relaziona** (LDR, PRO, COM, ESP) — icona persone, sfondo viola chiaro
4. **Stabilità e Principi** (RC, FIN, SUC, PRI) — icona scudo, sfondo grigio chiaro

Per ogni tratto:
- **Nome tratto + punteggio** (badge colorato)
- **Narrativa completa** generata da `getTraitNarrative()`
- **Nota speciale GP** se applicabile (da `getGPSpecialNarrative()`)

Dato che questa sezione sarà molto lunga (15 tratti × testo lungo), la inserisco come **sezione separata** (`data-section="profilo-narrative"`) con un proprio `PageBreak`, così il canvas slicing gestirà correttamente la paginazione.

## Modifiche

### `src/components/PremiumReportPDF.tsx`

1. Aggiungere import di `getTraitNarrative`, `getGPSpecialNarrative` (già importati `personalizzaTesto` e `getFascia`)
2. Dopo la sezione `profilo-tratti` (linea 508) e prima del `PageBreak` verso Gestione, inserire una nuova `<Section id="profilo-narrative">` con:
   - Titolo "Chi è [Nome]"
   - 4 blocchi capitolo, ognuno con sfondo colorato, titolo, sottotitolo
   - Per ogni tratto nel capitolo: nome, badge punteggio, testo narrativo
   - Nota speciale GP se presente

### Design

- Ogni capitolo è un box con bordo sinistro colorato (4px)
- Titolo capitolo: fontSize 12, bold, colore tematico
- Sottotitolo: fontSize 8, caption
- Ogni tratto: header con nome + badge, poi testo narrativo (fontSize 9, interlinea 1.6)
- Nota GP: box ambra con icona ⚠️

