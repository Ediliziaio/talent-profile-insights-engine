

# Aggiornamento Indice PDF con sotto-voce "Chi è [Nome]"

## Stato attuale

L'indice (linee 272-287 di `PremiumReportPDF.tsx`) è una lista piatta di 6 sezioni senza sotto-voci. La sezione 2 dice solo "Profilo Comportamentale — Analisi dei 15 tratti, narrativa, sindromi e ruoli compatibili".

## Modifica

Trasformo l'indice da lista piatta a lista gerarchica. La sezione 2 avrà sotto-voci indentate:

- **2.1** Grafico tratti comportamentali
- **2.2** Chi è [Nome] — Narrative personalizzate
- **2.3** Segnalazioni e sindromi
- **2.4** Ruoli compatibili
- **2.5** Profilo tipo esteso

Le altre sezioni (1, 3, 4, 5, 6) rimangono invariate.

## Design sotto-voci

- Indentazione sinistra 30px (allineate sotto il titolo padre)
- Numero in grigio (fontSize 10, color TEXT_CAPTION)
- Titolo fontSize 10, color TEXT_BODY
- Nessun bordo inferiore (solo il padre ha il bordo)
- Padding verticale ridotto (6px vs 12px)

## File modificato

**`src/components/PremiumReportPDF.tsx`** — linee 272-287: sostituire l'array piatto con una struttura che supporta `children` opzionali, e renderizzare le sotto-voci per la sezione 2.

