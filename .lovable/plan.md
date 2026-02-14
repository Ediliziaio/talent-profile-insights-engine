

# Piano di Implementazione: Test V3, Cleanup e Nuove Feature Gestione

## 1. Fix navigazione e test end-to-end

La pagina `/candidati/:id` esiste gia con la nuova struttura V3 (Hero Card, Alert Banner, 4 tab). Il 404 nel browser test e dovuto all'autenticazione mancante nella sessione del browser tool, non a un bug del codice. La struttura della pagina e corretta.

**Azioni:**
- Nessuna modifica necessaria alla struttura della pagina
- Verificare visivamente dal preview dell'utente (che ha la sessione autenticata)

## 2. Verifica responsive mobile

La pagina usa gia classi responsive (`flex-col md:flex-row`, `text-xs sm:text-sm`, etc.). I gauge SVG hanno dimensione fissa 90px che funziona su mobile. Il `TraitBarChart` e il `TabsList` usano `flex w-full` per adattarsi.

**Azioni:**
- Nessuna modifica strutturale necessaria, il layout e gia responsive

## 3. Cleanup componenti legacy

I componenti da eliminare hanno ancora dipendenze attive in altri file:

| Componente | Usato in |
|---|---|
| `FitIndicator` | `Candidati.tsx`, `CandidatoDrawer.tsx`, `FitScoreDisplay.tsx` |
| `CandleChart` | `CandidatoDrawer.tsx` |
| `StressZoneHero` | `InterpretazioneDati.tsx` |
| `ProfileCircles` | Nessuno (gia rimosso da CandidatoDettaglio) |
| `SintesiFinaleCard` | Nessuno (gia rimosso) |
| `ExecutiveSummaryCardV5Updated` | Nessuno (gia rimosso) |
| `MacroAreasChartV5` | Nessuno (gia rimosso) |

**Azioni:**
- Eliminare direttamente `ProfileCircles.tsx`, `SintesiFinaleCard.tsx`, `ExecutiveSummaryCardV5Updated.tsx`, `MacroAreasChartV5.tsx` (nessun import attivo)
- Per `FitIndicator`: mantenere per ora, e ancora usato nella lista candidati e nel drawer
- Per `CandleChart`: mantenere per ora, usato nel drawer
- Per `StressZoneHero`: mantenere per ora, usato in InterpretazioneDati

## 4. Quadro Psicologico e Piano Crescita 4 Fasi (Tab Gestione)

Creare un nuovo componente `GestioneAvanzataV3.tsx` da inserire nel tab Gestione dopo `ManagementGuideV5` e `ActionPlanCardV5`.

### 4a. Quadro Psicologico

Tre card collassabili:
- **Radice del Problema**: identifica il tratto piu basso e spiega come impatta gli altri tratti (logica: prendi il tratto con valore minimo, genera testo narrativo che collega cause ed effetti)
- **Risorsa Nascosta**: identifica il tratto piu alto e spiega come puo compensare le debolezze (logica: tratto con valore massimo, testo su come usarlo)
- **Circolo Vizioso**: identifica pattern cross-trait negativi usando la logica gia presente in `crossPatternsV5.ts` (filtra pattern critici attivi)

### 4b. Piano di Crescita a 4 Fasi

Layout timeline con 4 blocchi:
- **Fase 1 (0-3 mesi)**: Stabilizzazione - focus sul tratto piu critico, azioni immediate
- **Fase 2 (3-6 mesi)**: Sviluppo base - lavorare sui 2 tratti piu bassi sotto soglia
- **Fase 3 (6-12 mesi)**: Consolidamento - obiettivi intermedi misurabili
- **Fase 4 (12-24 mesi)**: Maturita - ricompilazione test, verifica progressi

Ogni fase avra: titolo, periodo, obiettivo, 2-3 azioni concrete, KPI suggerito.

**Nota temporale finale**: "I tratti della personalita non cambiano in settimane. Ogni misurazione va fatta su base semestrale."

---

## Dettaglio Tecnico

### File da creare
- `src/components/GestioneAvanzataV3.tsx` - Quadro Psicologico + Piano Crescita 4 Fasi

### File da modificare
- `src/pages/CandidatoDettaglio.tsx` - Aggiungere `GestioneAvanzataV3` nel tab Gestione

### File da eliminare
- `src/components/ProfileCircles.tsx`
- `src/components/SintesiFinaleCard.tsx`
- `src/components/ExecutiveSummaryCardV5Updated.tsx`
- `src/components/MacroAreasChartV5.tsx`

### Dipendenze esistenti riutilizzate
- `crossPatternsV5.ts` per il Circolo Vizioso
- `traitNarrativesV5.ts` per i testi personalizzati (nome + genere)
- `TRAIT_LABELS` per tradurre codici in nomi italiani (regola zero gergo)

### Ordine di esecuzione
1. Eliminare i 4 componenti orfani
2. Creare `GestioneAvanzataV3.tsx`
3. Integrare nel tab Gestione di `CandidatoDettaglio.tsx`

