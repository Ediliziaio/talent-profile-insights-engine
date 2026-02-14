

# Sostituzione Ruoli Edilizia con Nuovi Ruoli Professionali

## Cosa cambia

**Ruoli da RIMUOVERE (3):**
- Capocantiere
- Commerciale Edilizia  
- Operaio/Installatore

**Ruoli da AGGIUNGERE (5):**
1. **Imprenditore/Titolare** -- profilo alto su tutti gli assi: visione, rischio, decisione, costruzione team
2. **Consulente Strategico** -- pensiero analitico, comunicazione, autonomia, non necessariamente commerciale
3. **Team Leader/Coordinatore** -- leadership intermedia, gestione persone senza essere dirigente
4. **Formatore/Coach** -- capacita' di trasmettere, empatia, proattivita', pazienza
5. **Responsabile Qualita'/Compliance** -- rigore, principi, organizzazione, attenzione al dettaglio

Il totale passa da 17 a 19 ruoli.

## Dettagli tecnici

### File: `src/lib/roleMatchingV5.ts`

**Rimozioni:**
- Eliminare le 3 entry da `ROLE_PROFILES_V5`: `'Capocantiere'`, `'Commerciale Edilizia'`, `'Operaio/Installatore'`
- Rimuovere mapping `'Cantiere'` e `'Edilizia'` da `FUNZIONE_TO_RUOLO_MAP`
- Aggiornare commento header (da 17 a 19 ruoli)

**Aggiunte -- struttura per ogni nuovo ruolo:**

| Ruolo | Categoria | Tratti fondamentali | Soglie chiave |
|---|---|---|---|
| Imprenditore/Titolare | direzione | LDR, PRO, GP, AUT, DET | LDR>=45, PRO>=40, GP>=40, AUT>=40, DET>=35, VEN>=20 |
| Consulente Strategico | tecnico | ORG, COM, PRO, AUT | ORG>=45, COM>=30, PRO>=35, AUT>=40, GP>=30 |
| Team Leader/Coordinatore | direzione | LDR, COM, HRM, PRO | LDR>=35, COM>=25, HRM>=30, PRO>=30, GP>=30 |
| Formatore/Coach | tecnico | COM, ESP, PRO, HRM | COM>=35, ESP>=25, PRO>=30, HRM>=35, DET>=25 |
| Resp. Qualita'/Compliance | amministrativo | ORG, ADS, PRI, RC | ORG>=50, ADS>=45, PRI>=50, RC>=10, GP>=25 |

Ogni ruolo avra': requisiti, disqualifiers, profilo ideale, tratti fondamentali, domande colloquio, `validatoManualeV2: false`.

**Mapping aggiuntivi in `FUNZIONE_TO_RUOLO_MAP`:**
- `'Imprenditore'` -> `'Imprenditore/Titolare'`
- `'Titolare'` -> `'Imprenditore/Titolare'`
- `'Consulenza'` -> `'Consulente Strategico'`
- `'Coordinamento'` -> `'Team Leader/Coordinatore'`
- `'Formazione'` -> `'Formatore/Coach'`
- `'Qualita'` -> `'Responsabile Qualita/Compliance'`
- `'Ufficio acquisti'` -> `'Buyer/Acquisti'`
- `'Ufficio risorse umane'` -> `'HR Manager'`

### File: `src/types/database.ts`

Aggiornare array `FUNZIONI` aggiungendo le nuove voci corrispondenti e rimuovendo quelle edilizia.

### File: `src/test/roleMatchingV5.test.ts`

Aggiornare il test che verifica il conteggio ruoli (da 17 a 19) e i test sui ruoli validati/non validati (i nuovi sono tutti non validati).

### Ricalcolo batch

Dopo le modifiche, eseguire `batch-ricalcolo-v5` per aggiornare i profili candidato con il nuovo set di ruoli.

## Cosa NON cambia
- Nessuna modifica a soglie dei ruoli esistenti
- Nessuna modifica alla logica di scoring o sindromi
- Nessuna modifica al database schema
