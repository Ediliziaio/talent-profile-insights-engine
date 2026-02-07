

# Piano: Completamento Funzionalità V5 - Fascia Guru, PDF Sindromi e Pulizia

## Riepilogo Problemi Identificati

Dall'analisi approfondita del codebase e del database ho identificato i seguenti problemi da risolvere:

---

## 1. PDF SINDROMI NON AFFIDABILE

### Problema
La sindrome **S19 (RC GRAVE)** è stata aggiunta in `syndromes.ts` ma NON ha i dati estesi in `syndromesV5Data.ts`. Quando il PDF tenta di generare la pagina dettaglio per S19, chiama `getSyndromeExtendedData('S19')` che ritorna `undefined`, causando il fallimento del rendering.

### Candidata Affetta
- **Francesca Dell'Aquila** (RC = -29) ha S19 attiva nel database

### Soluzione
Aggiungere i dati estesi per S19 in `src/lib/syndromesV5Data.ts`:

```typescript
S19: {
  code: 'S19',
  name: 'RC GRAVE',
  severity: 'ORANGE',
  shortDescription: 'RC molto basso. Dispersiva, impulsiva, non completa progetti.',
  extendedDescription: `Resistenza al Cambiamento gravemente negativa (RC <= -29). 
    Questa persona è un vulcano di idee ma non ne completa nessuna. 
    Cambia continuamente direzione, è impulsiva nelle decisioni e fatica 
    a mantenere focus su obiettivi a lungo termine...`,
  organizationalImpact: `Progetti iniziati e abbandonati. Costi di 
    ri-lavoro elevati. Difficoltà a pianificare...`,
  warningSignals: [...],
  interviewQuestions: [...],
  managementTips: [...],
  contraindicatedRoles: [...],
  category: 'primary'
}
```

---

## 2. FASCIA GURU NON IMPLEMENTATA

### Problema
Il Manuale V2 specifica che RC tra -14 e +14 è la "Fascia del Guru": persone creative ma dispersive, difficili da gestire, che cambiano continuamente idea. Questa interpretazione speciale NON è visualizzata nel report candidato.

### Candidati Interessati
- Elena Bellin (RC = 0)
- Samuele Beretta (RC = -6)
- Davide Curti (RC = 12)
- giuliano beretta (RC = 12)
- Marco Rossi (RC = 12)

### Soluzione
Aggiungere un'interpretazione speciale "Fascia Guru" nel componente `ExecutiveSummaryCardV5Updated.tsx` che mostra un badge/alert quando RC è tra -14 e +14:

```typescript
// In ExecutiveSummaryCardV5Updated.tsx
const rcValue = traitsV5?.RC ?? 0;
const isFasciaGuru = rcValue >= -14 && rcValue <= 14;

{isFasciaGuru && (
  <Alert className="border-purple-500 bg-purple-50">
    <Lightbulb className="h-4 w-4 text-purple-600" />
    <AlertTitle>Fascia Guru (RC = {rcValue})</AlertTitle>
    <AlertDescription>
      Profilo creativo e aperto al cambiamento, ma potenzialmente dispersivo. 
      Vulcano di idee, può faticare a completare progetti. 
      Richiede guida e struttura per essere produttivo.
    </AlertDescription>
  </Alert>
)}
```

---

## 3. DOMANDE QUESTIONARIO

### Stato Attuale
- **Database**: 242 domande (ID 1-242)
- **File questionario.ts**: 200 domande (ID 1-200)
- **Assessment V5**: Usa 200 domande dal file

Le 42 domande extra nel DB (ID 201-242) sono per funzionalità legacy. Il sistema V5 funziona correttamente con 200 domande.

### Azione
Nessuna modifica necessaria. Il sistema è coerente.

---

## 4. CODICE VECCHIO DA RIMUOVERE

### File `src/lib/scoring.ts`
Questo file contiene logica V4 (scale 0-200) ancora utilizzata per candidati legacy. **NON rimuovere** - serve per compatibilità retroattiva con profili V4.

### File `src/test/roleMatchingV5-realProfiles.test.ts`
Contiene funzione `convertV4toV5()` per test. Può rimanere per test di regressione.

### Azione
Mantenere i file esistenti per compatibilità. Nessuna rimozione immediata necessaria.

---

## 5. VERIFICA NUOVE SOGLIE RUOLI

Le soglie ruoli allineate al Manuale V2 sono state applicate. Verificare che:
- Responsabile Amministrativo usi soglie corrette
- Venditore/Commerciale usi soglie corrette
- Customer Care usi soglie corrette

---

## File da Modificare

| File | Modifica | Priorità |
|------|----------|----------|
| `src/lib/syndromesV5Data.ts` | Aggiungere dati estesi S19 | CRITICA |
| `src/components/ExecutiveSummaryCardV5Updated.tsx` | Aggiungere interpretazione Fascia Guru | ALTA |
| `src/components/InterpretazioneDati.tsx` | Aggiungere sezione RC con Fascia Guru | MEDIA |

---

## Piano di Implementazione

### Fase 1: Fix PDF Sindromi (CRITICA)
1. Aprire `src/lib/syndromesV5Data.ts`
2. Aggiungere oggetto S19 completo con tutti i campi richiesti
3. Testare generazione PDF per Francesca Dell'Aquila

### Fase 2: Implementare Fascia Guru
1. Modificare `ExecutiveSummaryCardV5Updated.tsx`
2. Aggiungere logica per rilevare RC -14 a +14
3. Mostrare alert/badge "Fascia Guru" con descrizione

### Fase 3: Verifica Candidati
1. Navigare ai candidati con S19 e verificare PDF
2. Navigare ai candidati con RC nella Fascia Guru
3. Verificare che le soglie ruoli siano corrette

---

## Dettagli Tecnici

### Dati S19 da Aggiungere

```typescript
S19: {
  code: 'S19',
  name: 'RC GRAVE',
  severity: 'ORANGE',
  shortDescription: 'Altamente dispersiva, impulsiva. Vulcano di idee ma non ne completa nessuna.',
  extendedDescription: `Resistenza al Cambiamento gravemente negativa (RC <= -29). 
    Questa persona presenta un pattern di estrema apertura al cambiamento che sconfina 
    nella dispersività. È un vulcano di idee: ne genera continuamente ma raramente 
    le porta a termine. Cambia direzione frequentemente, spesso prima di vedere 
    i risultati delle azioni intraprese. L'impulsività decisionale può portare 
    a scelte affrettate che poi vengono rapidamente abbandonate. In contesti 
    che richiedono persistenza e follow-through, questo pattern è fortemente 
    problematico.`,
  organizationalImpact: `Costo elevato di progetti iniziati e abbandonati. 
    I colleghi si frustrano nel vedere continui cambiamenti di direzione. 
    La pianificazione a lungo termine diventa impossibile. Le risorse vengono 
    disperse su troppe iniziative simultanee. Tuttavia, può essere preziosa 
    in ruoli puramente creativi/ideazione se affiancata da figure esecutive.`,
  warningSignals: [
    'Curriculum con molti cambi di direzione o progetti brevi',
    'Entusiasmo per nuove idee ma vago su come le ha concluse',
    'Difficoltà a descrivere progetti portati a termine',
    'Impazienza visibile quando si parla di dettagli operativi',
    'Tende a interrompere per proporre alternative'
  ],
  interviewQuestions: [
    'Mi racconti di un progetto importante che ha portato a termine nonostante le difficoltà',
    'Come gestisce la tentazione di cambiare direzione quando emerge una nuova opportunità?',
    'Qual è il suo rapporto con la routine e le attività ripetitive?',
    'Come reagiscono i suoi colleghi quando propone cambiamenti?'
  ],
  managementTips: [
    'Affiancare sempre con figure "completers" che portano a termine',
    'Obiettivi a brevissimo termine (1-2 settimane)',
    'Check frequenti per evitare derive',
    'Valorizzare la creatività incanalandola in processi strutturati',
    'Non affidare progetti lunghi in autonomia'
  ],
  contraindicatedRoles: [
    'Project manager',
    'Ruoli che richiedono persistenza plurimensile',
    'Gestione operativa quotidiana',
    'Ruoli amministrativi o procedurali',
    'Posizioni con deadline critiche non negoziabili'
  ],
  category: 'primary'
}
```

### Logica Fascia Guru

```typescript
// Range RC per interpretazioni speciali (Manuale V2)
const RC_RANGES = {
  GRAVE: { max: -29, label: 'RC Grave', severity: 'error' },
  DISPERSIVO: { min: -28, max: -15, label: 'Dispersivo', severity: 'warning' },
  GURU: { min: -14, max: 14, label: 'Fascia Guru', severity: 'info' },
  EQUILIBRATO: { min: 15, max: 44, label: 'Equilibrato', severity: 'success' },
  ELEVATA: { min: 45, label: 'RC Elevata', severity: 'warning' }
};
```

---

## Risultato Atteso

Dopo le modifiche:
1. Il PDF Sindromi genererà correttamente per tutti i candidati, incluso S19
2. I candidati con RC nella Fascia Guru vedranno un'interpretazione speciale
3. Tutte le soglie ruoli saranno allineate al Manuale V2
4. Il sistema sarà al 100% di copertura del Manuale V2

