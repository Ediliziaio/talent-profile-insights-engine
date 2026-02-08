
# Piano: Fix Test Fallito + Pulizia e Stabilizzazione Finale

## Problema Identificato

Il test in `src/test/ricalcoloV5.test.ts` alla riga 274 fallisce perchè verifica:
```typescript
expect(matching.tuttiRuoli.length).toBe(9);
```

Ma il sistema ora supporta **15 ruoli** (confermato da `roleMatchingV5.test.ts` e dalla definizione in `roleMatchingV5.ts`).

---

## Modifica da Applicare

### File: `src/test/ricalcoloV5.test.ts`

**Riga 274** - Aggiornare assertion:
```typescript
// Prima
expect(matching.tuttiRuoli.length).toBe(9);

// Dopo
expect(matching.tuttiRuoli.length).toBe(15);
```

**Riga 3** (commento) - Aggiornare commento descrittivo:
```typescript
// Prima
// * Test per il ricalcolo nativo V5 con dati reali dal database

// Dopo (opzionale, per coerenza)
// * Test per il ricalcolo nativo V5 con 15 ruoli professionali
```

---

## Verifica Coerenza

Ho verificato che:
- `ROLE_PROFILES_V5` in `roleMatchingV5.ts` contiene **15 ruoli** (9 originali + 6 nuovi)
- `roleMatchingV5.test.ts` già aspetta 15 ruoli (righe 122-124, 199-201) ✅
- Solo `ricalcoloV5.test.ts` è obsoleto con il valore 9 ❌

---

## I 15 Ruoli Configurati

| # | Ruolo | Categoria |
|---|-------|-----------|
| 1 | Responsabile Amministrativo | amministrativo |
| 2 | Venditore/Commerciale | commerciale |
| 3 | Customer Care | commerciale |
| 4 | Direttore Generale | direzione |
| 5 | HR Manager | direzione |
| 6 | Marketing Manager | commerciale |
| 7 | Responsabile Tecnico | tecnico |
| 8 | Buyer/Acquisti | amministrativo |
| 9 | Responsabile Produzione/Logistica | operativo |
| 10 | Direttore Commerciale | direzione |
| 11 | Capocantiere | operativo |
| 12 | Commerciale Edilizia | commerciale |
| 13 | HR Recruiter | amministrativo |
| 14 | Project Manager | tecnico |
| 15 | Assistente di Direzione | amministrativo |

---

## Stima Impatto

- **1 riga da modificare** (riga 274)
- **Zero breaking changes**
- **Test passerà immediatamente**

---

## Sezione Tecnica

### Dettaglio Modifica

```typescript
// File: src/test/ricalcoloV5.test.ts
// Riga: 274

// === PRIMA ===
expect(matching.tuttiRuoli.length).toBe(9);

// === DOPO ===
expect(matching.tuttiRuoli.length).toBe(15);
```

### Verifica Post-Fix

Dopo l'applicazione, eseguirò i test per confermare che tutti passino:
- `ricalcoloV5.test.ts` → ora aspetta 15 ruoli
- `roleMatchingV5.test.ts` → già aspetta 15 ruoli
- `roleMatchingV5-realProfiles.test.ts` → verificare coerenza
