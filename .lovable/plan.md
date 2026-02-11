
# Piano: Mapping Funzione-Ruolo + Verifica Badge + Test

## Problema Critico Scoperto

Il campo `candidato.funzione` nel database contiene valori come "Direzione generale", "Ufficio vendite", "Amministrazione", ecc. Ma `ROLE_PROFILES_V5` usa chiavi come "Direttore Generale", "Venditore/Commerciale", "Responsabile Amministrativo".

Questo mismatch causa:
- Il matching restituisce sempre "Ruolo non configurato" (50%, DA_VALUTARE) per TUTTI i candidati
- Il badge "Soglie definite internamente" non appare mai (perche `roleProfile` e sempre `undefined`)
- Le domande colloquio specifiche per ruolo non vengono mai mostrate

### Valori nel database vs chiavi ROLE_PROFILES_V5

| `candidato.funzione` (DB) | Chiave ROLE_PROFILES_V5 attesa |
|---|---|
| Direzione generale | Direttore Generale |
| Ufficio vendite | Venditore/Commerciale |
| Vendite | Venditore/Commerciale |
| Amministrazione | Responsabile Amministrativo |
| Produzione | Responsabile Produzione/Logistica |
| Logistica | Responsabile Produzione/Logistica |
| Ufficio marketing | Marketing Manager |

## Soluzione

### 1. Aggiungere funzione di mapping (`src/lib/roleMatchingV5.ts`)

Creare una funzione `mapFunzioneToRuoloV5(funzione: string): string` che mappa i valori del campo `funzione` alle chiavi di `ROLE_PROFILES_V5`:

```typescript
const FUNZIONE_TO_RUOLO_MAP: Record<string, string> = {
  'Direzione generale': 'Direttore Generale',
  'Ufficio vendite': 'Venditore/Commerciale',
  'Vendite': 'Venditore/Commerciale',
  'Amministrazione': 'Responsabile Amministrativo',
  'Produzione': 'Responsabile Produzione/Logistica',
  'Logistica': 'Responsabile Produzione/Logistica',
  'Ufficio marketing': 'Marketing Manager',
};

export function mapFunzioneToRuoloV5(funzione: string): string {
  return FUNZIONE_TO_RUOLO_MAP[funzione] || funzione;
}
```

### 2. Usare il mapping in `CandidatoDettaglio.tsx`

In tutte le 5 occorrenze dove viene usato `candidato.funzione` come `ruoloRichiesto`, wrappare con `mapFunzioneToRuoloV5()`:

```typescript
// Prima:
ruoloRichiesto={candidato.funzione || 'Ufficio vendite'}

// Dopo:
ruoloRichiesto={mapFunzioneToRuoloV5(candidato.funzione || 'Venditore/Commerciale')}
```

### 3. Usare il mapping in `RoleMatchingCardV5.tsx` (nessuna modifica necessaria)

Il componente riceve gia il ruolo mappato come prop, quindi il badge funzionera automaticamente.

### 4. Aggiornare i test (`src/test/roleMatchingV5.test.ts`)

Aggiungere test per:
- Il flag `validatoManualeV2` esiste su tutti i ruoli
- 8 ruoli hanno `validatoManualeV2: true`
- 9 ruoli hanno `validatoManualeV2: false`
- La funzione `mapFunzioneToRuoloV5` mappa correttamente
- Il matching funziona con i valori mappati

### 5. Usare il mapping anche in `ExecutiveSummaryCardV5Updated.tsx` e `SintesiFinaleCard.tsx`

Ovunque venga passato `candidato.funzione` come ruolo per il matching, applicare il mapping.

## Risultato Atteso

Dopo le modifiche:
- Aprendo un candidato con funzione "Direzione generale", il matching usera il profilo "Direttore Generale"
- Il badge "Soglie definite internamente (non validate dal Manuale V2.0)" apparira in amber sotto il titolo
- Le domande colloquio specifiche per DG verranno mostrate
- I requisiti e disqualifiers saranno valutati correttamente

## File da Modificare

| File | Modifica |
|------|----------|
| `src/lib/roleMatchingV5.ts` | Aggiungere `FUNZIONE_TO_RUOLO_MAP` e `mapFunzioneToRuoloV5()` |
| `src/pages/CandidatoDettaglio.tsx` | Usare `mapFunzioneToRuoloV5()` in tutte le 5 occorrenze |
| `src/test/roleMatchingV5.test.ts` | Aggiungere test per flag e mapping |
