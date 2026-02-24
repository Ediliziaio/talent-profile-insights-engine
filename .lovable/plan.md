

# Ottimizzazione velocita "Prosegui al Test" (register-candidate)

## Analisi del problema

La edge function `register-candidate` esegue **6 operazioni sequenziali** al database/auth:

1. Validazione session token (query `candidate_sessions`)
2. Mark session as used (update `candidate_sessions`)
3. Verifica azienda (query `aziende`)
4. Creazione auth user (`auth.admin.createUser`) -- **lenta** (~2-3s)
5. Upsert profilo (upsert `profiles`)
6. Insert candidato (insert `candidati`)
7. **Sign in con password** (`signInWithPassword`) -- **lenta** (~2-3s, e ridondante)

Il collo di bottiglia principale e il punto 7: `signInWithPassword` e completamente inutile perche `createUser` restituisce gia l'utente creato. Possiamo generare una sessione senza fare un secondo round-trip di autenticazione.

Inoltre, i punti 2 e 3 possono essere eseguiti **in parallelo** (non dipendono l'uno dall'altro).

## Modifiche proposte

### File: `supabase/functions/register-candidate/index.ts`

1. **Rimuovere `signInWithPassword`** (linee 247-255): Questa chiamata e ridondante. Dopo `createUser`, possiamo generare un token direttamente con `auth.admin.generateLink` oppure semplicemente restituire le credenziali e lasciare che il frontend faccia il sign-in lato client.

2. **Parallelizzare operazioni indipendenti**: Eseguire `Promise.all` per il mark-session-used e la verifica azienda (linee 152-171), dato che non hanno dipendenze reciproche.

3. **Sign-in lato client**: Nel frontend (`FormAnagrafico.tsx`), dopo aver ricevuto le credenziali dal backend (`internalEmail` + `password`), eseguire `supabase.auth.signInWithPassword()` direttamente dal client. Questo elimina ~3 secondi dalla edge function.

### Dettaglio tecnico

**Edge function** - rimuovere il blocco sign-in server-side e restituire le credenziali interne:
```typescript
// RIMUOVERE:
const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({...});

// PARALLELIZZARE:
const [sessionUpdateResult, aziendaResult] = await Promise.all([
  supabaseAdmin.from('candidate_sessions').update({ used: true }).eq('id', session.id),
  supabaseAdmin.from('aziende').select('id, nome').eq('id', azienda_id).eq('attiva', true).single()
]);

// Restituire credenziali interne invece della sessione:
return { success: true, candidato, credentials: { internalEmail, password } };
```

**Frontend** (`FormAnagrafico.tsx`) - sign-in lato client con le credenziali ricevute:
```typescript
// Dopo aver ricevuto responseData:
if (responseData.credentials) {
  await supabase.auth.signInWithPassword({
    email: responseData.credentials.internalEmail,
    password: responseData.credentials.password,
  });
}
```

## Risultato atteso

- **Tempo ridotto da ~10s a ~4-5s**: Eliminazione del sign-in server-side (~3s) + parallelizzazione di 2 query (~1-2s).
- Nessun cambiamento funzionale: il candidato viene comunque autenticato e reindirizzato a `/test/privacy`.

