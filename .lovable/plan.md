

# Unificazione grafici Profilo + Requisiti ruolo

## Cosa cambia

### File: `src/components/ProfiloUnificatoTab.tsx`

1. **Rimuovere la sezione "Soddisfatti X/Y requisiti fondamentali"** (righe 240-251): il banner con il conteggio e la percentuale viene eliminato completamente.

2. **Unificare le due card in una sola**: la card "Requisiti per [ruolo]" (sezione 1) e "Profilo Comportamentale di [Nome]" (sezione 4) diventano un'unica card con titolo "Profilo Comportamentale di [Nome]". Il grafico mostrera' tutti i 15 tratti con le barre colorate E le linee rosse di soglia del ruolo, con le icone check/X per ogni tratto che ha una soglia.

3. **La card unificata usera'**: `TraitBarChart` con `thresholds` (soglie del ruolo) + `showThresholdIndicator` + `showValueLabels`, cosi' si vedono contemporaneamente i valori del candidato, le etichette testuali e le soglie minime rosse.

### File: `src/components/TraitBarChart.tsx`

Nessuna modifica necessaria: il componente supporta gia' sia `thresholds`+`showThresholdIndicator` che `showValueLabels` contemporaneamente. Basta passare entrambe le prop.

### Verifica soglie ruoli

Le soglie minime sono definite in `ROLE_PROFILES_V5` in `roleMatchingV5.ts` e sono gia' allineate al Manuale V2.0 (come indicato nei commenti del codice). Ogni ruolo ha i suoi `requisiti[]` con soglia e tipo (`min`/`max`). I tratti che NON hanno requisito per quel ruolo semplicemente non mostreranno la linea rossa -- comportamento corretto.

## Risultato visivo

Una sola card "Profilo Comportamentale di [Nome]" con:
- Tutte le 15 barre dei tratti raggruppate per area (Essere, Fare, Avere, Indicatori)
- Linee rosse verticali sulle barre dove il ruolo richiede una soglia minima
- Icone verdi (check) / rosse (X) per indicare se la soglia e' soddisfatta
- Etichette testuali (Alto, Buono, Medio, Basso, Critico)
- Legenda in basso

## Cosa NON cambia
- Sezione sindromi (3)
- Narrativa "Chi e' [Nome]" (5)
- Punti di Forza e Aree di Lavoro (6)
- Ruoli alternativi (7)
- Profilo Tipo e Attendibilita' (8, 9)
- Nessuna modifica al database o alle soglie dei ruoli
