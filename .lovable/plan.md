

# Filtro Date + Miglioramenti Reportistica Pagamenti

## Cosa cambia

### 1. Filtro intervallo date sulla reportistica
Un componente `DateRangePicker` (gia' esistente nel progetto) viene aggiunto sopra la sezione reportistica. Quando si seleziona un intervallo:
- I KPI (pagamenti falliti, importo medio) si ricalcolano sul periodo
- Il grafico "Incassi Mensili" mostra solo i mesi nell'intervallo
- Il grafico "Stato Pagamenti" filtra i pagamenti nel periodo
- La tabella riepilogo "Tot. Pagato" riflette solo i pagamenti nel range
- Senza filtro attivo, tutto rimane come ora (dati completi)

### 2. Metriche mancanti da aggiungere

- **MRR (Monthly Recurring Revenue)**: somma importi mensili degli abbonamenti attivi -- gia' presente come "Entrate Mensili" nella sezione KPI principale, ma mancante nella reportistica
- **Churn Rate**: percentuale abbonamenti scaduti/sospesi sul totale
- **Ricavo Totale**: somma di tutti i pagamenti completati (nel periodo filtrato)
- **Incasso Medio per Azienda**: ricavo totale diviso numero aziende con almeno un pagamento

### 3. Miglioramenti grafici

- Il grafico "Incassi Mensili" diventa dinamico: se il filtro date copre piu' di 6 mesi, mostra tutti i mesi nel range; se meno, mostra solo quelli nel range
- Aggiunta di un grafico **Trend Pagamenti Falliti vs Completati** (BarChart stacked) per visualizzare l'andamento della qualita' degli incassi nel tempo

## Dettagli tecnici

**File da modificare:**

### `src/components/PagamentiReportistica.tsx`
1. Aggiungere props `fromDate` e `toDate` (opzionali) all'interfaccia Props
2. Creare un `filteredPagamenti` con `useMemo` che filtra `pagamentiAll` per intervallo date
3. Usare `filteredPagamenti` al posto di `pagamentiAll` in tutti i calcoli (KPI, grafici, tabella)
4. Aggiungere nuove KPI cards: Churn Rate, Ricavo Totale, Incasso Medio per Azienda
5. Aggiungere grafico stacked bar "Completati vs Falliti per Mese"
6. Rendere dinamico il range mesi del grafico incassi (basato su filtro date se attivo, altrimenti ultimi 6 mesi)

### `src/pages/Pagamenti.tsx`
1. Aggiungere stati `reportFromDate` e `reportToDate` (useState)
2. Importare e renderizzare il `DateRangePicker` sopra il componente `PagamentiReportistica`
3. Passare `fromDate` e `toDate` come props a `PagamentiReportistica`

**Nessuna modifica al database** -- tutti i dati necessari sono gia' disponibili nelle query esistenti.

