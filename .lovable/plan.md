

# Riformulazione Domande con Risposte Custom

## Il Problema

Tutte le 242 domande usano le stesse 3 risposte: "Si, sempre / A volte / No, mai". Per 8 domande questo non ha senso:

- **Domande SPECIAL** (72, 73, 211, 212, 213, 228): richiedono risposte specifiche (fasce di eta, percentuali, mesi). "Si, sempre" come risposta a "A che eta hai iniziato a guadagnare?" e assurdo.
- **Domande 87 e 191**: il testo e formulato in modo che "Si, sempre / A volte / No, mai" suona innaturale.

## La Soluzione

Due interventi combinati:

### A. Risposte custom per le 6 domande SPECIAL

Aggiungere un campo opzionale `risposte_custom` alla struttura dati. Quando presente, il questionario mostra quelle etichette invece di "Si, sempre / A volte / No, mai".

| ID | Domanda (invariata) | A | B | C |
|---|---|---|---|---|
| 72 | "A che eta hai iniziato a guadagnare denaro?" | Prima dei 21 anni | Tra i 21 e i 23 anni | Dopo i 23 anni |
| 73 | "Che percentuale del tuo reddito annuo riesci a mettere da parte?" | Meno del 5% | Tra il 5% e il 15% | Piu del 15% |
| 211 | "Dedichi regolarmente del tempo alla gestione dei tuoi investimenti?" | Si, regolarmente | Meno del dovuto | No, per niente |
| 212 | "Le tue riserve finanziarie coprono..." | Meno di 3 mesi di spese | Tra 3 e 6 mesi di spese | Piu di 9 mesi di spese |
| 213 | "A quanti mesi ammonta la tua autonomia finanziaria attuale?" | Meno di 3 mesi | Tra 3 e 9 mesi | Piu di 9 mesi |
| 228 | "Rispetto alla media delle persone, quanto potenziale di successo ritieni di avere?" | Molto piu della media | Nella media | Un po' meno della media |

Lo scoring SPECIAL resta identico: i valori A/B/C nel codice non cambiano, cambia solo l'etichetta visuale.

### B. Riformulazione testo per Q87 e Q191

Queste due domande hanno polarita standard ('-') ma il testo suona male con "Si, sempre / A volte / No, mai". Riformulazione:

| ID | Testo attuale | Testo nuovo | Polarita | Perche funziona |
|---|---|---|---|---|
| 87 | "Ti senti troppo giovane o troppo vecchio per migliorare?" | "Ti capita di pensare che ormai sia troppo tardi per migliorare?" | - (invariata) | "Si, sempre / A volte / No, mai" suona naturale |
| 191 | "Preferisci lavorare in maniera autonoma piuttosto che in team?" | "Ti capita di preferire il lavoro in solitaria rispetto al lavoro di squadra?" | - (invariata) | "Si, sempre / A volte / No, mai" suona naturale |

La polarita '-' resta invariata, quindi lo scoring non cambia.

---

## Dettaglio Tecnico

### File da modificare

**`src/data/questionario.ts`**
- Aggiungere campo opzionale `risposte_custom?: { a: string; b: string; c: string }` all'interfaccia `DomandaV5`
- Aggiungere `risposte_custom` alle 6 domande SPECIAL (72, 73, 211, 212, 213, 228)
- Aggiornare il testo delle domande 87 e 191

**`src/pages/Questionario.tsx`**
- Nel rendering delle risposte, controllare se la domanda corrente ha `risposte_custom`
- Se si: usare quelle etichette al posto di "Si, sempre / A volte / No, mai"
- Se no: comportamento attuale invariato

**`src/components/AnswerButton.tsx`**
- Nessuna modifica necessaria: gia accetta `label` e `shortLabel` come props

### Impatto sullo scoring
- ZERO: lo scoring usa solo il valore `A`, `B`, `C` salvato in DB. Le etichette sono solo visuali.
- La mappa `SPECIAL_SCORING` in `scoringV5.ts` resta identica.
- Il `batch-ricalcolo-v5` edge function non e impattato.

### Ordine di esecuzione
1. Aggiornare interfaccia `DomandaV5` in `questionario.ts`
2. Aggiornare le 8 domande (6 custom labels + 2 riformulazioni testo)
3. Aggiornare `Questionario.tsx` per leggere `risposte_custom`
4. Aggiornare le stesse domande nel database (tabella `domande`)

