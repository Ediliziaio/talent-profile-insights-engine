

# Miglioramento Copy e Ristrutturazione Hero

## Panoramica

Due interventi principali:
1. **Hero split-layout**: testo a sinistra + immagine sfocata decorativa a destra (come ristrutturazionidebiti.it)
2. **Pulizia copy**: rimuovere riferimenti tecnici (V5, 14 scale, 140 domande), riscrivere in ottica marketing puro

---

## 1. Hero Split-Layout

La Hero attuale e' centrata con testo. Va trasformata in layout 2 colonne:
- **Sinistra (60%)**: pretitolo, H1, sottotitolo, 2 CTA, micro-badge
- **Destra (40%)**: immagine decorativa con blur/overlay (come ristrutturazionidebiti che usa un'immagine sfocata con gradiente sovrapposto)

L'immagine sara' un elemento decorativo CSS: un div con sfondo gradiente, forme geometriche sfocate (cerchi, rettangoli) che evocano dashboard/grafici, senza necessita' di un file immagine esterno. Effetto simile a ristrutturazionidebiti dove l'immagine e' volutamente astratta e sfocata.

Su mobile torna a layout singola colonna (solo testo, immagine nascosta o sotto).

## 2. Correzioni Copy -- Tutti i Punti

### Riferimenti tecnici da rimuovere/riscrivere

| Dove | Attuale | Nuovo |
|------|---------|-------|
| STEPS[1] desc | "140 domande validate scientificamente. 15 minuti..." | "Un questionario rapido, validato scientificamente. 15 minuti di compilazione, zero stress." |
| STEPS[2] desc | "...14 scale, scoring V5, mappa interiore..." | "...profilo psicologico completo con mappa interiore, punti di forza e aree critiche. Tutto in tempo reale." |
| FEATURES[0] desc | "14 scale psicologiche, scoring V5, analisi completa..." | "Analisi completa della personalita' su tutte le dimensioni chiave, in un unico report esecutivo." |
| FEATURES[2] desc | "...con 30+ ruoli aziendali" | "...con i principali ruoli aziendali" |
| STEPS[3] desc | "Role matching automatico con 30+ ruoli..." | "Compatibilita' automatica con i ruoli della tua azienda, guida personalizzata al colloquio e confronto tra candidati." |
| FAQ "validato" | "...14 scale validate e un sistema di scoring proprietario (V5)..." | "...scale psicologiche validate e un sistema di scoring proprietario sviluppato con esperti di psicologia del lavoro." |
| FAQ "differenza" | "...scoring numerico, role matching, analisi dei rischi operativi..." | Togliere "scoring numerico", riscrivere in modo discorsivo |
| Contatori NUMERI | "14 Scale Psicologiche" | Sostituire con "30+ Ruoli Mappati" (piu' comprensibile per un HR) |
| Testimonianze pretitolo | "Social Proof" | "Cosa Dicono i Nostri Clienti" |
| Casi Reali pretitolo | "Case Studies" | "Storie di Successo" |

### Copy migliorato per impatto marketing

| Sezione | Attuale | Nuovo |
|---------|---------|-------|
| Hero H1 | "BASTA Assunzioni Sbagliate. Scopri Chi Hai Davvero Davanti." | "BASTA Assunzioni Sbagliate. Scopri Chi Hai Davvero di Fronte." |
| Hero sottotitolo | "TalentProfile mappa il profilo psicologico profondo dei candidati in 15 minuti..." | "In 15 minuti sai chi hai davvero di fronte. Il profilo psicologico completo del candidato -- prima ancora del colloquio." |
| Lettera chiusura | "senza uno strumento scientifico, stai giocando d'azzardo..." | "senza dati reali sulla persona, stai scommettendo il futuro della tua azienda su una sensazione." |
| Buona notizia chiusura | "...SOLO se usi uno strumento validato, costruito da esperti di psicologia del lavoro." | "...SOLO se hai lo strumento giusto. Uno strumento costruito da chi la psicologia del lavoro la conosce davvero." |

---

## Dettaglio Tecnico

### File da modificare
Solo `src/pages/Home.tsx`

### Hero -- nuova struttura JSX
```
<section sfondo gradiente>
  <div max-w-7xl flex>
    <div w-3/5 (testo, CTA, badge)>
      ...testo allineato a sinistra
    </div>
    <div w-2/5 hidden lg:block (immagine decorativa)>
      ...div con forme sfocate, gradiente, effetto "dashboard blurred"
    </div>
  </div>
  ...cerchi decorativi di sfondo
</section>
```

L'immagine decorativa e' composta da:
- Un contenitore con `rounded-2xl overflow-hidden` e leggera `backdrop-blur`
- 3-4 forme geometriche colorate (cerchi e rettangoli) con `blur-xl` e `opacity-60`
- Un overlay con bordo sottile bianco/20 per dare effetto "card di vetro" (glassmorphism)
- Nessun file immagine necessario -- tutto CSS/Tailwind

### Contatori
Sostituire il terzo contatore da `useCountUp(14)` a `useCountUp(30)` con label "Ruoli Mappati"

### Nessuna dipendenza aggiuntiva
Tutto con Tailwind e CSS esistente.

