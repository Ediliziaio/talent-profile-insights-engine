

# Fix e Miglioramenti Grafico a Candele

## Problemi trovati

### 1. Le soglie rosse NON appaiono
Il componente `<customized>` (riga 414, minuscolo) non funziona in Recharts. Il componente corretto e' `<Customized>` (C maiuscola) importato da `recharts`. Questo spiega perche' le soglie rosse e le etichette dei gruppi (ESSERE, FARE, AVERE, INDICATORI) non sono visibili nel grafico.

### 2. I valori possono andare sotto lo zero
Si', il grafico GIA' supporta valori negativi (asse Y da -80 a +80). Questo candidato specifico ha tutti valori positivi, ma se un candidato avesse tratti negativi, le barre si estenderebbero verso il basso dalla linea zero.

## Modifiche

### File: `src/components/TraitCandleChart.tsx`

**Fix critico - Importare e usare `Customized` correttamente:**
- Aggiungere `Customized` nell'import da `recharts`
- Cambiare `<customized component={...} />` in `<Customized component={...} />`
- Rimuovere il commento `@ts-ignore`

**Miglioramenti UX:**
1. **Etichette X piu' leggibili**: mostrare abbreviazioni piu' descrittive (es. "Org", "Aut", "GP") con font leggermente piu' grande
2. **Gradient sulle barre**: aggiungere opacita' progressiva per dare profondita' visiva
3. **Soglie rosse ben visibili**: linea tratteggiata rossa orizzontale sulla barra + triangoli indicatori
4. **Icone check/X sopra le barre**: visibili a colpo d'occhio senza bisogno di hover
5. **Hover effect**: barra si illumina leggermente al passaggio del mouse

## Dettaglio tecnico

La modifica principale e' alla riga 414 del file:

```typescript
// PRIMA (non funziona):
{/* @ts-ignore */}
<customized component={...} />

// DOPO (funziona):
<Customized component={...} />
```

Questo sblocca sia le etichette dei gruppi in alto (ESSERE, FARE, AVERE, INDICATORI) sia i marker delle soglie rosse con le icone check/X.

Nessun altro file necessita di modifiche - il `ProfiloUnificatoTab` gia' passa correttamente `thresholds` e `showThresholdIndicator` al componente.

## Risultato atteso

- Le soglie rosse appariranno come linee orizzontali sulla barra del tratto corrispondente
- Le icone check (verde) e X (rossa) appariranno sopra ogni barra con soglia
- Le etichette "ESSERE", "FARE", "AVERE", "INDICATORI" appariranno in alto raggruppate
- Cambiando ruolo nel selettore, tutto si aggiornera' in tempo reale

