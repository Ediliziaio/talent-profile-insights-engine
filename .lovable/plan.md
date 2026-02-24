

# Fix Radar Chart + Redesign Mappa Interiore — Piano di Implementazione

## Diagnosi del Problema

Il radar chart SVG attuale (linee 380-438) ha dimensioni troppo piccole:
- **viewBox `0 0 300 300`** con `width={300} height={300}` ma il container A4 (210mm = ~794px) lo riduce
- Le label esterne usano `maxR + 28` = 138px dal centro, il che comprime il pentagono effettivo
- I font label sono `8px` e `9px` — illeggibili in stampa dopo scaling html2canvas
- Il radar non ha un `id` HTML, rendendo impossibile qualsiasi validazione pre-export
- Il container non ha dimensioni fisse esplicite, dipende dal flow CSS

## Modifiche — File `src/components/PremiumReportPDF.tsx`

### 1. Nuovo RadarChartSVG (sostituzione completa linee 380-438)

- `viewBox="0 0 500 500"` con `width={420} height={420}` — dimensione target print
- `id="inner-map-radar"` per validazione
- Centro a `250, 250`, raggio massimo `170px` (vs 110 attuale)
- Label a `maxR + 40` con font `11px` (nome) e `12px bold` (valore)
- Stroke pentagono `2.5px`, griglia `1px`
- Grid rings con numeri di scala (2.5, 5, 7.5, 10) visibili
- Punti dati `r={5}` con stroke bianco `2px`
- `dominant-baseline="middle"` e `text-anchor="middle"` su tutti i testi

### 2. Mappa Interiore — Pagina A: Panoramica (sostituzione sezione `mappa-radar`, linee 1263-1334)

Layout strutturato:

```text
┌──────────────────────────────────────────────────┐
│  SEZIONE 04 — MAPPA INTERIORE                    │
│  Sottotitolo + mini legenda chip                 │
├──────────────────────┬───────────────────────────┤
│                      │  SNAPSHOT                  │
│   RADAR CHART        │  Identità/Ris.: 3/10 ███ │
│   (420 x 420)        │  Reg. Emotiva:  8/10 ███ │
│                      │  Attaccamento:  7/10 ███ │
│                      │  Difese:        3/10 ███ │
│                      │  Bisogno Prim.: 6/10 ███ │
├──────────────────────┴───────────────────────────┤
│  Col sx: "Chi è [Nome]      │  Col dx: 3 card   │
│   nel profondo" (narrativa)  │  Stile relaz.     │
│   6-10 righe, interlinea 1.55│  Meccanismo dif.  │
│                              │  Bisogno primario │
├──────────────────────────────────────────────────┤
│  Nota: "Questa sezione è il cuore del profilo"   │
└──────────────────────────────────────────────────┘
```

Specifiche:
- Radar + Snapshot in `display: flex`, radar `flex: 0 0 auto` (420px), snapshot `flex: 1`
- Snapshot: 5 righe con mini barra sottile (60px wide, 6px high) + valore bold + label
- Legenda punteggi come chip inline: `0–3 Basso | 4–6 Medio | 7–10 Alto`
- Sezione inferiore 2 colonne: narrativa sx (60%), 3 card dx (40%)
- Card con `borderTop: 3px solid [color]`, padding 14-16px, gap 12px
- Footer divider + nota in italic

### 3. Mappa Interiore — Pagina B: Leva Strategica (sostituzione sezione `mappa-narrative`, linee 1337-1377)

```text
┌──────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────┐  │
│  │  🔑 LA CHIAVE                              │  │
│  │  "Non devi fare tutto tu..."               │  │
│  │  font 16px, centrato, bg tenue premium     │  │
│  └────────────────────────────────────────────┘  │
├──────────┬──────────┬────────────────────────────┤
│ Cosa lo  │ Cosa lo  │ Cosa Teme                  │
│ Motiva   │ Blocca   │ (3-5 bullet)               │
│ (5-7 bul)│ (5-7 bul)│                            │
├──────────┴──────────┴────────────────────────────┤
│  POTENZIALE INESPRESSO                           │
│  (box full-width, 5-8 righe narrative)           │
├──────────────────────────────────────────────────┤
│  🚫 3 ERRORI DA NON FARE MAI                    │
│  1. ...                                          │
│  2. ...                                          │
│  3. ...                                          │
├──────────────────────────────────────────────────┤
│  Pattern Combinatori (se presenti)               │
└──────────────────────────────────────────────────┘
```

Specifiche:
- LA CHIAVE: box full-width, `background: #fef9f3` (warm tenue), `borderLeft: 6px solid BRAND_ORANGE`, font frase `16px`, font weight `600`, `text-align: center`, padding `28px`
- 3 colonne sotto: `display: flex, gap: 14`, ogni card con icona piccola + titolo bold
- Potenziale Inespresso: AccentBox `borderColor: BRAND_BLUE`, più narrativo
- Errori: numerazione `1. 2. 3.` con font bold e colore rosso
- Pattern combinatori mantenuti in fondo

### 4. Nessuna modifica alle altre sezioni

Le sezioni Cover, Indice, Executive Summary, Profilo Comportamentale, Narrative, Gestione, Colloquio, Metodologia rimangono intatte.

### 5. Zero pagine vuote

- Eliminare `<PageBreak />` tra mappa-radar e mappa-narrative (linea 1381 attualmente — verrà rimossa perché le due sezioni ora riempiono una pagina ciascuna senza bisogno di break forzato tra di esse)
- Il `data-section` splitting già gestisce la paginazione via html2canvas

## Riepilogo modifiche

| Cosa | Dove | Linee |
|---|---|---|
| `RadarChartSVG` completo | Componente, linee 380-438 | Sostituzione |
| Sezione `mappa-radar` | Linee 1263-1334 | Sostituzione con layout Pagina A |
| Sezione `mappa-narrative` | Linee 1337-1377 | Sostituzione con layout Pagina B |
| PageBreak post-mappa | Linea 1381 | Rimozione (non serve più) |

Nessuna modifica a `PremiumReportPDFButton.tsx` — la logica di cattura canvas e `Pagina X di Y` funziona già correttamente con le sezioni `data-section`.

