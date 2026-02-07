

# Piano di Migrazione: Sistema Assessment Psicometrico V5

## Panoramica del Cambiamento

Questo aggiornamento è una **revisione completa** del sistema di assessment, che passa da:

| Aspetto | Sistema Attuale | Nuovo Sistema V5 |
|---------|-----------------|------------------|
| Domande | 200 | 242 (+42 nuove) |
| Tratti/Scale | 12 (SV,MO,CF,EF,EC,QN,QR,SP,PA,SC,ST,LE) | 15 nuovi (ORG,AUT,GP,ADS,DET,VEN,HRM,LDR,PRO,COM,ESP,RC,FIN,SUC,PRI) + CTRL |
| Range punteggi | 0-200 | -100/+100 |
| Macro-aree | Impatto Organizzativo, Solidità Personale, Capacità Produttiva | ESSERE, FARE, AVERE |
| Sindromi | ~5 pattern (Stress Zone, Motore a Vuoto, etc.) | 24 sindromi (18 primarie + 6 secondarie) |
| Attendibilità | Nessuna | 5 domande di controllo (238-242) |
| Risposte | A/B/C | A/B/C/D (con "D" = preferisco non rispondere) |

---

## FASE 1: Nuove Domande (42 domande aggiuntive)

### 1.1 Aggiornamento Tabella `domande` nel Database

Aggiungere 42 nuove domande (201-242) alla tabella `domande` con i nuovi tratti:

```text
Struttura colonne:
- id: 201-242
- testo: testo della domanda
- scala_primaria: nuovo codice tratto (ORG, AUT, GP, ADS, DET, VEN, HRM, LDR, PRO, COM, ESP, RC, FIN, SUC, PRI, CTRL)
- polarita: '+' | '-' | 'SPECIAL' | 'CTRL_YES'
- blocco_tematico: 7 (Vendita/Finanze/Successo) o 8 (Controllo)
```

### 1.2 Aggiornamento File `questionario.ts`

Aggiungere le 42 nuove domande con:
- Domande 201-237: Blocco Vendita, Finanze, Successo
- Domande 238-242: Blocco Controllo (attendibilità)

### 1.3 Aggiornamento Tipi TypeScript

```typescript
// src/types/database.ts
export type TraitCode = 
  | 'ORG' | 'AUT' | 'GP' | 'ADS' | 'DET' | 'VEN' | 'HRM' 
  | 'LDR' | 'PRO' | 'COM' | 'ESP' | 'RC' | 'FIN' | 'SUC' | 'PRI' | 'CTRL';

export const TRAIT_LABELS: Record<TraitCode, string> = {
  ORG: 'Organizzazione',
  AUT: 'Automotivazione',
  GP: 'Gestione Pressioni',
  ADS: 'Autodisciplina',
  DET: 'Determinazione',
  VEN: 'Attitudine Vendita',
  HRM: 'HR Management',
  LDR: 'Leadership Naturale',
  PRO: 'Proattività',
  COM: 'Comprensione',
  ESP: 'Espansività',
  RC: 'Resistenza al Cambiamento',
  FIN: 'Finanze',
  SUC: 'Successo',
  PRI: 'Principi',
  CTRL: 'Controllo'
};
```

### 1.4 Gestione Domande Speciali

Alcune domande hanno risposte con punteggi non standard:
- **072**: Età primo guadagno (a=Prima 21 +10, b=21-23 +5, c=Dopo 23 0)
- **073**: % risparmio (a=<5% 0, b=5-15% +5, c=>15% +10)
- **211**: Tempo investimenti (a=Sì +10, b=Meno del dovuto +5, c=No 0)
- **212-213**: Riserve finanziarie con fasce
- **228**: Potenziale successo con fasce

Queste richiedono una mappatura speciale nello scoring.

---

## FASE 2: Nuovo Sistema di Scoring (-100/+100)

### 2.1 Creare `src/lib/scoringV5.ts`

```typescript
// Nuova formula di normalizzazione
export function calculateNormalizedScore(rawScore: number, maxScore: number): number {
  // punteggio_normalizzato = ((punteggio_grezzo / punteggio_max) * 200) - 100
  return Math.round(((rawScore / maxScore) * 200) - 100);
}

// Punteggi max per tratto
export const TRAIT_MAX_SCORES: Record<TraitCode, number> = {
  ORG: 120,  // 12 domande
  AUT: 220,  // 22 domande
  GP: 180,   // 18 domande
  ADS: 210,  // 21 domande
  DET: 190,  // 19 domande
  VEN: 190,  // 19 domande
  HRM: 80,   // 8 domande
  LDR: 110,  // 11 domande
  PRO: 160,  // 16 domande
  COM: 160,  // 16 domande
  ESP: 130,  // 13 domande
  RC: 170,   // 17 domande
  FIN: 140,  // 14 domande
  SUC: 160,  // 16 domande
  PRI: 170,  // 17 domande
  CTRL: 50,  // 5 domande (non produce punteggio, solo conteggio)
};
```

### 2.2 Nuove Fasce di Interpretazione

Il nuovo sistema usa fasce diverse per ogni tratto, non più soglie universali:

| Tratto | Eccellente | Buono | Discreto | Mediocre | Critico |
|--------|------------|-------|----------|----------|---------|
| ORG | >65 | 40-65 | 30-40 | 0-30 | <0 |
| AUT | >60 | 35-60 | 20-35 | 0-20 | <0 |
| GP | >65 | 30-65 | 21-30 | 0-21 | <0 |
| ... | ... | ... | ... | ... | ... |

### 2.3 Macro-Aree V5

```typescript
// Calcolo Macro-Aree
ESSERE% = ((ORG + AUT + GP + 300) / 600) * 100
FARE% = ((ADS + DET + VEN + HRM + 400) / 800) * 100
AVERE% = ((LDR + PRO + COM + ESP + 400) / 800) * 100
```

---

## FASE 3: Sistema Attendibilità

### 3.1 Logica Controllo (domande 238-242)

Le 5 domande di controllo hanno risposta attesa "A":
- 0-1 risposte inattese: **YES** (attendibile)
- 2-3 risposte inattese: **CAUTION** (avviso)
- 4-5 risposte inattese: **NO** (blocco, chiede ricompilazione)

### 3.2 Logica Forzatura (FORCED)

Quando l'attendibilità è NO e si forza:
- Se media tratti > 40: ridurre tutti i tratti del 20%
- Se media tratti > 60: ridurre tutti i tratti del 30%
- Ricalcolare sindromi dopo riduzione
- Marcare come "FORCED - Risultati da utilizzare con riserva"

---

## FASE 4: Sistema Sindromi (24 totali)

### 4.1 Creare `src/lib/syndromes.ts`

Implementare tutte le 18 sindromi primarie (S01-S18) e 6 secondarie (SS1-SS6):

```typescript
export type SyndromeSeverity = 'RED' | 'ORANGE' | 'YELLOW';

export interface SyndromeResult {
  code: string;
  name: string;
  severity: SyndromeSeverity;
  description: string;
  isActive: boolean;
}

// Esempio S01
function checkS01_DemotivanteCreonica(traits: TraitScores): SyndromeResult {
  const isActive = traits.HRM < 0 && traits.PRO < 0 && traits.COM < 0 && traits.ESP < 0;
  return {
    code: 'S01',
    name: 'PERSONA DEMOTIVANTE CRONICA',
    severity: 'RED',
    description: 'SEMPRE NON IDONEA. Porta al fallimento chi gestisce.',
    isActive
  };
}
```

### 4.2 Tabella Database `syndromes_detected`

```sql
CREATE TABLE syndromes_detected (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES profili_candidato(id),
  syndrome_code VARCHAR NOT NULL,
  syndrome_name VARCHAR NOT NULL,
  severity VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## FASE 5: Nuovo Matching Ruoli (9 Mansioni)

### 5.1 Aggiornare `roleMatching.ts`

Ogni ruolo ha:
- **DISQUALIFIER**: sindromi che rendono automaticamente NON IDONEO
- **TRATTI NECESSARI**: soglie minime per i tratti richiesti
- **TOLLERANZE**: numero di tratti leggermente fuori range accettabili

### 5.2 Esempio Requisiti Venditore

```text
VENDITORE / COMMERCIALE
DQ: S01, S02, S03 (senza controllo), S04, S05, S08, S12
TRATTI: AUT>=20, VEN>=30, ESP>=15, GP>=21 (o RC>-19)
IDEALE: DET>=30, PRO>=10, COM>=0
REGOLA: GP più alto + DET<30 = NON IDONEO
```

---

## FASE 6: Aggiornamento UI

### 6.1 Nuovo Grafico Tratti

- Grafico a barre orizzontali -100/+100
- Colori: verde (>30), giallo (0-30), arancione (-30/0), rosso (<-30)
- Evidenziare valli (tratti inferiori alla media di 20+ punti)

### 6.2 Badge Sindromi

- ROSSO #DC2626 per sindromi critiche
- ARANCIONE #EA580C per sindromi moderate
- GIALLO #CA8A04 per attenzioni

### 6.3 Report PDF 10 Pagine

Struttura completa:
1. Copertina (nome, ruolo, data, attendibilità)
2. Summary (ESSERE/FARE/AVERE %, profilo tipo, alert, idoneità)
3. Grafico 15 tratti
4. Area ESSERE (ORG, AUT, GP)
5. Area FARE (ADS, DET, VEN, HRM)
6. Area AVERE (LDR, PRO, COM, ESP)
7. Indicatori (RC, FIN, SUC, PRI)
8. Sindromi rilevate
9. Matching ruolo
10. Raccomandazioni

---

## FASE 7: Migrazione Database

### 7.1 Aggiornamento Schema `profili_candidato`

```sql
ALTER TABLE profili_candidato ADD COLUMN IF NOT EXISTS 
  assessment_version VARCHAR DEFAULT 'v4';

-- Nuovi campi V5
ALTER TABLE profili_candidato 
  ADD COLUMN IF NOT EXISTS essere_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS fare_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS avere_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS reliability_index VARCHAR DEFAULT 'YES',
  ADD COLUMN IF NOT EXISTS syndromes_detected JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS traits_v5 JSONB DEFAULT '{}';
```

### 7.2 Compatibilità Retroattiva

- Mantenere i campi vecchi (`scale_punteggi`, `leadership_pct`, etc.) per candidati esistenti
- Usare `assessment_version` per distinguere V4 vs V5
- UI mostra automaticamente il layout corretto in base alla versione

---

## Ordine di Implementazione Suggerito

1. **FASE 1.3**: Aggiornare tipi TypeScript (TraitCode, TRAIT_LABELS)
2. **FASE 7.1**: Creare migrazione database per nuovi campi
3. **FASE 1.1-1.2**: Aggiungere 42 nuove domande
4. **FASE 2**: Implementare nuovo scoring (-100/+100)
5. **FASE 3**: Implementare sistema attendibilità
6. **FASE 4**: Implementare sindromi
7. **FASE 5**: Aggiornare matching ruoli
8. **FASE 6**: Aggiornare UI (grafico, badge, report)
9. **Test End-to-End**: Verificare flusso completo

---

## Note Tecniche

### Impatto sui Candidati Esistenti
- I candidati che hanno già completato il test V4 manterranno i loro risultati
- Solo i nuovi assessment useranno il sistema V5
- Possibilità di ricompilare dopo 2 anni per vedere cambiamenti

### Gestione Risposta "D"
La nuova risposta "D" (Preferisco non rispondere) viene trattata come "B" nel calcolo:
- Polarità positiva: d = +5
- Polarità negativa: d = +5

### Tempo Stimato
Questo è un aggiornamento significativo che richiede multiple iterazioni:
- Fase 1-3: ~2-3 sessioni
- Fase 4-5: ~2 sessioni
- Fase 6-7: ~2 sessioni
- Testing: ~1-2 sessioni

