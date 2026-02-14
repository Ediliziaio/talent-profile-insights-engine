

# Redesign Completo Reportistica Candidato - V3

## Obiettivo
Trasformare la pagina CandidatoDettaglio da 10 tab tecnici a 4 tab "decisional tool" per HR manager, seguendo il Manuale V3.0 e il mockup JSX fornito.

## Cosa cambia (sintesi)

```text
PRIMA (10 tab)                    DOPO (4 tab)
+-----------+-----------+         +---------------+---------+----------+-----------+
| Match     | Aree      |         | Compatibilita | Profilo | Gestione | Colloquio |
| Dati      | Interp    |   -->   +---------------+---------+----------+-----------+
| Profilo   | Chi e     |
| Gestire   | Coll      |
| AI        | Risposte  |
+-----------+-----------+
```

## Architettura Nuova Pagina (dall'alto in basso)

```text
+----------------------------------------------------------+
| HEADER compatto                                          |
| Nome Cognome   [Report PDF] [Scheda Colloquio] [...]     |
| Azienda - Ruolo - Eta - Data test                        |
+----------------------------------------------------------+
| HERO CARD                                                |
| Verdetto + Frase motivazionale + Profilo Tipo badge      |
| 3 Gauge semicerchio: ESSERE | FARE | AVERE              |
+----------------------------------------------------------+
| ALERT BANNER (condizionale, 1 solo, dismissable)         |
+----------------------------------------------------------+
| TAB BAR: Compatibilita | Profilo | Gestione | Colloquio  |
+----------------------------------------------------------+
| CONTENUTO TAB                                            |
+----------------------------------------------------------+
```

---

## Dettaglio Implementazione

### FASE 1: Nuova Hero Card

**File:** Nuovo componente `src/components/HeroCardV3.tsx`

Sostituisce `ExecutiveSummaryCardV5Updated`. Contenuto:
- Verdetto grande con emoji e colore (IDONEO verde, CON RISERVA ambra, DA VALUTARE blu, NON IDONEO rosso)
- Sottotesto: "per il ruolo di [Ruolo]"
- Frase motivazionale (1-2 righe, corsivo, linguaggio naturale) generata deterministicamente dai tratti
- Badge Profilo Tipo (7 possibilita: Leader, Stratega, Esecutore, Creativo, Supporto, Transizione, Critico)
- 3 gauge SVG semicircolari (ESSERE blu, FARE ambra, AVERE viola)
- Border-left 4px colore verdetto, sfondo tenue
- Layout: 60% sinistra (verdetto), 40% destra (gauge)

**Eliminati dalla Hero:** compatibilita %, successo 12m %, KPI grid, attendibilita badge, lista punti forza/attenzione, alert multipli

### FASE 2: Alert Banner Condizionale

**File:** Nuovo componente `src/components/AlertBannerV3.tsx`

Mostra UN SOLO alert (il piu grave), dismissable con X:
1. Sindrome RED attiva --> sfondo rosso, "Pattern comportamentale critico rilevato"
2. GP < 21 --> sfondo ambra, "[Nome] sta attraversando un periodo di forte pressione relazionale"
3. Attendibilita bassa (ZERO/FORCED) --> sfondo grigio, "Attendibilita del test bassa"
4. RC tra -14 e +14 --> sfondo viola, "Profilo creativo, richiede struttura"

### FASE 3: Riduzione Tab da 10 a 4

**File:** Modifica `src/pages/CandidatoDettaglio.tsx`

| Tab eliminato | Dove va il contenuto |
|---|---|
| Match | --> Tab Compatibilita |
| Aree | --> Assorbito in Compatibilita (radar chart) |
| Dati | ELIMINATO (metriche V4 legacy: IIO, ISP, ICP, Candle Chart) |
| Interp | ELIMINATO (sovrapposto a Profilo) |
| Profilo (vecchio) | --> Accordion dentro Tab Profilo |
| Chi e | --> Tab Profilo (rinominato) |
| Gestire | --> Tab Gestione (mantenuto) |
| Coll | --> Tab Colloquio (mantenuto) |
| AI | --> Integrato in Profilo |
| Risposte | --> Bottone "..." nel header (solo admin) |

### FASE 4: Tab 1 - Compatibilita

**File:** Nuovo componente `src/components/CompatibilitaTabV3.tsx`

Sezioni dall'alto in basso:
1. **Grafico barre orizzontali con soglie** - 15 tratti raggruppati per area, con linea soglia minima del ruolo, icona OK/KO
2. **Conteggio requisiti** - "Soddisfatti X/Y requisiti fondamentali"
3. **Segnalazioni** - Sindromi in linguaggio naturale (titolo frontend, testo 3-5 righe, impatto ruolo, azione). Colori: RED sfondo rosso, ORANGE sfondo ambra, YELLOW badge inline
4. **Ruoli alternativi** - Solo se NON IDONEO, barre con percentuale
5. **Attendibilita** - Accordion chiuso di default con spiegazione

### FASE 5: Tab 2 - Profilo (Chi e [Nome])

**File:** Nuovo componente `src/components/ProfiloTabV3.tsx`

Sezioni dall'alto in basso:
1. **Grafico barre orizzontali** - 15 tratti raggruppati per 4 aree (ESSERE, FARE, AVERE, INDICATORI) con colori e legenda
2. **Narrativa "Chi e [Nome]"** - 4 accordion per area, ogni tratto con testo narrativo personalizzato (nome + genere), basato sulle fasce del manuale
3. **Punti di Forza e Aree di Lavoro** - Top 3 / Bottom 3, con testo narrativo troncato
4. **Profilo Tipo** - Accordion con motto, cosa vuole, paura, come gestirlo, errori, ruoli ideali

### FASE 6: Tab 3 - Gestione

Mantiene `ManagementGuideV5` e `ActionPlanCardV5` con modifiche:
1. **Priorita Assoluta** (condizionale) - Card rossa se GP < 21, con testo colloquio riservato
2. **Consigli operativi** - Stessa logica, nomi tratti tradotti in italiano
3. **Piano d'azione** - Mantiene struttura P1-P5
4. **Quadro psicologico** - 3 blocchi: Radice del Problema, Risorsa Nascosta, Circolo Vizioso
5. **Piano crescita 4 fasi** - Fase 1 (0-3m), Fase 2 (3-6m), Fase 3 (6-12m), Fase 4 (12-24m)
6. **Nota temporale** - "I tratti non cambiano in settimane. Misurare su base semestrale."

### FASE 7: Tab 4 - Colloquio

Mantiene struttura attuale con miglioramenti:
1. **Domande per area** - Raggruppate per area tematica (NON per codice), con checkbox e priorita ALTA/MEDIA
2. **Segnali d'allarme e positivi** - Grid 2 colonne, sempre presenti
3. **Pulsante "Scarica Scheda Colloquio"** - PDF A4 (gia esistente)

### FASE 8: Regola Zero Gergo

Applicata ovunque:
- MAI codici (S01, GP, RC, ISP)
- MAI acronimi
- MAI formule
- SEMPRE nomi italiani completi dal mapping del manuale
- SEMPRE [Nome] al posto di codici
- SEMPRE genere corretto (M/F)

---

## Componenti ELIMINATI

| Componente | Motivo |
|---|---|
| `ExecutiveSummaryCardV5Updated` | Sostituito da HeroCardV3 |
| `MacroAreasChartV5` | Gauge nella Hero, dettagli in Compatibilita |
| `ProfileCircles` | Metriche V4 (IIO, ISP, ICP) |
| `CandleChart` | Scala 200, V4 legacy |
| `StressZoneHero` | Metriche V4 (SV/CF) |
| `InterpretazioneDati` | Sovrapposto a Profilo |
| `SintesiFinaleCard` | Integrato in Hero |
| `FitIndicator` (dall'header) | Integrato in Hero |

## Componenti MANTENUTI (con modifiche naming)

| Componente | Modifiche |
|---|---|
| `ManagementGuideV5` | Traduzione nomi tratti |
| `ActionPlanCardV5` | Traduzione nomi tratti |
| `PersonalityNarrativeV5` | Integrato in Tab Profilo |
| `StrengthsWeaknessesCardV5` | Integrato in Tab Profilo |
| `RoleMatchingCardV5` | Logica riusata in Tab Compatibilita |

## Componenti NUOVI

| Componente | Descrizione |
|---|---|
| `HeroCardV3` | Verdetto + frase + gauge semicerchi |
| `AlertBannerV3` | Alert condizionale singolo dismissable |
| `CompatibilitaTabV3` | Tab 1 completo |
| `ProfiloTabV3` | Tab 2 completo |
| `TraitBarChart` | Grafico barre orizzontali 15 tratti |
| `AreaGaugeSVG` | Gauge semicircolare SVG |

---

## Design System

| Elemento | Valore |
|---|---|
| Brand primario | #1B3A5C |
| IDONEO | #16A34A (verde) |
| CON RISERVA | #D97706 (ambra) |
| DA VALUTARE | #2563EB (blu) |
| NON IDONEO | #DC2626 (rosso) |
| ESSERE | #3B82F6 (blu) |
| FARE | #F59E0B (ambra) |
| AVERE | #8B5CF6 (viola) |
| INDICATORI | #6B7280 (grigio) |
| Card padding | 24px |
| Card border-radius | 12px |
| Spacing tra card | 16px |

## Ordine di implementazione

1. `AreaGaugeSVG` + `HeroCardV3` (nuova hero)
2. `AlertBannerV3` (alert condizionale)
3. `TraitBarChart` (grafico barre riusabile)
4. `CompatibilitaTabV3` (tab 1)
5. `ProfiloTabV3` (tab 2)
6. Adattamento Tab 3 Gestione (aggiunta Quadro Psicologico + Piano 4 Fasi)
7. Adattamento Tab 4 Colloquio
8. Riscrittura `CandidatoDettaglio.tsx` con nuova struttura 4 tab
9. Cleanup componenti eliminati
10. Test e-2-e

