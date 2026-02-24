

# Riprogettazione completa "Scarica PDF" — Report Premium Multi-Pagina

## Analisi dello stato attuale

Il pulsante "Scarica PDF" attualmente esegue un `html2canvas` del `reportRef` (il div che contiene HeroCard + AlertBanner + Tabs), producendo uno screenshot rasterizzato che viene impaginato su A4. Risultato: qualita bassa, grafici sfocati, nessuna struttura, sezioni spezzate a meta, nessuna copertina.

## Architettura proposta

Creare un **template HTML dedicato per il PDF** (`PremiumReportPDF.tsx`) che viene renderizzato off-screen, poi catturato sezione per sezione con `html2canvas` e impaginato con `jsPDF` con page break controllati. Questo approccio:

- Funziona interamente client-side (no server, no Puppeteer — non disponibile in questo stack)
- Usa lo stesso pattern gia collaudato per `InterviewSheetPDFButton`
- Permette controllo totale su layout, margini, page break
- Gestisce grafici come componenti HTML renderizzati (non screenshot della pagina)

### Perche non server-side

Il progetto usa Lovable Cloud (edge functions Deno). Puppeteer/wkhtmltopdf non sono disponibili. La generazione rimane client-side con jsPDF + html2canvas, ma con un **template dedicato** ottimizzato per la stampa.

## Struttura del documento PDF

### Pagina 1 — Copertina
- Logo TalentProfile (in alto a sinistra)
- Titolo: "Analisi Strategica Profilo Candidato"
- Nome e Cognome (grande, centrato)
- Ruolo / Funzione
- Azienda
- Data generazione
- Badge profilo tipo (es. "Leader Naturale")
- Design: sfondo bianco, accento brand orange (#f09133) e blue (#1e3a5f), tipografia forte

### Pagina 2 — Indice
- Lista numerata delle sezioni con numeri pagina
- Generato dinamicamente in base alle sezioni presenti

### Pagina 3 — Executive Summary
- Verdetto idoneita (IDONEO/CON RISERVA/DA VALUTARE/NON IDONEO) con badge colorato
- Frase motivazionale
- Macro-aree (ESSERE/FARE/AVERE) con barre orizzontali e percentuali
- Top 3 Punti di Forza e Top 3 Aree di Miglioramento
- Profilo Tipo con descrizione breve
- Attendibilita del test
- Alert attivi (sindromi RED/ORANGE)

### Pagine 4-6 — Profilo Completo
- **Grafico a barre comportamentale** con tutti i 15 tratti + soglie ruolo
  - Renderizzato come barre HTML pure (div con width percentuale), non Recharts
  - Ogni tratto: nome, barra colorata, valore numerico, soglia se presente
- **Narrativa "Chi e [Nome]"**: i 4 capitoli (Come Pensa, Come Agisce, Come si Relaziona, Stabilita e Principi) con tutti i tratti e le narrative
- **Segnalazioni sindromi**: lista completa con severita e descrizione
- **Ruoli compatibili**: top 5 con percentuale
- **Profilo tipo esteso**: descrizione, punti forza, aree attenzione, come gestirlo

### Pagine 7-8 — Area Gestione
- **Consigli di Management** (ManagementGuideV5): priorita assoluta + consigli operativi
- **Piano d'Azione** (ActionPlanCardV5): tutte le azioni P1-P5 con timeline, responsabile, trigger
- **Quadro Psicologico** (GestioneAvanzataV3): radice del problema, risorsa nascosta, circoli viziosi
- **Piano di Crescita 4 fasi**: stabilizzazione, sviluppo, consolidamento, maturita

### Pagine 9-10 — Mappa Interiore
- **Panoramica dimensioni**: grafico a barre orizzontali HTML (5 dimensioni)
- **Pillole dimensioni**: Stile relazionale, Reazione alla pressione, Motore primario
- **Narrative**: Chi e nel profondo, Cosa lo guida, Cosa lo blocca, Potenziale inespresso
- **La Chiave**: frase chiave evidenziata
- **Motiva / Blocca / Teme**: 3 colonne con liste
- **3 Errori da Non Fare Mai**
- **Pattern Combinatori** (se presenti)

### Pagine 11-12 — Colloquio
- **Domande per area** con priorita (ALTA/MEDIA)
- **Motivazione** per ogni area
- **Segnali d'allarme e positivi**: le due liste complete

### Pagina finale — Metodologia e Dati Tecnici
- Spiegazione metodo TalentProfile 360 v2.0
- Significato dei punteggi e delle scale
- Assessment version (V5)
- Data generazione, data test
- Disclaimer legale
- Logo watermark

## Design system PDF

### Tipografia
- Titoli H1: 18pt, bold, #1e3a5f (brand blue)
- Titoli H2: 14pt, bold, #1e3a5f
- Titoli H3: 12pt, semibold, #333
- Corpo: 10pt, regular, #444
- Caption: 8pt, #888

### Layout
- Margini: 15mm top/bottom, 18mm left/right
- Header ogni pagina: logo piccolo (sinistra) + "Analisi Strategica — [Nome Cognome]" (destra)
- Footer ogni pagina: numerazione "Pagina X di Y" (centro) + data (destra)
- Separatori: linea 0.5pt #ddd tra sezioni

### Colori
- Brand orange: #f09133 (accenti, badge)
- Brand blue: #1e3a5f (titoli, header)
- Barre verdi: #16A34A (punti forza, idoneo)
- Barre ambra: #D97706 (aree miglioramento, con riserva)
- Barre rosse: #DC2626 (critico)
- Sfondo sezioni: #f8f9fa (grigio chiaro)

### Grafici
- Tutti renderizzati come HTML puro (div con colori e width percentuale)
- Non usare Recharts nel template PDF — troppo complesso da rasterizzare correttamente
- Barre orizzontali con label, valore, colore condizionale

## File da creare/modificare

### Nuovi file
1. **`src/components/PremiumReportPDF.tsx`** (~800 righe)
   - Componente React che renderizza l'intero report come HTML ottimizzato per stampa
   - Diviso in sezioni con classi CSS per page break (`page-break-before: always`)
   - Tutti i dati passati come props
   - Grafici come barre HTML pure
   - Stile inline (necessario per html2canvas)

2. **`src/components/PremiumReportPDFButton.tsx`** (~150 righe)
   - Pulsante che sostituisce `PDFExportButton`
   - Renderizza `PremiumReportPDF` off-screen
   - Cattura sezione per sezione con html2canvas
   - Assembla con jsPDF, aggiungendo header/footer/numerazione per ogni pagina
   - Progress feedback durante la generazione

### File da modificare
3. **`src/pages/CandidatoDettaglio.tsx`**
   - Sostituire `PDFExportButton` con `PremiumReportPDFButton`
   - Passare tutti i dati necessari (candidato, traits, macroAreas, profiloTipoV5, reliabilityIndex, syndromes, roleMatch, mappaInteriore data)
   - Rimuovere `reportRef` (non serve piu, il PDF ha il suo template)

4. **`src/components/PDFExportButton.tsx`**
   - Rimuovere il vecchio `PDFExportButton` (sostituito)
   - Mantenere `InterviewSheetPDFButton` invariato

## Strategia di rendering PDF

Per evitare problemi di page break e qualita:

```
Per ogni sezione del report:
  1. Renderizza la sezione HTML in un container off-screen (width: 210mm)
  2. Cattura con html2canvas (scale: 2)
  3. Calcola se entra nella pagina corrente
  4. Se non entra: nuova pagina
  5. Aggiungi immagine al PDF
  6. Aggiungi header/footer
  7. Procedi alla sezione successiva
```

Questo garantisce:
- Nessuna sezione spezzata a meta
- Qualita costante
- Gestione intelligente dello spazio
- Header/footer su ogni pagina

## Performance

- Generazione asincrona con `async/await`
- Loader con progress (% completamento sezioni)
- Tempo stimato: 5-8 secondi per un report completo
- Nessun crash: try/catch per ogni sezione, graceful degradation

## Dati necessari (gia tutti disponibili in CandidatoDettaglio)

- `candidato`: nome, cognome, sesso, ruolo, funzione, eta, data_test, azienda
- `traitsV5`: Record dei 15+1 tratti
- `macroAree`: essere, fare, avere (percentuali)
- `profiloTipoV5`: codice profilo tipo
- `reliabilityIndex`: attendibilita
- `syndromes`: array sindromi attive
- `roleMatch`: risultato role matching (calcolato al volo)
- `mappaInteriore`: calcolata al volo con `calculateMappaInteriore()`
- Dati gestione: calcolati al volo dalle funzioni gia esistenti (`getPersonalizedManagementTips`, `buildGrowthPlan`, `getPersonalizedPatterns`)
- Dati colloquio: calcolati al volo con `generateColloquioAreasV3()`

Nessuna query aggiuntiva al database necessaria.

