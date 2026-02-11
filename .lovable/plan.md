

# Piano di Pulizia, Fix e Stabilizzazione - TalentProfile V5

## 1. CODICE NON UTILIZZATO DA RIMUOVERE

### Componenti Inutilizzati (0 import esterni)

| File | Righe | Verifica |
|------|-------|----------|
| Nessun componente orfano trovato | - | Tutti i componenti hanno almeno 1 import attivo |

### Import Inutili da Pulire

| File | Import da Rimuovere | Motivo |
|------|---------------------|--------|
| `src/pages/Questionario.tsx` | `DomandaV5` (riga 10) | Importato ma mai usato nel file |

---

## 2. FIX FUNZIONALI (BUG IDENTIFICATI)

### Bug CRITICO: Profilo Tipo V5 calcolato SENZA sindromi

**File:** `src/lib/scoringV5.ts` (riga 456) e `src/pages/Questionario.tsx` (riga 204)

**Problema:** La funzione `calcolaProfiloV5()` chiama `determinaProfiloTipoV5(finalTraits, macroAree)` senza passare `hasCriticalSyndromes` e `activeSyndromeCodes`. Di conseguenza:
- Candidati con S01-S04 NON vengono classificati come CRITICAL
- La logica EXECUTOR (che controlla S05) non funziona
- La logica IN_TRANSIZIONE (che controlla S15) non funziona

**Fix:** In `Questionario.tsx`, dopo aver calcolato le sindromi (riga 175), ricalcolare il profilo tipo usando `determinaProfiloTipoV5` con i dati completi delle sindromi e usare il risultato corretto per il salvataggio:

```typescript
// Dopo riga 176:
const activeSyndromeCodes = syndromes
  .filter(s => s.isActive)
  .map(s => s.code);
const hasCriticalSyndromes = activeSyndromeCodes
  .some(c => ['S01','S02','S03','S04'].includes(c));

// Ricalcola profilo tipo con sindromi
const profiloTipoCorretto = determinaProfiloTipoV5(
  profilo.traits_v5,
  { essere_pct: profilo.essere_pct, fare_pct: profilo.fare_pct, avere_pct: profilo.avere_pct },
  hasCriticalSyndromes,
  activeSyndromeCodes
);

// Usa profiloTipoCorretto nel profiloData invece di profilo.profilo_tipo_v5
```

### Bug MEDIO: Sindrome S12 senza eta candidato

**File:** `src/pages/Questionario.tsx` (riga 175)

**Problema:** `getActiveSyndromes(traitScores)` viene chiamata senza passare `candidato.eta`. La sindrome S12 richiede `eta > 39` per attivarsi, ma senza il parametro non si attivera mai.

**Fix:** Passare l'eta del candidato:
```typescript
const syndromes = getActiveSyndromes(traitScores, candidato.eta ?? undefined);
```

### Bug BASSO: FormAnagrafico senza validazione Zod

**File:** `src/pages/FormAnagrafico.tsx` (righe 72-81)

**Problema:** La validazione usa controlli manuali (`!formData.cognome || !formData.nome...`) invece dello schema Zod centralizzato `formAnagraficoSchema` gia definito in `validationSchemas.ts`. Questo bypassa validazioni come:
- Lunghezza massima nome/cognome (100 char)
- Formato telefono (regex)
- Range eta (16-99)

**Fix:** Sostituire la validazione manuale con `formAnagraficoSchema.safeParse(formData)` e mostrare errori campo per campo, come gia fatto in `Auth.tsx`.

---

## 3. MIGLIORAMENTI UX

### 3.1 FormAnagrafico: Feedback errori campo per campo

Attualmente mostra un unico toast generico "Compila tutti i campi obbligatori". Dopo l'integrazione Zod, ogni campo mostrera il suo errore specifico sotto l'input (come gia avviene in Auth.tsx).

### 3.2 Questionario: Nessun miglioramento necessario

L'analisi conferma che il questionario ha gia:
- Transizioni fluide (`animate-in fade-in-50 slide-in-from-bottom-1`)
- Feedback immediato su salvataggio (`isSaving` con `animate-pulse`)
- Auto-scroll al cambio pagina
- Sticky footer con navigazione
- Touch targets >= 56px su mobile
- Progress bar con percentuale
- Skeleton loading durante caricamento

### 3.3 Flusso Candidato: Nessun vicolo cieco

Verificato il percorso completo:
- `/auth` -> Login con feedback errori
- `/test/anagrafica` -> Form con redirect se sessione scaduta
- `/test/privacy` -> Checkbox + CTA sempre visibile
- `/test/questionario` -> 242 domande con persistenza automatica
- `/test/completato` -> Conferma + pulsante "Esci"

---

## 4. RIEPILOGO MODIFICHE

### File da Modificare

| File | Modifica | Priorita |
|------|----------|----------|
| `src/pages/Questionario.tsx` | Ricalcolare profilo tipo con sindromi, passare eta a getActiveSyndromes, rimuovere import DomandaV5 | CRITICA |
| `src/pages/FormAnagrafico.tsx` | Integrare validazione Zod con errori campo per campo | MEDIA |

### Nessun File da Eliminare

Tutti i componenti e le librerie sono attivamente utilizzati. La pulizia dei file legacy (scoring.ts) e stata gia completata nelle sessioni precedenti.

### Gia Corretto / Funzionante

| Area | Stato |
|------|-------|
| Questionario 242 domande | OK |
| Persistenza risposte (upsert) | OK |
| Skeleton loading tutte le pagine | OK |
| Error handling + ErrorBoundary | OK |
| Mobile UX (touch targets, safe areas) | OK |
| Transizioni e animazioni | OK |
| Console pulita | OK (0 errori) |
| Lazy loading pagine pesanti | OK |

---

## 5. DETTAGLI TECNICI

### Impatto del bug profilo tipo

Senza sindromi, `determinaProfiloTipoV5` usa i parametri di default `hasCriticalSyndromes = false` e `activeSyndromeCodes = []`. Questo significa che:
- Un candidato con HRM<0, PRO<0, COM<0, ESP<0 (S01 - Isolamento Relazionale Completo) verrebbe classificato come LEADER se ha 5+ tratti sopra 45, invece che CRITICAL
- Un candidato con GP<0, PRO<10, COM<=0 (S05) potrebbe essere classificato come EXECUTOR quando non dovrebbe

### Ordine di implementazione

1. Fix Questionario.tsx (bug critico profilo tipo + eta + import)
2. Fix FormAnagrafico.tsx (validazione Zod)
3. Verifica e2e del flusso completo

