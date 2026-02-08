
# Piano: Pulizia, Fix Funzionali e UX Esperienziale - TalentProfile

## Executive Summary

Questo piano documenta un'analisi completa del codebase TalentProfile e propone interventi mirati per:
1. **Pulizia codice** - Rimozione elementi non utilizzati
2. **Fix funzionali** - Correzione bug e problemi di stato
3. **UX esperienziale** - Miglioramento flusso utente e feedback

---

## 1. ANALISI E PULIZIA CODICE

### 1.1 Import Inutili Identificati

| File | Import Inutili |
|------|----------------|
| `src/pages/CandidatoDettaglio.tsx` | `Award` da lucide-react (non usato) |
| `src/pages/Dashboard.tsx` | `startOfDay` da date-fns (non usato) |
| `src/components/PDFExportButton.tsx` | Import `ClipboardList` duplicato inline (riga 522) |
| `src/lib/scoring.ts` | Funzione `getScaleForRadarChart` (RadarChart rimosso dal progetto) |

### 1.2 Codice Legacy da Rimuovere

| Elemento | Motivo | Azione |
|----------|--------|--------|
| `getScaleForRadarChart` in `scoring.ts` | RadarChart rimosso nella pulizia V4 | Rimuovere funzione |
| Variabile `profiloTipo` fallback | Ridondante con V5 logic | Consolidare |

### 1.3 File Verificati - Nessun Problema

- `src/data/questionario.ts` - 200+ domande tutte referenziate
- `src/lib/syndromes.ts` - 24 sindromi tutte utilizzate
- `src/lib/constants.ts` - Tutte le costanti in uso
- `src/components/AnswerButton.tsx` - Componente pulito

---

## 2. FIX FUNZIONALI

### 2.1 Bug Identificati e Soluzioni

#### Bug #1: Autocomplete mancante nei form (Warning Console)
**File**: `src/pages/Auth.tsx`
**Problema**: Input password senza attributo `autoComplete`
**Soluzione**: Aggiungere `autoComplete="current-password"` e `autoComplete="new-password"`

```typescript
// Prima
<Input type="password" ... />

// Dopo
<Input type="password" autoComplete="current-password" ... />
```

#### Bug #2: Potenziale race condition nel caricamento risposte
**File**: `src/pages/Questionario.tsx`
**Problema**: `useEffect` per caricare risposte esistenti non gestisce loading state
**Soluzione**: Aggiungere stato loading locale durante fetch iniziale

```typescript
// Aggiungere
const [loadingRisposte, setLoadingRisposte] = useState(true);

useEffect(() => {
  if (candidato) {
    setLoadingRisposte(true);
    supabase
      .from('risposte')
      .select('domanda_id, valore')
      .eq('candidato_id', candidato.id)
      .then(({ data }) => {
        if (data) {
          const existing: Record<number, AnswerValue> = {};
          data.forEach((r) => {
            existing[r.domanda_id] = r.valore as AnswerValue;
          });
          setRisposte(existing);
        }
        setLoadingRisposte(false);
      });
  }
}, [candidato]);
```

#### Bug #3: Navigazione candidato dopo test completato
**File**: `src/pages/Questionario.tsx`
**Problema**: `navigate()` chiamato nel render body causa warning React
**Soluzione**: Usare `useEffect` per la navigazione

```typescript
// Prima (riga 159)
if (candidato.test_completato) {
  navigate('/test/completato');
  return null;
}

// Dopo
useEffect(() => {
  if (candidato?.test_completato) {
    navigate('/test/completato');
  }
}, [candidato?.test_completato, navigate]);

if (candidato?.test_completato) {
  return null;
}
```

#### Bug #4: Tipo `any` in error handling
**File**: `src/pages/Candidati.tsx` (righe 364, 486)
**Problema**: `error: any` non tipizzato correttamente
**Soluzione**: Usare `Error` type

```typescript
// Prima
onError: (error: any) => { ... }

// Dopo
onError: (error: Error) => { ... }
```

### 2.2 Validazioni Mancanti

| Componente | Problema | Soluzione |
|------------|----------|-----------|
| `FormAnagrafico.tsx` | Età non validata client-side | Aggiungere validazione Zod |
| `Questionario.tsx` | Salvataggio risposte senza feedback errore | Toast su errore mutation |

---

## 3. UX ESPERIENZIALE

### 3.1 Miglioramenti Transizioni

#### 3.1.1 Transizione tra pagine questionario
**File**: `src/pages/Questionario.tsx`
**Problema**: Cambio pagina brusco
**Soluzione**: Aggiungere animazione fade

```typescript
// Nel className delle Card domande
className={cn(
  "transition-all duration-200 min-h-[72px]",
  "animate-in fade-in-50 slide-in-from-bottom-2",
  risposte[domanda.id] ? "border-accent/50 shadow-md" : ""
)}
```

#### 3.1.2 Feedback salvataggio risposta
**File**: `src/components/AnswerButton.tsx`
**Problema**: Nessun feedback visivo immediato
**Soluzione**: Aggiungere stato "saving" con micro-animazione

```typescript
// Aggiungere prop isSaving
interface AnswerButtonProps {
  // ... existing props
  isSaving?: boolean;
}

// Nel rendering
<div className={cn(
  "w-7 h-7 rounded-full flex items-center justify-center",
  isSaving && "animate-pulse"
)}>
```

### 3.2 Miglioramenti Loading States

#### 3.2.1 Skeleton per caricamento risposte
**File**: `src/pages/Questionario.tsx`
**Problema**: Spinner generico durante caricamento
**Soluzione**: Usare skeleton cards

```typescript
if (loadingCandidato || loadingRisposte) {
  return <QuestionarioSkeleton />;
}
```

### 3.3 Messaggi di Errore Migliorati

#### 3.3.1 Toast non invasivi
**Problema attuale**: Toast rossi invasivi
**Soluzione**: Usare `variant: "default"` con icona warning per errori non critici

```typescript
// Per errori recuperabili
toast({
  title: 'Attenzione',
  description: 'Riprova tra qualche secondo',
  variant: 'default',
});
```

### 3.4 CTA Sempre Visibili

#### 3.4.1 Pulsante "Torna indietro" accessibile
**File**: `src/pages/TestCompletato.tsx`
**Problema**: Solo "Esci dalla piattaforma" come azione
**Soluzione**: Aggiungere testo informativo e rimuovere ambiguità

```typescript
<CardFooter className="flex flex-col gap-3 justify-center">
  <p className="text-xs text-muted-foreground text-center">
    Puoi chiudere questa pagina. I tuoi risultati sono stati salvati.
  </p>
  <Button variant="outline" onClick={signOut}>
    Esci dalla piattaforma
  </Button>
</CardFooter>
```

---

## 4. VERIFICHE FINALI

### 4.1 Test da Eseguire Post-Implementazione

| Test | Descrizione | Criteri Successo |
|------|-------------|------------------|
| Smoke Test Login | Login candidato → Anagrafica → Privacy → Questionario → Completato | Flusso completo senza errori |
| Test Domande | Rispondere 10 domande random, refresh, verificare persistenza | Risposte salvate |
| Test Edge Case | Rispondere velocemente 20 domande consecutive | Nessun salvataggio perso |
| Responsiveness | Verificare questionario su viewport 375px | Layout intatto |
| Console Check | Verificare console su Chrome DevTools | Nessun errore rosso |

### 4.2 Metriche Performance

| Metrica | Target | Verifica |
|---------|--------|----------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | User testing |
| Re-render | Nessun flash visibile | Visual inspection |

---

## 5. RIEPILOGO MODIFICHE

### 5.1 File da Modificare

| File | Tipo Modifica | Priorità |
|------|---------------|----------|
| `src/pages/Auth.tsx` | Add autocomplete attributes | Alta |
| `src/pages/Questionario.tsx` | Fix navigation + loading state | Alta |
| `src/lib/scoring.ts` | Remove unused function | Media |
| `src/pages/CandidatoDettaglio.tsx` | Remove unused import | Bassa |
| `src/pages/Dashboard.tsx` | Remove unused import | Bassa |
| `src/components/AnswerButton.tsx` | Add saving feedback | Media |
| `src/pages/TestCompletato.tsx` | Improve UX messaging | Media |
| `src/pages/Candidati.tsx` | Fix error typing | Bassa |

### 5.2 Stima Impatto

- **Righe rimosse**: ~15 righe (import/funzioni inutili)
- **Righe aggiunte**: ~40 righe (fix + UX improvements)
- **Rischio breaking changes**: Nessuno (modifiche non-breaking)

---

## 6. SEZIONE TECNICA

### 6.1 Dettaglio Fix Questionario.tsx

```typescript
// === PRIMA ===
// Problema: navigate() nel render body
if (candidato.test_completato) {
  navigate('/test/completato');
  return null;
}

// === DOPO ===
// Soluzione: useEffect per side-effect
useEffect(() => {
  if (candidato?.test_completato) {
    navigate('/test/completato');
  }
}, [candidato?.test_completato, navigate]);

// Render guard separato
if (!candidato || candidato.test_completato) {
  return null;
}
```

### 6.2 Dettaglio Fix Auth.tsx

```typescript
// === Righe da modificare ===

// Password candidato (riga ~231)
<Input 
  id="candidate-password" 
  type="password" 
  autoComplete="current-password"  // AGGIUNGERE
  value={candidatePassword}
  ...
/>

// Password azienda (riga ~275)
<Input 
  id="password" 
  type="password"
  autoComplete="current-password"  // AGGIUNGERE
  value={password}
  ...
/>

// Password registrazione (riga ~343)
<Input 
  id="reg-password" 
  type="password"
  autoComplete="new-password"  // AGGIUNGERE
  value={password}
  ...
/>
```

### 6.3 Dettaglio Rimozione getScaleForRadarChart

```typescript
// === src/lib/scoring.ts ===
// RIMUOVERE righe 217-225

// export function getScaleForRadarChart(punteggi: Record<string, number>): ScalaPunteggio[] {
//   const orderedScales: ScalaCode[] = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA'];
//   
//   return orderedScales.map(scala => ({
//     scala,
//     label: SCALE_LABELS[scala],
//     punteggio: punteggi[scala] || 100
//   }));
// }
```

---

## Note Finali

- **Zero breaking changes**: Tutte le modifiche sono retrocompatibili
- **Behavioral parity**: Il comportamento funzionale rimane identico
- **Focus su stabilità**: Priorità ai fix che prevengono errori runtime
