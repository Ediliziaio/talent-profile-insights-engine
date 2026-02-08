

# Piano: Sincronizzazione Completa Questionario V5 ✅ COMPLETATO

## Stato: IMPLEMENTATO

La sincronizzazione è stata completata con successo:

| Componente | Prima | Dopo | Status |
|------------|-------|------|--------|
| `questionario.ts` | 200 domande V4 | 242 domande V5 | ✅ |
| `Questionario.tsx` | scoring.ts (V4) | scoringV5.ts | ✅ |
| `constants.ts` | - | TOTAL_QUESTIONS = 242 | ✅ |
| `database.ts` | - | DomandaV5 interface | ✅ |
| Test V5 | - | 23/23 passati | ✅ |

## Analisi del Problema (Risolto)

### Flusso Attuale (Problematico)

Il candidato risponde alle 200 domande del file locale (`questionario.ts`) che ha le scale V4, ma le risposte vengono salvate con `domanda_id` che corrispondono alle domande V5 nel database.

Successivamente, il ricalcolo V5 (`ricalcoloV5.ts`) interpreta le risposte usando le scale V5 del database - questo funziona casualmente perché gli ID coincidono.

## Modifiche Proposte

### Fase 1: Sincronizzare `questionario.ts` con il Database

**File**: `src/data/questionario.ts`

Sostituire completamente il contenuto con tutte le 242 domande dal database, usando le scale V5:

```typescript
import { TraitCode } from '@/types/database';

interface DomandaV5 {
  id: number;
  testo: string;
  scala_primaria: TraitCode;
  polarita: '+' | '-' | 'S' | 'C';
  blocco_tematico: number;
  ordine: number;
}

export const DOMANDE: DomandaV5[] = [
  // Tutte le 242 domande dal database con scale V5
  { id: 1, testo: "Ti capita di sentirti incerto...", scala_primaria: 'ORG', polarita: '-', blocco_tematico: 1, ordine: 1 },
  // ... altre 241 domande
];
```

### Fase 2: Aggiornare Questionario.tsx per Usare 242 Domande

**File**: `src/pages/Questionario.tsx`

1. Modificare l'import per usare il nuovo tipo domanda V5
2. Aggiornare il contatore totale domande (242 invece di 200)
3. Usare il sistema di scoring V5 al submit invece di V4

### Fase 3: Aggiornare il Submit per Usare Scoring V5

**File**: `src/pages/Questionario.tsx`

Modificare la funzione `handleSubmit` per:
1. Usare `calcolaProfiloV5` da `scoringV5.ts` invece di `calcolaProfilo` da `scoring.ts`
2. Salvare i tratti V5 nel database
3. Calcolare le sindromi comportamentali
4. Impostare `assessment_version: 'v5'`

### Fase 4: Aggiornare Costanti

**File**: `src/lib/constants.ts`

- Aggiornare `QUESTIONS_PER_PAGE` se necessario
- Aggiungere costante `TOTAL_QUESTIONS = 242`

### Fase 5: Aggiornare Tipo Domanda

**File**: `src/types/database.ts`

Aggiornare l'interfaccia `Domanda` per supportare polarità V5:

```typescript
export interface DomandaV5 {
  id: number;
  testo: string;
  scala_primaria: TraitCode;
  scala_secondaria: TraitCode | null;
  polarita: PolaritaV5;  // '+' | '-' | 'S' | 'C'
  blocco_tematico: number | null;
  ordine: number | null;
}
```

---

## Riepilogo Modifiche

| File | Azione |
|------|--------|
| `src/data/questionario.ts` | Sostituire con 242 domande V5 dal database |
| `src/pages/Questionario.tsx` | Usare scoring V5, aggiornare contatori |
| `src/lib/constants.ts` | Aggiungere `TOTAL_QUESTIONS = 242` |
| `src/types/database.ts` | Aggiornare interfaccia Domanda per V5 |

---

## Dettagli Tecnici

### Struttura Domande nel Database

Il database contiene 242 domande distribuite così per scala:

| Scala | Domande | Descrizione |
|-------|---------|-------------|
| ORG | 12 | Organizzazione |
| AUT | 22 | Automotivazione |
| GP | 17 | Gestione Pressioni |
| ADS | 21 | Autodisciplina |
| DET | 19 | Determinazione |
| VEN | 19 | Attitudine Vendita |
| HRM | 7 | HR Management |
| LDR | 11 | Leadership |
| PRO | 16 | Proattività |
| COM | 16 | Comprensione |
| ESP | 13 | Espansività |
| RC | 17 | Resistenza Cambiamento |
| FIN | 14 | Finanze |
| SUC | 16 | Successo |
| PRI | 17 | Principi |
| CTRL | 5 | Controllo Validità |
| **TOTALE** | **242** | |

### Domande con Scoring Speciale (Polarità 'S')

| ID | Scala | Descrizione |
|----|-------|-------------|
| 72 | SUC | Prima età guadagno |
| 73 | FIN | % risparmio |
| 211 | FIN | Tempo investimenti |
| 212 | FIN | Riserve finanziarie |
| 213 | FIN | Autonomia finanziaria |
| 228 | AUT | Potenziale successo |

### Domande di Controllo (Polarità 'C')

| ID | Risposta Attesa |
|----|-----------------|
| 238-242 | A |

### Impatto sui Candidati Esistenti

I candidati con `assessment_version: 'v5'` (ricalcolati) continueranno a funzionare correttamente.

I candidati con `assessment_version: 'v4'` avranno solo le risposte alle prime 200 domande - il sistema V5 calcolerà i punteggi basandosi su quelle risposte disponibili.

### Ruoli V5 - Verifica Configurazione

I 17 ruoli sono già correttamente configurati in `roleMatchingV5.ts`:

1. Responsabile Amministrativo
2. Venditore/Commerciale
3. Customer Care
4. Direttore Generale
5. HR Manager
6. Marketing Manager
7. Responsabile Tecnico
8. Buyer/Acquisti
9. Responsabile Produzione/Logistica
10. Direttore Commerciale
11. Capocantiere
12. Commerciale Edilizia
13. HR Recruiter
14. Impiegato Amministrativo
15. Operaio/Installatore
16. Project Manager *(nuovo)*
17. Assistente di Direzione *(nuovo)*

I ruoli vengono mostrati nell'accordion "Compatibilità Tutti i Ruoli" del `RoleMatchingCardV5` component.

