

# Fix: Aziende.tsx mostra username con suffisso email errato

## Problema

In `src/pages/Aziende.tsx` (linea 506), quando le credenziali candidato vengono rigenerate, lo username viene mostrato nel formato:
```
cristiancarli-kmoi@azienda.talentprofile.local
```

Questo suffisso `@azienda.talentprofile.local` è un residuo del vecchio sistema di autenticazione tramite Supabase Auth. Il sistema attuale di login candidato (edge function `candidate-login`) cerca lo username esatto nella tabella `accessi_azienda`, quindi l'utente deve inserire solo `cristiancarli-kmoi`.

L'utente ha copiato le credenziali dalla pagina Aziende, ha incollato lo username completo con il suffisso nel form di login candidato, e il login ha fallito con "Credenziali non valide".

Ho verificato che le credenziali `cristiancarli-kmoi` / `9tPdFSFgxFjR` funzionano correttamente chiamando direttamente la edge function.

## Soluzione

### File: `src/pages/Aziende.tsx`

**Linea 506**: Rimuovere il suffisso `@azienda.talentprofile.local`. Mostrare solo lo username puro:

```typescript
// PRIMA (errato):
const email = `${result.accesso.username}@azienda.talentprofile.local`;
setRegeneratedCredentials({ email, password: result.plainPassword });

// DOPO (corretto):
setRegeneratedCredentials({
  email: result.accesso.username,
  password: result.plainPassword,
});
```

Verificare anche se ci sono altri punti nella pagina Aziende dove viene aggiunto questo suffisso e correggerli.

### Verifica aggiuntiva

Controllare se il label "Email" nel dialog delle credenziali rigenerate va rinominato in "Username" per coerenza con il form di login candidato.

## Comportamento atteso

- Le credenziali mostrate nella pagina Aziende usano lo username puro (es. `cristiancarli-kmoi`)
- L'utente copia le credenziali e le incolla nel form di login candidato
- Il login funziona al primo tentativo

