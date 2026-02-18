

# Aggiungere "Crea Nuovo Abbonamento" alla pagina Pagamenti

## Cosa cambia

Un bottone "Nuovo Abbonamento" accanto ai filtri che apre un dialog per creare un abbonamento per un'azienda che non ne ha ancora uno.

## Funzionamento

1. Il Superadmin clicca il bottone "Nuovo Abbonamento"
2. Si apre un dialog con:
   - **Azienda**: dropdown che mostra solo le aziende che NON hanno gia' un abbonamento
   - **Stato**: selezionabile tra attivo, trial, scaduto, sospeso (default: trial)
   - **Importo mensile**: precompilato a 97.00 EUR, modificabile
   - **Data inizio**: campo data (default: oggi)
   - **Data scadenza**: campo data (default: +1 mese)
   - **Note**: campo testo opzionale
3. Al salvataggio, il record viene inserito in `abbonamenti` e la tabella si aggiorna

## Dettagli tecnici

**File da modificare:** `src/pages/Pagamenti.tsx`

**Modifiche:**
1. Aggiungere stato `nuovoAbbonamentoDialog` (boolean)
2. Aggiungere query per caricare la lista aziende (`aziende`)
3. Aggiungere mutation `insertAbbonamentoMutation` che inserisce in `abbonamenti`
4. Aggiungere bottone "Nuovo Abbonamento" nella barra filtri (accanto al Select dello stato)
5. Creare componente `NuovoAbbonamentoDialog` che:
   - Riceve la lista aziende e la lista abbonamenti esistenti
   - Filtra le aziende gia' con abbonamento dal dropdown
   - Inserisce il nuovo record con i campi compilati

**Nessuna modifica al database** -- la tabella `abbonamenti` ha gia' tutti i campi necessari e le RLS policies per il superadmin sono gia' attive.

