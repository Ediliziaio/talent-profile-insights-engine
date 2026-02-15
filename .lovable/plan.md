

# Correzioni e Completamenti della Mappa Interiore

## Problemi Identificati

### 1. Calcoli: CORRETTI
Ho verificato ogni formula con i tratti reali nel database (ORG=75, AUT=45, GP=35, ADS=52, DET=16, VEN=11, HRM=71, LDR=27, PRO=81, COM=31, ESP=8, RC=53, FIN=14, SUC=69, PRI=35):
- Identita-Risultato = 1/10 (corretto)
- Regolazione Emotiva = 9/10 (corretto)
- Attaccamento Sicuro con score 5 (corretto)
- Difese Equilibrate (corretto)
- Bisogno Primario = Competenza con score 5 (corretto)

Il DOCX con GP=-26, PRO=16, RC=71 si riferisce a un test diverso, NON e' quello presente nel database.

### 2. Narrativa "Equilibrato" troppo generica (PROBLEMA PRINCIPALE)
Il profilo "equilibrato" produce testi generici come "profilo psicologico equilibrato, dimensioni nella norma." Ma il report di riferimento per gli stessi tratti dice: "una persona che ha separato il proprio valore intrinseco dai risultati che ottiene. Quando fallisce, non si frantuma -- impara." La differenza e' enorme.

Il problema: la funzione `generateNarrativa` usa template fissi per profilo, senza considerare i tratti specifici. Un profilo "equilibrato" con ID=1 e RE=9 (punteggi eccezionali) riceve lo stesso testo generico di qualsiasi altro "equilibrato".

### 3. Sezioni mancanti dal manuale
Confrontando con il documento DOCX completo e il Capitolo 6-7 del manuale:

- **Azioni Concrete per il Piano di Crescita** (4 fasi) -- MANCANTE
- **Domande Colloquio di Secondo Livello** -- MANCANTE
- **Override al Piano di Crescita** -- MANCANTE
- **Attendibilita del Test** (con CTRL) -- MANCANTE (puo' essere aggiunta in futuro)

### 4. Pattern Combinatorio mancante
Per Florin con RE=9, difese null (ma simile a sublimazione), sicuro: il Pattern 7 ("Un punto di forza raro nel team") non scatta perche' la difesa e' null. Il report di riferimento dice che il profilo "funziona come una sublimazione naturale" ma il sistema non lo rileva. Serve una condizione piu' flessibile.

---

## Piano di Correzioni

### File 1: `src/lib/mappaInteriore.ts` -- Miglioramenti logica

**A. Narrativa "equilibrato" personalizzata in base ai tratti**

Invece di un template generico, la funzione `generateNarrativa` per il profilo `equilibrato` analizzera' i tratti specifici e generera' testi diversi in base a:
- Se ID <= 2 (identita' stabile rara): narrativa che evidenzia la separazione sana tra valore personale e risultati
- Se RE >= 8 (regolazione eccellente): narrativa che evidenzia la capacita' di restare lucidi sotto pressione
- Se ESP < 10 (rete minima): menzione dell'area relazionale come punto di crescita
- Se DET < 20 (assertivita' bassa): menzione della comunicazione come area di sviluppo
- Combinazione di questi fattori per testi unici e specifici

Esempio per Florin (ID=1, RE=9, ESP=8, DET=16):
- chi_e_nel_profondo: "[Nome] e' una persona che ha separato il proprio valore intrinseco dai risultati. Quando fallisce, non si frantuma -- impara. La sua forza non e' nel carisma da palcoscenico ma nella capacita' sistematica di trasformare problemi in soluzioni. Il suo tallone d'Achille non e' emotivo ma relazionale: tende a fare da solo cio' che potrebbe delegare."
- cosa_lo_guida: "Il motore principale e' sentirsi capace e vedere che il lavoro produce risultati concreti. Non lavora per il riconoscimento ma per costruire cose che funzionano."
- la_chiave: "Non devi fare tutto tu per farlo bene -- devi insegnare ad altri a farlo come lo faresti tu."

**B. Pattern 7 piu' flessibile**

Aggiungere una variante del Pattern 7 che scatta anche quando:
- RE >= 8 AND attaccamento sicuro AND difese null (nessuna difesa disfunzionale)
Questo copre il caso di persone come Florin che sono "naturalmente sublimanti" senza che il sistema lo rilevi come difesa.

**C. Aggiungere domande colloquio aggiuntive**

Nuovo campo nel risultato: `domande_colloquio_aggiuntive` con array di oggetti {area, priorita, domande[]}.
Le domande vengono generate in base alle dimensioni (Cap. 7 del manuale):
- Se RE <= 4: domande su gestione emotiva
- Se ID >= 7: domande su separazione identita-risultato
- Se attaccamento evitante: domande su relazioni
- Se GP < 21: domande sulla situazione attuale (con delicatezza)
- Se difesa razionalizzazione: domande su consapevolezza di se'

**D. Aggiungere override piano crescita**

Nuovo campo: `override_piano_crescita` con array di stringhe.
Generati in base a (Cap. 6 del manuale):
- Se ID >= 7: "Lavorare sulla separazione identita-risultato in Fase 2"
- Se RE <= 3: "Priorita Fase 1: stabilizzazione emotiva, ridurre carico 20-30%"
- Se attaccamento ansioso: "Feedback rassicurante ogni 1-2 settimane"
- Se attaccamento evitante: "Comunicazione breve e fattuale"
- Se difese mature: "Segnalare come punto di forza"

### File 2: `src/components/MappaInterioreTab.tsx` -- Nuove sezioni UI

**A. Sezione "Domande Colloquio di Secondo Livello"**
- Dopo i Pattern Combinatori
- Card con icona Search/MessageCircle
- Raggruppate per area con badge di priorita' (ALTA/MEDIA/CRITICA)
- Ogni domanda come list item

**B. Sezione "Azioni per il Piano di Crescita"**
- Prima del disclaimer
- Card con sfondo leggero
- Override specifici generati dalla logica

**C. Sezione "Punteggi Attaccamento dettagliati"**
- Tooltip o collapsible sotto il badge "Stile relazionale"
- Mostra tutti e 4 gli score (Sicuro X, Ansioso Y, Evitante Z, Disorganizzato W)
- Come nel report di riferimento: "componente ansiosa 2/10, evitante 2/10"

### File 3: `src/pages/CandidatoDettaglio.tsx` -- Nessuna modifica

Il componente e' gia' correttamente integrato. La Tab riceve tutti i dati necessari.

---

## Tipo di ritorno aggiornato

```text
MappaInterioreResult {
  ... campi esistenti ...
  + domande_colloquio_aggiuntive: { area: string; priorita: string; domande: string[] }[]
  + override_piano_crescita: string[]
}
```

---

## Verifica attesa per Florin Ovidiu (tratti nel DB)

Con i tratti reali (ORG=75, AUT=45, GP=35, ADS=52, DET=16, VEN=11, HRM=71, LDR=27, PRO=81, COM=31, ESP=8, RC=53, FIN=14, SUC=69, PRI=35):

- ID = 1/10, RE = 9/10 (invariati, corretti)
- Profilo "equilibrato" ma con narrativa PERSONALIZZATA che parla della separazione sana identita-risultato, della regolazione eccellente, della rete relazionale da costruire
- La Chiave: "Non devi fare tutto tu per farlo bene -- devi insegnare ad altri a farlo come lo faresti tu."
- Pattern 7 variante: "Un punto di forza raro nel team" (scattera' perche' RE >= 8 AND sicuro AND nessuna difesa disfunzionale)
- Domande colloquio: nessuna di priorita' ALTA (profilo sano), solo area "Rete di Supporto" priorita' MEDIA (ESP=8)
- Override piano: "Segnalare come punto di forza" (nessuna difesa disfunzionale con regolazione eccellente)

