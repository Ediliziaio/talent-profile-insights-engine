

# Creare la pagina Garanzia

## Cosa fare

### 1. Nuovo file `src/pages/Garanzia.tsx`
Pagina pubblica "Soddisfatti o Rimborsati" con lo stesso stile della Home (sfondo chiaro, brand colors orange/blue, `landing-card` styles, framer-motion animations). Struttura:

- **Header/Navbar** — riutilizza la stessa navbar della Home (o un componente condiviso)
- **Hero** — Titolo grande: "Garanzia Soddisfatti o Rimborsati", sottotitolo: "Se non sei soddisfatto, ti rimborsiamo. Senza domande." con icona Shield
- **Come funziona** — 3 step semplici:
  1. Provi TalentProfile per 30 giorni
  2. Se non ti convince, scrivi una mail
  3. Rimborso completo, senza domande
- **Cosa copre la garanzia** — Lista chiara di cosa è incluso (assessment, report, confronto candidati)
- **FAQ garanzia** — 3-4 domande frequenti con Accordion (stesse del pattern Home)
- **CTA finale** — "Provalo senza rischi" con bottone che porta a `/auth`
- **Footer** — stesso footer della Home

### 2. Aggiornare `src/App.tsx`
- Aggiungere lazy import per `Garanzia`
- Aggiungere route `/garanzia` (pubblica, no ProtectedRoute)

### 3. Aggiornare `src/pages/Home.tsx`
- Aggiungere link alla pagina Garanzia nel footer (colonna "Risorse" o "Prodotto")

