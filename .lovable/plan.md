

# Miglioramento UX della Sezione Risultati Candidato

## Problemi Identificati

### 1. Gauge semicircolari tagliati (ESSERE, FARE, AVERE)
Il componente `AreaGaugeSVG` ha il viewBox impostato su `0 0 100 60` con il centro dell'arco a `cy=50`. Questo lascia solo 10 unita sopra il centro per un arco di raggio 40, e lo strokeWidth di 8px con strokeLinecap "round" provoca il clipping visivo ai bordi. Inoltre, il Card padre ha la classe `overflow-hidden` che taglia qualsiasi elemento che sporge.

### 2. Grafici Compatibilita e Profilo "identici"
Entrambe le tab usano lo stesso componente `TraitBarChart` con gli stessi dati dei tratti. La differenza e che la tab Compatibilita mostra le soglie del ruolo (linee rosse e check/X), mentre la tab Profilo no. Ma visivamente appaiono molto simili, dando l'impressione che "non cambino".

### 3. Aspetto visivo generale migliorabile
- I gauge sono piccoli e poco leggibili
- Manca separazione visiva tra le sezioni
- Il layout dei gauge potrebbe essere piu elegante

## Interventi Proposti

### 1. Fix AreaGaugeSVG - Risolvere il clipping
Riscrivere le coordinate SVG per centrare correttamente l'arco nel viewBox:
- Cambiare viewBox da `0 0 100 60` a `0 0 100 70`
- Spostare il centro dell'arco da `cy=50` a `cy=46` per dare piu respiro in alto
- Aggiornare l'altezza SVG a `size * 0.7` per mantenere le proporzioni
- Spostare il testo percentuale di conseguenza
- Questo risolve completamente il taglio degli archi

### 2. Migliorare la HeroCardV3 - Layout gauge piu elegante
- Aumentare la dimensione dei gauge su desktop da 90px a 100px per maggiore leggibilita
- Aggiungere un sottile separatore verticale tra la sezione verdetto e i gauge su desktop
- Dare ai gauge un contenitore con sfondo leggermente diverso per risalto visivo

### 3. Differenziare i grafici tra le tab
- **Tab Compatibilita**: Mantenere il `TraitBarChart` con soglie, ma aggiungere un banner riassuntivo colorato sopra il grafico che mostra quanti requisiti sono soddisfatti con indicatore visivo prominente
- **Tab Profilo**: Sostituire o arricchire il grafico con etichette descrittive inline per ogni barra (es. "Alto", "Nella media", "Da sviluppare") cosi il grafico appare visivamente diverso e piu informativo

## Dettaglio Tecnico

### File da modificare

**`src/components/AreaGaugeSVG.tsx`**
- Cambiare viewBox: `"0 0 100 70"` 
- Aggiornare `cy` da 50 a 46
- Aggiornare altezza SVG: `height={size * 0.7}`
- Spostare il testo percentuale da `y={48}` a `y={56}`
- Questo risolve il clipping senza cambiare l'aspetto visivo

**`src/components/HeroCardV3.tsx`**
- Aumentare gauge size desktop: da `90` a `100`
- Aggiungere un divider verticale `border-l` su desktop tra verdetto e gauge
- Applicare un leggero sfondo al contenitore gauge: `bg-white/50 dark:bg-white/5 rounded-xl p-3`

**`src/components/TraitBarChart.tsx`**
- Aggiungere prop opzionale `showValueLabels` per mostrare etichette descrittive ("Alto", "Medio", "Basso") accanto ai valori numerici
- Nella tab Profilo, attivare questa prop per differenziare visivamente il grafico

**`src/components/ProfiloTabV3.tsx`**
- Passare `showValueLabels={true}` al TraitBarChart per differenziarlo dalla versione in Compatibilita

### Impatto
- Solo modifiche CSS/SVG e prop aggiuntive
- Nessun impatto su logica, scoring o dati
- Desktop e mobile entrambi migliorati
- Retrocompatibile al 100%

