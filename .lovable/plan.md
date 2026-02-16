

# Animazioni Fluide con Framer Motion

## Panoramica

Aggiungere `framer-motion` per animazioni professionali su tutte le sezioni della landing page, incluso un carosello di loghi scorrevole infinito nella Logo Bar.

---

## Nuova dipendenza

- `framer-motion` (libreria di animazioni React)

---

## Modifiche in `src/pages/Home.tsx`

### 1. Logo Bar -- Carosello scorrevole infinito

Sostituire la griglia statica dei loghi con un marquee infinito CSS-based:
- Duplicare la lista dei loghi 2 volte in un contenitore flex
- Animazione CSS `@keyframes marquee` che trasla da 0 a -50% orizzontalmente
- Effetto gradient fade sui bordi sinistro/destro (mask-image)
- Pausa al hover (`hover:pause`)

### 2. Componente Section animato

Sostituire il sistema `useScrollAnimation` (IntersectionObserver manuale) con `motion.div` + `whileInView`:
- Ogni sezione usa `motion.section` con `initial={{ opacity: 0, y: 30 }}` e `whileInView={{ opacity: 1, y: 0 }}`
- `viewport={{ once: true, amount: 0.15 }}`
- Transizione: `duration: 0.6, ease: "easeOut"`

### 3. Stagger sulle card (Problema, Features, Trust, Per Chi E')

Per le griglie di card, usare `staggerChildren`:
- Container: `motion.div` con `staggerChildren: 0.1`
- Ogni card: `motion.div` con `variants` fade-up
- Le card appaiono una dopo l'altra con effetto cascata

### 4. Tabella Comparativa

- Ogni riga appare con stagger: `staggerChildren: 0.08`
- Animazione slide-in da sinistra per la colonna rossa, da destra per la verde

### 5. Hero Section

- Testo: fade-in + slide-up con delay progressivo (titolo, sottotitolo, bottoni)
- Mockup: slide-in da destra con leggero scale
- Social proof: fade-in con delay finale

### 6. Numeri/Contatori

- Ogni numero appare con stagger + scale-in
- Mantenere il sistema `useCountUp` esistente (si attiva quando visibile)

### 7. FAQ

- Ogni item appare con stagger leggero

---

## Modifiche in `src/index.css`

### Aggiungere animazione marquee per Logo Bar

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 25s linear infinite;
}

.logo-marquee-container {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
```

---

## Struttura animazioni per sezione

| Sezione | Tipo animazione | Dettaglio |
|---|---|---|
| Hero | Stagger sequenziale | Titolo, sottotitolo, CTA, mockup appaiono in sequenza |
| Logo Bar | Marquee infinito | Loghi scorrono da destra a sinistra, loop continuo |
| Problema | Stagger cards | 3 card appaiono una dopo l'altra |
| Features | Stagger grid | 6 card con cascade 0.1s |
| Manifesto | Fade parallelo | Immagine da sinistra, testo da destra |
| CTA Intermedio | Fade-up semplice | Apparizione morbida |
| Metodo | Stagger steps | 4 step appaiono in sequenza |
| Calcolatore | Fade-up | Card singola |
| Tabella | Stagger righe | Righe appaiono dall'alto in basso |
| Testimonianze | Stagger cards | 3 card LinkedIn |
| Per Chi E' | Fade parallelo | Card verde da sinistra, rossa da destra |
| Numeri | Stagger + scale | Contatori appaiono con effetto pop |
| Trust | Stagger badges | 5 badge in sequenza |
| FAQ | Stagger items | Accordion items |
| CTA Finale | Fade-up | Blocco singolo |

---

## Nessun altro file da modificare

