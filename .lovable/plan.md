
# Fix: Rimuovere sfondo bianco sovrapposto dai Gauge

## Problema
Il contenitore dei gauge ha le classi `bg-white/50 rounded-xl` che creano un rettangolo bianco semitrasparente visibile sopra lo sfondo colorato della card (rosso/rosa per NON IDONEO). Questo causa l'effetto "due livelli sovrapposti".

## Intervento

### `src/components/HeroCardV3.tsx` (riga 186)
Rimuovere `bg-white/50 dark:bg-white/5 rounded-xl` dal div contenitore dei gauge, mantenendo solo il layout flex e il padding.

Da:
```
bg-white/50 dark:bg-white/5 rounded-xl p-2 md:p-3 overflow-visible
```

A:
```
p-2 md:p-3 overflow-visible
```

Questo elimina completamente lo sfondo bianco sovrapposto, lasciando i gauge direttamente sullo sfondo della card.
