

# Riscrittura pagina Garanzia — stile Dan Kennedy / Belfort / Jay Abraham

## Problemi attuali
- Testo troppo leggero e poco visibile (colori con opacità `/60`, `/70`)
- Copy generico, istituzionale — zero urgenza, zero emozione
- Manca la struttura persuasiva da sales letter

## Approccio
Riscrittura completa in stile **direct response marketing**: headline potente, inversione del rischio aggressiva, linguaggio in prima persona, urgenza, social proof implicito, pattern interrupt.

## Struttura nuova

**File**: `src/pages/Garanzia.tsx` — riscrittura completa

### 1. HERO — Pattern interrupt + headline killer
- Headline: **"Rischio ZERO. Parola mia."**
- Sottotitolo lungo, stile lettera: "Se TalentProfile non ti fa risparmiare almeno una assunzione sbagliata nei prossimi 30 giorni... ti ridò ogni centesimo. Senza farti una sola domanda."
- Testo bianco su sfondo scuro `bg-[#1e3a5f]` per massima leggibilità

### 2. SEZIONE "PERCHÉ LO FACCIO" — Lettera personale
- Stile Dan Kennedy "reason why"
- Copy diretto: "Potrei semplicemente dirti 'provalo'. Ma voglio fare di più. Voglio toglierti OGNI scusa per non iniziare..."
- Spiegazione della logica: "Se il mio strumento funziona, ci guadagno un cliente a vita. Se non funziona, non merito i tuoi soldi."
- Font serif (Georgia) per effetto lettera, testo grande e leggibile

### 3. SEZIONE "ECCO COSA TI GARANTISCO" — Lista aggressiva con checkmark
- Bullet points grandi, bold, alta leggibilità
- "Accesso COMPLETO a tutti gli strumenti — nessuna versione limitata"
- "Report illimitati su tutti i candidati che vuoi"
- "Se non vedi risultati, UN'EMAIL e ti ridò tutto"
- "Nessun modulo, nessuna telefonata, nessuna rottura"

### 4. SEZIONE "3 PASSI" — Riscritta con urgenza
- Step 1: "Attiva oggi — ci vogliono 2 minuti"
- Step 2: "Usa tutto per 30 giorni — mettimi alla prova"
- Step 3: "Non ti convince? Una mail. Fine."

### 5. FAQ — Riscritta con tono diretto
- Domande più aggressive: "E se volessi fregarti?" → "Puoi farlo. Ma non succede mai, perché il prodotto funziona."
- Testo con colori pieni, no opacità basse

### 6. CTA FINALE — Urgenza + inversione rischio
- "L'unico rischio è NON provarlo"
- Bottone grande con copy diretto: "ATTIVA ORA — RISCHIO ZERO"
- Sotto il bottone: "30 giorni. Rimborso garantito. Zero domande."

## Fix visivi
- Tutti i testi con colori pieni (`text-[#1a1a2e]`, `text-white`) — eliminare le opacità `/60` `/70` che rendono il testo invisibile
- Font size più grandi per il body copy (`text-lg`, `text-xl`)
- Più contrasto ovunque

