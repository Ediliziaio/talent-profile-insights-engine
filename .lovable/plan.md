

# Pagamenti: Dati di Prova + Checkout Stripe Integrato

## Verifica Struttura (Completata)

La pagina /pagamenti funziona correttamente:
- 4 card metriche visibili (Entrate Mensili, Abbonamenti Attivi, Scaduti, Incassi)
- Filtri per nome azienda e stato funzionanti
- Tabella con colonne corrette
- La tabella e' vuota perche' non ci sono ancora abbonamenti nel database

---

## Fase 1: Inserire abbonamenti di prova

Creare un abbonamento per ognuna delle 3 aziende esistenti (Clientium, Manuel Sechi, Teknofinestre) con stati diversi per testare le metriche:

| Azienda | Stato | Data Inizio | Scadenza |
|---|---|---|---|
| Clientium | attivo | 1 gen 2026 | 1 mar 2026 |
| Manuel Sechi | trial | 1 feb 2026 | 1 mar 2026 |
| Teknofinestre | scaduto | 1 nov 2025 | 1 gen 2026 |

Inserire anche 2-3 pagamenti di esempio per Clientium (completato) e Teknofinestre (fallito) per popolare le metriche "Incassi Ultimo Mese".

---

## Fase 2: Checkout Stripe integrato

### Flusso utente
1. Il Superadmin dalla pagina Pagamenti clicca "Attiva Abbonamento" su un'azienda
2. Si apre la pagina di Stripe Checkout (hosted) con il prodotto da 97 EUR/mese preconfigurato
3. L'azienda (o il superadmin per conto dell'azienda) completa il pagamento
4. Stripe chiama un webhook che aggiorna lo stato dell'abbonamento nel database

### Prerequisito: abilitare Stripe
Prima di scrivere codice, abilitare l'integrazione Stripe per ottenere la chiave API. Questo sblocchera' gli strumenti avanzati per creare prodotti e prezzi direttamente.

### Cosa verra' creato

**1. Prodotto Stripe**
- Nome: "TalentProfile - Abbonamento Mensile"
- Prezzo: 97 EUR/mese, ricorrente

**2. Edge function `create-checkout-session`**
- Riceve `azienda_id` dal frontend
- Crea (o recupera) un Stripe Customer associato all'azienda
- Crea una Checkout Session con il prezzo ricorrente da 97 EUR
- Salva `stripe_customer_id` nell'abbonamento
- Ritorna l'URL della sessione Checkout

**3. Edge function `stripe-webhook`**
- Ascolta eventi Stripe: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`
- Aggiorna automaticamente stato abbonamento e registra pagamenti nella tabella `pagamenti`

**4. Modifiche UI (`Pagamenti.tsx`)**
- Aggiungere bottone "Attiva Abbonamento Stripe" nella riga di ogni azienda con stato `trial` o `scaduto`
- Il bottone apre Stripe Checkout in una nuova finestra
- Aggiungere un bottone "Crea Abbonamento" in alto per aziende che non hanno ancora un abbonamento

### Dettagli tecnici

**File da creare:**
- `supabase/functions/create-checkout-session/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**File da modificare:**
- `src/pages/Pagamenti.tsx` -- aggiunta bottoni Checkout
- `supabase/config.toml` -- configurazione JWT per le nuove functions

**Sequenza implementazione:**
1. Abilitare Stripe (raccolta chiave API)
2. Inserire dati di prova nel database
3. Creare prodotto e prezzo su Stripe
4. Creare edge function `create-checkout-session`
5. Creare edge function `stripe-webhook`
6. Aggiornare la UI con i bottoni di checkout
