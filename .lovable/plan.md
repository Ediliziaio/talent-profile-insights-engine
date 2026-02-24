
# Piano Enterprise per Sezione Candidato - TalentProfile

## A) Report AS-IS: Flusso Candidato

### Mappa Flusso
```text
Auth.tsx (tab "Candidato")
  |-- candidate-login Edge Function (username/password -> sessionToken)
  |-- sessionStorage.setItem('candidate_session')
  v
FormAnagrafico.tsx
  |-- Legge candidate_session da sessionStorage
  |-- register-candidate Edge Function (crea auth user + candidato record)
  |-- supabase.auth.setSession() -> sessione Supabase attiva
  v
ConsensoPrivacy.tsx
  |-- Verifica test_completato -> redirect se gia fatto
  |-- Checkbox accettazione -> navigazione
  v
Questionario.tsx (242 domande, 20 per pagina)
  |-- Carica risposte esistenti (resume)
  |-- Upsert singola risposta per ogni click
  |-- Submit finale: scoring V5 + sindromi + profilo -> DB
  v
TestCompletato.tsx (pagina finale, logout)
```

### Entita DB coinvolte
- `accessi_azienda` -- credenziali condivise per login candidato
- `login_attempts` -- rate limiting
- `candidati` -- record anagrafico
- `risposte` -- risposte questionario (upsert per domanda)
- `risultati` -- punteggi per tratto
- `profili_candidato` -- profilo V5 completo
- `profiles` -- profilo auth utente

### Problemi Identificati

#### P0 - CRITICI

1. **`register-candidate` non valida il sessionToken**: Il candidato fa login e ottiene un `sessionToken`, ma `FormAnagrafico.tsx` non lo invia mai al backend. La Edge Function `register-candidate` non lo verifica. Chiunque con un `azienda_id` valido puo registrare candidati fittizi senza autenticarsi.

2. **`register-candidate` manca validazione server-side**: La funzione verifica solo che i campi non siano vuoti (`!azienda_id || !cognome`), ma non applica validazione di formato (eta fuori range, email malformata, injection nei campi testo). La validazione Zod esiste solo lato client.

3. **SHA-256 per password hashing in `candidate-login`**: Usa `crypto.subtle.digest('SHA-256')` senza salt. Vulnerabile a rainbow tables e brute force. Dovrebbe usare bcrypt o argon2.

4. **FormAnagrafico non verifica scadenza sessione**: Il `sessionToken` ha un `expiresAt` ma il client non lo controlla mai. Un candidato potrebbe usare una sessione scaduta.

#### P1 - IMPORTANTI

5. **Questionario: risposte caricate via useEffect invece di useQuery**: Il caricamento risposte in `Questionario.tsx` (riga 51-76) usa un `useEffect` manuale con `setLoadingRisposte`. Questo bypassa React Query e non beneficia di cache, retry automatico, o gestione errori standard.

6. **Questionario: `saveMutation` senza debounce/throttle**: Ogni click su una risposta scatena immediatamente un upsert DB. Con click rapidi su domande consecutive, si generano molte richieste parallele. Non c'e un meccanismo di batching o throttle.

7. **Questionario: submit finale non e idempotente**: Se il submit fallisce a meta (es. dopo `risultati` insert ma prima di `profili_candidato`), un retry inserira duplicati in `risultati`. Non c'e un check di idempotenza.

8. **FormAnagrafico: email e telefono sono opzionali nello schema Zod ma obbligatori nell'UI**: Lo schema `formAnagraficoSchema` ha `email` e `telefono` come `.optional()`, ma l'UI li marca con asterisco e il backend li richiede (`!email || !telefono`). Incoerenza validazione.

9. **`candidate-login` rate limit: cleanup fire-and-forget**: La pulizia dei vecchi tentativi (riga 43-49) usa `.then(() => {})` senza gestione errori. Se fallisce silenziosamente, la tabella cresce indefinitamente.

#### P2 - MIGLIORAMENTI

10. **Questionario: nessun indicatore di salvataggio globale**: Il `savingId` mostra solo l'animazione pulse sulla singola risposta, ma non c'e un indicatore che confermi "tutte le risposte salvate" o "salvataggio in corso".

11. **ConsensoPrivacy: `setTimeout` di 300ms artificiale**: `handleContinue` introduce un delay di 300ms prima della navigazione senza motivo tecnico.

12. **TestCompletato: nessun guard di autenticazione**: La pagina non verifica che l'utente sia autenticato o che sia un candidato. Qualsiasi utente puo accedere a `/test/completato`.

13. **Auth.tsx: tab "Registra" visibile pubblicamente**: Chiunque puo registrare un account HR/azienda. Non e chiaro se questo sia intenzionale o se la registrazione dovrebbe essere riservata al superadmin.

---

## B) Cleanup e Semplificazione

### B1. Validazione sessionToken end-to-end
- `FormAnagrafico.tsx`: inviare `sessionToken` nel body della richiesta a `register-candidate`
- `register-candidate/index.ts`: validare il token verificando che esista un record attivo in `accessi_azienda` per quell'azienda e che il token non sia scaduto
- Dato che il sessionToken non e mai persistito in DB (e solo un UUID generato al volo dal login), l'approccio piu semplice e cambiare la logica: il client invia `sessionToken` + `azienda_id`, e il backend verifica che la coppia sia coerente con una sessione recente. Alternativa: salvare il sessionToken in una tabella `candidate_sessions` con scadenza.

### B2. Validazione server-side in `register-candidate`
Aggiungere validazione Zod (o equivalente) server-side per:
- `eta`: intero tra 16 e 99
- `email`: formato email valido
- `cognome`/`nome`: max 100 caratteri, trimmed
- `sesso`: solo 'M' o 'F'
- `ruolo_attuale` e `funzione`: da lista predefinita

### B3. Questionario: migrare caricamento risposte a useQuery
Sostituire il `useEffect` manuale con un `useQuery` che benefici di cache e retry automatico.

### B4. Coerenza validazione email/telefono
Allineare lo schema `formAnagraficoSchema` per rendere email e telefono obbligatori (come nell'UI e nel backend).

### B5. Guard su TestCompletato
Aggiungere verifica ruolo candidato e autenticazione.

---

## C) Performance

### C1. Questionario: batch save con debounce
Invece di un upsert immediato per ogni risposta, accumulare le risposte modificate e salvarle in batch ogni 2-3 secondi (o al cambio pagina). Riduce le chiamate DB da potenzialmente 20/pagina a 1.

**Stima**: da 20 richieste per pagina a 1-2 richieste. Riduzione ~90% delle chiamate DB durante la compilazione.

### C2. Questionario: scroll ottimizzato
Il componente ri-renderizza tutte le 20 domande ad ogni risposta (perche `risposte` state cambia). Memoizzare i singoli blocchi domanda con `React.memo` basato su `domanda.id` e `risposte[domanda.id]`.

**Stima**: riduzione re-render da 20 componenti a 1 per ogni click.

### C3. ConsensoPrivacy: rimuovere setTimeout artificiale
La navigazione verso il questionario ha un delay di 300ms non necessario.

---

## D) Stabilita Funzionale

### D1. Submit questionario idempotente
Prima del submit, verificare se esiste gia un `profili_candidato` per quel `candidato_id`. Se esiste, saltare l'insert (o fare upsert). Stessa logica per `risultati`: usare upsert su `(candidato_id, scala)`.

### D2. Verifica scadenza sessione candidato
In `FormAnagrafico.tsx`, controllare `expiresAt` dalla sessione e se scaduto reindirizzare ad `/auth` con messaggio appropriato.

### D3. Gestione errore rete nel questionario
Se il salvataggio di una risposta fallisce, mostrare un indicatore visivo persistente (non solo un toast) e ritentare automaticamente.

---

## E) UX

### E1. Indicatore salvataggio globale
Aggiungere un piccolo badge "Salvato" / "Salvataggio..." nella barra di navigazione sticky del questionario, accanto al contatore risposte.

### E2. Conferma prima dell'invio finale
Aggiungere un dialog di conferma prima del submit finale ("Stai per inviare le tue risposte. Questa azione non e reversibile.").

---

## F) Multi-Tenancy

### F1. Isolamento gia implementato
- `candidati.azienda_id` e impostato dal backend in `register-candidate`
- RLS policies filtrano per `user_id` del candidato
- Il candidato vede solo i propri dati

### F2. Rischio: `register-candidate` senza auth
Senza validazione del sessionToken, un attaccante potrebbe creare candidati in qualsiasi azienda conoscendone l'ID. Questo e il fix P0 principale.

---

## G) Sicurezza

### G1. Fix sessionToken (P0)
Creare tabella `candidate_sessions` per persistere e validare i token:
```text
candidate_sessions
  id: uuid
  session_token: text (unique)
  azienda_id: uuid (FK)
  expires_at: timestamptz
  used: boolean (default false)
  created_at: timestamptz
```
- `candidate-login`: inserisce record con token + scadenza
- `register-candidate`: verifica token valido, non scaduto, non usato, marca come `used`
- RLS: nessuna policy necessaria (accesso solo via service role)

### G2. Validazione input server-side (P0)
Aggiungere validazione in `register-candidate`:
- Trimming e sanitizzazione stringhe
- Verifica formato email
- Range eta 16-99
- Sesso in ['M', 'F']
- Lunghezza massima campi

### G3. Rate limit cleanup robusto (P1)
Sostituire il fire-and-forget con un cleanup schedulato o un TTL a livello DB (pg_cron o trigger).

### G4. Guard rotte candidato (P1)
- `/test/completato`: verificare autenticazione + ruolo candidato
- `/test/anagrafica`: gia protetto via sessionStorage (ma debole)

---

## H) Backup e Restore
Gia coperto dal piano globale. Le risposte del questionario sono persistite una per una (upsert immediato), quindi il rischio di perdita dati e minimo.

---

## I) Osservabilita
- `register-candidate`: aggiungere log strutturati JSON per tracciare registrazioni (azienda_id, timestamp, esito)
- `candidate-login`: gia loggato via `login_attempts` table

---

## J) Sequenza di Implementazione

### Fase 1: Sicurezza critica (P0)
1. Creare tabella `candidate_sessions` con migrazione DB
2. Aggiornare `candidate-login` per inserire sessione in DB
3. Aggiornare `FormAnagrafico.tsx` per inviare sessionToken
4. Aggiornare `register-candidate` per validare token + input server-side
5. Allineare validazione email/telefono obbligatori

### Fase 2: Stabilita (P1)
6. Submit questionario idempotente (upsert risultati e profilo)
7. Verifica scadenza sessione in FormAnagrafico
8. Guard autenticazione su TestCompletato
9. Migrare caricamento risposte a useQuery

### Fase 3: Performance e UX (P2)
10. Memoizzare blocchi domanda nel questionario
11. Indicatore salvataggio globale
12. Dialog conferma invio finale
13. Rimuovere setTimeout ConsensoPrivacy

### Note
- Fase 1 e critica per la sicurezza e deve essere implementata per prima
- Fase 2 e 3 sono behavior-preserving e non rompono funzionalita
- Stima totale: 2-3 iterazioni di implementazione
