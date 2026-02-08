
# Piano: Verifica Flusso E2E + Aggiunta Ruoli Mancanti

## Riepilogo Verifiche Effettuate

### ✅ Test Flusso Candidato Completato con Successo

Ho eseguito il test end-to-end completo del flusso candidato:

| Step | Stato | Dettagli |
|------|-------|----------|
| Login Candidato | ✅ | Username/password azienda funzionano correttamente |
| Form Anagrafico | ✅ | Tutti i campi compilabili, validazioni attive |
| Pagina Privacy | ✅ | Checkbox consenso + pulsante "Accetto e Proseguo" |
| Questionario | ✅ | Domande visibili, risposte selezionabili |
| Salvataggio Risposte | ✅ | Ogni risposta salvata immediatamente (POST 201) |
| Progress Bar | ✅ | Aggiornamento in tempo reale (5% dopo 10 domande) |

### ✅ Verifica Salvataggio Database

Tutte le chiamate di rete monitorate hanno mostrato:
- `register-candidate`: 200 OK (3079ms)
- `risposte`: 201 Created per ogni risposta
- Upsert con `on_conflict=candidato_id,domanda_id` funzionante

### ✅ Verifica Profili Candidato Esistenti

| Candidato | Profilo Tipo V5 | Status |
|-----------|-----------------|--------|
| Marco Rossi | IN_TRANSIZIONE | Test completato ✅ |
| Luca Bianchi | LEADER | Test completato ✅ |

I profili V5 estesi sono correttamente configurati in `profiloTipoV5Extended.ts` con:
- Descrizione breve e estesa
- Punti di forza e aree di attenzione
- Contesto ideale e ruoli consigliati
- Tempo onboarding e probabilità successo

---

## Ruoli Sistema: Stato Attuale

### 15 Ruoli Configurati in ROLE_PROFILES_V5:

| # | Ruolo | Categoria | Status |
|---|-------|-----------|--------|
| 1 | Responsabile Amministrativo | amministrativo | ✅ |
| 2 | Venditore/Commerciale | commerciale | ✅ |
| 3 | Customer Care | commerciale | ✅ |
| 4 | Direttore Generale | direzione | ✅ |
| 5 | HR Manager | direzione | ✅ |
| 6 | Marketing Manager | commerciale | ✅ |
| 7 | Responsabile Tecnico | tecnico | ✅ |
| 8 | Buyer/Acquisti | amministrativo | ✅ |
| 9 | Responsabile Produzione/Logistica | operativo | ✅ |
| 10 | Direttore Commerciale | direzione | ✅ |
| 11 | Capocantiere | operativo | ✅ |
| 12 | Commerciale Edilizia | commerciale | ✅ |
| 13 | HR Recruiter | amministrativo | ✅ |
| 14 | Impiegato Amministrativo | amministrativo | ✅ |
| 15 | Operaio/Installatore | operativo | ✅ |

### Ruoli Mancanti (citati nel manuale):

| Ruolo | Status | Nota |
|-------|--------|------|
| Project Manager | ❌ NON configurato | Menzionato in profiloDescriptions.ts come ruolo ideale |
| Assistente di Direzione | ❌ NON configurato | Non presente in nessun file |

---

## Modifiche da Implementare

### 1. Aggiungere "Project Manager" in roleMatchingV5.ts

```typescript
'Project Manager': {
  id: 'project_manager',
  nome: 'Project Manager',
  categoria: 'tecnico',
  descrizione: 'Gestione progetti, coordinamento team, rispetto tempi e budget',
  requisiti: [
    { trait: 'ORG', soglia: 50, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 50' },
    { trait: 'GP', soglia: 40, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 40' },
    { trait: 'LDR', soglia: 35, tipo: 'min', isCritical: true, label: 'Leadership ≥ 35' },
    { trait: 'PRO', soglia: 35, tipo: 'min', isCritical: false, label: 'Proattività ≥ 35' },
    { trait: 'COM', soglia: 25, tipo: 'min', isCritical: false, label: 'Comprensione ≥ 25' },
  ],
  disqualifiers: [
    {
      condition: (t) => t.ORG < 35,
      reason: 'Organizzazione insufficiente per gestire progetti complessi',
      severity: 'blocking'
    },
    {
      condition: (t) => t.GP < 25,
      reason: 'Non regge la pressione delle deadline',
      severity: 'blocking'
    },
    {
      condition: (_, s) => s.some(syn => ['S01', 'S02', 'S03', 'S04'].includes(syn.code) && syn.isActive),
      reason: 'Sindrome critica: non può coordinare team',
      severity: 'blocking'
    },
  ],
  profiloIdeale: 'Orchestratore di complessità. Sa tenere insieme persone, tempi, budget e qualità.',
  trattiFondamentali: ['ORG', 'GP', 'LDR', 'PRO'],
  domandeColloquio: [
    'Racconti di un progetto che ha gestito dall\'inizio alla fine.',
    'Come gestisce le priorità quando tutto è urgente?',
    'Come affronta uno stakeholder che cambia i requisiti a metà progetto?',
    'Qual è il suo approccio per gestire team cross-funzionali?',
  ],
}
```

### 2. Aggiungere "Assistente di Direzione" in roleMatchingV5.ts

```typescript
'Assistente di Direzione': {
  id: 'assistente_dir',
  nome: 'Assistente di Direzione',
  categoria: 'amministrativo',
  descrizione: 'Supporto direzionale, gestione agenda, coordinamento flussi informativi',
  requisiti: [
    { trait: 'ORG', soglia: 55, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 55' },
    { trait: 'ADS', soglia: 50, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 50' },
    { trait: 'PRO', soglia: 40, tipo: 'min', isCritical: true, label: 'Proattività ≥ 40' },
    { trait: 'COM', soglia: 35, tipo: 'min', isCritical: false, label: 'Comprensione ≥ 35' },
    { trait: 'PRI', soglia: 45, tipo: 'min', isCritical: false, label: 'Principi ≥ 45 (riservatezza)' },
  ],
  disqualifiers: [
    {
      condition: (t) => t.ORG < 40,
      reason: 'Organizzazione insufficiente per gestire agenda complessa',
      severity: 'blocking'
    },
    {
      condition: (t) => t.PRI < 30,
      reason: 'Principi troppo bassi: rischio riservatezza',
      severity: 'blocking'
    },
    {
      condition: (_, s) => s.some(syn => ['S01', 'S04', 'S16'].includes(syn.code) && syn.isActive),
      reason: 'Sindrome problematica per ruolo di fiducia',
      severity: 'blocking'
    },
  ],
  profiloIdeale: 'Braccio destro affidabile. Anticipa, organizza, protegge. Riservatezza assoluta.',
  trattiFondamentali: ['ORG', 'ADS', 'PRO', 'PRI'],
  domandeColloquio: [
    'Come gestisce le richieste di ultima ora del dirigente?',
    'Racconti di una situazione riservata che ha dovuto gestire.',
    'Come fa a far rispettare le priorità del dirigente?',
    'Come gestisce le chiamate e le visite indesiderate?',
  ],
}
```

### 3. Aggiornare Test (già fatto)

Il test `ricalcoloV5.test.ts` è già stato aggiornato per aspettare 15 ruoli.
Dopo l'aggiunta dei 2 nuovi ruoli, dovrà essere aggiornato a 17.

---

## File da Modificare

| File | Modifica | Linee |
|------|----------|-------|
| `src/lib/roleMatchingV5.ts` | Aggiungere Project Manager e Assistente di Direzione | Dopo riga 692 |
| `src/test/ricalcoloV5.test.ts` | Aggiornare da 15 a 17 | Riga 274 |

---

## Sezione Tecnica

### Posizione Inserimento (roleMatchingV5.ts)

I nuovi ruoli verranno inseriti prima della chiusura dell'oggetto `ROLE_PROFILES_V5` (riga 692), dopo `'Operaio/Installatore'`.

### Schema Dati Rispettato

Entrambi i ruoli seguono lo schema `RoleProfileV5`:
- `id`: identificatore univoco
- `nome`: nome display
- `categoria`: una delle categorie esistenti
- `descrizione`: breve descrizione ruolo
- `requisiti`: array di TraitRequirement con soglie
- `disqualifiers`: array di RoleDisqualifier con funzioni
- `profiloIdeale`: stringa descrittiva
- `trattiFondamentali`: array di TraitCode
- `domandeColloquio`: array di domande suggerite

### Soglie Tratti Basate su Manuale V5

Le soglie sono state definite seguendo i pattern esistenti e le indicazioni del manuale:
- Project Manager: focus su ORG (50), GP (40), LDR (35) - simile a Responsabile Produzione/Logistica
- Assistente di Direzione: focus su ORG (55), ADS (50), PRI (45) - enfasi su riservatezza

---

## Risultato Finale Atteso

Dopo l'implementazione:
- **17 ruoli professionali** nel sistema
- Test `ricalcoloV5.test.ts` aggiornato per validare 17 ruoli
- Copertura completa rispetto al manuale V5

