

# Fix Bottoni + Rendere la Landing Piu' Dinamica e Calda

## Problemi Identificati

### 1. Bottone "Scopri di piu'" nel Hero -- ILLEGGIBILE
Il bottone ha testo bianco con bordo `white/30` su sfondo blu scuro -- il testo e' quasi invisibile. Va reso leggibile con sfondo pieno o bordo visibile.

### 2. Pagina statica e fredda
- Troppo spazio vuoto crema (#f7f4f0) tra le sezioni -- senso di "vuoto"
- Le sezioni su sfondo crema non hanno separazione visiva -- si confondono
- Mancano micro-interazioni e elementi di movimento
- Le card sono piatte e non invitano al click
- Il mockup del report e' statico

---

## Soluzioni

### A. Fix Bottoni (Home.tsx)

**Hero "Scopri di piu'"**: Cambiare da outline trasparente a sfondo bianco con testo blu scuro:
```
bg-white text-[#1e3a5f] hover:bg-white/90
```

**Verificare tutti gli altri bottoni**: Controllare contrasto su ogni CTA della pagina.

### B. Ridurre il "freddo" -- Sfondo e separatori

- Alternare piu' spesso `bg-white` e `bg-[#f7f4f0]` tra sezioni per creare ritmo visivo
- Ridurre il padding verticale eccessivo (`py-20 md:py-28` -> `py-16 md:py-20`) per compattare
- Aggiungere sottili decorazioni di sfondo (gradienti leggeri, forme geometriche soft) nelle sezioni chiave

### C. Micro-interazioni e dinamismo

1. **Card hover avanzati**: Aggiungere `whileHover={{ y: -5, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}` su tutte le landing-card
2. **Bottoni animati**: `whileHover={{ scale: 1.03 }}` e `whileTap={{ scale: 0.97 }}` sui CTA principali
3. **Icone animate**: Le icone nelle feature cards ruotano leggermente o pulsano al hover
4. **Mockup report**: Aggiungere una sottile animazione floating (oscillazione verticale continua) al mockup del report nel hero
5. **Progress bars nel mockup**: Animare le barre del mockup report con fill progressivo al caricamento
6. **Numeri contatori**: Aggiungere un leggero glow/pulse all'arancione dei numeri quando completano il conteggio

### D. Elementi visivi caldi

1. **Gradiente sottile** sul background principale: da `#f7f4f0` a `#faf8f5` per evitare il piatto
2. **Dot pattern o grid** sottilissimo come sfondo di alcune sezioni (opacity 3-5%)
3. **Accent lines**: Linee arancioni decorative sotto i titoli di sezione
4. **Card con left-border arancione** sulle feature cards per dare colore

### E. Logo Marquee migliorato

- Aumentare la velocita' del marquee leggermente (da 25s a 20s)
- Aggiungere piu' loghi (duplicare 3x invece di 2x) per evitare gap visibili

---

## File da modificare

### `src/pages/Home.tsx`
- Fix classi bottone Hero "Scopri di piu'" (riga ~462-467)
- Aggiungere `motion` props `whileHover`/`whileTap` su card e bottoni
- Aggiungere animazione floating al mockup (keyframes CSS o framer-motion `animate`)
- Alternare bg-white/bg-cream sulle sezioni
- Ridurre padding verticale sezioni
- Aggiungere accent lines sotto i titoli
- Triplicare i loghi nel marquee

### `src/index.css`
- Aggiungere animazione `@keyframes float` per il mockup
- Aggiungere classe `.accent-underline` per linee decorative sotto titoli
- Aggiungere pattern di sfondo sottile opzionale

---

## Nessuna nuova dipendenza

