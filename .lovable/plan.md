

# Generare immagine AI per la sezione "La scienza dietro le decisioni"

## Cosa fare

Sostituire il placeholder attuale (icona Brain con sfondo gradient blu) con un'immagine generata dall'AI che rappresenti il concetto "la scienza dietro le decisioni di assunzione".

### Passaggi

1. **Generare l'immagine** tramite l'edge function AI (modello `google/gemini-3-pro-image-preview` per qualità superiore). Prompt: un'illustrazione professionale e moderna che rappresenti l'analisi scientifica delle persone in ambito HR — ad esempio un profilo umano stilizzato con connessioni neurali/dati, toni blu scuro e arancione in linea con il brand.

2. **Salvare l'immagine** nello storage (bucket pubblico) o direttamente in `public/images/` come file statico.

3. **Aggiornare `src/pages/Home.tsx`** (righe 1146-1163): sostituire il div con gradient+Brain icon con un tag `<img>` che mostra l'immagine generata, mantenendo lo stesso aspect ratio (4/3), rounded corners e shadow.

### Dettaglio tecnico

- Creare un'edge function `generate-landing-image` che chiama il modello AI, riceve il base64, lo carica su storage e restituisce l'URL pubblico
- In alternativa (più semplice): generare l'immagine una volta sola, salvarla in `public/images/manifesto-hero.png` e referenziarla staticamente — evita chiamate API ad ogni page load
- Approccio consigliato: **statico** (generare una volta, salvare nel progetto)

### Risultato

Il placeholder blu con icona Brain viene sostituito da un'immagine AI professionale che rende la sezione più visivamente impattante e credibile.

