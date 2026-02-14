
# Fix: Ultima domanda tagliata su mobile

## Problema

Il contenitore principale del questionario ha `pb-24` (96px) di padding inferiore, ma il footer fisso di navigazione (con `py-2 sm:py-4` + altezza pulsanti + `safe-area-bottom`) occupa piu spazio su mobile, specialmente su iPhone con la barra home. Le risposte dell'ultima domanda vengono coperte dal footer.

## Soluzione

Aumentare il padding inferiore del contenitore principale su mobile per garantire che tutto il contenuto sia visibile sopra il footer fisso.

### Modifica in `src/pages/Questionario.tsx`

Cambiare la classe del contenitore principale da:
```
pb-24 sm:pb-24
```
a:
```
pb-32 sm:pb-24
```

Questo aggiunge 128px di padding inferiore su mobile (32 x 4px = 128px) invece di 96px, lasciando ampio spazio per il footer fisso e la safe area di iOS. Su desktop resta invariato a 96px.

## Impatto
- Solo CSS, nessun impatto su logica o scoring
- Desktop invariato
