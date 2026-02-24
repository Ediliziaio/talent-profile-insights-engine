

# Redesign Premium PDF — Da Export Software a Report di Consulenza Strategica

## Analisi dello Stato Attuale

Il file `PremiumReportPDF.tsx` (990 righe) contiene tutte le sezioni del PDF. Dopo analisi approfondita, i problemi principali sono:

- **Margini**: attualmente `15mm 18mm` — troppo stretti, non premium
- **Font sizes**: troppo piccoli (9-10px corpo, 16px titoli) — poca gerarchia
- **Colori**: troppo `BG_LIGHT (#f8f9fa)` ovunque — aspetto grigio e piatto
- **Box**: tutti uguali con `borderRadius: 8` e `border: 1px solid #e5e7eb` — aspetto dashboard
- **Macro-aree**: piccoli box con progress bar — non impattanti
- **Narrative**: testo piatto senza struttura operativa
- **Mappa Interiore**: barre orizzontali — non graficamente impattante
- **Colloquio**: elenco domande — non guida operativa HR

## Piano di Implementazione (5 Fasi)

Data la complessità (990 righe da ridisegnare), il lavoro sarà suddiviso in fasi implementabili progressivamente.

---

### FASE 1: Design System + Cover + Indice

**Costanti e componenti base:**
- Margini: `25mm top/bottom, 20mm laterali`
- Font body: `11px`, line-height `1.6`
- Font titoli: `H1=22px, H2=16px, H3=13px`
- Eliminare `BG_LIGHT` come sfondo default — bianco dominante
- Nuovi `SectionTitle`, `SubTitle`, `BodyText` con spaziature corrette
- Bordi sinistri colorati invece di box pieni per le sezioni
- Nuova palette: bianco + brand blue/orange + verde/rosso solo per indicatori

**Cover:** aggiungere sottotitolo descrittivo sotto "Analisi Strategica", migliorare spaziature.

**Indice:** aggiungere linea punteggiata tra titolo e sotto-voci, aumentare font.

---

### FASE 2: Executive Summary — Ridisegno Completo (la pagina WOW)

**Macro-Aree in cerchi grandi (3 colonne):**
```
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  ╭───────╮   │  │  ╭───────╮   │  │  ╭───────╮   │
   │  │  57%  │   │  │  │  43%  │   │  │  │  68%  │   │
   │  │ESSERE │   │  │  │ FARE  │   │  │  │ AVERE │   │
   │  │ Buono │   │  │  │Mediocre│  │  │  │Ottimo │   │
   │  ╰───────╯   │  │  ╰───────╯   │  │  ╰───────╯   │
   │ 2 righe di   │  │ 2 righe di   │  │ 2 righe di   │
   │ interpretaz. │  │ interpretaz. │  │ interpretaz. │
   └─────────────┘  └─────────────┘  └─────────────┘
```

Ogni cerchio: 120px diametro, `stroke` SVG con colore semantico, testo centrato dentro (%, label, qualità). Sotto: mini-descrizione generata dinamicamente basata sul valore.

**Top 3 Punti di Forza / Aree di Attenzione:**
- Design elegante con bordo sinistro colorato (verde/rosso) invece di sfondo pieno
- Icona + nome tratto + punteggio + mini-frase interpretativa

**Profilo Tipo:** badge premium con bordo, non sfondo pieno.

**Attendibilità:** indicatore grafico a 4 segmenti (come un semaforo orizzontale).

**Nuovo blocco "Sintesi Strategica":** 6-8 righe generate dinamicamente che riassumono il profilo complessivo. Logica: combinazione di profilo tipo + top strength + top weakness + sindrome dominante.

---

### FASE 3: Profilo Comportamentale + Narrative Tratti

**Grafico tratti ridisegnato:**
- Per ogni macro-area: titolo grande + sottotitolo descrittivo + frase interpretativa auto-generata
- Barre più spesse (18px vs 14px)
- Nome tratto a sinistra, barra al centro, **punteggio DENTRO la barra** (non fuori)
- Eliminare sfondo grigio del container

**Box "Lettura Strategica" per macro-area:**
```
┌─ Lettura Strategica ─────────────────────────┐
│ ▶ Impatto in azienda: [testo auto-generato]  │
│ ▶ Rischio: [testo auto-generato]             │
│ ▶ Opportunità: [testo auto-generato]         │
└───────────────────────────────────────────────┘
```

**Narrative Tratti — layout a 2 colonne:**
```
┌──────────────┬────────────────────────────────┐
│  TRAIT NAME  │  Testo narrativo ampliato      │
│  ┌────┐      │  (min +30% rispetto a oggi)    │
│  │ 42 │      │  ...                           │
│  └────┘      │                                │
│  Buono       │  ┌─ Impatto Operativo ────────┐│
│              │  │ ▶ Impatto professionale    ││
│              │  │ ▶ Cosa osservare           ││
│              │  │ ▶ Se non gestito...        ││
│              │  └────────────────────────────┘│
└──────────────┴────────────────────────────────┘
```

Per i testi +30%, la logica aggiungerà frasi operative auto-generate basate sulla fascia (impatto aziendale, rischio, cosa fare).

---

### FASE 4: Mappa Interiore + Gestione

**Mappa Interiore:**
- Sostituire barre orizzontali con **radar/pentagon chart SVG** (5 dimensioni)
- Etichette e valori visibili nel grafico
- 4 box orizzontali sotto: Cosa lo motiva / Cosa lo blocca / Cosa teme / Potenziale inespresso
- **"LA CHIAVE"**: box full-width con bordo sinistro orange, font 14px bold, molto spazio bianco

**Gestione:**
- Management tips in box con icona e titolo strutturato
- Piano d'azione: tabella con header premium (non blu pieno, ma bordo inferiore)
- Piano di crescita: timeline grafica verticale con pallini e connettori

---

### FASE 5: Colloquio + Metodologia + Header/Footer

**Colloquio — da elenco a guida operativa:**
Per ogni area:
```
┌─ AREA: Gestione Pressioni ────────────────────┐
│ Perché è critica: [2 righe generate]          │
│                                                │
│ Domande:                                       │
│  1. "Come stai davvero..."                     │
│  2. "C'è qualcuno..."                          │
│                                                │
│ ✓ Segnale positivo: [cosa ascoltare]           │
│ ✗ Segnale negativo: [cosa preoccupa]           │
│                                                │
│ 👁 Cosa osservare: [linguaggio non verbale]    │
└────────────────────────────────────────────────┘
```

**Metodologia:**
- Blocchi più chiari con titoli separati
- Significato punteggi con barra grafica colorata (non solo testo)
- Tabella dati tecnici più elegante (alternanza bianco/grigio leggero)

**Header/Footer:**
- Header più minimal: solo logo piccolo + nome candidato
- Footer: `Pagina X di Y` — calcolato nel PremiumReportPDFButton (si aggiorna `totalPages` post-rendering)

---

## Dettaglio Tecnico

### File modificati:
1. **`src/components/PremiumReportPDF.tsx`** — Riscrittura completa delle sezioni (mantenendo stessa struttura `Section`/`PageBreak`)
2. **`src/components/PremiumReportPDFButton.tsx`** — Aggiornare per passare `totalPages` e usare `Pagina X di Y`

### Dati che NON cambiano:
- Tutti i `props` rimangono identici
- Tutte le librerie di calcolo (`traitNarrativesV5`, `mappaInteriore`, `crossPatternsV5`, etc.) rimangono intatte
- La logica di canvas slicing nel Button rimane invariata
- Backend zero modifiche

### Nuove funzioni helper (dentro PremiumReportPDF.tsx):
- `getMacroAreaInterpretation(value)` — genera 2 righe di interpretazione per le macro-aree
- `getStrategicSummary(traits, syndromes, profiloTipo)` — genera 6-8 righe di sintesi strategica
- `getStrategicReading(macroArea, traits)` — genera impatto/rischio/opportunità
- `getTraitOperationalImpact(code, value)` — genera impatto professionale / cosa osservare / se non gestito
- `RadarChartSVG` — componente SVG per pentagon chart della Mappa Interiore
- `CircleGauge` — componente SVG per i cerchi grandi delle macro-aree

### Rischi e mitigazioni:
- **Testi troppo lunghi**: il canvas slicing gestisce già il multi-page
- **SVG rendering**: html2canvas supporta SVG inline — nessun problema
- **Performance**: nessuna chiamata API aggiuntiva, solo logica locale

---

## Ordine di Implementazione

Data la dimensione, suggerisco di procedere in **2 blocchi**:

**Blocco A** (prima implementazione): Fase 1 + 2 + 3 — Design system, Executive Summary WOW, Profilo con narrative ampliate

**Blocco B** (seconda implementazione): Fase 4 + 5 — Mappa Interiore radar, Gestione timeline, Colloquio guida operativa, Metodologia, Header X/Y

Procedo con il **Blocco A** per primo?

