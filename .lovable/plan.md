

# Fix testo invisibile + passare al "Noi"

## Problemi identificati

1. **Testo invisibile nella CTA finale**: la classe `landing-card` forza `background: #ffffff` che sovrascrive il `bg-[#1e3a5f]`. Il testo bianco diventa invisibile su sfondo bianco.
2. **"Parola mia" → singolare**: va cambiato in "Noi" su tutta la pagina.

## Modifiche — `src/pages/Garanzia.tsx`

### 1. Fix CTA card — rimuovere `landing-card` dalla sezione finale
Riga 239: sostituire `landing-card p-10 md:p-16 bg-[#1e3a5f]` con solo `rounded-2xl p-10 md:p-16 bg-[#1e3a5f]` (senza `landing-card` che forza lo sfondo bianco).

### 2. Cambiare tutto il copy da singolare a plurale ("Noi")

| Attuale | Nuovo |
|---|---|
| "Parola mia." | "Parola nostra." |
| "ti ridò ogni centesimo" | "ti ridiamo ogni centesimo" |
| "Senza farti una sola domanda" | "Senza farti una sola domanda" (ok) |
| "Perché ti faccio questa garanzia?" | "Perché ti facciamo questa garanzia?" |
| "Potrei semplicemente dirti" | "Potremmo semplicemente dirti" |
| "Ma voglio fare di più" | "Ma vogliamo fare di più" |
| "Voglio toglierti OGNI scusa" | "Vogliamo toglierti OGNI scusa" |
| "Perché so una cosa" | "Perché sappiamo una cosa" |
| "Se il mio strumento funziona, ci guadagno un cliente a vita" | "Se il nostro strumento funziona, ci guadagniamo un cliente a vita" |
| "Se non funziona, non merito i tuoi soldi" | "Se non funziona, non meritiamo i tuoi soldi" |
| "il rischio è tutto dalla mia parte" | "il rischio è tutto dalla nostra parte" |
| "UN'EMAIL e ti ridò tutto" (nei GUARANTEES) | "UN'EMAIL e ti ridiamo tutto" |
| "Provalo. Se non funziona, ti ridò tutto." | "Provalo. Se non funziona, ti ridiamo tutto." |
| FAQ "E se volessi fregarti?" risposta: mantiene "non succede quasi mai" | invariato |

### 3. Dati statici da aggiornare
- `GUARANTEES[3]`: "ti ridò" → "ti ridiamo"
- Hero h1, hero subtitle, reason-why section, CTA section

