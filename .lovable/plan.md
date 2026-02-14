

# Ottimizzazione Mobile della Pagina Dettaglio Candidato

## Problemi Identificati

Dalla verifica su viewport 390px, la pagina dettaglio candidato ha diversi problemi su mobile:

1. **Header troppo alto**: Il nome, i metadati e i 4 pulsanti azione (Report Colloquio, Report Sindromi, Scheda Colloquio, ...) occupano circa 300px di altezza, lasciando poco spazio per il contenuto
2. **Pulsanti azione su 2 righe**: I 4 pulsanti si wrappano su 2 righe occupando spazio prezioso
3. **Hero Card grande**: Il verdetto + i 3 gauge occupano molto spazio verticale
4. **Pulsante "Torna alla lista" fisso in basso**: Copre il contenuto e il `pb-24` non compensa abbastanza
5. **Tabs difficili da leggere**: Le 4 tab con icona + testo sono strette su 390px
6. **Scroll potenzialmente bloccato**: Il contenuto sotto le tab e' poco visibile

## Interventi Proposti

### 1. Header compatto su mobile (`CandidatoDettaglio.tsx`)
- Nascondere i pulsanti azione principali su mobile e spostarli nel menu "..." (DropdownMenu)
- Ridurre il font del nome (da `text-2xl` a `text-xl`)
- Compattare i metadati (azienda, funzione, eta, data) su una sola riga con truncate

### 2. Pulsanti azione dentro DropdownMenu su mobile
- Su mobile: mostrare solo il pulsante "..." che contiene tutte le azioni (Report Colloquio, Report Sindromi, Scheda Colloquio, Scarica PDF)
- Su desktop: layout invariato con tutti i pulsanti visibili

### 3. Hero Card piu' compatta su mobile (`HeroCardV3.tsx`)
- Ridurre padding (da `p-5` a `p-3` su mobile)
- Ridurre dimensione gauge (da 90px a 70px su mobile)
- Ridurre font del verdetto (da `text-3xl` a `text-xl` su mobile)
- Emoji verdetto piu' piccola su mobile

### 4. Fix pulsante fisso "Torna alla lista"
- Aumentare il `pb-24` del contenitore a `pb-28` per garantire che il contenuto non venga coperto
- Ridurre altezza del pulsante fisso (da `h-12` a `h-10`)

### 5. Tabs ottimizzate su mobile
- Nascondere le icone su mobile nelle tab, mostrare solo il testo
- Ridurre font-size delle tab
- Rendere le tab scrollabili orizzontalmente se necessario

## Dettaglio Tecnico

### File da modificare

**`src/pages/CandidatoDettaglio.tsx`**
- Header: wrappare i pulsanti azione in `hidden sm:flex` e aggiungerli come voci nel DropdownMenu su mobile
- Ridurre font del nome su mobile con classi responsive
- Aumentare padding-bottom del contenitore principale
- Tab: nascondere icone sotto `sm` breakpoint

**`src/components/HeroCardV3.tsx`**
- Padding responsive: `p-3 sm:p-5 md:p-6`
- Gauge size responsive: passare `size={70}` su mobile via media query o prop
- Verdetto font responsive: `text-xl sm:text-2xl md:text-3xl`
- Emoji size responsive

### Impatto
- Solo CSS/layout, nessun impatto su logica, scoring o dati
- Desktop completamente invariato

