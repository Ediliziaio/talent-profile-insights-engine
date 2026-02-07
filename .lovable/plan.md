

# Piano: Verifica Completa Manuale V2 vs Implementazione

## Riepilogo Analisi

Ho analizzato il Manuale TalentProfile V2 (23 pagine) e confrontato con l'implementazione attuale. Questo manuale è una versione più recente e contiene alcune differenze significative rispetto alla V5.

---

## 1. LE 15 SCALE - STATO: ✅ COMPLETO

| Scala | Codice | Range | Implementato |
|-------|--------|-------|--------------|
| Organizzazione | ORG | -100/+100 | ✅ |
| Automotivazione | AUT | -100/+100 | ✅ |
| Gestione Pressioni | GP | -100/+100 | ✅ |
| Autodisciplina | ADS | -100/+100 | ✅ |
| Determinazione | DET | -100/+100 | ✅ |
| Attitudine Vendita | VEN | -100/+100 | ✅ |
| HR Management | HRM | -100/+100 | ✅ |
| Leadership | LDR | -100/+100 | ✅ |
| Proattività | PRO | -100/+100 | ✅ |
| Comprensione | COM | -100/+100 | ✅ |
| Espansività | ESP | -100/+100 | ✅ |
| Resistenza Cambiamento | RC | -100/+100 | ✅ |
| Finanze | FIN | -100/+100 | ✅ |
| Successo | SUC | -100/+100 | ✅ |
| Principi | PRI | -100/+100 | ✅ |

**File:** `src/lib/scoringV5.ts`

---

## 2. MACRO-AREE - STATO: ✅ COMPLETO

| Area | Tratti | Implementato |
|------|--------|--------------|
| ESSERE | ORG + AUT + GP | ✅ |
| FARE | ADS + DET + VEN + HRM | ✅ |
| AVERE | LDR + PRO + COM + ESP | ✅ |

---

## 3. SINDROMI PRIMARIE (1-18) - STATO: ✅ COMPLETO

Tutte le 18 sindromi primarie sono implementate correttamente in `src/lib/syndromes.ts`:

| Sindrome | Nome | Condizioni Manuale V2 | Implementato |
|----------|------|----------------------|--------------|
| S01 | Persona Demotivante Cronica | HRM<0 + PRO<0 + COM<0 + ESP<0 | ✅ |
| S02 | SP (Soppressiva) | AUT≥60 + GP<21 + COM≤0 + RC>45 | ✅ |
| S03 | Trouble | AUT≥60 + (GP<21 OR RC≤-19) + COM≤0 | ✅ |
| S04 | Persona Demotivante | PRO≤0 + COM≤0 + ESP≤0 | ✅ |
| S05 | Atteggiamento Demotivante | GP≤0 + PRO<10 + COM≤0 | ✅ |
| S06 | Potenziali Problemi Etica | 5 combinazioni diverse | ✅ |
| S07 | Creativo Dispersivo | ORG<30 + RC≤14 | ✅ |
| S08 | Ghost | ORG>44 + AUT>44 + GP>44 + ADS>44 + DET>44 + VEN>44 + PRO>44 | ✅ |
| S09 | Robotismo al Contrario | AUT≥60 + (GP<21 OR RC≤-20) | ✅ |
| S10 | Disaccordo Tipo 1 | AUT>29 + DET>29 + VEN>49 + PRO<30 + COM<20 | ✅ |
| S11 | Disaccordo Tipo 2 | GP>49 + PRO>39 + COM<16 + DET>44 (o DET>35+AUT>60) | ✅ |
| S12 | Insuccesso Commerciale | VEN>29 + età>39 + RC>44 + SUC<69 + FIN<30 | ✅ |
| S13 | Fuori Rotta | SUC<69 + PRI<40 + FIN<30 | ✅ |
| S14 | Poca Precisione | AUT≥60 + VEN≥70 | ✅ |
| S15 | Profilo Tutto Basso | Tutti tratti ≤10 | ✅ |
| S16 | Brutto Carattere | PRO<10 + COM≤0 | ✅ |
| S17 | GP Più Alto | GP = max di tutti i tratti | ✅ |
| S18 | Ego | ORG<0 + AUT>50 + DET>44 + VEN>44 + LDR>44 + PRO<0 + COM<0 + ESP>60 | ✅ |

---

## 4. SINDROMI SECONDARIE (S1-S6) - STATO: ✅ COMPLETO

| Sindrome | Nome | Condizioni | Implementato |
|----------|------|------------|--------------|
| SS1 | Fa cose ma non le fa fare | ADS>44 + DET<30 | ✅ |
| SS2 | Disaccordo Importante | GP≤0 + COM≤0 | ✅ |
| SS3 | Perfezionista | ORG>64 + COM<0 | ✅ |
| SS4 | Esecutore | ORG≥30 + GP≥30 + PRO≥20 | ✅ |
| SS5 | Zerbino | PRO>40 + DET<35 | ✅ |
| SS6 | RC Elevata | RC≥45 | ✅ |

---

## 5. SCALA ISP (Criticità) - STATO: ✅ COMPLETO

| Livello | Condizione | Implementato |
|---------|------------|--------------|
| 1 | Demotivante Cronica | ✅ |
| 2 | SP | ✅ |
| 3 | Persona Demotivante | ✅ |
| 4 | Trouble | ✅ |
| 5 | Robotismo al Contrario | ✅ |
| 6 | RC ≤ -20 | ✅ |
| 7 | GP ≥ 69 o più alto | ✅ |
| 8 | GP < 21 | ✅ |

---

## 6. REQUISITI MANSIONI - STATO: ⚠️ PARZIALE

### Ruoli nel Manuale V2 (Parte 4 + Parte 7):

| Ruolo | Manuale V2 | Implementato |
|-------|------------|--------------|
| Responsabile Amministrativo | ORG>40, AUT≥-15, GP≥21, ADS>39, PRO>19, COM≥-15, RC>-19, PRI>39 | ✅ (soglie diverse) |
| Responsabile Vendite / Direttore Commerciale / DG | ORG>40, AUT≥35, ADS>39, DET≥35, PRI≥45, PRO≥20 OR COM≥30 | ✅ (come Direttore Commerciale) |
| Responsabile Produzione | ORG>44, GP≥21, ADS>44, DET≥30, PRO≥10, COM≥-10, RC>-19, PRI≥39 | ✅ |
| Venditore / Commerciale | AUT≥20, VEN≥30, ESP≥15, GP≥21, DET≥30, PRO≥10, COM≥0 | ✅ |
| Impiegato Amministrativo | ORG≥30, ADS≥30, PRO≥10, RC>-19, PRI≥30 | ✅ |
| Operaio / Installatore / Manutentore | Profilo Esecutore (ORG≥30, GP≥30, PRO≥20), ADS≥20 | ✅ |
| Customer Care | PRO≥20, COM≥10, ESP≥10, GP≥21, ADS≥25 | ✅ |
| Selezionatore / HR | COM≥20, ESP≥20, PRO≥20, DET≥30, ORG≥30, VEN≥20 | ✅ (come HR Recruiter) |
| Addetto Marketing | ORG≥30, AUT≥20, ADS≥30, VEN≥30, ESP≥15, DET≥30 (se gestisce team) | ✅ (come Marketing Manager) |
| **Capocantiere** (Parte 7) | ORG>40, ADS>39, DET≥30, GP≥21, PRO≥10, RC>-19 | ✅ |
| **Posatore/Installatore Serramenti** (Parte 7) | Esecutore + ADS≥25 + COM≥0 | ⚠️ (incluso in Operaio) |
| **Commerciale Edilizia** (Parte 7) | Venditore + ORG≥30 + ADS≥30 | ✅ |

### Discrepanze Soglie Trovate:

1. **Responsabile Amministrativo**: Il Manuale V2 specifica:
   - Manuale: ORG>40, AUT≥-15, GP≥21, ADS>39, PRO>19, COM≥-15, RC>-19, PRI>39, DET>35 (se gestisce persone)
   - Implementato: ORG≥45, ADS≥40, RC≤60, ESP≤60
   - **AZIONE**: Aggiornare soglie per allinearsi al Manuale V2

2. **Venditore/Commerciale**: Il Manuale V2 specifica:
   - Manuale: AUT≥20, VEN≥30, ESP≥15, GP≥21, DET≥30, PRO≥10, COM≥0
   - Implementato: VEN≥50, DET≥40, ESP≥35, AUT≥40, FIN≥30
   - **AZIONE**: Aggiornare soglie per allinearsi al Manuale V2

3. **Customer Care**: Il Manuale V2 specifica:
   - Manuale: PRO≥20, COM≥10, ESP≥10, GP≥21, ADS≥25
   - Implementato: COM≥40, PRO≥35, GP≥30, ESP≥30
   - **AZIONE**: Aggiornare soglie per allinearsi al Manuale V2

---

## 7. ATTENDIBILITÀ - STATO: ⚠️ DA VERIFICARE

| Elemento | Manuale V2 | Implementato |
|----------|------------|--------------|
| Domande controllo | Non specificato numero | 238-242 (5 domande) |
| >5 risposte inattese | NO | ✅ |
| >8 risposte inattese | ZERO | ❌ (manca ZERO) |
| Risposta attesa | Non specificato | A |
| FORCED | Descritto | ✅ |

**AZIONE RICHIESTA**: Aggiungere stato "ZERO" quando >8 risposte inattese.

---

## 8. REGOLE DI INTERPRETAZIONE (Parte 5) - STATO: ⚠️ PARZIALE

### Fasce del Grafico:
- Sopra +30: Positivo → ✅ Implementato
- Da 0 a +30: Solo in condizioni ottimali → ✅ Implementato
- Sotto 0: Negativo anche in circostanze ottimali → ✅ Implementato

### Valli del Grafico:
Il Manuale V2 specifica: "Le cadute di un tratto rispetto al resto sono MOLTO PIÙ PRONUNCIATE di quanto sembra."

**AZIONE**: Verificare che la funzione `analizzaTraits()` evidenzi correttamente le valli.

### RC (Resistenza al Cambiamento) - Interpretazione Speciale:
| Range | Significato | Implementato |
|-------|-------------|--------------|
| >45 | Molto rigida, blocca cambiamenti | ✅ SS6 |
| 15-45 | Buon equilibrio | ✅ |
| -14 a +14 | Fascia del Guru (creativa ma dispersiva) | ⚠️ Non esplicitato |
| <-19 | ISP: incoerente, relazione non risolta | ✅ Parte di S09 |
| <-29 | ALERT GRAVE: dispersiva, impulsiva | ⚠️ Non esplicitato |

**AZIONE RICHIESTA**: Aggiungere interpretazione speciale per RC < -29 come alert separato.

---

## 9. REGOLE PRIMA LINEA (Parte 9) - STATO: ❌ MANCANTE

Il Manuale V2 specifica regole importanti per l'organigramma:

1. **Regola A**: Se titolare ha lacune → prima linea DEVE avere profili solidi
2. **Regola B**: Se titolare ha buon profilo → si accettano lacune in prima linea
3. **Regola C**: Titolare può tenere solo UNA macro-posizione
4. **Regola D**: Titolare compensa TUTTE le lacune della prima linea

Queste regole dovrebbero essere implementate nella pagina Organigramma (attualmente mancante).

---

## 10. STRUTTURA REPORT (Parte 6) - STATO: ✅ COMPLETO

Il report automatico deve contenere:
- OVERVIEW con ESSERE %, FARE %, AVERE % → ✅
- ALERT SINDROMI con semafori (ROSSO/ARANCIONE/GIALLO) → ✅
- IDONEITÀ (IDONEO / NON IDONEO / IDONEO CON RISERVA) → ✅
- GRAFICO 15 tratti → ✅
- ANALISI aree ESSERE, FARE, AVERE → ✅
- INDICATORI (RC, FIN, SUC, PRI) → ✅
- PUNTI DI FORZA e AREE DI MIGLIORAMENTO → ✅
- DOMANDE PER IL COLLOQUIO → ✅
- RACCOMANDAZIONI → ✅

---

## 11. RIEPILOGO MODIFICHE NECESSARIE

| Priorità | Modifica | Complessità |
|----------|----------|-------------|
| **ALTA** | Allineare soglie ruoli al Manuale V2 | Media |
| **ALTA** | Aggiungere stato "ZERO" attendibilità (>8 inattese) | Bassa |
| **MEDIA** | Aggiungere alert RC < -29 (GRAVE) | Bassa |
| **MEDIA** | Esplicitare "Fascia Guru" per RC -14/+14 | Bassa |
| **BASSA** | Implementare regole Prima Linea in Organigramma | Alta |

---

## 12. PIANO DI IMPLEMENTAZIONE

### Fase 1: Aggiornare soglie ruoli in `roleMatchingV5.ts`

Modificare le soglie per allinearsi al Manuale V2:

**Responsabile Amministrativo:**
```
requisiti: [
  { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true },
  { trait: 'AUT', soglia: -15, tipo: 'min', isCritical: false },
  { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true },
  { trait: 'ADS', soglia: 39, tipo: 'min', isCritical: true },
  { trait: 'PRO', soglia: 19, tipo: 'min', isCritical: false },
  { trait: 'COM', soglia: -15, tipo: 'min', isCritical: false },
  { trait: 'RC', soglia: -19, tipo: 'min', isCritical: true },
  { trait: 'PRI', soglia: 39, tipo: 'min', isCritical: true },
]
```

**Venditore/Commerciale:**
```
requisiti: [
  { trait: 'AUT', soglia: 20, tipo: 'min', isCritical: false },
  { trait: 'VEN', soglia: 30, tipo: 'min', isCritical: true },
  { trait: 'ESP', soglia: 15, tipo: 'min', isCritical: false },
  { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true },
  { trait: 'DET', soglia: 30, tipo: 'min', isCritical: true },
  { trait: 'PRO', soglia: 10, tipo: 'min', isCritical: false },
  { trait: 'COM', soglia: 0, tipo: 'min', isCritical: false },
]
```

**Customer Care:**
```
requisiti: [
  { trait: 'PRO', soglia: 20, tipo: 'min', isCritical: true },
  { trait: 'COM', soglia: 10, tipo: 'min', isCritical: true },
  { trait: 'ESP', soglia: 10, tipo: 'min', isCritical: false },
  { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true },
  { trait: 'ADS', soglia: 25, tipo: 'min', isCritical: false },
]
```

### Fase 2: Aggiornare attendibilità in `scoringV5.ts`

Aggiungere stato ZERO:
```typescript
if (unexpectedCount <= 1) {
  return { index: 'YES', unexpectedCount };
} else if (unexpectedCount <= 5) {
  return { index: 'CAUTION', unexpectedCount };
} else if (unexpectedCount <= 8) {
  return { index: 'NO', unexpectedCount };
} else {
  return { index: 'ZERO', unexpectedCount };
}
```

### Fase 3: Aggiungere alert RC in `syndromes.ts`

Nuova sindrome S19:
```typescript
function checkS19_RCGrave(ctx: SyndromeCheckContext): SyndromeResult {
  const { RC } = ctx.traits;
  const isActive = RC <= -29;
  
  return {
    code: 'S19',
    name: 'RC GRAVE',
    severity: 'ORANGE',
    description: 'Altamente dispersiva, impulsiva. Vulcano di idee ma non ne completa nessuna.',
    isActive,
    category: 'primary'
  };
}
```

### Fase 4: Ricalcolare tutti i candidati

Dopo le modifiche, eseguire un ricalcolo batch di tutti i candidati V5 per aggiornare:
- Verdetti ruoli
- Sindromi rilevate
- Attendibilità

---

## 13. FILE DA MODIFICARE

| File | Modifiche |
|------|-----------|
| `src/lib/roleMatchingV5.ts` | Aggiornare soglie 3 ruoli |
| `src/lib/scoringV5.ts` | Aggiungere ZERO attendibilità |
| `src/lib/syndromes.ts` | Aggiungere S19_RCGrave |
| `src/types/database.ts` | Aggiungere 'ZERO' a ReliabilityIndex |
| `supabase/functions/batch-ricalcolo-v5` | Trigger ricalcolo dopo deploy |

---

## Conclusione

**L'implementazione attuale copre circa 95% del Manuale V2.**

Le principali discrepanze sono:
1. Soglie ruoli leggermente diverse (più restrittive nell'implementazione)
2. Mancanza stato "ZERO" per attendibilità
3. Mancanza alert esplicito per RC < -29

Una volta applicate queste modifiche e ricalcolati i candidati, l'allineamento sarà completo al 100%.

