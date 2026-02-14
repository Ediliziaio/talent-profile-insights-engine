

# Unificazione Tab Compatibilita' + Profilo e Fix Ruoli Alternativi

## Problema 1: Due tab ridondanti
Attualmente "Compatibilita'" e "Profilo" sono due tab separati. L'utente li vuole uniti in un unico flusso piu' naturale. La nuova struttura sara' un singolo tab **"Profilo e Compatibilita'"** (o semplicemente "Profilo") che presenta tutto insieme.

## Problema 2: Ruoli alternativi incoerenti
Due sistemi completamente diversi generano "ruoli consigliati":
- **Compatibilita' tab**: usa `calculateAllRolesCompatibilityV5` che calcola la % di compatibilita' su 17 ruoli con soglie e disqualifier algoritmici
- **Profilo tab**: usa `profiloTipoV5Extended.ruoliIdeali` che sono stringhe statiche scritte a mano per ogni profilo tipo (es. LEADER ha "Direzione Generale", "Direzione Commerciale"...)

I nomi non corrispondono nemmeno (es. "Direzione Generale" vs "Direttore Generale") e i risultati sono calcolati con logiche diverse.

**Soluzione**: usare SOLO il sistema algoritmico (`calculateAllRolesCompatibilityV5`) come fonte unica di verita' per i ruoli consigliati, sostituendo le liste statiche nel profilo tipo con i risultati calcolati dinamicamente sui tratti reali del candidato.

## Piano di implementazione

### 1. Unire i due tab in uno solo

**`src/pages/CandidatoDettaglio.tsx`**:
- Ridurre i tab da 4 a 3: **Profilo** (unione), **Gestione**, **Colloquio**
- Il nuovo tab "Profilo" conterra' nell'ordine:
  1. Grafico barre con soglie ruolo (da Compatibilita')
  2. Conteggio requisiti soddisfatti (da Compatibilita')
  3. Segnalazioni sindromi (da Compatibilita')
  4. Grafico barre comportamentale senza soglie (da Profilo)
  5. Narrativa "Chi e' [Nome]" (da Profilo)
  6. Punti di Forza e Aree di Lavoro (da Profilo)
  7. Ruoli alternativi (unificati - solo algoritmici)
  8. Profilo Tipo accordion (da Profilo)
  9. Attendibilita' accordion (da Compatibilita')

### 2. Creare nuovo componente unificato

**Nuovo file: `src/components/ProfiloUnificatoTab.tsx`**
- Riceve tutte le props di entrambi i tab attuali
- Organizza le sezioni in un flusso logico dall'alto al basso
- Nella sezione "Ruoli alternativi": usa esclusivamente `calculateAllRolesCompatibilityV5Cached` per generare la lista
- Nella sezione "Profilo Tipo": rimuove `ruoliIdeali` statici e li sostituisce con i top 3-5 ruoli calcolati algoritmicamente

### 3. Aggiornare CandidatoDettaglio

**`src/pages/CandidatoDettaglio.tsx`**:
- Rimuovere import di `CompatibilitaTabV3` e `ProfiloTabV3`
- Importare il nuovo `ProfiloUnificatoTab`
- Aggiornare i tab da 4 a 3
- Passare tutte le props necessarie

### 4. Pulizia

- I file `CompatibilitaTabV3.tsx` e `ProfiloTabV3.tsx` restano nel codebase come riferimento ma non vengono piu' importati (si possono eliminare in un secondo momento)

## Risultato finale

| Prima (4 tab) | Dopo (3 tab) |
|---|---|
| Compatibilita' | **Profilo** (unificato) |
| Profilo | Gestione |
| Gestione | Colloquio |
| Colloquio | |

I ruoli consigliati saranno sempre calcolati algoritmicamente in base ai tratti reali del candidato, eliminando la discrepanza con le liste statiche del profilo tipo.

