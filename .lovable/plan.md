
# Fix: Completare lista FUNZIONI e correggere mappature ruoli

## Problemi trovati

### 1. Duplicato "Selezione personale"
La voce "Selezione personale" appare DUE VOLTE nella lista FUNZIONI (righe 246 e 259 di `database.ts`). Va rimosso il duplicato.

### 2. Conflitto mappatura "Segreteria/Assistenza dir."
La funzione "Segreteria/Assistenza dir." mappa a "Office Manager", ma il ruolo "Assistente di Direzione" non ha nessuna funzione dedicata nel form. Servono due voci separate:
- "Segreteria/Assistenza dir." -> Office Manager (mappatura esistente, corretta)
- Aggiungere "Assistente di direzione" -> Assistente di Direzione (nuova voce)

### 3. Lista FUNZIONI non ordinata
Le voci sono in ordine sparso. Meglio ordinarle alfabeticamente per una migliore usabilita'.

---

## Modifiche

### File: `src/types/database.ts`
- Rimuovere il duplicato "Selezione personale" (riga 259)
- Aggiungere "Assistente di direzione" come nuova voce
- Ordinare la lista alfabeticamente

Lista finale FUNZIONI (27 voci, ordinate):
```
Account management, Amministrazione, Assistente di direzione, Cantiere/Edilizia,
Consulenza, Controllo di gestione, Coordinamento, Customer care, Data analysis,
Direzione commerciale, Direzione generale, Formazione, Impiegato amministrativo,
Imprenditore, Installazione/Manutenzione, IT/Sistemi informativi, Logistica,
Produzione, Project management, Qualita'/Compliance, Segreteria/Assistenza dir.,
Selezione personale, Ufficio acquisti, Ufficio marketing, Ufficio risorse umane,
Ufficio tecnico, Ufficio vendite
```

### File: `src/lib/roleMatchingV5.ts`
- Aggiungere mappatura: `'Assistente di direzione': 'Assistente di Direzione'`

### Verifica copertura completa

Dopo le modifiche, ogni voce FUNZIONI mappera' a un ruolo ROLE_PROFILES_V5:

| Funzione | Ruolo V5 |
|---|---|
| Account management | Account Manager |
| Amministrazione | Responsabile Amministrativo |
| Assistente di direzione | Assistente di Direzione |
| Cantiere/Edilizia | Capocantiere |
| Consulenza | Consulente Strategico |
| Controllo di gestione | Controller di Gestione |
| Coordinamento | Team Leader/Coordinatore |
| Customer care | Customer Care |
| Data analysis | Data Analyst |
| Direzione commerciale | Direttore Commerciale |
| Direzione generale | Direttore Generale |
| Formazione | Formatore/Coach |
| Impiegato amministrativo | Impiegato Amministrativo |
| Imprenditore | Imprenditore/Titolare |
| Installazione/Manutenzione | Operaio/Installatore |
| IT/Sistemi informativi | Responsabile IT/Sistemi |
| Logistica | Responsabile Produzione/Logistica |
| Produzione | Responsabile Produzione/Logistica |
| Project management | Project Manager |
| Qualita'/Compliance | Responsabile Qualita'/Compliance |
| Segreteria/Assistenza dir. | Office Manager |
| Selezione personale | HR Recruiter |
| Ufficio acquisti | Buyer/Acquisti |
| Ufficio marketing | Marketing Manager |
| Ufficio risorse umane | HR Manager |
| Ufficio tecnico | Responsabile Tecnico |
| Ufficio vendite | Venditore/Commerciale |

Tutti i 24 ruoli sono coperti (Produzione e Logistica condividono lo stesso ruolo).
