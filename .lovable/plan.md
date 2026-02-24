
# Enterprise Production Readiness Plan - TalentProfile

## A) REPORT AS-IS

### Architettura Attuale
- **Frontend**: React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui, React Query, React Router
- **Backend**: Lovable Cloud (Supabase) con 8 Edge Functions
- **Database**: 9 tabelle con RLS policies, 3 funzioni SECURITY DEFINER
- **Auth**: Doppio sistema (Supabase Auth per HR/Admin + candidato login custom via Edge Function)
- **Ruoli**: superadmin, azienda, candidato (memorizzati nella tabella `profiles.ruolo`)

### Flussi Utente Principali
1. **Candidato**: Auth -> Anagrafica -> Privacy -> Questionario (242 domande) -> Completato
2. **HR/Azienda**: Auth -> Dashboard -> Candidati (CRUD, filtri, drawer) -> Dettaglio Candidato (4 tab)
3. **Superadmin**: Dashboard -> Aziende (CRUD) -> Candidati -> Pagamenti -> Confronto Candidati

### Problemi Identificati (Prioritizzati)

#### P0 - CRITICI (Sicurezza/Stabilita)

1. **RUOLI NEL PROFILO (Privilege Escalation Risk)**: I ruoli sono nella tabella `profiles`, non in una tabella separata `user_roles`. Un utente con accesso UPDATE al proprio profilo potrebbe alterare il proprio ruolo. Le RLS policies consentono `Users can update own profile` senza restrizioni sui campi modificabili.

2. **Edge Function `candidate-login` senza rate limiting**: Nessuna protezione brute-force. Endpoint pubblico senza JWT verification in config.toml (manca del tutto la configurazione `verify_jwt = false`).

3. **Edge Function `register-candidate` senza autenticazione**: Chiunque con un `azienda_id` valido potrebbe registrare candidati fittizi. L'endpoint non verifica il session token dal candidate-login.

4. **`password_plain` nel database**: La colonna `accessi_azienda.password_plain` esiste ancora nel DB. Anche se la memory dice che non viene piu usata, la colonna va rimossa.

5. **SHA-256 per password hashing**: Le funzioni `candidate-login` e `manage-company-access` usano SHA-256 che non e adeguato per password hashing (manca salt, troppo veloce per brute force). Dovrebbe essere bcrypt/argon2.

6. **Leaked password protection disabilitata**: Confermato dal linter Supabase.

7. **Funzione `analyze-candidate` usa scale V4 legacy**: L'edge function `analyze-candidate` contiene ROLE_REQUIREMENTS basati su scale V4 (SV, MO, CF, etc.) ma il sistema e ora completamente V5. Produce risultati incoerenti.

#### P1 - IMPORTANTI (Performance/Pulizia)

8. **Home.tsx e 2000 righe**: Pagina landing page enorme, difficile da manutenere. Contiene dati statici hardcoded, animazioni, componenti interni.

9. **Candidati.tsx e 1636 righe e Aziende.tsx e 1419 righe**: Pagine monolitiche con UI, business logic, e data layer tutti mescolati.

10. **Dashboard.tsx duplica query candidati**: La query per duplicati cross-azienda scarica tutti i candidati una seconda volta.

11. **Aziende.tsx `generatePassword()` client-side**: Funzione inutilizzata (la generazione avviene server-side), residuo di codice morto.

12. **`as any` casting diffuso**: CandidatoDettaglio.tsx usa `(profilo as any)?.assessment_version` per campi che esistono nel tipo ma non sono mappati correttamente. Indica che il tipo `ProfiloCandidato` non e aggiornato per V5.

13. **Mancanza di ProtectedRoute su Dashboard e Pagamenti**: Le pagine fanno redirect manuale controllando `user` e `profile`, ma non usano il wrapper `ProtectedRoute` in modo coerente.

#### P2 - MIGLIORAMENTI (UX/Manutenibilita)

14. **Nessun password reset flow**: Non esiste la pagina `/reset-password` ne la funzionalita di recupero password.

15. **Nessuna pagina 404 per rotte inesistenti nel layout**: La NotionLayout non gestisce rotte non valide; la route `*` esiste ma non e dentro il layout.

16. **Console potenzialmente non pulita**: Nessun ErrorBoundary sui singoli tab di CandidatoDettaglio.

---

## B) PIANO DI CLEANUP E SEMPLIFICAZIONE

### B1. Tipo `ProfiloCandidato` aggiornato per V5
Aggiornare `src/types/database.ts` per includere i campi V5 (`traits_v5`, `essere_pct`, `fare_pct`, `avere_pct`, `syndromes_detected`, `reliability_index`, `assessment_version`, `profilo_tipo_v5`) direttamente nel tipo, eliminando tutti i `(profilo as any)` casting in CandidatoDettaglio.tsx.

### B2. Rimozione codice morto
- `Aziende.tsx`: rimuovere la funzione `generatePassword()` (riga 74-81, non usata)
- Verificare se `src/lib/scaleTexts.ts`, `src/lib/chartMapping.ts`, `src/lib/interpretazioneProfile.ts` sono usati solo dal flusso V4 legacy nel CandidatoDrawer/PDFReport - se si, mantenerli per retrocompatibilita con candidati V4 esistenti

### B3. Standardizzazione ProtectedRoute
Avvolgere Dashboard e Pagamenti con `ProtectedRoute` per eliminare logica di redirect duplicata.

### B4. Centralizzazione fetch URL per Edge Functions
Creare un helper `invokeEdgeFunction(name, body, token?)` in un file utility per eliminare la costruzione manuale di URL ripetuta in Candidati.tsx, Aziende.tsx e Auth.tsx.

---

## C) PERFORMANCE

### C1. Dashboard: eliminare query duplicati separata
Integrare la logica dei duplicati cross-azienda nel dataset gia scaricato dalla query principale (sono gli stessi dati).

### C2. Candidati.tsx: spostare filtri client-side sul server
I filtri `filterFitVerdict`, `filterSesso`, `filterEta` e `searchTerm` sono applicati client-side dopo aver scaricato TUTTI i candidati. Per dataset grandi, spostare almeno `sesso` e `eta` lato server con `.eq()` / `.gte()`.

### C3. Home.tsx: code splitting
Estrarre i dati statici (NAV_LINKS, STEPS, FEATURES, TESTIMONIALS, FAQ, etc.) in un file separato `src/data/homeContent.ts` per ridurre il bundle della pagina.

### C4. Database indexes
Aggiungere indici su:
- `candidati(azienda_id, test_completato)` - usato da Dashboard e Candidati
- `risposte(candidato_id, domanda_id)` - usato dal questionario upsert
- `profili_candidato(candidato_id)` - usato dal dettaglio candidato
- `pagamenti(abbonamento_id, data_pagamento)` - usato da Pagamenti

### C5. Stima miglioramenti
- Dashboard: riduzione 1 query (duplicati) = ~200ms meno
- Candidati: filtri server-side = risparmio trasferimento dati proporzionale al dataset
- Home: estrazione dati statici = ~50KB in meno nel chunk lazy

---

## D) STABILITA FUNZIONALE

### D1. Fix `analyze-candidate` per V5
L'edge function usa scale V4 (SV, MO, CF, etc.) per i ROLE_REQUIREMENTS. Deve essere aggiornata per usare i tratti V5 (ORG, AUT, GP, etc.) allineandosi con `src/lib/roleMatchingV5.ts`.

### D2. Fix tipo ProfiloCandidato
Eliminare tutti i cast `as any` nei componenti di dettaglio candidato aggiornando il tipo TypeScript.

### D3. Gestione errori coerente
Verificare che tutte le mutation hanno handler `onError` con toast. Attualmente presente ovunque.

### D4. Loading states
Tutti i loading state sono gestiti correttamente con skeleton e spinner. Nessun fix necessario.

---

## E) UX "ESPERIENZIALE"

### E1. Feedback micro-interazioni
Gia implementati: pulse animation per salvataggio risposte, animate-in per step, spinner per navigazione privacy->questionario. Nessun intervento necessario.

### E2. Mobile
Gia implementato mobile-first con responsive layout e bottom sheets. Nessun intervento critico necessario.

---

## F) MULTI-TENANCY E DATA ISOLATION

### F1. Stato attuale
L'isolamento multi-tenant e gia implementato tramite:
- RLS policies basate su `azienda_id` via `get_user_azienda_id(auth.uid())`
- Ogni query filtra per `azienda_id` del profilo
- Edge functions verificano il ruolo del caller e scope l'azienda

### F2. Rischio residuo
La tabella `profiles` permette `Users can update own profile` - un utente potrebbe teoricamente modificare il proprio `azienda_id`. Fix: creare una policy UPDATE che escluda i campi `ruolo` e `azienda_id`, oppure separare i ruoli in tabella dedicata.

### F3. Fix raccomandato (P0)
Aggiungere una policy UPDATE piu restrittiva su `profiles` che impedisca la modifica di `ruolo` e `azienda_id`:

```
CREATE POLICY "Users can update own non-sensitive fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND ruolo = (SELECT ruolo FROM public.profiles WHERE user_id = auth.uid())
  AND azienda_id IS NOT DISTINCT FROM (SELECT azienda_id FROM public.profiles WHERE user_id = auth.uid())
);
```
(Eliminando la policy precedente `Users can update own profile`.)

---

## G) SICUREZZA

### G1. Fix P0: Protezione campo `ruolo` nei profili
Modificare la policy UPDATE di `profiles` per impedire modifica di `ruolo` e `azienda_id` da parte dell'utente.

### G2. Fix P0: Rate limiting su `candidate-login`
Aggiungere un meccanismo di rate limiting basato su IP/username nella edge function (contatore in-memory con TTL o tabella DB con tentativi).

### G3. Fix P0: Autenticazione `register-candidate`
La funzione deve validare il `sessionToken` dal candidate-login, attualmente lo ignora completamente.

### G4. Fix P0: Rimuovere colonna `password_plain`
Creare migrazione per droppare `password_plain` da `accessi_azienda`.

### G5. Fix P0: Abilitare leaked password protection
Configurare tramite il backend per abilitare il controllo password compromesse.

### G6. Fix P1: Configurare `candidate-login` in config.toml
Aggiungere `[functions.candidate-login] verify_jwt = false` (dato che e un endpoint pubblico di autenticazione).

### G7. Segreti e chiavi
- Nessuna chiave API esposta nel client (verificato)
- `VITE_SUPABASE_PUBLISHABLE_KEY` e correttamente la chiave anon (pubblica)
- I segreti sensibili (SERVICE_ROLE_KEY, LOVABLE_API_KEY) sono solo nelle edge functions via env

---

## H) BACKUP E RESTORE

### H1. Stato attuale
Lovable Cloud (Supabase) include backup automatici:
- **Frequenza**: Backup giornalieri automatici gestiti dall'infrastruttura
- **Retention**: 7 giorni (piano standard)
- **Restore**: Disponibile tramite la dashboard Cloud

### H2. Raccomandazioni aggiuntive
- Implementare export CSV periodico dei dati critici (candidati, profili, risultati) come backup applicativo
- La funzionalita di export CSV e gia presente in Aziende.tsx - estenderla a Candidati

---

## I) OSSERVABILITA

### I1. Stato attuale
- Error logging: `console.error` nelle Edge Functions
- ErrorBoundary: presente a livello root in App.tsx
- Toast notifications: presenti per tutti gli errori UI
- Nessun sistema di alerting strutturato

### I2. Raccomandazioni
- I log delle Edge Functions sono gia raccolti automaticamente dall'infrastruttura Cloud
- Aggiungere log strutturati (JSON) nelle edge functions per filtraggio migliore
- Considerare integrazione con servizio di error tracking in futuro (fuori scope attuale)

---

## J) SEQUENZA DI IMPLEMENTAZIONE

La sequenza tiene conto delle dipendenze e della priorita:

### Fase 1: Sicurezza critica (P0)
1. Migrazione DB: aggiungere policy restrittiva UPDATE su `profiles`, droppare `password_plain`
2. Fix `register-candidate`: validare sessionToken
3. Aggiornare `config.toml` per `candidate-login`
4. Abilitare leaked password protection

### Fase 2: Pulizia e tipi (P1)
5. Aggiornare tipo `ProfiloCandidato` in `database.ts` per V5
6. Rimuovere `generatePassword()` da Aziende.tsx
7. Eliminare `as any` casting in CandidatoDettaglio.tsx
8. Centralizzare helper per invocazione Edge Functions

### Fase 3: Performance (P1)
9. Indici database
10. Eliminare query duplicati dalla Dashboard
11. Estrarre dati statici da Home.tsx
12. ProtectedRoute su Dashboard e Pagamenti

### Fase 4: Backend fix (P1)
13. Aggiornare `analyze-candidate` per V5

### Note
- Ogni fase e indipendente e non rompe le precedenti
- Stima totale: ~4-5 iterazioni di implementazione
- Nessun cambiamento funzionale visibile all'utente (behavior-preserving)
