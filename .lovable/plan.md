

# Fix: Spinner infinito su /test/privacy

## Problema identificato

Dopo la registrazione candidato, la pagina `/test/privacy` resta con lo spinner infinito. La causa principale e una **race condition + mancata gestione errori**:

1. **`FormAnagrafico.tsx` (linea 119-123)**: `supabase.auth.signInWithPassword()` restituisce `{ data, error }` ma il codice **non controlla l'errore**. Se il sign-in fallisce (per qualsiasi motivo), il codice prosegue comunque con `navigate('/test/privacy')` senza che l'utente sia autenticato.

2. **`ConsensoPrivacy.tsx` (linea 19-20)**: L'useEffect che controlla lo stato del test ha la condizione `if (!user || loading) return`. Se `user` e `null` (perche il sign-in e fallito), l'effect non procede mai e `checkingTest` resta `true` per sempre → **spinner infinito**.

## Soluzione

### File: `src/pages/FormAnagrafico.tsx`

Aggiungere controllo errore sul sign-in e attendere conferma autenticazione:

```typescript
// PRIMA (senza controllo errore):
await supabase.auth.signInWithPassword({
  email: responseData.credentials.internalEmail,
  password: responseData.credentials.password,
});

// DOPO (con controllo errore):
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: responseData.credentials.internalEmail,
  password: responseData.credentials.password,
});
if (signInError) {
  throw new Error('Errore di autenticazione: ' + signInError.message);
}
```

### File: `src/pages/ConsensoPrivacy.tsx`

Gestire il caso in cui `user` e `null` dopo che `loading` diventa `false`. Se non c'e utente autenticato, redirect al login invece di spinner infinito:

```typescript
// Dopo il check loading || checkingTest, PRIMA del check ruolo:
if (!user) {
  return <Navigate to="/auth" replace />;
}
```

Inoltre, modificare l'useEffect per gestire il caso `user` null dopo il loading:

```typescript
useEffect(() => {
  if (loading) return;
  if (!user) return; // will be handled by the redirect above
  // ... rest of checkTestStatus
}, [user, loading, navigate]);
```

## Risultato atteso

- Se il sign-in fallisce: errore mostrato all'utente nel form anagrafico (toast), non naviga
- Se l'utente arriva su `/test/privacy` senza autenticazione: redirect a `/auth` invece di spinner infinito
- Flusso normale: registrazione → sign-in → navigate → pagina privacy si carica correttamente

