

# Grafico a Candele Verticali per il Profilo Comportamentale

## Cosa cambia

Il grafico attuale (barre orizzontali con nomi a sinistra) viene sostituito da un grafico a **candele verticali** con i nomi dei tratti sull'asse X orizzontale. Ogni "candela" parte dal centro (valore 0) e si estende verso l'alto (positivo) o verso il basso (negativo).

## Design UX

- **15 barre verticali** raggruppate per area (Essere, Fare, Avere, Indicatori) con colori distinti per gruppo
- **Asse X**: nomi abbreviati dei tratti (ORG, AUT, GP, ecc.) con etichette complete visibili al passaggio del mouse
- **Asse Y**: scala da -100 a +100, con linea zero evidenziata
- **Zone colorate di sfondo**: verde (sopra +15), giallo (tra -15 e +15), rosso (sotto -15) per orientamento immediato
- **Soglie ruolo**: marker rossi orizzontali (triangoli o linee) sulla barra corrispondente, visibili solo sui tratti che hanno requisiti per il ruolo selezionato
- **Icone check/X**: sopra ogni barra che ha una soglia, per indicare se il requisito e' soddisfatto
- **Tooltip ricco**: al passaggio mostra nome completo del tratto, valore numerico, etichetta qualitativa (Alto/Buono/Medio/Basso/Critico), e stato soglia
- **Separatori visivi** tra i gruppi di area con label colorate (ESSERE, FARE, AVERE, INDICATORI)
- **Responsive**: su mobile le etichette ruotano a 45 gradi e le barre si restringono

## Dettaglio tecnico

### File: `src/components/TraitCandleChart.tsx` (nuovo)
Nuovo componente che usa Recharts (`BarChart` verticale standard, non layout="vertical"):
- `XAxis` con `dataKey="code"` (codici tratto) e tick personalizzati
- `YAxis` con domain `[-80, 80]` e tickFormatter per il segno +/-
- `Bar` con `Cell` colorati per gruppo area
- `ReferenceArea` per le zone verde/giallo/rosso
- `ReferenceLine` a y=0
- Soglie ruolo rese come `ReferenceDot` o marker SVG custom sulla barra corrispondente
- Tooltip personalizzato con tutte le info
- Legenda in basso con zone + soglie

Le props restano le stesse di `TraitBarChart`:
```
traits: Record<string, number>
thresholds?: TraitThreshold[]
showThresholdIndicator?: boolean
showValueLabels?: boolean
```

### File: `src/components/ProfiloUnificatoTab.tsx`
- Sostituire `import { TraitBarChart }` con `import { TraitCandleChart }`
- Alla riga 258, sostituire `<TraitBarChart ... />` con `<TraitCandleChart ... />`
- Stesse props: `traits`, `thresholds`, `showThresholdIndicator`, `showValueLabels`

### File: `src/components/TraitBarChart.tsx`
Nessuna modifica: il componente resta disponibile per altri usi (es. PDF, confronto candidati).

## Risultato visivo

```text
          ESSERE    |    FARE       |   AVERE      | INDICATORI
  +80 ──────────────────────────────────────────────────────────
       ██           |         ██    |              |
  +40  ██    ██     |    ██   ██    |  ██   ██     |    ██
       ██    ██     |    ██   ██ ▲  |  ██   ██     |    ██
    0 ─██────██─────|────██───██────|──██───██─────|────██──────
       ██         ██|              ██|         ██   |  ██
  -40        ──   ██|    ──        ██|         ██   |  ██  ──
                    |               |              |
  -80 ──────────────────────────────────────────────────────────
      ORG  AUT  GP   ADS DET VEN HRM LDR PRO COM ESP  RC FIN SUC PRI

      ▲ = soglia minima ruolo    ██ verde = sopra soglia    ██ rosso = sotto soglia
```

Ogni barra ha il colore del suo gruppo (blu/ambra/viola/grigio) e le soglie appaiono come marcatori rossi.
