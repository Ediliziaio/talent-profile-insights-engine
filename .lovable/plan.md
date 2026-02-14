

# Aggiunta 5 Nuovi Ruoli Professionali (da 19 a 24)

## Ruoli da aggiungere

| # | Ruolo | Categoria | Tratti fondamentali | Requisiti chiave |
|---|---|---|---|---|
| 1 | **Controller di Gestione** | amministrativo | ORG, ADS, FIN, PRI | ORG>=45, ADS>=40, FIN>=30, PRI>=40, GP>=25 |
| 2 | **Data Analyst** | tecnico | ORG, ADS, AUT, GP | ORG>=40, ADS>=40, AUT>=30, GP>=25, PRO>=20 |
| 3 | **Account Manager** | commerciale | COM, VEN, ESP, HRM | COM>=35, VEN>=30, ESP>=20, HRM>=25, PRO>=25, DET>=25 |
| 4 | **Office Manager** | amministrativo | ORG, COM, ADS, HRM | ORG>=40, COM>=30, ADS>=35, HRM>=25, PRO>=20 |
| 5 | **Responsabile IT/Sistemi** | tecnico | ORG, ADS, GP, PRO | ORG>=45, ADS>=40, GP>=30, PRO>=30, AUT>=30 |

## Logica disqualifier per ogni ruolo

**Controller di Gestione** -- Profilo analitico-finanziario, rigore nei numeri
- Blocking: ORG<30, ADS<25, sindromi S01/S02/S06
- Warning: FIN<10

**Data Analyst** -- Profilo metodico, precisione e autonomia
- Blocking: ORG<25, ADS<25, sindromi S01/S02/S04
- Warning: PRO<10

**Account Manager** -- Relazione con clienti esistenti, fidelizzazione
- Blocking: COM<15, sindromi S01/S02/S03/S05
- Warning: VEN<15, ESP<5

**Office Manager** -- Gestione ufficio, persone e procedure quotidiane
- Blocking: ORG<25, sindromi S01/S04/S16
- Warning: COM<15

**Responsabile IT/Sistemi** -- Infrastruttura tecnica, problem solving sotto pressione
- Blocking: ORG<30, ADS<25, sindromi S01/S02/S04
- Warning: GP<15

Tutti con `validatoManualeV2: false`.

## File da modificare

### `src/lib/roleMatchingV5.ts`
- Aggiungere 5 nuove entry in `ROLE_PROFILES_V5` (dopo riga 935, prima di HR Recruiter)
- Aggiornare commento header da 19 a 24 ruoli
- Aggiungere mapping in `FUNZIONE_TO_RUOLO_MAP`:
  - `'Controllo di gestione'` -> `'Controller di Gestione'`
  - `'Data analysis'` -> `'Data Analyst'`
  - `'Account management'` -> `'Account Manager'`
  - `'Segreteria/Assistenza dir.'` -> `'Office Manager'` (piu' appropriato)
  - `'IT'` -> `'Responsabile IT/Sistemi'`
  - `'Sistemi informativi'` -> `'Responsabile IT/Sistemi'`
- Aggiornare commento funzione `calculateAllRolesCompatibilityV5` (da 19 a 24)

### `src/types/database.ts`
- Aggiungere nuove funzioni nell'array `FUNZIONI`: `'Controllo di gestione'`, `'Data analysis'`, `'Account management'`, `'IT/Sistemi informativi'`

### `src/test/roleMatchingV5.test.ts`
- Aggiornare conteggio ruoli da 19 a 24
- Aggiornare conteggio ruoli non validati da 12 a 17 (5 nuovi tutti non validati)

## Verifica

Dopo l'implementazione, verifico sulla pagina candidato che i 5 nuovi ruoli appaiano nella lista compatibilita' con percentuali coerenti.

## Cosa NON cambia
- Nessuna modifica ai 19 ruoli esistenti
- Nessuna modifica a logica scoring o sindromi
- Nessuna modifica al database schema

