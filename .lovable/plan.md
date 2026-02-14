

# Fix: Rimuovere completamente l'arco di sfondo dei Gauge

## Problema
Anche con opacita' al 4%, l'arco di sfondo resta visibile sugli sfondi colorati (rosa per NON IDONEO). L'utente vuole che sparisca del tutto.

## Soluzione

### `src/components/AreaGaugeSVG.tsx` (riga 50)
Impostare lo stroke dell'arco di sfondo a `transparent` oppure `rgba(0,0,0,0)`, rendendo l'arco completamente invisibile.

```
stroke="transparent"
```

I gauge mostreranno solo l'arco colorato di progresso senza alcuna traccia di sfondo.

