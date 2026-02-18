

# Struttura Pagamenti Aziende (Superadmin)

## Panoramica

Creare una nuova sezione "Pagamenti" nell'area Superadmin per gestire e monitorare gli abbonamenti delle aziende. L'abbonamento e' fisso a 97 EUR/mese. L'integrazione Stripe verra' collegata in un secondo momento; ora si costruisce solo la struttura dati e l'interfaccia.

## 1. Nuova tabella database: `abbonamenti`

Tabella che traccia lo stato dell'abbonamento di ogni azienda:

| Colonna | Tipo | Note |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| azienda_id | uuid | FK verso aziende, NOT NULL, UNIQUE |
| stato | varchar | 'attivo', 'scaduto', 'sospeso', 'trial', default 'trial' |
| importo_mensile | numeric | default 97.00 |
| data_inizio | timestamptz | inizio abbonamento |
| data_scadenza | timestamptz | prossima scadenza |
| stripe_customer_id | text | nullable, per futuro collegamento Stripe |
| stripe_subscription_id | text | nullable, per futuro collegamento Stripe |
| note | text | nullable, note libere superadmin |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

RLS: solo superadmin puo' leggere/scrivere.

## 2. Nuova tabella database: `pagamenti`

Storico singoli pagamenti:

| Colonna | Tipo | Note |
|---|---|---|
| id | uuid | PK |
| abbonamento_id | uuid | FK verso abbonamenti |
| azienda_id | uuid | FK logica |
| importo | numeric | NOT NULL |
| stato | varchar | 'completato', 'fallito', 'in_attesa', 'rimborsato' |
| data_pagamento | timestamptz | default now() |
| metodo | varchar | 'stripe', 'bonifico', 'manuale' |
| stripe_payment_id | text | nullable |
| note | text | nullable |
| created_at | timestamptz | default now() |

RLS: solo superadmin.

## 3. Nuova pagina: `src/pages/Pagamenti.tsx`

Pagina accessibile solo al Superadmin con:

**Header metriche (4 card)**:
- Entrate mensili totali (somma abbonamenti attivi x 97 EUR)
- Aziende con abbonamento attivo (conteggio)
- Pagamenti in ritardo / scaduti
- Incassi ultimo mese (dalla tabella pagamenti)

**Tabella abbonamenti** con colonne:
- Azienda (nome)
- Stato (badge colorato: verde=attivo, giallo=trial, rosso=scaduto, grigio=sospeso)
- Importo mensile
- Data inizio
- Prossima scadenza
- Azioni (modifica stato, vedi storico pagamenti)

**Drawer storico pagamenti** per singola azienda:
- Lista pagamenti con data, importo, stato, metodo
- Possibilita' di registrare un pagamento manuale

**Filtri**: ricerca per nome azienda, filtro per stato abbonamento

## 4. Navigazione

- Aggiungere voce "Pagamenti" nella sidebar (`NotionLayout.tsx`) con icona `CreditCard`, visibile solo al superadmin
- Aggiungere rotta `/pagamenti` in `App.tsx`

## 5. Dettagli tecnici

### File da creare:
- `src/pages/Pagamenti.tsx` -- pagina principale

### File da modificare:
- `src/components/NotionLayout.tsx` -- aggiunta voce menu
- `src/App.tsx` -- aggiunta rotta
- `src/types/database.ts` -- interfacce TypeScript per Abbonamento e Pagamento

### Migrazione SQL:
- Creazione tabelle `abbonamenti` e `pagamenti`
- RLS policies (solo superadmin)
- Trigger `update_updated_at_column` su `abbonamenti`

### Nessuna nuova dipendenza necessaria
Usa gli stessi componenti UI gia' presenti (Card, Table, Badge, Sheet, Dialog).
