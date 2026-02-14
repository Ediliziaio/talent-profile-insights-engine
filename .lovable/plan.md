

# Riformulazione Domande VEN (Blocco 9) - Da "Vendita" a "Persuasione"

## Il Problema

Le domande 201-209 usano un linguaggio troppo specifico per il ruolo commerciale: "vendita", "clienti", "trattativa", "proposte commerciali", "prodotti/servizi". Un candidato per ruoli di amministrazione, produzione o altro si sente estraneo a queste domande.

Il tratto VEN misura in realta la **capacita di persuasione, influenza e comunicazione efficace** -- competenze trasversali a qualsiasi ruolo. Le domande vanno riformulate per catturare lo stesso costrutto psicologico con parole universali.

## Riformulazioni Proposte

| ID | Scala | Pol. | Testo Attuale | Testo Nuovo | Cosa Misura |
|---|---|---|---|---|---|
| 201 | VEN | + | "Chiudi spesso una vendita o un accordo con successo?" | "Riesci spesso a convincere gli altri ad accettare le tue proposte?" | Capacita di chiusura/persuasione |
| 202 | VEN | - | "Ti capita di sentirti a disagio quando devi chiedere il prezzo per il tuo lavoro?" | "Ti capita di sentirti a disagio quando devi far valere il tuo punto di vista?" | Difficolta nell'assertivita |
| 203 | VEN | + | "Riesci a mantenere relazioni con clienti nel lungo periodo?" | "Riesci a mantenere relazioni professionali solide nel lungo periodo?" | Fidelizzazione relazionale |
| 204 | VEN | + | "Ti senti a tuo agio nel gestire obiezioni durante una trattativa?" | "Ti senti a tuo agio nel gestire le obiezioni quando presenti un'idea?" | Gestione delle resistenze |
| 205 | VEN | + | "Sei bravo a identificare i bisogni dei tuoi clienti?" | "Sei bravo a capire cosa vogliono veramente le persone con cui interagisci?" | Ascolto attivo / empatia strategica |
| 206 | PRI | + | "Ti capita di rinunciare a una vendita per mantenere la tua integrità?" | "Ti capita di rinunciare a un vantaggio personale per mantenere la tua integrita?" | Integrita etica (nota: scala PRI, non VEN) |
| 207 | VEN | + | "Riesci a creare urgenza nelle tue proposte commerciali?" | "Riesci a motivare gli altri ad agire rapidamente sulle tue proposte?" | Capacita di attivazione |
| 209 | VEN | + | "Sei bravo a presentare i vantaggi dei tuoi prodotti/servizi?" | "Sei bravo a presentare le tue idee in modo convincente?" | Comunicazione persuasiva |

**Domanda 208** ("Ti piace costruire una rete di contatti professionali?") resta invariata: e gia formulata in modo universale.

## Impatto sullo Scoring

**ZERO.** Tutte le polarita (+/-) restano identiche. Lo scoring V5 usa solo la scala e la polarita, non il testo. Nessuna modifica a `scoringV5.ts`, `ricalcoloV5.ts` o edge functions.

## Dettaglio Tecnico

### File da modificare

**`src/data/questionario.ts`** -- Aggiornare il campo `testo` per le domande 201, 202, 203, 204, 205, 206, 207, 209 (8 domande).

### Aggiornamento database

Eseguire una migrazione SQL per aggiornare la colonna `testo` nella tabella `domande` per gli stessi 8 ID, in modo che il database resti sincronizzato con il codice frontend.

### Ordine di esecuzione
1. Aggiornare i testi in `questionario.ts`
2. Eseguire la migrazione SQL sulla tabella `domande`

