

# Redesign Tab Colloquio V3

## Problema attuale

Il tab Colloquio usa ancora la logica V4 legacy (`colloquioQuestions.ts` legge da `scalePunteggi` su scala 0-200 con codici SV, CF, QR, MO, EF, EC, PA, SC). Per un candidato V5, questi dati sono vuoti o irrilevanti, quindi il tab mostra poche o nessuna domanda.

Inoltre mancano:
- La sezione "Segnali d'allarme / Segnali positivi" (sempre visibile)
- Le aree tematiche corrette dal manuale V3
- La regola Zero Gergo nelle motivazioni

## Soluzione

Creare un nuovo componente `ColloquioTabV3.tsx` che:
1. Legge dai tratti V5 (-100/+100) invece che dalle scale V4
2. Genera domande per area tematica con le soglie corrette dal manuale
3. Include la sezione segnali d'allarme/positivi
4. Applica la regola Zero Gergo ovunque

## Logica di attivazione aree (dal Manuale V3)

| Condizione V5 | Area tematica | Priorita |
|---|---|---|
| GP < 21 | Pressioni e benessere | ALTA |
| ORG < 30 | Organizzazione e metodo | ALTA |
| DET < 25 | Comunicazione diretta | MEDIA |
| PRO < 10 | Gestione delle critiche | ALTA |
| RC > 45 oppure RC < -14 | Apertura al cambiamento | ALTA |
| VEN < 15 | Capacita di coinvolgimento | MEDIA |
| COM < 0 | Relazioni con gli altri | MEDIA |
| AUT < 25 | Motivazione e obiettivi | MEDIA |
| SUC < -20 | Risultati e percorso | MEDIA |

## Domande per area (dal Manuale V3)

**Pressioni e benessere:**
- "Come stai davvero in questo periodo? C'e qualcosa che ti pesa?"
- "C'e qualcuno nel tuo ambiente che ti causa preoccupazione?"
- "Come reagisci quando qualcosa non va secondo i piani?"
- "Quali strategie usi per recuperare dopo periodi difficili?"

**Organizzazione e metodo:**
- "Come organizzi una settimana tipo di lavoro?"
- "Quando arrivano 3 urgenze contemporaneamente, come decidi?"
- "Quanti progetti segui in questo momento? Come tieni traccia?"

**Comunicazione diretta:**
- "Raccontami l'ultima volta che hai detto qualcosa di scomodo a un superiore."
- "Come gestisci un collaboratore che non fa il suo lavoro?"
- "Quando non sei d'accordo, come lo comunichi?"

**Gestione delle critiche:**
- "L'ultima volta che qualcuno ti ha criticata: cosa hai provato?"
- "Quando qualcosa va storto, qual e la tua prima reazione?"

**Apertura al cambiamento:**
- "Come reagisci quando i piani cambiano all'improvviso?"
- "Preferisci ambienti stabili o dinamici? Perche?"

**Relazioni con gli altri:**
- "Come costruisci relazioni professionali con persone nuove?"
- "Hai lavorato con qualcuno molto diverso da te? Come e andata?"

**Capacita di coinvolgimento:**
- "Vendimi questo ruolo: perche dovremmo scegliere te?"
- "Come hai convinto qualcuno di un'idea a cui era contrario?"

## Segnali (costanti, sempre visibili)

**Segnali d'allarme:**
- Parla male di colleghi o superiori precedenti
- Non sa dare numeri concreti sui risultati
- Dice "si" a tutto senza approfondire
- Si agita quando chiedi dettagli specifici
- Racconta solo successi, mai fallimenti
- Non fa domande alla fine del colloquio

**Segnali positivi:**
- Racconta fallimenti e cosa ha imparato
- Da numeri concreti senza esitazione
- Ammette aree di miglioramento
- Fa domande sulla cultura aziendale
- Parla bene dei colleghi precedenti
- Ha un piano chiaro per il futuro

## Design (dal mockup JSX)

- Card bianca con bordo sottile, border-radius 14px
- Ogni area: badge priorita (ALTA rosso #DC2626, MEDIA ambra #D97706) + nome area + conteggio domande
- Domande con checkbox interattivi e numerazione
- Sezione segnali: grid 2 colonne, sfondo rosso-50 per allarme, verde-50 per positivi
- Pulsante "Copia tutte" per ogni gruppo di domande (mantenuto dall'attuale)

## Dettaglio tecnico

### File da creare
- `src/components/ColloquioTabV3.tsx` - Nuovo componente completo

### File da modificare
- `src/pages/CandidatoDettaglio.tsx` - Sostituire `InterpretazioneDati` con `ColloquioTabV3` nel tab Colloquio

### Props del componente
```text
candidatoNome: string
candidatoSesso: string
traits: Record<TraitCode, number>   // V5 traits
syndromes: SyndromeResult[]         // per contestualizzare le domande
```

### Componenti riutilizzati
- `Checkbox` da shadcn/ui (gia presente)
- `Card`, `Badge`, `Button` da shadcn/ui
- `Collapsible` da shadcn/ui (per espandere/collassare le aree)

### Ordine di esecuzione
1. Creare `ColloquioTabV3.tsx` con logica V5 e design dal mockup
2. Aggiornare `CandidatoDettaglio.tsx` per usare il nuovo componente
