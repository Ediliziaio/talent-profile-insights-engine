

# Pulizia, Stabilizzazione e Miglioramenti UX

## 1. Codice da Rimuovere

Ho analizzato l'intero codebase e l'app e' gia' molto pulita (precedenti cicli di cleanup). I file morti sono:

| File | Motivo |
|------|--------|
| `src/components/TraitBarChart.tsx` (210 righe) | Mai importato da nessun file. Era il vecchio grafico a barre V5, sostituito da `TraitCandleChart` |
| `src/App.css` (41 righe) | Boilerplate Vite mai importato. L'app usa `index.css` con Tailwind |

Nessun altro componente, hook, pagina o modulo lib risulta inutilizzato. Tutti gli import sono attivi e referenziati.

## 2. Bug e Fix Funzionali

Ho verificato tutte le pagine del flusso candidato (Auth -> FormAnagrafico -> ConsensoPrivacy -> Questionario -> TestCompletato) e il flusso admin (Dashboard, Candidati, CandidatoDettaglio con tutti e 4 i tab). Console pulita: zero errori runtime, solo 4 warning di postMessage irrilevanti (piattaforma Lovable).

Problemi riscontrati:

| Problema | Fix |
|----------|-----|
| Nessun bug bloccante trovato | -- |
| `Questionario.tsx` riga 90: `onConflict: 'candidato_id,domanda_id'` presume un constraint univoco composito sulla tabella `risposte`. Se il constraint non esiste, l'upsert fallisce silenziosamente | Verificare e, se mancante, aggiungere il constraint univoco via migration |
| Auth.tsx: i tab "Azienda" e "Registra" condividono le variabili `email` e `password`, causando leak di dati tra i form se l'utente cambia tab | Separare gli state: `regEmail`, `regPassword` per il form di registrazione |

## 3. Miglioramenti UX

L'app segue gia' gli standard "esperienziali" (animazioni, feedback immediato, Zod validation). Piccoli affinamenti:

| Miglioramento | Dove | Dettaglio |
|---------------|------|-----------|
| Tab "Registra" su Auth non resetta errori quando si cambia tab | `Auth.tsx` | Aggiungere `setFieldErrors({})` su cambio tab |
| `ConsensoPrivacy` non ha animazione di transizione verso il questionario | `ConsensoPrivacy.tsx` | Aggiungere fade-out prima della navigazione (micro-delay con feedback visivo sul bottone) |
| Il bottone "Accetto e Proseguo" non mostra stato di caricamento | `ConsensoPrivacy.tsx` | Aggiungere stato loading con spinner al click, per evitare doppio click |
| `TestCompletato.tsx` usa il colore `text-success` che potrebbe non essere definito nel tema | `TestCompletato.tsx` | Verificare e usare classe Tailwind sicura |

## 4. Verifiche Finali

- **Smoke test**: Pagina candidato dettaglio con tutti e 4 i tab verificata via browser -- carica correttamente, nessun errore
- **Console pulita**: 0 errori, 0 warning rilevanti
- **Responsiveness**: Layout gia' responsive con breakpoint mobile/desktop su tutte le pagine
- **Performance**: Code splitting attivo con React.lazy, skeleton loading, useMemo su sorting/filtering

## Riepilogo Interventi

### Rimozioni (2 file)
1. `src/components/TraitBarChart.tsx` -- componente grafico mai usato
2. `src/App.css` -- boilerplate Vite inutilizzato

### Fix funzionali (2)
1. Auth.tsx: separare state email/password tra tab Azienda e Registra per evitare leak
2. Verificare constraint univoco `candidato_id, domanda_id` su tabella `risposte` (necessario per upsert questionario)

### Miglioramenti UX (3)
1. Auth.tsx: reset errori al cambio tab
2. ConsensoPrivacy.tsx: stato loading sul bottone "Accetto e Proseguo"
3. Verificare che i colori `text-success` / `bg-success` siano definiti nel tema

---

## Dettaglio Tecnico

### Auth.tsx -- Separazione state e reset errori
- Aggiungere `regEmail`, `regPassword` dedicati al form registrazione
- `onValueChange` sulla TabsList per resettare fieldErrors
- Impatto: zero regressione, fix comportamento inatteso

### ConsensoPrivacy.tsx -- Loading state
- Aggiungere `const [navigating, setNavigating] = useState(false)` 
- Nel `handleContinue`: `setNavigating(true)` poi `navigate()`
- Bottone mostra spinner durante transizione

### Constraint DB risposte
- Verificare con query SQL se esiste un unique constraint su `(candidato_id, domanda_id)`
- Se mancante: migration per aggiungerlo (necessario per upsert corretto)

