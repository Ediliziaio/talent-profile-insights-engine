
# Fix: Rimuovere artefatti celesti dietro i Gauge

## Problema
L'arco di sfondo dei gauge usa `stroke="hsl(var(--muted))"` che su sfondo colorato (rosa per NON IDONEO, verde per IDONEO, ecc.) appare come una striscia celeste/azzurrina visibile dietro l'arco colorato. Sembra un artefatto visivo.

## Soluzione
Cambiare il colore dell'arco di sfondo da `hsl(var(--muted))` a un colore semitrasparente che si adatti a qualsiasi sfondo della card.

### File: `src/components/AreaGaugeSVG.tsx` (riga 50)
Cambiare lo stroke dell'arco di sfondo da:
```
stroke="hsl(var(--muted))"
```
a:
```
stroke="rgba(0,0,0,0.08)"
```

Questo usa un nero con 8% di opacita' che risulta come un leggero grigio su qualsiasi sfondo (bianco, rosa, verde, ambra, blu), senza creare l'effetto "croce celeste".

### Impatto
- Una sola riga di codice modificata
- Funziona su tutti i colori di sfondo delle card (tutti i verdict)
- Nessun impatto su logica o layout
