
# Piano: Aggiungere Pulsante Download Scheda Colloquio PDF

## Obiettivo
Aggiungere un pulsante per scaricare la **Scheda Colloquio** (InterviewSheetPDF) come documento A4 compatto, pronto per la stampa durante i colloqui.

---

## Analisi Componenti Esistenti

### Già Creati
1. **`InterviewSheetPDF.tsx`** - Layout A4 per stampa con:
   - Intestazione (nome, ruolo, data, attendibilità)
   - Profilo tipo e idoneità ruolo
   - Top 3 sindromi
   - Mini-grafico macro-aree
   - Top 3 forze/debolezze
   - 10 domande colloquio
   - Spazio note rigato

2. **`PDFExportButton.tsx`** - Contiene già helper per:
   - `loadLogoAsBase64()` - Carica watermark logo
   - `addWatermarkToPage()` - Aggiunge logo a ogni pagina
   - Pattern per generazione PDF con html2canvas + jsPDF

### Da Creare
Un nuovo componente `InterviewSheetPDFButton` simile a `PDFSyndromeReportButton`

---

## Implementazione Tecnica

### 1. Nuovo Componente in `PDFExportButton.tsx`

```typescript
interface InterviewSheetPDFButtonProps {
  candidato: {
    nome: string;
    cognome: string;
    sesso?: string | null;
    ruolo_attuale?: string | null;
    data_test?: string | null;
    funzione?: string | null;
  };
  traits: Record<TraitCode, number>;
  macroAreas: {
    essere: number;
    fare: number;
    avere: number;
  };
  profiloTipo: ProfiloTipoV5;
  reliabilityIndex: ReliabilityIndex;
  syndromes: SyndromeResult[];
  roleMatch?: RoleMatchResultV5;
  className?: string;
}
```

**Logica:**
1. Renderizza `InterviewSheetPDF` in container temporaneo offscreen
2. Genera domande colloquio combinando:
   - Domande da sindromi attive (`SYNDROMES_V5_DATA[code].interviewQuestions`)
   - Domande su tratti bassi (valli)
3. Cattura canvas con `html2canvas`
4. Genera PDF A4 con `jsPDF`
5. Aggiunge watermark logo
6. Download file `Scheda_Colloquio_[Cognome]_[Nome]_[data].pdf`

### 2. Generazione Domande Colloquio

Le domande verranno prese da:

**Fonte 1: Sindromi attive**
```typescript
// Per ogni sindrome attiva, prendi 2-3 domande
syndromes.filter(s => s.isActive).forEach(s => {
  const data = SYNDROMES_V5_DATA[s.code];
  questions.push(...data.interviewQuestions.slice(0, 2));
});
```

**Fonte 2: Tratti più bassi (valli)**
```typescript
// Domande su tratti < 10 (critici)
Object.entries(traits)
  .filter(([_, v]) => v < 10)
  .forEach(([trait]) => {
    questions.push(`Come gestisce situazioni che richiedono ${TRAIT_LABELS[trait]}?`);
  });
```

**Fonte 3: Domande standard obbligatorie (dal manuale)**
- Prima domanda sempre: "Cosa la motiva a candidarsi per questa posizione?"
- Ultima domanda sempre: "C'è qualcosa che vuole aggiungere o chiedermi?"

### 3. Integrazione in CandidatoDettaglio.tsx

Aggiungere il bottone nell'header, vicino agli altri pulsanti PDF:

```tsx
{isV5 && traitsV5 && profiloTipoV5 && reliabilityIndex && (
  <InterviewSheetPDFButton
    candidato={{
      nome: candidato.nome,
      cognome: candidato.cognome,
      sesso: candidato.sesso,
      ruolo_attuale: candidato.ruolo_attuale,
      data_test: candidato.data_test,
      funzione: candidato.funzione
    }}
    traits={traitsV5 as Record<TraitCode, number>}
    macroAreas={{
      essere: esserePct || 0,
      fare: farePct || 0,
      avere: averePct || 0
    }}
    profiloTipo={profiloTipoV5}
    reliabilityIndex={reliabilityIndex}
    syndromes={syndromes}
    roleMatch={roleMatchResult}
  />
)}
```

---

## File da Modificare

| File | Modifica |
|------|----------|
| `src/components/PDFExportButton.tsx` | Aggiungere `InterviewSheetPDFButton` (~100 righe) |
| `src/pages/CandidatoDettaglio.tsx` | Importare e usare nuovo bottone (~10 righe) |

---

## UI/UX del Bottone

- **Icona**: `ClipboardList` o `FileCheck` (distintivo dagli altri PDF)
- **Testo**: "Scheda Colloquio"
- **Variante**: `outline` (secondario rispetto a Report Colloquio)
- **Visibilità**: Solo per candidati V5 con profilo completo

---

## Output PDF Atteso

**Pagina A4 singola contenente:**
1. Header con nome, ruolo, data test, badge attendibilità
2. Box profilo tipo con descrizione 1 riga
3. Box idoneità ruolo con percentuale e motivazione
4. Alert rilevati (max 3 sindromi)
5. Mini-grafico barre macro-aree
6. Colonne forza/miglioramento
7. 10 domande numerate per il colloquio
8. Area note con righe per appunti
9. Footer con versione e data

---

## Stima Complessità

| Task | Righe | Tempo |
|------|-------|-------|
| InterviewSheetPDFButton | ~120 | Principale |
| Integrazione CandidatoDettaglio | ~15 | Rapido |
| Funzione generateInterviewQuestionsV5 | ~40 | Rapido |
| **Totale** | ~175 righe | |

---

## Note Tecniche

1. **Performance**: Il PDF viene generato client-side, quindi nessun carico server
2. **Compatibilità**: Usa le stesse librerie già installate (html2canvas, jsPDF)
3. **Stampa**: Layout ottimizzato per A4 portrait con margini corretti
4. **Watermark**: Logo TalentProfile in basso a destra come altri PDF
