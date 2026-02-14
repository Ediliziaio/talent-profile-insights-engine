

# Stabilizzazione e Pulizia Progetto TalentProfile

## 1. Codice non utilizzato da rimuovere

### File da eliminare completamente
- **`src/components/PersonalityNarrativeV5.tsx`** - Mai importato da nessun componente
- **`src/lib/profiloDescriptions.ts`** - Mai importato da nessun file

### Import inutili da rimuovere
- **`src/pages/CandidatoDettaglio.tsx`**: `showRisposte` state e relativa logica nel dropdown sono duplicati (il componente `RisposteDettagliate` ha gia' il suo toggle interno tramite Collapsible). Lo state `showRisposte` non viene usato per condizionare il rendering di `RisposteDettagliate`, quindi e' dead code.

## 2. Fix funzionali

### 2.1 Questionario - Flusso skip ConsensoPrivacy
Il flusso attuale e': Privacy -> Questionario. Ma `ConsensoPrivacy` non verifica se il candidato ha gia' completato il form anagrafico. Se il candidato arriva dalla registrazione self-service, funziona. Ma se accede tramite candidato creato da HR (con credenziali generate), arriva a Privacy e poi Questionario senza problemi. **Nessun bug critico rilevato qui.**

### 2.2 Candidato Dettaglio - `showRisposte` dead state
Lo state `showRisposte` in `CandidatoDettaglio.tsx` viene settato nel dropdown menu ma non viene usato per mostrare/nascondere il componente `RisposteDettagliate`. Il componente viene sempre renderizzato (quando `profilo` esiste) e usa il proprio Collapsible interno. Questo crea confusione UX: il pulsante "Mostra Risposte" nel dropdown non fa nulla di visibile. Fix: rimuovere lo state e collegare il toggle correttamente oppure rimuovere la voce dal dropdown.

### 2.3 `CandidatoDettaglio.tsx` - Cast `as any` eccessivi
Molti campi del profilo vengono castati con `as any` (linee 79-87). Non e' un bug runtime ma rende il codice fragile. Sara' documentato come tech debt.

## 3. Pulizia e miglioramenti UX

### 3.1 Fix `showRisposte` in CandidatoDettaglio
Rendere il toggle "Mostra Risposte Dettagliate" funzionante: quando cliccato, scrollare fino al componente `RisposteDettagliate` e aprirlo automaticamente.

### 3.2 Mobile: bottone "Torna alla lista" nel dettaglio candidato
Attualmente il bottone `ArrowLeft` per tornare alla lista e' `hidden sm:flex`. Su mobile manca un modo chiaro per tornare indietro. Aggiungere un pulsante "Torna alla lista" fisso in basso o nel header mobile.

### 3.3 ConsensoPrivacy - skip se test gia' completato
Aggiungere un redirect se `candidato.test_completato === true` cosi' un candidato che ha gia' completato il test non rivede la pagina privacy ma viene mandato direttamente a `/test/completato`.

## 4. Riepilogo tecnico delle modifiche

| # | File | Azione |
|---|------|--------|
| 1 | `src/components/PersonalityNarrativeV5.tsx` | Eliminare (mai usato) |
| 2 | `src/lib/profiloDescriptions.ts` | Eliminare (mai importato) |
| 3 | `src/pages/CandidatoDettaglio.tsx` | Rimuovere dead state `showRisposte`, collegare toggle a `RisposteDettagliate` ref, aggiungere bottone "Torna" mobile |
| 4 | `src/pages/ConsensoPrivacy.tsx` | Aggiungere check test_completato e redirect |
| 5 | Pulizia generale | Verificare console per errori/warning residui |

## 5. Cosa NON viene toccato (vincolo rispettato)
- Nessun cambiamento al comportamento funzionale del questionario, scoring, sindromi, role matching
- Nessuna modifica a file auto-generati (client.ts, types.ts, config.toml, .env)
- Nessuna modifica alla logica di autenticazione o RLS

