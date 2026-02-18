

# Sparkline nei KPI Cards della Reportistica Pagamenti

## Cosa cambia

Ogni card KPI nella reportistica mostra un piccolo grafico sparkline (linea sottile) sotto il valore numerico, rappresentando il trend degli ultimi 6 mesi per quella metrica. Questo permette di capire a colpo d'occhio se una metrica sta migliorando o peggiorando.

## Sparkline per ogni KPI

| KPI | Dati sparkline |
|-----|---------------|
| Conversione Trial->Attivo | % conversione calcolata mese per mese (non applicabile storicamente, mostra valore fisso) |
| Churn Rate | Stesso, valore statico dagli abbonamenti attuali |
| MRR | Somma incassi completati per mese (ultimi 6 mesi) -- proxy del MRR |
| Pagamenti Falliti | Conteggio falliti per mese |
| Ricavo Totale | Incassi cumulativi per mese |
| ARPA | Incasso medio per azienda per mese |
| Abbonamenti Totali | Non ha trend mensile, nessuna sparkline |

Le sparkline con dati significativi saranno: **MRR**, **Pagamenti Falliti**, **Ricavo Totale** e **ARPA**. Le altre KPI (Conversione, Churn, Abbonamenti Totali) sono snapshot e non hanno serie temporali -- verranno mostrate senza sparkline.

## Dettagli tecnici

**File da modificare:** `src/components/PagamentiReportistica.tsx`

### 1. Calcolo dati sparkline (useMemo)
Aggiungere un `useMemo` che calcola, per gli ultimi 6 mesi, i valori mensili di:
- `ricavoMensile[]` -- somma pagamenti completati per mese
- `fallitiMensile[]` -- conteggio pagamenti falliti per mese
- `arpaMensile[]` -- ricavo / numero aziende paganti per mese

Struttura dati: `{ month: string, value: number }[]` per ciascuna serie.

### 2. Componente Sparkline inline
Creare un piccolo componente `MiniSparkline` interno al file che usa recharts `LineChart` + `Line` con:
- `ResponsiveContainer` altezza 30px
- Nessun asse, nessun tooltip, nessuna griglia
- Linea sottile (strokeWidth 1.5) con colore passato come prop
- Dati passati come array di `{ value: number }`

```text
+----------------------------------+
| Ricavo Totale            $       |
| EUR 12.500                       |
| ~~~/\___/~~~  (sparkline)        |
+----------------------------------+
```

### 3. Integrazione nelle KPI cards
- **MRR card**: sparkline verde con `ricavoMensile`
- **Pagamenti Falliti card**: sparkline rossa con `fallitiMensile`
- **Ricavo Totale card**: sparkline verde con `ricavoMensile` (cumulativo)
- **ARPA card**: sparkline blu con `arpaMensile`
- Le altre 3 cards restano invariate (senza sparkline)

Ogni sparkline viene aggiunta sotto il valore `text-2xl` dentro `CardContent`, con un `div` wrapper alto 30px e margine top minimo.

### 4. Import aggiuntivi da recharts
Aggiungere `LineChart, Line` agli import esistenti di recharts.

**Nessuna modifica al database o ad altri file.**

