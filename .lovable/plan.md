

# Rimozione "Report Sindromi" e "Report Colloquio" dai PDF

## Cosa viene rimosso

Il candidato dettaglio attualmente mostra 4 pulsanti PDF nel header (desktop):
1. **Report Colloquio** (`PDFReportButton`) -- DA RIMUOVERE
2. **Report Sindromi** (`PDFSyndromeReportButton`) -- DA RIMUOVERE
3. **Scheda Colloquio** (`InterviewSheetPDFButton`) -- resta
4. **Scarica PDF** (`PDFExportButton`) -- resta

## Modifiche

### 1. `src/pages/CandidatoDettaglio.tsx`
- Rimuovere l'import di `PDFReportButton` e `PDFSyndromeReportButton`
- Rimuovere il blocco `<PDFReportButton .../>` (linee 183-196)
- Rimuovere il blocco condizionale `{isV5 && syndromes.length > 0 && <PDFSyndromeReportButton .../>}` (linee 197-206)
- Rimuovere le variabili usate solo da questi componenti se non servono altrove (verifico: `profiloTipo`, `scalePunteggi`, `stressZone`, `schematicita` sono usati anche da altri componenti, quindi restano)

### 2. `src/components/PDFExportButton.tsx`
- Rimuovere `PDFReportButton` (linee 18-347): interfaccia, funzione, export
- Rimuovere `PDFSyndromeReportButton` (linee 349-512): interfaccia, funzione, export
- Rimuovere gli import non piu necessari: `PDFReportLayout`, `PDFSyndromeReportLayout`, `ProfiloTipo`, `SyndromeResult` (se non usati da InterviewSheetPDFButton -- `SyndromeResult` e usato da InterviewSheetPDFButton, quindi resta)
- Rimuovere import `ProfiloTipo` (usato solo da PDFReportButton)

### 3. File da eliminare (codice morto)
- `src/components/PDFReportLayout.tsx` -- usato solo da PDFReportButton
- `src/components/PDFSyndromeReportLayout.tsx` -- usato solo da PDFSyndromeReportButton

### 4. Import cleanup in CandidatoDettaglio
- Rimuovere variabili/import non piu necessari dopo la rimozione (es. `ProfiloTipo` se non usato altrove nel file -- verifico: `profiloTipo` e tipizzato come `ProfiloTipo` alla linea 89, ma con la rimozione di PDFReportButton non serve piu passarlo. Tuttavia `profiloTipo` e ancora definito alla linea 89 e potrebbe essere usato altrove -- controllo: non e usato in nessun altro componente nel file. Lo rimuovo.)

## Cosa resta invariato
- `PDFExportButton` (Scarica PDF generico dalla pagina)
- `InterviewSheetPDFButton` (Scheda Colloquio)
- Tutti i tab, hero card, alert banner, gestione avanzata, etc.

