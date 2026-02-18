
# Indicatore Variazione % Mese Precedente nelle KPI Cards

## Cosa cambia

Ogni KPI card che ha dati storici mostra un indicatore di variazione percentuale rispetto al mese precedente, con icona freccia su/giu e colore verde (positivo) o rosso (negativo). Le KPI senza serie temporale (Conversione, Churn, Abbonamenti Totali) non avranno l'indicatore.

## Cards con indicatore

| KPI | Calcolo variazione |
|-----|-------------------|
| MRR | Ricavo mese corrente vs mese precedente |
| Pagamenti Falliti | Conteggio falliti mese corrente vs precedente (inversione colore: rosso se aumenta) |
| Ricavo Totale | Ricavo mese corrente vs precedente |
| ARPA | ARPA mese corrente vs precedente |

## Aspetto visivo

```text
+----------------------------------+
| MRR                        $     |
| EUR 4.200                        |
| +12% ^   ~~~/\___/~~~ sparkline  |
+----------------------------------+
```

- Freccia verso l'alto (TrendingUp) + testo verde per variazione positiva
- Freccia verso il basso (TrendingDown) + testo rosso per variazione negativa
- Per "Pagamenti Falliti" la logica colore e' invertita (meno falliti = verde)
- Testo piccolo (`text-xs`) accanto alla sparkline
- Se il mese precedente ha valore 0, mostra "N/A" o nessun indicatore

## Dettagli tecnici

**File da modificare:** `src/components/PagamentiReportistica.tsx`

### 1. Calcolo variazioni (useMemo)
Estendere il `useMemo` `sparklineData` esistente per restituire anche le variazioni percentuali. I dati degli ultimi 2 mesi (indici 4 e 5 nell'array da 6 elementi) vengono confrontati:

```
const prevMonth = ricavo[4].value;
const currMonth = ricavo[5].value;
const deltaRicavo = prevMonth > 0 ? ((currMonth - prevMonth) / prevMonth) * 100 : null;
```

Stesso calcolo per `falliti`, `arpa`. Aggiungere queste variazioni all'oggetto restituito da `sparklineData`.

### 2. Componente DeltaBadge inline
Creare un piccolo componente interno `DeltaBadge` che riceve:
- `delta: number | null` -- variazione percentuale
- `invertColor?: boolean` -- per Pagamenti Falliti (aumento = negativo)

Renderizza: icona `TrendingUp`/`TrendingDown` (12px) + `+X%` o `-X%` con colori appropriati. Se `delta` e' `null`, non renderizza nulla.

### 3. Integrazione nelle KPI cards
Aggiungere `<DeltaBadge>` dentro `CardContent` di MRR, Pagamenti Falliti, Ricavo Totale e ARPA, posizionato tra il valore numerico e la sparkline, in un `div` con `flex items-center gap-2`.
