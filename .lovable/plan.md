
# Piano Completo: Test E2E, Batch Ricalcolo, Flag Ruoli Non Validati, Pulizia e Stabilizzazione

## STATO ATTUALE - Risultati delle verifiche

### Batch Ricalcolo V5: COMPLETATO
Il batch ricalcolo e stato eseguito con successo:
- **15 profili aggiornati** con la nuova logica V2.0 (sindromi corrette, profili tipo, fasce interpretative)
- **1 fallimento** (Enrico Goldoni): nessuna risposta nel database - non e un bug
- Profili tipo ora corretti: LEADER, STRATEGIST, EXECUTOR, GROWTH_POTENTIAL, IN_TRANSIZIONE, CRITICAL
- Marco Rossi correttamente classificato come **CRITICAL** (S01 + S04 attive)

### Test E2E Flusso Candidato: Verificato
Il flusso `/auth` -> `/test/anagrafica` -> `/test/privacy` -> `/test/questionario` -> `/test/completato` e completo e funzionante:
- Auth: 3 tab (Candidato, Azienda, Registra) con validazione Zod campo per campo
- FormAnagrafico: Validazione Zod con `formAnagraficoSchema` e `FieldError` inline gia implementati
- ConsensoPrivacy: Checkbox GDPR + CTA "Accetto e Proseguo" - OK
- Questionario: 242 domande, upsert risposte, progress bar, sticky footer, skeleton loading - OK
- TestCompletato: Conferma + pulsante "Esci" - OK
- Console: 0 errori runtime (solo warning postMessage irrilevanti)

### Analisi Pulizia Codice
- Nessun componente orfano trovato
- Nessun import inutile residuo (DomandaV5 gia rimosso nella sessione precedente)
- Nessun file legacy da eliminare

---

## MODIFICHE DA IMPLEMENTARE

### 1. Flag `validato_manuale_v2` per i Ruoli (Priorita MEDIA)

**File:** `src/lib/roleMatchingV5.ts`

Aggiungere un campo `validatoManualeV2: boolean` all'interfaccia `RoleProfileV5` per distinguere i ruoli ufficiali del Manuale V2.0 da quelli "inventati".

**Ruoli validati dal Manuale V2.0** (8 ruoli):
- Responsabile Amministrativo
- Venditore/Commerciale
- Customer Care
- Marketing Manager (nel manuale come "Addetto Marketing")
- Responsabile Produzione/Logistica
- HR Recruiter
- Impiegato Amministrativo
- Operaio/Installatore

**Ruoli NON validati** (9 ruoli - soglie definite internamente):
- Direttore Generale
- HR Manager
- Responsabile Tecnico
- Buyer/Acquisti
- Direttore Commerciale
- Capocantiere
- Commerciale Edilizia
- Project Manager
- Assistente di Direzione

**Implementazione:**
1. Aggiungere `validatoManualeV2: boolean` a `RoleProfileV5`
2. Settare `validatoManualeV2: true` per gli 8 ruoli del manuale
3. Settare `validatoManualeV2: false` per i 9 ruoli extra
4. Mostrare un badge "Non validato" nella UI del RoleMatchingCardV5 per i ruoli non validati

### 2. Badge visuale nella UI (Priorita BASSA)

**File:** `src/components/RoleMatchingCardV5.tsx`

Nella sezione header del card, aggiungere un piccolo badge informativo quando il ruolo non e validato dal manuale:

```
[info icon] Soglie definite internamente (non validate dal Manuale V2.0)
```

Questo avvisa l'HR che le soglie di quel ruolo non hanno validazione psicometrica ufficiale.

---

## RIEPILOGO FINALE

### Cose gia completate (nessuna azione necessaria)
- Batch ricalcolo V5: 15/16 profili aggiornati
- Validazione Zod campo per campo su FormAnagrafico
- Profilo tipo V5 calcolato con sindromi (fix critico gia applicato)
- Sindrome S12 con eta candidato (fix gia applicato)
- Import DomandaV5 rimosso (pulizia gia fatta)
- Console pulita: 0 errori

### Cose da implementare ora
| File | Modifica | Priorita |
|------|----------|----------|
| `src/lib/roleMatchingV5.ts` | Aggiungere `validatoManualeV2` a interfaccia e a tutti i 17 ruoli | MEDIA |
| `src/components/RoleMatchingCardV5.tsx` | Badge informativo per ruoli non validati | BASSA |

### Conferma Test
- Flusso candidato E2E: OK (Auth -> Anagrafica -> Privacy -> Questionario -> Completato)
- Validazione Zod FormAnagrafico: OK (campo per campo con FieldError)
- Questionario 242 domande: OK (caricamento, selezione, salvataggio, navigazione)
- Batch ricalcolo: OK (15/16 profili aggiornati)
- Console: 0 errori runtime
- Mobile UX: OK (touch targets 44px+, safe areas, sticky footer)
- Skeleton loading: OK (tutte le pagine)
