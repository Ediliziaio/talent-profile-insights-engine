
# Piano: Implementazione Completa Manuale Output V2.0

## Analisi Gap - Cosa Manca

Ho confrontato il **Manuale Output V2.0** con l'implementazione corrente. Ecco le sezioni richieste dal manuale e il loro stato attuale:

| Sezione Manuale | Stato Attuale | Azione Richiesta |
|-----------------|---------------|------------------|
| **SEZIONE 1: Panoramica Istantanea** | ✅ Parziale | Aggiungere testi dinamici per profilo tipo |
| **SEZIONE 2: Chi è [Nome] come Persona** | ❌ Manca | Creare nuovo componente con 4 capitoli |
| **SEZIONE 3: Il Grafico** | ✅ OK | Già implementato con CandleChart/MacroAreasChartV5 |
| **SEZIONE 4: Alert e Sindromi** | ✅ OK | Già implementato |
| **SEZIONE 5: Idoneità al Ruolo** | ✅ Parziale | Aggiungere testi motivazione estesi e ruoli alternativi |
| **SEZIONE 6: Punti di Forza e Aree Miglioramento** | ❌ Manca | Creare componente dedicato con percorsi formativi |
| **SEZIONE 7: Domande per il Colloquio** | ✅ Parziale | Aggiungere domande obbligatorie dal manuale |
| **SEZIONE 8: Piano d'Azione** | ❌ Manca | Creare componente con priorità e tempistiche |
| **SEZIONE 9: Come Gestire [Nome]** | ❌ Manca | Creare testi narrativi per il manager |
| **SEZIONE 10: Scheda Colloquio Stampabile** | ❌ Manca | Creare PDF compatto A4 |

---

## Nuovi Componenti da Creare

### 1. PersonalityNarrativeV5.tsx (SEZIONE 2)
Il componente più importante e complesso. Genera un "ritratto umano" dinamico diviso in 4 capitoli:

- **Capitolo 1: COME PENSA (Area ESSERE)**
  - ORG: Modo di organizzare la vita
  - AUT: Fiducia e ambizione
  - GP: Stabilità emotiva attuale

- **Capitolo 2: COME AGISCE (Area FARE)**
  - ADS: Affidabilità e disciplina
  - DET: Capacità di parlare chiaro
  - VEN: Capacità di coinvolgere
  - HRM: Come gestisce e fa crescere le persone

- **Capitolo 3: COME SI RELAZIONA (Area AVERE)**
  - LDR: Influenza sugli altri
  - PRO: Quanto aiuta o ostacola
  - COM: Apertura alla diversità
  - ESP: Rete di relazioni

- **Capitolo 4: STABILITÀ E PRINCIPI (Indicatori)**
  - RC: Rapporto con il cambiamento
  - FIN: Gestione finanziaria
  - SUC: Risultati raggiunti
  - PRI: Principi professionali

Ogni tratto avrà 6-7 fasce con testi specifici dal manuale.

### 2. StrengthsWeaknessesCardV5.tsx (SEZIONE 6)
Card con tabella TOP 3 FORZA / TOP 3 MIGLIORAMENTO:
- Descrizione 2-3 righe per ogni tratto
- Percorso suggerito
- Tempistica stimata (3-6 mesi / 6-12 mesi / 12-24 mesi)

### 3. ActionPlanCardV5.tsx (SEZIONE 8)
Tabella con Piano d'Azione:
- Priorità P1, P2, P3...
- GP < 21 sempre priorità 1
- Ogni sindrome ha azione specifica
- Check-in intermedio a 3 mesi
- Ricompilazione a 24 mesi

### 4. ManagementGuideV5.tsx (SEZIONE 9)
Testi narrativi per il manager basati sui pattern:
- SE AUT > 50: "Dagli sfide ambiziose..."
- SE AUT < 20: "Ha bisogno di incoraggiamento costante..."
- SE DET > 40: "Apprezza la sua schiettezza..."
- SE RC > 45: "I cambiamenti vanno introdotti con numeri..."
- SE GP < 21: "PRIORITA' ASSOLUTA: scopri chi causa pressioni..."
- Etc.

### 5. InterviewSheetPDF.tsx (SEZIONE 10)
Layout PDF A4 compatto per stampare:
- Intestazione con nome, ruolo, data, badge attendibilità
- Profilo tipo con testo 1 riga
- Idoneità con motivazione 1 riga
- Max 3 sindromi (1 riga ciascuna)
- Mini-grafico a barre semplificato
- Forza/Miglioramento (1 riga ciascuno)
- 5-10 domande dalla Sezione 7
- Area note bianca per appunti

---

## File di Dati da Creare

### traitNarrativesV5.ts
File con tutti i testi narrativi per ogni tratto e fascia:

```typescript
export const TRAIT_NARRATIVES: Record<TraitCode, Record<string, string>> = {
  ORG: {
    'eccellente': "[Nome] ha una mente straordinariamente organizzata...",
    'buono': "[Nome] ha ottime capacità organizzative...",
    'discreto': "[Nome] ha buone capacità organizzative...",
    'mediocre': "[Nome] riesce a organizzarsi in condizioni normali...",
    'carenza': "[Nome] ha una relazione difficile con la pianificazione...",
    'critico': "[Nome] fatica seriamente a organizzare il proprio tempo...",
    'grave': "[Nome] vive in una condizione di dispersione mentale..."
  },
  AUT: { ... },
  GP: { ... },
  // ... tutti i 15 tratti
};
```

### crossPatternV5.ts
File con i pattern cross-area (combinazioni di tratti):

```typescript
export const CROSS_PATTERNS: CrossPattern[] = [
  {
    id: 'base_eccellenza',
    condition: (traits) => traits.ORG > 40 && traits.ADS > 40 && traits.DET > 35,
    tipo: 'positivo',
    testo: "[Nome] ha le tre colonne portanti dell'efficacia..."
  },
  {
    id: 'sognatore_non_realizza',
    condition: (traits, macro) => macro.essere > 60 && macro.fare < 40,
    tipo: 'critico',
    testo: "C'è un grande divario tra ciò che [Nome] pensa e ciò che fa..."
  },
  // ... tutti i pattern dal manuale
];
```

### managementTipsV5.ts
File con i consigli gestionali per il manager:

```typescript
export const MANAGEMENT_TIPS: ManagementTip[] = [
  { condition: (t) => t.AUT > 50, text: "Dagli sfide ambiziose..." },
  { condition: (t) => t.AUT < 20, text: "Ha bisogno di incoraggiamento..." },
  { condition: (t) => t.DET > 40, text: "Apprezza la sua schiettezza..." },
  { condition: (t) => t.GP < 21, text: "PRIORITA' ASSOLUTA: scopri chi causa pressioni..." },
  // ... tutti i consigli dal manuale
];
```

---

## Modifiche a File Esistenti

### 1. CandidatoDettaglio.tsx
- Aggiungere nuovi tab per le sezioni mancanti
- Riorganizzare la navigazione con scroll continuo o tabs

### 2. ExecutiveSummaryCardV5Updated.tsx
- Aggiungere testi brevi/estesi per ogni profilo tipo (dal manuale)
- Usare il nome del candidato nei testi

### 3. RoleMatchingCardV5.tsx
- Aggiungere testi motivazione estesi (IDONEO/NON IDONEO/CON RISERVA)
- Aggiungere sezione "Ruoli Alternativi" se NON IDONEO

### 4. InterpretazioneDati.tsx
- Aggiungere le domande obbligatorie dal manuale (sempre domanda 1 e ultima)
- Aggiungere domande condizionali specifiche (SE GP < 21, SE DET < 30, etc.)

### 5. PDFReportLayout.tsx
- Aggiornare per includere le nuove sezioni
- Usare sempre [Nome] candidato (mai "il candidato")

---

## Ordine di Implementazione

### Fase 1: Dati Core (Priorità CRITICA)
1. `src/lib/traitNarrativesV5.ts` - Testi narrativi per tutti i tratti
2. `src/lib/crossPatternsV5.ts` - Pattern cross-area
3. `src/lib/managementTipsV5.ts` - Consigli gestionali

### Fase 2: Componenti Principali (Priorità ALTA)
4. `src/components/PersonalityNarrativeV5.tsx` - SEZIONE 2 completa
5. `src/components/StrengthsWeaknessesCardV5.tsx` - SEZIONE 6
6. `src/components/ManagementGuideV5.tsx` - SEZIONE 9

### Fase 3: Componenti Secondari (Priorità MEDIA)
7. `src/components/ActionPlanCardV5.tsx` - SEZIONE 8
8. `src/components/InterviewSheetPDF.tsx` - SEZIONE 10

### Fase 4: Integrazioni (Priorità MEDIA)
9. Aggiornare `CandidatoDettaglio.tsx` con nuovi componenti
10. Aggiornare `PDFReportLayout.tsx` per includere tutto
11. Aggiornare `InterpretazioneDati.tsx` con domande obbligatorie

### Fase 5: Rifinitura (Priorità BASSA)
12. Aggiungere testi estesi a `ExecutiveSummaryCardV5Updated.tsx`
13. Aggiungere ruoli alternativi a `RoleMatchingCardV5.tsx`
14. Test end-to-end con candidati reali

---

## Stima Complessità

| Componente | Righe Stimate | Complessità |
|------------|---------------|-------------|
| traitNarrativesV5.ts | ~800 | Media (testi da copiare) |
| crossPatternsV5.ts | ~200 | Bassa |
| managementTipsV5.ts | ~100 | Bassa |
| PersonalityNarrativeV5.tsx | ~400 | Alta |
| StrengthsWeaknessesCardV5.tsx | ~200 | Media |
| ActionPlanCardV5.tsx | ~250 | Media |
| ManagementGuideV5.tsx | ~200 | Media |
| InterviewSheetPDF.tsx | ~300 | Media |
| **TOTALE** | ~2450 righe | |

---

## Note Tecniche Importanti

1. **Uso del Nome Candidato**
   - Mai usare "il candidato" - sempre [Nome]
   - Gestire desinenze M/F basate sul campo `sesso` nel form

2. **Calcolo in Max 3 Secondi**
   - Tutti i calcoli sono già client-side
   - Rendering progressivo già implementato

3. **PDF in Max 10 Secondi**
   - Usare lazy loading per sezioni pesanti
   - Ottimizzare html2canvas

4. **Navigazione**
   - Tab o scroll continuo (già implementato con Tabs)
   - Tutte le sezioni devono essere accessibili

---

## Risultato Atteso

Dopo l'implementazione:
- Il report candidato avrà **tutte le 10 sezioni** del Manuale V2.0
- Ogni testo sarà **dinamico** e userà il **nome del candidato**
- Il PDF sarà completo e ottimizzato per la stampa
- La Scheda Colloquio sarà un PDF A4 compatto e pratico
