

# Reportistica Completa Pagamenti

## Cosa viene aggiunto

Una sezione di reportistica avanzata sotto le metriche KPI esistenti, con grafici e tabelle riepilogative che coprono: stato abbonamenti, andamento incassi, utilizzo piattaforma per azienda e overview finanziaria.

## Struttura della reportistica

### 1. KPI aggiuntivi (nuova riga di cards)
- **Tasso Conversione Trial->Attivo**: percentuale di aziende passate da trial ad attivo
- **Abbonamenti Totali**: conteggio complessivo
- **Importo Medio**: media degli importi mensili
- **Pagamenti Falliti**: conteggio pagamenti con stato "fallito"

### 2. Grafici (2 righe da 2 colonne)

**Riga 1:**
- **Distribuzione Stato Abbonamenti** (PieChart): spicchi colorati per attivo/trial/scaduto/sospeso
- **Incassi Mensili** (BarChart): importi incassati raggruppati per mese (ultimi 6 mesi)

**Riga 2:**
- **Stato Pagamenti** (PieChart): completato/fallito/in_attesa/rimborsato
- **Utilizzo per Azienda** (BarChart orizzontale): numero candidati per azienda, con indicazione dello stato abbonamento

### 3. Tabella Riepilogo Utilizzo per Azienda
Una tabella che mostra per ogni azienda:
- Nome azienda
- Stato abbonamento
- Numero candidati totali
- Candidati con test completato
- Tasso completamento %
- Importo mensile
- Pagamenti completati totali

## Dettagli tecnici

**File da modificare:** `src/pages/Pagamenti.tsx`

**Nuove query:**
1. `pagamenti-all` -- fetch di tutti i pagamenti per costruire i grafici (importo, stato, metodo, data_pagamento, azienda_id)
2. `candidati-per-azienda` -- fetch candidati raggruppati per azienda_id con conteggio test_completato (riutilizza la query gia' presente nella rete: `candidati?select=azienda_id,test_completato`)

**Nuove dipendenze:** nessuna -- recharts e date-fns sono gia' installati.

**Modifiche al componente:**
1. Aggiungere le query `pagamenti-all` e `candidati-per-azienda` con `useQuery`
2. Calcolare metriche aggiuntive con `useMemo` (tasso conversione, importo medio, pagamenti falliti)
3. Preparare dati per i grafici con `useMemo`:
   - `statoAbbonamentiData` -- raggruppa abbonamenti per stato
   - `incassiMensiliData` -- raggruppa pagamenti completati per mese (ultimi 6 mesi)
   - `statoPagamentiData` -- raggruppa pagamenti per stato
   - `utilizzoAziendeData` -- unisce aziende + candidati + abbonamento
4. Renderizzare i grafici usando `recharts` (PieChart, BarChart, ResponsiveContainer, Tooltip, Legend, Cell)
5. Renderizzare la tabella riepilogo utilizzo sotto i grafici

**Pattern UI:** Stesso stile gradient cards e layout responsive gia' usato nel Dashboard principale (grid-cols-2 su mobile, grid-cols-4 su desktop per le KPI; grid-cols-1 md:grid-cols-2 per i grafici).

