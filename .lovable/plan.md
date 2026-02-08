
# Piano: Sincronizzazione Edge Function con Manuale V2.0

## Problema Identificato

L'edge function `batch-ricalcolo-v5` utilizza una scala di scoring **0-2** mentre il Manuale V2.0 e il file locale `scoringV5.ts` utilizzano correttamente la scala **0-10**.

### Discrepanza Critica

| Componente | Risposta A | Risposta B | Risposta C |
|------------|------------|------------|------------|
| Edge Function (errato) | 2 | 1 | 0 |
| Manuale V2.0 (corretto) | 10 | 5 | 0 |
| scoringV5.ts (corretto) | 10 | 5 | 0 |

### Impatto

I profili ricalcolati tramite edge function hanno punteggi normalizzati **identici** a quelli calcolati con scala 0-10 (perche la normalizzazione compensa), ma:

1. **La logica di attendibilita e sbagliata**: Usa `ctrlAvg` invece di contare le risposte inattese
2. **Le soglie non sono allineate**: Non usa le soglie 0-1/2-3/4-5 del Manuale V2.0
3. **Manca il supporto per SPECIAL_SCORING**: Le domande speciali (72, 73, 211-213, 228) non hanno i punteggi corretti

---

## Modifiche da Implementare

### File: `supabase/functions/batch-ricalcolo-v5/index.ts`

#### 1. Aggiornare Scala Scoring (Linee 96-126)

Sostituire la logica di scoring da scala 0-2 a scala 0-10:

**Prima (errato):**
```typescript
// Positive polarity: A=2, B=1, C=0
score = valore === 'A' ? 2 : valore === 'B' ? 1 : 0;
// Negative polarity: A=0, B=1, C=2
score = valore === 'A' ? 0 : valore === 'B' ? 1 : 2;
```

**Dopo (corretto):**
```typescript
// Positive polarity: A=10, B=5, C=0
score = valore === 'A' ? 10 : valore === 'B' ? 5 : 0;
// Negative polarity: A=0, B=5, C=10
score = valore === 'A' ? 0 : valore === 'B' ? 5 : 10;
```

#### 2. Aggiungere Mappa SPECIAL_SCORING

Aggiungere la mappatura per le domande con scoring speciale:

```typescript
const SPECIAL_SCORING: Record<number, { a: number; b: number; c: number }> = {
  72: { a: 10, b: 5, c: 0 },   // Eta primo guadagno (SUC)
  73: { a: 0, b: 5, c: 10 },   // % risparmio (FIN)
  211: { a: 10, b: 5, c: 0 },  // Tempo investimenti (FIN)
  212: { a: 0, b: 5, c: 10 },  // Riserve finanziarie (FIN)
  213: { a: 0, b: 5, c: 10 },  // Autonomia finanziaria (FIN)
  228: { a: 10, b: 5, c: 0 },  // Potenziale successo (AUT)
};
```

#### 3. Aggiornare Logica SPECIAL Scoring

**Prima (errato):**
```typescript
if (polarita === 'S') {
  score = valore === 'A' ? 2 : valore === 'B' ? 1 : 0;
}
```

**Dopo (corretto):**
```typescript
if (polarita === 'S' && SPECIAL_SCORING[domanda.id]) {
  const scoring = SPECIAL_SCORING[domanda.id];
  const key = valore.toLowerCase() as 'a' | 'b' | 'c';
  score = scoring[key] || 0;
} else if (polarita === 'S') {
  // Fallback per domande S non mappate
  score = valore === 'A' ? 10 : valore === 'B' ? 5 : 0;
}
```

#### 4. Correggere Normalizzazione Punteggi (Linee 128-140)

**Prima (basato su scala 0-2):**
```typescript
const avg = data.sum / data.count;
// avg is 0-2, normalize to -100/+100
traits_v5[trait] = Math.round((avg - 1) * 100);
```

**Dopo (basato su scala 0-10 e punteggi massimi):**
```typescript
const TRAIT_MAX_SCORES: Record<TraitCode, number> = {
  ORG: 120, AUT: 220, GP: 170, ADS: 210, DET: 190,
  VEN: 190, HRM: 70, LDR: 110, PRO: 160, COM: 160,
  ESP: 130, RC: 170, FIN: 140, SUC: 160, PRI: 170
};

// Normalizza usando formula corretta
const rawScore = data.sum;
const maxScore = TRAIT_MAX_SCORES[trait];
traits_v5[trait] = Math.round(((rawScore / maxScore) * 200) - 100);
```

#### 5. Correggere Logica Attendibilita (Linee 143-159)

**Prima (errato - usa ctrlAvg):**
```typescript
const ctrlAvg = ctrlData.count > 0 ? ctrlData.sum / ctrlData.count : 1;
if (ctrlAvg >= 1.5) {
  reliability_index = 'YES';
} else if (ctrlAvg >= 1.0) {
  reliability_index = 'CAUTION';
}
```

**Dopo (corretto - conta risposte inattese):**
```typescript
const CONTROL_QUESTIONS = [238, 239, 240, 241, 242];
let unexpectedCount = 0;

for (const questionId of CONTROL_QUESTIONS) {
  const risposta = risposte.find(r => r.domanda_id === questionId);
  if (risposta && risposta.valore !== 'A') {
    unexpectedCount++;
  }
}

// Soglie Manuale V2.0
if (unexpectedCount <= 1) {
  reliability_index = 'YES';
} else if (unexpectedCount <= 3) {
  reliability_index = 'CAUTION';
} else if (unexpectedCount <= 5) {
  reliability_index = 'NO';
} else {
  reliability_index = 'ZERO';
}
```

---

## Riepilogo Modifiche

| Sezione | Modifica | Priorita |
|---------|----------|----------|
| Scala Scoring | 0-2 → 0-10 | CRITICA |
| SPECIAL_SCORING | Aggiungere mappa 6 domande | CRITICA |
| Normalizzazione | Usare TRAIT_MAX_SCORES | CRITICA |
| Attendibilita | Contare inattese, soglie V2.0 | ALTA |

---

## Verifica Post-Implementazione

1. **Eseguire batch ricalcolo** su un candidato di test
2. **Confrontare punteggi** con quelli calcolati da `scoringV5.ts`
3. **Verificare attendibilita** sia calcolata correttamente (0-1/2-3/4-5)
4. **Controllare domande speciali** (72, 73, 211-213, 228) abbiano scoring corretto

---

## Dettagli Tecnici

### Differenza Matematica

Con scala 0-2 e normalizzazione `(avg - 1) * 100`:
- Se media risposte = 1.5 → punteggio = +50
- Se media risposte = 0.5 → punteggio = -50

Con scala 0-10 e normalizzazione `((raw / max) * 200) - 100`:
- Se raw = 75% del max → punteggio = +50
- Se raw = 25% del max → punteggio = -50

I risultati finali sono **equivalenti** per la maggior parte dei casi, ma la logica attuale:
- Non gestisce correttamente le domande SPECIAL
- Non calcola correttamente l'attendibilita

### Impatto Candidati Esistenti

Dopo l'implementazione, sara necessario un **batch ricalcolo completo** per aggiornare tutti i profili con:
- Punteggi SPECIAL corretti
- Attendibilita ricalcolata con soglie V2.0
