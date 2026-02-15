
# Implementazione Tab "Mappa Interiore"

## Panoramica

Nuovo tab nella scheda candidato, posizionato tra "Gestione" e "Colloquio", che calcola 5 dimensioni psicologiche profonde dai tratti V5 e le presenta con un layout narrativo ricco. Tutto il calcolo avviene lato client, nessuna modifica al database.

---

## File da creare

### 1. `src/lib/mappaInteriore.ts` -- Motore di calcolo

Modulo TypeScript puro con tutte le formule dal manuale:

**Dimensione 1: Identita-Risultato (0-10)**
- Base 0, incrementi condizionali: AUT>60 +3, AUT>40 +2, AUT>25 +1; PRO<0 +3, PRO<10 +2, PRO<25 +1; SUC<0 AND AUT>30 +1; FIN<0 AND AUT>40 +1; moderatori COM>30 -1, PRI>50 -1. Clamp 0-10.

**Dimensione 2: Regolazione Emotiva (0-10)**
- Base 5, modificatori: GP>40 +1 / GP<0 -2 / GP<21 -1; PRO>40 +2 / PRO>20 +1 / PRO<0 -2 / PRO<10 -1; RC>55 -1; RC<-20 -1; SUC>50 +1; FIN>30 AND GP>30 +1; ADS>40 +1 / ADS<10 -1. Clamp 0-10.

**Dimensione 3: Stile di Attaccamento**
- Calcolo parallelo di 4 score (sicuro base 5, altri base 0) con trigger specifici dal manuale. Dominante = score piu' alto.

**Dimensione 4: Meccanismo di Difesa**
- 7 meccanismi verificati in ordine di priorita'. Primo match = dominante, secondo = secondario. Include traduzione clinico->HR per frontend.

**Dimensione 5: Bisogno Primario**
- 6 bisogni con calcolo score da trigger. Primario = score piu' alto, secondario = secondo. Include label frontend.

**Profilo Narrativo** (8 profili in ordine di priorita'):
1. compresso: GP<21 AND almeno 3 tratti<0
2. performante_identitario: identita_risultato >= 7
3. protettore_ferito: COM<0 AND ESP<15 AND PRO<10
4. rigido_difensivo: RC>50 AND COM<15
5. ambizioso_frustrato: AUT>40 AND SUC<30 AND FIN<20
6. creativo_frammentato: RC tra -14 e +14 AND ORG<30
7. esecutore_invisibile: sindrome S04 attiva AND AUT<30
8. equilibrato: nessuna condizione soddisfatta

**Visibilita'**: se identita_risultato tra 4-6 AND regolazione_emotiva tra 4-6 AND attaccamento sicuro AND profilo equilibrato -> null (non mostrare)

**Testi narrativi**: template per ogni profilo narrativo con i 4 campi narrativi (chi_e_nel_profondo, cosa_lo_guida, cosa_lo_blocca, potenziale_inespresso), la_chiave, liste motiva/blocca/teme, errori_da_evitare. Personalizzazione con nome e genere (maschile/femminile).

**7 Pattern Combinatori** con condizioni, label frontend e azioni concrete dal manuale.

**Tipo di ritorno**:
```text
MappaInterioreResult {
  dimensioni: {
    identitaRisultato: number (0-10)
    regolazioneEmotiva: number (0-10)
    attaccamento: { dominante, scores: {sicuro, ansioso, evitante, disorganizzato} }
    difesa: { dominante: {codice, frontend, livello} | null, secondaria | null }
    bisogno: { primario: {codice, frontend, score}, secondario | null }
  }
  profiloNarrativo: string
  narrativa: { chi_e_nel_profondo, cosa_lo_guida, cosa_lo_blocca, potenziale_inespresso, la_chiave }
  cosa_motiva: string[]
  cosa_blocca: string[]
  cosa_teme: string[]
  errori_da_evitare: string[]
  pattern_combinatori: PatternResult[]
}
```

### 2. `src/components/MappaInterioreTab.tsx` -- Componente UI

Layout seguendo esattamente la sezione 9.2 del manuale:

- **Titolo**: "La Mappa Interiore di [Nome]" con icona Sparkles
- **2 barre orizzontali 0-10**:
  - Identita-Risultato: colori INVERTITI (verde 0-3, ambra 4-6, arancione 7-10) -- alta = attenzione
  - Regolazione Emotiva: colori NORMALI (rosso 0-3, ambra 4-6, verde 7-10)
  - Barre con etichetta numerica e descrizione qualitativa
- **3 badge pill**: Stile relazionale, Reazione alla pressione, Motore primario (MAI termini clinici, solo traduzioni HR dal Cap. 8)
- **4 card narrative** con `border-l-4` colorato:
  - "Chi e' nel profondo" (bordo blu)
  - "Cosa lo guida" (bordo arancione)
  - "Cosa lo blocca" (bordo azzurro/ciano)
  - "Potenziale inespresso" (bordo viola)
- **Card "La Chiave"** enfatizzata con `bg-violet-50`, font grande, bordo doppio viola
- **3 colonne responsive** (1 colonna su mobile): Motiva (check verde) / Blocca (X rossa) / Teme (alert giallo)
- **Box "3 Errori da Non Fare Mai"** con `bg-red-50`, icona AlertTriangle, lista numerata
- **Pattern combinatori** (se presenti): card con titolo, descrizione e azioni concrete
- **Disclaimer** fisso in fondo: "Questa analisi offre indicazioni per la crescita professionale..."

Props:
```text
traits: Record<TraitCode, number>
candidatoNome: string
candidatoSesso: string | null
eta?: number
syndromes: SyndromeResult[]
```

Se `calculateMappaInteriore()` restituisce null -> card "Profilo Bilanciato" con messaggio positivo.

---

## File da modificare

### 3. `src/pages/CandidatoDettaglio.tsx`

- Importare `MappaInterioreTab`
- Aggiungere tab "Mappa Interiore" con icona `Eye` o `Sparkles` nella `TabsList`, tra "Gestione" e "Colloquio"
- Aggiungere `TabsContent value="mappa"` con il componente
- L'ordine finale sara': Profilo | Gestione | **Mappa Interiore** | Colloquio

---

## Verifica con Florin Ovidiu

Con i suoi tratti (ORG=71, AUT=40, GP=-26, ADS=33, DET=26, VEN=34, HRM=57, LDR=55, PRO=16, COM=41, ESP=0, RC=71, FIN=25, SUC=70, PRI=21):

- **Identita-Risultato**: AUT=40 -> +2, PRO=16 -> +1, COM>30 -> -1, = **2/10** (basso, positivo)
- **Regolazione Emotiva**: base 5, GP<0 -> -2, PRO>10 ma <20 = nessun bonus (PRO=16, non supera 20), RC>55 -> -1, SUC>50 -> +1 = **3/10**
- **Attaccamento**: Sicuro base 5, DET>25 AND COM>15 -> +1 = 6. Ansioso: AUT=40 non >40, GP<30 AND AUT>30 -> +2. Evitante: ESP<10 -> +2. = Sicuro (6) dominante
- **Difese**: Nessun trigger -> Equilibrate
- **Bisogno**: Sicurezza RC>45 +3, GP<30 +2 = 5. Competenza AUT=40 non >40 = 0. = **Sicurezza primario**
- **Profilo narrativo**: nessuna condizione standard -> costruttore sotto pressione (variante custom, o equilibrato con override)
- **Visibilita'**: regolazione emotiva = 3 (fuori fascia 4-6) -> SI, la Mappa appare

Questo e' coerente con il documento di esempio fornito.
