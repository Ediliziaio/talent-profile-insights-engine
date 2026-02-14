

# Ottimizzazione Mobile del Questionario

## Stato Attuale

Il layout mobile attuale ha questi limiti:
- Ogni domanda e racchiusa in una **Card con bordo e padding** che occupa spazio verticale prezioso
- I 3 pulsanti di risposta (grid-cols-3) con cerchio + testo diventano stretti su schermi piccoli, specialmente per le risposte custom lunghe (es. "Tra 3 e 6 mesi di spese")
- Lo **spazio tra domande** (space-y-3) accumula scroll inutile su 20 domande
- L'header occupa molto spazio verticale su mobile
- La progress bar ha una sezione separata che aggiunge altro spazio

## Interventi

### 1. Layout domande piu compatto (Questionario.tsx)
- Rimuovere le Card individuali su mobile: usare un layout a lista con separatori leggeri invece di card con bordo+shadow per ogni domanda
- Ridurre padding interno (da p-3 a p-2.5)
- Ridurre gap tra domande (da space-y-3 a space-y-2)
- Aggiungere un indicatore visivo piu sottile per le risposte completate (bordo sinistro colorato invece di shadow)

### 2. Header compatto su mobile
- Compattare header e progress bar in un unico blocco: integrare la barra di progresso direttamente sotto l'header, senza spazio aggiuntivo
- Ridurre altezza header su mobile (padding py-2 invece di p-3)
- Nascondere il testo "Dom. X-Y di Z" su schermi molto piccoli e lasciare solo "Pag. X/Y"

### 3. Pulsanti risposta ottimizzati (AnswerButton.tsx)
- Ridurre altezza minima da 56px a 48px per le risposte standard
- Per risposte custom lunghe: usare testo su una sola riga con ellipsis oppure adattare il layout a colonna verticale (stack) quando il testo e lungo
- Rimuovere il cerchio con la lettera su mobile per guadagnare spazio orizzontale: mostrare solo il testo della risposta
- Feedback di selezione piu chiaro: checkmark integrato nel bordo

### 4. Footer navigazione piu snello
- Ridurre altezza del footer fisso (da py-3 a py-2)
- Compattare il contatore risposte in un badge piu piccolo

## Dettaglio Tecnico

### File da modificare

**`src/components/AnswerButton.tsx`**
- Variant mobile: rimuovere il cerchio lettera, usare solo testo con bordo colorato
- Ridurre min-h da 56px a 48px
- Aggiungere supporto per testo lungo con `line-clamp-1` o `truncate`
- Checkmark inline quando selezionato (senza cerchio)

**`src/pages/Questionario.tsx`**
- Mobile: sostituire Card individuali con div leggeri + bordo sinistro per stato completato
- Compattare header: unire header + progress bar
- Ridurre spacing verticale generale
- Footer: ridurre padding verticale

### Impatto
- Solo CSS/layout, nessun impatto su logica o scoring
- Desktop resta invariato (tutte le modifiche sono sotto `lg:hidden` / breakpoint mobile)

