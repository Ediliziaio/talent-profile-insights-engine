

# Correzioni: Soglie dinamiche + Completezza ruoli

## Problemi trovati

### Problema 1: Le soglie rosse NON si aggiornano cambiando ruolo
Nel dettaglio candidato (`CandidatoDettaglio.tsx`, riga 111), il ruolo richiesto e' calcolato una sola volta dalla `funzione` salvata nel database:
```
const ruoloRichiesto = mapFunzioneToRuoloV5(candidato?.funzione || 'Venditore/Commerciale');
```
Non c'e' nessun selettore per cambiare il ruolo "al volo" e vedere le soglie di un ruolo diverso. Le soglie rosse nel grafico unificato rimangono sempre quelle del ruolo originale.

### Problema 2: Mancano ruoli nella selezione funzione
La lista `FUNZIONI` nel form anagrafico ha 19 voci. Alcune non hanno mappatura verso i 24 ruoli professionali (es. "Selezione personale", "Project management" passano senza mappatura e non trovano un profilo ruolo). Inoltre, alcuni ruoli come "Capocantiere", "Commerciale Edilizia", "Operaio/Installatore" non hanno alcuna voce corrispondente nella lista FUNZIONI.

---

## Soluzioni

### 1. Aggiungere selettore ruolo nel dettaglio candidato

**File: `src/pages/CandidatoDettaglio.tsx`**
- Aggiungere uno stato `selectedRuolo` inizializzato dal `ruoloRichiesto` attuale
- Passare `selectedRuolo` (invece di `ruoloRichiesto`) come prop a `ProfiloUnificatoTab` e `ColloquioTabV3`
- In questo modo, cambiando il ruolo dal selettore, le soglie rosse nel grafico si aggiornano automaticamente (il componente `ProfiloUnificatoTab` gia' calcola le soglie dalla prop `ruoloRichiesto`)

**File: `src/components/ProfiloUnificatoTab.tsx`**
- Aggiungere un `Select` con tutti i 24 `RUOLI_V5` nell'header della card "Profilo Comportamentale"
- Quando l'utente cambia ruolo nel selettore, le soglie rosse e le icone check/X si aggiornano in tempo reale
- Il ruolo attuale del candidato viene mostrato come default

### 2. Completare la lista FUNZIONI e la mappatura

**File: `src/types/database.ts`**
- Aggiungere le funzioni mancanti alla lista `FUNZIONI`:
  - "Cantiere/Edilizia" (per Capocantiere e Commerciale Edilizia)
  - "Installazione/Manutenzione" (per Operaio/Installatore)

**File: `src/lib/roleMatchingV5.ts`**
- Aggiungere le mappature mancanti a `FUNZIONE_TO_RUOLO_MAP`:
  - "Selezione personale" -> "HR Recruiter"
  - "Project management" -> "Project Manager"
  - "Cantiere/Edilizia" -> "Capocantiere"
  - "Installazione/Manutenzione" -> "Operaio/Installatore"
  - "Impiegato amministrativo" -> "Impiegato Amministrativo"

---

## Risultato atteso

1. Nella pagina dettaglio candidato, un selettore permette di cambiare ruolo e le soglie rosse nel grafico si aggiornano istantaneamente
2. Il form anagrafico offre tutte le funzioni necessarie per coprire i 24 ruoli professionali
3. Ogni funzione selezionabile mappa correttamente a un profilo ruolo con soglie definite

