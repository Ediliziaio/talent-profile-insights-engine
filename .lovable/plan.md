

# Fix: Arco di sfondo gauge ancora troppo visibile

## Problema
Il colore `rgba(0,0,0,0.08)` per l'arco di sfondo risulta ancora troppo contrastato sugli sfondi colorati delle card (rosa/rosso per NON IDONEO). Si vede chiaramente un arco grigio dietro l'arco colorato.

## Soluzione

### `src/components/AreaGaugeSVG.tsx` (riga 50)
Ridurre drasticamente l'opacita' dell'arco di sfondo da `rgba(0,0,0,0.08)` a `rgba(0,0,0,0.04)` (4% invece di 8%).

In alternativa, se anche 4% risulta visibile, possiamo passare il colore di sfondo come prop dalla HeroCard, oppure usare `currentColor` con opacita' molto bassa.

La soluzione piu' semplice e' dimezzare l'opacita':
```
stroke="rgba(0,0,0,0.04)"
```

### Impatto
- Una sola modifica di valore
- L'arco di sfondo diventa quasi invisibile ma mantiene un riferimento visivo leggero
- Funziona su tutti gli sfondi colorati
