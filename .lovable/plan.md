
# Piano: Report PDF con Sindromi V5 Complete

## Obiettivo
Creare un report PDF esteso che includa tutte le sindromi V5 rilevate con descrizioni dettagliate, impatto sul ruolo, e raccomandazioni specifiche per il colloquio e la gestione.

---

## Architettura Proposta

```text
                  PDFExportButton.tsx
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │        PDFReportLayoutV5.tsx            │
    │  (nuovo layout 6+ pagine per V5)        │
    └─────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   syndromes.ts   syndromesV5Data.ts   roleMatchingV5.ts
   (logica)       (descrizioni         (impatto ruoli)
                   estese - NUOVO)
```

---

## Modifiche Previste

### 1. Nuovo file: `src/lib/syndromesV5Data.ts`
Database completo delle 24 sindromi con:
- **Descrizione estesa** (80-150 parole): spiegazione dettagliata del pattern comportamentale
- **Impatto organizzativo**: come la sindrome influenza team e risultati
- **Segnali da osservare**: comportamenti visibili durante il colloquio
- **Domande specifiche**: 3-4 domande da fare al candidato
- **Raccomandazioni gestionali**: come gestire la persona se assunta
- **Controindicazioni ruolo**: ruoli da evitare assolutamente

### 2. Nuovo file: `src/components/PDFSyndromeReportLayout.tsx`
Layout PDF dedicato alle sindromi con struttura:

**PAGINA 1: Riepilogo Sindromi**
- Header con dati candidato
- Tabella riassuntiva sindromi rilevate (codice, nome, severità)
- Semaforo visivo (verde/giallo/arancione/rosso)
- Livello di criticità globale (LIV 1-8)

**PAGINA 2-N: Dettaglio per ogni sindrome RED/ORANGE**
- Box sindrome con codice e nome
- Descrizione estesa del pattern
- Impatto organizzativo
- Segnali comportamentali
- Domande colloquio specifiche
- Raccomandazioni gestionali
- Ruoli controindicati

**PAGINA FINALE: Sintesi e Azioni**
- Checklist decisionale
- Matrice rischio/opportunità
- Piano di onboarding condizionato
- Spazio note

### 3. Modifica: `src/components/PDFExportButton.tsx`
Aggiungere nuovo bottone `PDFSyndromeReportButton`:
- Props: candidato data + traitsV5 + syndromes
- Genera PDF specifico per sindromi
- Etichetta: "Report Sindromi"
- Icona: AlertTriangle

### 4. Modifica: `src/pages/CandidatoDettaglio.tsx`
Aggiungere il nuovo bottone PDF nell'header:
- Visibile solo per profili V5
- Affiancato ai bottoni esistenti

---

## Struttura Dati Sindromi Estese

```typescript
interface SyndromeExtendedData {
  code: string;
  name: string;
  severity: 'RED' | 'ORANGE' | 'YELLOW';
  shortDescription: string;      // Esistente
  extendedDescription: string;   // NUOVO: 80-150 parole
  organizationalImpact: string;  // NUOVO
  warningSignals: string[];      // NUOVO: segnali colloquio
  interviewQuestions: string[];  // NUOVO: domande specifiche
  managementTips: string[];      // NUOVO: come gestire
  contraindicatedRoles: string[]; // NUOVO: ruoli da evitare
  category: 'primary' | 'secondary';
}
```

---

## Contenuto Sindromi (Esempi)

### S01 - Persona Demotivante Cronica (RED)
**Descrizione estesa**: 
Questa persona presenta un pattern sistematico di negatività che pervade ogni aspetto della vita lavorativa. Tende a vedere ostacoli dove non esistono, a minimizzare i successi altrui e a massimizzare i problemi. La sua presenza in un team riduce progressivamente la motivazione di tutti i collaboratori, creando un effetto domino di disimpegno.

**Impatto organizzativo**: 
Può causare un aumento del turnover del 40% nel suo team. I colleghi tendono a evitare interazioni, riducendo la collaborazione. I progetti subiscono ritardi cronici.

**Segnali colloquio**:
- Parla prevalentemente di esperienze negative
- Attribuisce i fallimenti sempre ad altri
- Non cita mai successi personali o di team
- Tono vocale piatto, linguaggio pessimistico

**Domande specifiche**:
- Qual è stato il suo più grande successo professionale e come l'ha ottenuto?
- Come reagisce quando un progetto va meglio del previsto?
- Mi racconti di un momento in cui ha motivato un collega in difficoltà

**Raccomandazioni**: 
NON ASSUMERE in nessun caso. Se già presente in organico, isolare da ruoli di team e valutare percorso di uscita.

**Ruoli controindicati**: 
Tutti i ruoli con gestione persone, customer facing, team work

---

### S02 - Soppressiva (SP) (RED)
**Descrizione estesa**: 
Pattern comportamentale caratterizzato da manipolazione sistematica e tendenza a sabotare il successo altrui. Questa persona può apparire inizialmente collaborativa, ma nel tempo emerge un pattern di comportamenti volti a destabilizzare colleghi percepiti come minaccia. Possibili problematiche etiche significative.

**Impatto organizzativo**: 
Rischio elevato di cause legali, mobbing, ambiente tossico. Può portare al fallimento di interi reparti o aziende di piccole dimensioni.

**Segnali colloquio**:
- Riferimenti frequenti a ingiustizie subite
- Difficoltà a riconoscere meriti altrui
- Risposte evasive su uscite da aziende precedenti
- Tendenza a criticare ex colleghi/capi

**Domande specifiche**:
- Come ha gestito situazioni in cui un collega ha avuto più successo di lei?
- Può raccontarmi di un conflitto lavorativo significativo e come si è risolto?
- Perché ha lasciato le sue ultime 3 posizioni?

**Raccomandazioni**: 
ASSOLUTAMENTE NON ASSUMERE. Se identificata post-assunzione, predisporre uscita immediata con documentazione legale.

**Ruoli controindicati**: 
Tutti

---

## Stile PDF

- **Formato**: A4, orientamento portrait
- **Font**: Arial/Helvetica per leggibilità
- **Colori**: 
  - RED syndromes: sfondo rosso chiaro (#FEE2E2), bordo rosso (#DC2626)
  - ORANGE syndromes: sfondo arancione chiaro (#FFEDD5), bordo arancione (#EA580C)
  - YELLOW syndromes: sfondo giallo chiaro (#FEF9C3), bordo giallo (#CA8A04)
- **Watermark**: Logo TalentProfile in basso a destra
- **Header**: Dati candidato su ogni pagina
- **Footer**: Numero pagina e disclaimer confidenzialità

---

## File da Creare

| File | Tipo | Descrizione |
|------|------|-------------|
| `src/lib/syndromesV5Data.ts` | Nuovo | Database descrizioni estese 24 sindromi |
| `src/components/PDFSyndromeReportLayout.tsx` | Nuovo | Layout PDF sindromi multi-pagina |

## File da Modificare

| File | Modifica |
|------|----------|
| `src/components/PDFExportButton.tsx` | Aggiungere `PDFSyndromeReportButton` |
| `src/pages/CandidatoDettaglio.tsx` | Aggiungere bottone report sindromi nell'header |

---

## Dettagli Tecnici

### Generazione PDF
Utilizzo dello stesso pattern esistente:
1. Render React component in container temporaneo off-screen
2. Cattura con `html2canvas` a scala 2x
3. Conversione in PDF multi-pagina con `jsPDF`
4. Watermark logo su ogni pagina
5. Download automatico con nome file strutturato

### Gestione Pagine Dinamiche
- Pagina 1: sempre presente (riepilogo)
- Pagine 2-N: una pagina per ogni sindrome RED/ORANGE (max 2 sindromi per pagina per YELLOW)
- Pagina finale: sempre presente (sintesi)
- Calcolo dinamico numero pagine basato su sindromi attive

### Performance
- Lazy loading delle descrizioni estese
- Render condizionale solo per sindromi attive
- Timeout adeguato per render completo prima di cattura

---

## Risultato Atteso

Un report PDF professionale di 6-15 pagine (a seconda delle sindromi) che fornisce all'HR:
- Visione immediata del livello di rischio
- Comprensione profonda di ogni pattern problematico
- Strumenti pratici per il colloquio
- Guida decisionale chiara
- Documentazione per eventuali decisioni future

Il report sarà esportabile con un click dal bottone "Report Sindromi" nella pagina dettaglio candidato V5.
