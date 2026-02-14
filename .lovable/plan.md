

# Aggiornamento plan.md + Correzioni Linguistiche Residue

## 1. Aggiornamento plan.md

Aggiornare il file `.lovable/plan.md` per riflettere che la riformulazione VEN e completata, e documentare anche le precedenti modifiche (risposte custom, riformulazione Q87/Q191).

Il nuovo contenuto del plan documentera:
- Step completato: Riformulazione VEN (201-209)
- Step completato: Risposte custom SPECIAL (72, 73, 211, 212, 213, 228)
- Step completato: Riformulazione Q87 e Q191

## 2. Analisi Linguistica Completa

Ho verificato tutte le 242 domande. Risultato:

### Domande gia corrette (234 su 242)
Tutte le domande standard (+/-) sono formulate come comportamenti personali e si abbinano naturalmente a "Si, sempre / A volte / No, mai". Le 6 domande SPECIAL hanno risposte custom adeguate.

### Domande con potenziali criticita (3 domande)

| ID | Testo Attuale | Problema | Proposta di Riformulazione | Scala | Pol. |
|---|---|---|---|---|---|
| 77 | "Il tuo lavoro ti richiede di essere spesso in contatto con i clienti?" | Troppo specifica per ruoli commerciali (stessa logica VEN). "Clienti" esclude operai, amministrativi, ecc. | "Ti capita spesso di dover interagire con persone esterne al tuo team di lavoro?" | VEN | + |
| 86 | "Lavorare con un ritmo rapido e costante e vantaggioso?" | Domanda retorica/opinativa. "Si, sempre" applicato a "e vantaggioso?" suona forzato. | "Lavori abitualmente con un ritmo rapido e costante?" | ADS | + |
| 158 | "Fare bene le cose e un dovere, quindi correggere gli errori e utile?" | Doppia affermazione retorica. Quasi tutti rispondono "Si". | "Quando noti un errore, lo correggi subito anche se non e compito tuo?" | HRM | + |

Tutte le polarita restano invariate. Lo scoring non cambia.

## Dettaglio Tecnico

### File da modificare

1. **`.lovable/plan.md`** -- Riscrivere con lo stato aggiornato di tutti gli interventi completati
2. **`src/data/questionario.ts`** -- Aggiornare il `testo` per le domande 77, 86 e 158

### Database
Eseguire SQL UPDATE sulla tabella `domande` per sincronizzare i testi delle domande 77, 86 e 158.

### Impatto sullo scoring
ZERO. Le polarita e le scale restano identiche.

