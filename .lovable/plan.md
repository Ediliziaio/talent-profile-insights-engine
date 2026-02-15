

# Mappa Interiore -- Grafico a Candele e UX Upgrade

## Panoramica

Aggiunta di un grafico a candele (barre bidirezionali) per le 5 dimensioni profonde e restyling completo della tab per un'esperienza visiva piu' professionale e coinvolgente.

---

## 1. Grafico a Candele delle Dimensioni

Un nuovo componente grafico con barre orizzontali bidirezionali per le 5 dimensioni, ispirato al `CandleChart` gia' esistente nel progetto ma adattato per le dimensioni psicologiche della Mappa Interiore.

**Struttura del grafico:**
- Asse Y: le 5 dimensioni (Identita-Risultato, Regolazione Emotiva, Attaccamento Sicuro, Difese, Bisogno Primario)
- Asse X: scala 0-10
- Barre orizzontali colorate per valore:
  - Identita-Risultato: colori **invertiti** (verde 0-3, ambra 4-6, arancione/rosso 7-10 -- basso = positivo)
  - Regolazione Emotiva: colori normali (rosso 0-3, ambra 4-6, verde 7-10)
  - Attaccamento: score del dominante (verde se sicuro, ambra se ansioso/evitante, rosso se disorganizzato)
  - Difese: 0 se equilibrate (verde), score stimato se attive (ambra/rosso)
  - Bisogno Primario: score grezzo (neutro, blu/viola)
- Zone di sfondo colorate (rosso chiaro, giallo chiaro, verde chiaro) come nel TraitCandleChart
- Linea di riferimento a score 5 (centro scala)
- Tooltip ricco con etichetta qualitativa e spiegazione breve
- Label con valore numerico alla fine di ogni barra
- Etichette complete sulle righe

Il grafico viene posizionato in cima alla tab, subito dopo il titolo, sostituendo le 2 progress bar attuali e integrando visivamente tutte e 5 le dimensioni in un'unica vista.

## 2. Restyling UX Completo

**A. Header della tab**
- Titolo piu' grande con sottotitolo "Report di Psicologia Profonda"
- Profilo narrativo mostrato come badge prominente sotto il titolo (es. "IL COSTRUTTORE SOTTO PRESSIONE" con sfondo colorato)

**B. Sezione Dimensioni (dopo il grafico)**
- I 3 badge (Stile relazionale, Reazione pressione, Motore primario) diventano card pill piu' grandi con icone colorate e sfondo leggero
- Il collapsible per l'attaccamento dettagliato rimane ma con stile migliorato (bordo sinistro colorato, punteggi con mini-barre)

**C. Card Narrative**
- Sfondo leggero personalizzato per ogni card (non solo bordo sinistro)
- Icone piu' grandi e colorate
- Titoli piu' prominenti
- Testo con interlinea piu' generosa per leggibilita'

**D. Card "La Chiave"**
- Piu' enfatizzata: sfondo gradiente viola, testo piu' grande, icona chiave animata (pulse leggero)
- Bordo doppio con ombra

**E. Motiva / Blocca / Teme**
- Card con sfondo colorato leggero (verde chiaro, rosso chiaro, ambra chiaro) invece del bianco
- Icone colorate per ogni bullet point
- Separatori visuali tra le card

**F. Box Errori**
- Piu' prominente con icona piu' grande
- Ogni errore con numero in cerchio rosso
- Bordo sinistro rosso spesso

**G. Pattern Combinatori**
- Card con icona fulmine colorata
- Sfondo leggero (verde se positivo, ambra se attenzione)
- Azione in box separato con sfondo grigio chiaro

**H. Domande Colloquio**
- Badge priorita' piu' visibili con colore pieno
- Domande in blockquote stilizzato
- Separatore tra gruppi

**I. Azioni Piano di Crescita**
- Card con step numerati in cerchi colorati
- Timeline visiva verticale tra gli step

**J. Disclaimer**
- Piu' discreto, sfondo grigio piu' chiaro, font piu' piccolo

---

## File da modificare

### `src/components/MappaInterioreTab.tsx`
- Aggiungere il grafico a candele usando recharts (BarChart layout="vertical") direttamente nel componente
- Restyling completo di tutte le sezioni come descritto sopra
- Il grafico usa i dati gia' calcolati in `MappaInterioreResult.dimensioni`

### `src/lib/mappaInteriore.ts`
- Nessuna modifica alla logica di calcolo
- Eventuale aggiunta di una funzione helper `getDimensioniChartData()` che converte i risultati delle 5 dimensioni nel formato richiesto dal grafico recharts

---

## Dettaglio tecnico del grafico

I dati per il grafico vengono costruiti dal risultato `MappaInterioreResult`:

```text
[
  { name: "Identita-Risultato", value: 1, label: "Identita stabile", color: verde (invertito) },
  { name: "Regolazione Emotiva", value: 9, label: "Eccellente", color: verde },
  { name: "Attaccamento", value: 6, label: "Sicuro", color: verde },
  { name: "Difese", value: 0, label: "Equilibrate", color: verde },
  { name: "Bisogno Primario", value: 5, label: "Sicurezza", color: blu },
]
```

Il grafico usa `ResponsiveContainer`, `BarChart` con `layout="vertical"`, `ReferenceArea` per le zone colorate, `ReferenceLine` a x=5, e `Cell` per colori condizionali per ogni barra. Tooltip personalizzato che mostra il significato qualitativo del punteggio.

