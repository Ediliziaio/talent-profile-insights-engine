

# Aggiunta Bottone Elimina per Singolo Candidato

## Situazione attuale

La funzionalita' di selezione multipla e cancellazione bulk esiste gia' (checkbox + bottone "Elimina (N)" nell'header). Manca pero' un bottone cestino per ogni riga della tabella, per eliminare rapidamente un singolo candidato senza dover prima selezionarlo.

## Modifiche previste

### File: `src/pages/Candidati.tsx`

1. **Aggiungere stato per eliminazione singola**: nuovo stato `singleDeleteId` per tracciare quale candidato si vuole eliminare singolarmente.

2. **Aggiungere icona Trash2 in ogni riga** (desktop e mobile):
   - Desktop: nella colonna "Azioni", accanto al bottone "Vedi" o "Copia link", aggiungere un bottone con icona cestino (Trash2) che apre il dialog di conferma per quel singolo candidato.
   - Mobile: nella card view, aggiungere lo stesso bottone cestino accanto ai bottoni esistenti.

3. **Aggiornare il dialog di conferma eliminazione**: gestire sia il caso bulk (selectedIds) che il caso singolo (singleDeleteId), mostrando il nome del candidato quando si elimina uno solo.

4. **Aggiungere `analisi_candidato` alla cascata di eliminazione**: attualmente la `deleteMutation` cancella `profili_candidato`, `risultati`, `risposte` ma NON `analisi_candidato`. Aggiungere questa tabella alla cascata per evitare orfani.

### Dettaglio UI

**Desktop - colonna Azioni:**
- Il bottone cestino appare sempre su ogni riga, con stile `ghost` e colore rosso al hover
- Posizionato dopo il bottone "Vedi" o "Copia link"

**Mobile - card view:**
- Bottone cestino piccolo accanto ai bottoni esistenti

**Dialog conferma:**
- Singolo: "Stai per eliminare [Nome Cognome] e tutti i suoi dati."
- Multiplo: "Stai per eliminare N candidati e tutti i loro dati." (comportamento attuale)

## Cosa NON cambia
- La logica di selezione multipla e bulk delete resta invariata
- Nessuna modifica al database o alle RLS policies
- Nessuna modifica ad altri componenti
