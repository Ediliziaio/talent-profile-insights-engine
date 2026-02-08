
# Piano: Sincronizzazione Domande e Verifica Ruoli

## Analisi dei Problemi

### Problema 1: Domande Mancanti (200 vs 243)

| Fonte | Conteggio | Status |
|-------|-----------|--------|
| `src/data/questionario.ts` | 200 domande (id 1-200) | ❌ Incompleto |
| Database `domande` | 242 domande (id 1-242) | ✅ Completo |

Le domande **201-242** presenti nel database includono:
- **201-209**: Domande VEN (Attitudine Vendita) avanzate
- **210-219**: Domande FIN (Finanze)
- **220-228**: Domande SUC (Successo)
- **229-237**: Domande PRI (Principi)
- **238-242**: Domande CTRL (Controllo validità)

**Nota**: La memoria V5 menziona "200 domande per l'assessment", quindi le domande 201-242 potrebbero essere supplementari per gli indicatori V5 e il CTRL.

### Problema 2: Ruoli - Stato Attuale

| Ruolo | Status in `ROLE_PROFILES_V5` |
|-------|------------------------------|
| 1. Responsabile Amministrativo | ✅ |
| 2. Venditore/Commerciale | ✅ |
| 3. Customer Care | ✅ |
| 4. Direttore Generale | ✅ |
| 5. HR Manager | ✅ |
| 6. Marketing Manager | ✅ |
| 7. Responsabile Tecnico | ✅ |
| 8. Buyer/Acquisti | ✅ |
| 9. Responsabile Produzione/Logistica | ✅ |
| 10. Direttore Commerciale | ✅ |
| 11. Capocantiere | ✅ |
| 12. Commerciale Edilizia | ✅ |
| 13. HR Recruiter | ✅ |
| 14. Impiegato Amministrativo | ✅ |
| 15. Operaio/Installatore | ✅ |
| 16. Project Manager | ✅ (Aggiunto di recente) |
| 17. Assistente di Direzione | ✅ (Aggiunto di recente) |

**Totale: 17 ruoli configurati** - Il sistema è completo.

---

## Decisione Strategica: Domande

Il sistema V5 è progettato per utilizzare **200 domande base** per il calcolo dei tratti. Le domande 201-242 nel database sono:
- Indicatori supplementari (FIN, SUC, PRI)
- Domande di controllo validità (CTRL)
- Presenti per compatibilità con versioni future

**Due opzioni:**

### Opzione A: Mantenere 200 domande (Consigliato)
- Il questionario attuale funziona correttamente
- I tratti V5 vengono calcolati con le 200 domande
- Le domande extra sono per analisi avanzate non ancora implementate

### Opzione B: Estendere a 242 domande
- Sincronizzare `questionario.ts` con il database
- Richiede modifiche al motore di scoring
- Aumenta il tempo del test per i candidati

---

## Modifiche Proposte

### 1. Aggiornare Commento Legacy in roleMatchingV5.ts

Il commento iniziale menziona "9 mansioni" ma sono 17. Aggiornamento:

**File**: `src/lib/roleMatchingV5.ts` (righe 1-16)

```typescript
/**
 * Sistema di Matching Ruoli V5 - Assessment Psicometrico
 * 
 * Matching per 17 mansioni basato sui 15 tratti V5:
 * - Responsabile Amministrativo
 * - Venditore/Commerciale
 * - Customer Care
 * - Direttore Generale
 * - HR Manager
 * - Marketing Manager
 * - Responsabile Tecnico
 * - Buyer/Acquisti
 * - Responsabile Produzione/Logistica
 * - Direttore Commerciale
 * - Capocantiere
 * - Commerciale Edilizia
 * - HR Recruiter
 * - Impiegato Amministrativo
 * - Operaio/Installatore
 * - Project Manager
 * - Assistente di Direzione
 * 
 * Include disqualifier e soglie tratti dal Manuale V5
 */
```

### 2. (Opzionale) Sincronizzare Domande 201-242

Se desideri le 42 domande aggiuntive nel questionario:

**File**: `src/data/questionario.ts`

Aggiungere le domande 201-242 dal database. Queste includono:
- Domande speciali per VEN, FIN, SUC, PRI
- Domande di controllo CTRL

---

## Riepilogo Verifiche

| Componente | Status | Note |
|------------|--------|------|
| Ruoli in `ROLE_PROFILES_V5` | ✅ 17 ruoli | Tutti configurati |
| Export `RUOLI_V5` | ✅ Dinamico | `Object.keys()` include tutti |
| Domande in TypeScript | ⚠️ 200 | Sufficiente per V5 base |
| Domande in Database | ✅ 242 | Include indicatori extra |
| Test suite | ✅ 51/51 | Tutti passati |

---

## Sezione Tecnica

### Architettura Domande V5

Il manuale V5 specifica:
- **200 domande core**: Calcolo dei 15 tratti principali
- **Domande CTRL**: Validità e attendibilità (opzionali)
- **Indicatori FIN/SUC/PRI**: Analisi supplementare

Il file `questionario.ts` fornisce le 200 domande core, sufficienti per l'assessment standard. Le domande 201-242 nel database sono per funzionalità avanzate.

### Visualizzazione Ruoli UI

I ruoli vengono mostrati dinamicamente tramite:
1. `calculateAllRolesCompatibilityV5Cached()` - Calcola matching per tutti i 17 ruoli
2. `RUOLI_V5` - Lista dinamica da `Object.keys(ROLE_PROFILES_V5)`
3. `RoleMatchingCardV5` - Accordion con tutti i ruoli ordinati per compatibilità

Se non vedi tutti i 17 ruoli nella UI, potrebbe essere:
- Il candidato non ha un profilo V5 completo
- Cache del browser da svuotare
- Componente non ricaricato dopo le modifiche

### File Coinvolti

| File | Modifica |
|------|----------|
| `src/lib/roleMatchingV5.ts` | Aggiornare commento (17 ruoli) |
| `src/data/questionario.ts` | Opzionale: aggiungere domande 201-242 |

---

## Raccomandazione

Procedere con **Opzione A**: mantenere 200 domande nel questionario (sufficiente per V5) e aggiornare solo il commento legacy nel file roleMatchingV5.ts.

Se desideri estendere a 242 domande, conferma e procederò con la sincronizzazione completa.
