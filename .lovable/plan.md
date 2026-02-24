

# Fix: Credenziali visibili subito dopo la generazione

## Problema

Due problemi distinti:

1. **Candidati.tsx**: Il testo placeholder dice "Rigenera per ottenere la password" anche quando le credenziali sono appena state generate per la prima volta. In realtà il codice `onSuccess` già cattura `result.plainPassword` nello state `generatedPassword`, quindi la password dovrebbe apparire correttamente dopo il click su "Genera". Il testo del placeholder va corretto per coerenza.

2. **Aziende.tsx (line 510)**: Ancora referenzia `result.accesso.password_plain` come fallback, ma quella colonna è stata droppata nel Phase 3. Va rimosso il fallback.

## Modifiche

### File: `src/pages/Candidati.tsx`

1. **Linea 973**: Cambiare il placeholder da `'Rigenera per ottenere la password'` a `'Genera per ottenere la password'` per coerenza con il bottone che mostra "Genera" quando non ci sono credenziali.

2. **Linea 991**: Stesso fix nel testo del "Copia tutto".

### File: `src/pages/Aziende.tsx`

1. **Linea 510**: Rimuovere il fallback `|| result.accesso.password_plain` — usare solo `result.plainPassword`. La colonna `password_plain` non esiste più nel DB.

## Comportamento atteso

- **Prima generazione ("Genera")**: Click → la mutation chiama l'edge function → `onSuccess` cattura `plainPassword` → la password appare in chiaro, copiabile.
- **Rigenerazione ("Rigenera")**: Stesso flusso, nuove credenziali generate e mostrate.
- **Refresh pagina**: Placeholder "Genera per ottenere la password" (la password non è mai persistita nel DB).
- **Aziende.tsx**: Nessun crash da referenza a colonna inesistente.

