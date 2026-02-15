

# Calcolatore "Quanto Ti Costa un'Assunzione Sbagliata" + Verifica Copy

## Panoramica

Aggiungere una nuova sezione interattiva con un calcolatore del costo di un'assunzione sbagliata, posizionata dopo la sezione "Il Problema" (sezione 4) e prima della "Buona Notizia" (sezione 5). Include slider per lo stipendio, mesi di formazione, e calcolo automatico del danno totale con breakdown visivo. Sotto il calcolatore, 2-3 scenari reali tipo "Ti e' mai capitato?".

---

## File da modificare

Solo `src/pages/Home.tsx`

---

## 1. Nuova sezione: Calcolatore Costo Assunzione Sbagliata

### Posizione
Tra la sezione "PROBLEMA" (sezione 4, riga 595) e "BUONA NOTIZIA" (sezione 5, riga 597).

### Struttura

**Titolo della sezione:**
- Pretitolo: "Il Conto Che Non Fai"
- H2: "Quanto ti costa DAVVERO un'assunzione sbagliata?"
- Sottotitolo: "Sposta gli slider e scopri quanto stai bruciando ogni volta che sbagli persona."

**Calcolatore interattivo (Card grande centrata):**

Due slider (useState):
1. **Stipendio lordo annuo** (RAL): da 20.000 a 80.000 euro, step 5.000, default 30.000
2. **Mesi prima di accorgerti dell'errore**: da 1 a 12, step 1, default 3

**Calcolo automatico (formula):**
- Stipendio bruciato = RAL / 12 * mesi
- Costo formazione = RAL * 0.15 (15% del RAL)
- Costo recruiting (annunci, tempo HR, colloqui) = 3.000 euro fisso
- Produttivita' persa = RAL / 12 * mesi * 0.4 (40% di produttivita' sotto le aspettative)
- Costo riassunzione = 3.000 euro fisso
- **TOTALE** = somma di tutti

**Visualizzazione risultato:**
- Numero grande animato in arancione col totale (es. "€27.500")
- Sotto: breakdown in 5 voci con barra di progresso proporzionale e importo
- Nota finale in rosso: "E questo senza contare il danno al morale del team, i clienti persi e il tempo che non torna."

### Layout
- Su desktop: card larga con sfondo chiaro, bordo, shadow
- Slider con Tailwind (input range nativo stilizzato oppure il componente Slider di Radix gia' installato)
- Su mobile: tutto in colonna, slider full-width

---

## 2. Scenari "Ti E' Mai Capitato?"

Sotto il calcolatore, 3 card con scenari realistici:

**Scenario 1 -- "Il commerciale perfetto"**
- "L'hai formato per 3 mesi. Gli hai dato il portfolio clienti. Sembrava il migliore. Poi ha mollato -- portandosi dietro 2 clienti. Costo stimato: €35.000+"

**Scenario 2 -- "Il responsabile che non responsabilizza"**
- "RAL €45.000. Dopo 6 mesi il team era a pezzi. 2 dimissioni a catena. Costo reale tra turnover, riassunzioni e produttivita' persa: oltre €80.000."

**Scenario 3 -- "L'operativo che 'andava bene'"**
- "Assunto d'urgenza, senza assessment. 4 mesi di errori operativi, reclami clienti, formazione buttata. Poi ricominciare da capo. Totale: €22.000 per un ruolo da €25.000 di RAL."

Layout: griglia 3 colonne su desktop, stack su mobile. Ogni card con icona emoji, titolo bold, testo narrativo, e importo in rosso.

---

## 3. Navigazione

Aggiungere "Calcolatore" al NAV_LINKS con id `calcolatore` per poter navigare direttamente alla sezione.

---

## Dettaglio Tecnico

### Stato React
```
const [ral, setRal] = useState(30000);
const [mesi, setMesi] = useState(3);
```

Calcoli derivati con useMemo:
```
const costoTotale = useMemo(() => {
  const stipendioBruciato = (ral / 12) * mesi;
  const formazione = ral * 0.15;
  const recruiting = 3000;
  const produttivitaPersa = (ral / 12) * mesi * 0.4;
  const riassunzione = 3000;
  return { stipendioBruciato, formazione, recruiting, produttivitaPersa, riassunzione,
           totale: stipendioBruciato + formazione + recruiting + produttivitaPersa + riassunzione };
}, [ral, mesi]);
```

### Componenti utilizzati
- `Slider` da `@radix-ui/react-slider` (gia' installato in `src/components/ui/slider.tsx`)
- `Card` esistente
- `Calculator` icon da lucide-react (da importare)

### Nessuna dipendenza aggiuntiva
Tutto con componenti e librerie gia' presenti.

