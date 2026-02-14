

# Fix: Rendere visibile il bottone cestino nella tabella candidati

## Problema

Il bottone cestino (Trash2) e' presente nel codice (riga 1516-1526 di Candidati.tsx) ma non e' visibile nella tabella desktop. La colonna "Azioni" ha larghezza `w-24` (96px) che non basta per contenere sia il bottone Vedi/Copia che il bottone cestino. Il cestino viene tagliato dal bordo destro della tabella.

## Soluzione

### File: `src/pages/Candidati.tsx`

1. **Allargare la colonna Azioni**: cambiare `w-24` in `w-32` (128px) nella TableHead "Azioni" (riga 1372) per dare spazio a entrambi i bottoni.

2. **Verificare che i bottoni siano su una riga**: assicurarsi che il `div` container dei bottoni (riga 1488) abbia `flex-nowrap` per evitare che il cestino vada a capo e esca dalla vista.

Modifica minima, una sola riga da cambiare nel file.

