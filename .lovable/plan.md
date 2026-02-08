
# Piano di Implementazione Completo: Sincronizzazione Sistema V5

## Problema Identificato

Ho analizzato in dettaglio il Manuale Definitivo V2.0, lo screenshot dell'interfaccia, il database e il codice sorgente. Sono state identificate **discrepanze critiche** che causano calcoli errati dei punteggi.

---

## Modifiche da Implementare

### 1. Sincronizzazione Questionario (PRIORITA CRITICA)

**File:** `src/data/questionario.ts`

Il file locale contiene **testi e scale ERRATE** per le domande 127-237 rispetto al database. Questo causa:
- Candidati che vedono domande diverse da quelle mappate nel database
- Punteggi calcolati con scale errate

**Esempi di discrepanze identificate:**

| ID | Database (corretto) | File Locale (errato) |
|----|---------------------|----------------------|
| 127 | COM(-): "Credi che le persone abbiano idee impossibili da modificare?" | PRI(+): testo diverso |
| 128 | DET(+): "Quando uno sbaglia bisogna farglielo notare per evitare ripetizioni?" | VEN(+): testo diverso |
| 131 | HRM(+): "Dai un apporto stabilizzante all'ambiente che frequenti?" | HRM(-): polarita errata! |
| 133 | HRM(-): "Pensi spesso che dovresti avere meno responsabilita?" | AUT(-): scala errata |
| 138 | HRM(+): "Quando insegni, sei molto attento a far notare gli errori?" | ORG(+): scala errata |

**Azione:** Sostituire completamente le domande 127-237 con i testi e le mappature corrette dal database.

---

### 2. Correzione Soglie Attendibilita (PRIORITA ALTA)

**File:** `src/lib/scoringV5.ts`

Il Manuale Definitivo V2.0 specifica soglie piu stringenti:

| Risposte Inattese | Manuale Definitivo | Codice Attuale |
|-------------------|-------------------|----------------|
| 0-1 | YES | YES |
| 2-3 | CAUTION | (incluso in 2-5) |
| 4-5 | NO (ricompilazione) | CAUTION |
| >5 | ZERO | NO/ZERO |

**Azione:** Aggiornare la funzione `calcolaAttendibilita()`:

```typescript
// Soglie allineate al Manuale Definitivo V2.0
if (unexpectedCount <= 1) {
  return { index: 'YES', unexpectedCount };
} else if (unexpectedCount <= 3) {
  return { index: 'CAUTION', unexpectedCount };
} else if (unexpectedCount <= 5) {
  return { index: 'NO', unexpectedCount };
} else {
  return { index: 'ZERO', unexpectedCount };
}
```

---

### 3. Verifica Dropdown Funzioni (GIA CORRETTO)

**File:** `src/types/database.ts` e `src/pages/FormAnagrafico.tsx`

Il codice contiene gia le 9 funzioni corrette:
1. Direzione generale
2. Ufficio risorse umane
3. Ufficio marketing
4. Ufficio vendite
5. Ufficio tecnico
6. Ufficio acquisti
7. Produzione
8. Logistica
9. Amministrazione

Lo screenshot mostra solo 6 funzioni probabilmente perche il dropdown non e stato scrollato. Il componente Select usa `max-h-[300px]` con scroll automatico.

---

## Riepilogo File da Modificare

| File | Tipo Modifica | Priorita |
|------|---------------|----------|
| `src/data/questionario.ts` | Riscrittura completa domande 127-237 | CRITICA |
| `src/lib/scoringV5.ts` | Modifica funzione `calcolaAttendibilita()` | ALTA |

---

## Verifiche Post-Implementazione

1. **Test Questionario**: Verificare che tutte le 242 domande siano visualizzate correttamente
2. **Test Punteggi**: Completare un questionario e verificare che i punteggi V5 siano calcolati correttamente
3. **Test Attendibilita**: Verificare che le soglie 0-1/2-3/4-5 siano applicate correttamente
4. **Test Funzioni**: Verificare che il dropdown mostri tutte le 9 opzioni (con scroll)

---

## Dettagli Tecnici

### Distribuzione Domande per Tratto (dal Database - Corretta)

| Tratto | Domande | Polarita | Max Punti |
|--------|---------|----------|-----------|
| ORG | 12 | 2(-) + 10(+) | 120 |
| AUT | 22 | 7(-) + 14(+) + 1(S) | 220 |
| GP | 17 | 16(-) + 1(+) | 170 |
| ADS | 21 | 9(-) + 12(+) | 210 |
| DET | 19 | 6(-) + 13(+) | 190 |
| VEN | 19 | 4(-) + 15(+) | 190 |
| HRM | 7 | 2(-) + 5(+) | 70 |
| LDR | 11 | 1(-) + 10(+) | 110 |
| PRO | 16 | 12(-) + 4(+) | 160 |
| COM | 16 | 4(-) + 12(+) | 160 |
| ESP | 13 | 7(-) + 6(+) | 130 |
| RC | 17 | 1(-) + 16(+) | 170 |
| FIN | 14 | 3(-) + 7(+) + 4(S) | 140 |
| SUC | 16 | 2(-) + 13(+) + 1(S) | 160 |
| PRI | 17 | 8(-) + 9(+) | 170 |
| CTRL | 5 | 5(C) | - |
| **TOTALE** | **242** | | |

I valori `TRAIT_MAX_SCORES` in `scoringV5.ts` sono gia corretti.

### Domande di Controllo (238-242)

Tutte le domande CTRL hanno risposta attesa = "A" (Si):
- 238: "A volte hai dovuto dire una bugia?"
- 239: "Hai mai conosciuto una persona antipatica?"
- 240: "Qualche volta ti capita di pensare a cose che poi non dici?"
- 241: "Qualche volta hai l'impressione di parlare troppo?"
- 242: "Qualche volta ti capita di avere pensieri critici riguardo a qualcuno?"

### Sindromi e Ruoli

Le 24 sindromi in `syndromes.ts` e i 17 ruoli in `roleMatchingV5.ts` sono gia correttamente implementati e allineati al manuale.
