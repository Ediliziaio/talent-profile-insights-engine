
# Redesign Landing Page -- Stile infrastrutture.ai

## Panoramica

Trasformare il design della landing page TalentProfile ispirandosi allo stile aggressivo e dark di infrastrutture.ai, mantenendo il contenuto e il funnel gia' costruito. I cambiamenti principali sono: sfondo scuro, tipografia molto piu' grande e bold, numeri/statistiche giganti, sezioni full-width con alto contrasto, e un look piu' premium ed esclusivo.

## Elementi chiave da infrastrutture.ai da adottare

1. **Sfondo scuro (quasi nero)** su tutta la pagina, con testo bianco ad alto contrasto
2. **Numeri/statistiche enormi** (text-7xl/8xl) con colore accent forte
3. **Tipografia aggressiva** -- titoli molto piu' grandi, font-black, spacing drammatico
4. **Sezioni a piena larghezza** con gradienti scuri e bordi sottili luminosi
5. **Card con bordi luminosi** su sfondo scuro (glow effect)
6. **Stile "premium/esclusivo"** nella comunicazione visiva
7. **Lettera del fondatore** con stile corsivo su sfondo scuro, piu' personale
8. **Contatori/KPI** presentati come "cruscotto" con numeri enormi

## File da modificare

Solo `src/pages/Home.tsx` e `src/index.css`

---

## Modifiche Dettagliate

### 1. CSS: Aggiungere classi utility per il tema dark della landing

In `src/index.css`, aggiungere classi per:
- `.landing-dark` -- sfondo quasi nero (#0a0a0a / #0d0d0d)
- `.glow-card` -- card con bordo luminoso e leggero glow arancione/rosso
- `.stat-number` -- numeri statistici giganti con leggero text-shadow
- Animazione `@keyframes glow-pulse` per effetti luminosi sottili

### 2. Home.tsx: Contenitore principale

Cambiare il contenitore da `bg-background` a sfondo scuro fisso:
- `min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden`

### 3. Navbar

- Sfondo trasparente che diventa scuro su scroll (bg-[#0a0a0a]/90 backdrop-blur)
- Testo bianco/grigio chiaro
- Pulsante CTA accent rimane arancione

### 4. Hero Section

- Sfondo: gradiente scuro piu' drammatico, quasi nero con accento blu sottile
- Titolo: dimensione aumentata a text-5xl/6xl/8xl, font-black
- Pre-titolo: uppercase con tracking molto ampio, colore arancione
- Banner urgenza: bordo rosso luminoso con glow effect
- Rimuovere immagine team a destra, centrare tutto il contenuto (come infrastrutture.ai)

### 5. Sezione Problema

- Sfondo scuro (#0d0d0d)
- Card con sfondo #111111, bordo grigio scuro, hover con bordo arancione/rosso
- Icone in rosso su sfondo rosso/10%
- Testi bianchi

### 6. Urgency Timeline

- Gia' su sfondo scuro, rendere piu' drammatico
- Cerchi numerati con glow effect
- Linea verticale con gradiente piu' luminoso

### 7. Calcolatore

- Card su sfondo #111111 con bordo luminoso
- Numero totale in rosso con glow (text-shadow)
- Barre di breakdown con colori piu' saturi
- Sfondo sezione: #0a0a0a

### 8. Scenari "Ti e' mai capitato?"

- Card scure (#111111) con bordo grigio, hover con bordo rosso
- Importi in rosso con font ancora piu' grande

### 9. Lettera Aperta

- Sfondo scuro, testo in bianco/grigio chiaro
- Stile corsivo piu' marcato, come infrastrutture.ai
- Linea decorativa arancione sopra

### 10. Buona Notizia

- Sfondo leggermente diverso (#0f1419) per contrasto
- Card bianche sostituite da card scure con bordo verde/accent
- Rimuovere immagine laterale, layout centrato

### 11. Metodo (4 Step)

- Sfondo scuro
- Cerchi numerati arancioni con glow
- Rimuovere immagine laterale, layout centrato/verticale

### 12. Funzionalita'

- Card scure (#111111) con hover glow
- Icone arancioni/blu su sfondo scuro

### 13. Tabella Comparativa

- Tabella con sfondo scuro, bordi grigio scuro
- Colonna "Metodo tradizionale" con sfondo rosso scuro
- Colonna "TalentProfile" con sfondo verde scuro

### 14. Testimonianze + Casi Reali

- Card scure con bordi luminosi
- Badge PRIMA in rosso scuro, DOPO in verde scuro
- Stelle in arancione

### 15. Numeri/Contatori

- Numeri ENORMI (text-7xl/8xl) in arancione con text-shadow/glow
- Sfondo quasi nero con particelle/gradiente sottile

### 16. Per Chi E' / Non E'

- Due card: una con bordo rosso glow, una con bordo verde glow
- Sfondo scuro

### 17. FAQ

- Accordion con sfondo #111111, bordi grigi scuri
- Hover con bordo arancione

### 18. Riquadro Costo Inazione

- Card con bordo rosso luminoso e glow effect
- Sfondo #111111
- Numeri in rosso giganti

### 19. CTA Finale

- Gradiente arancione mantenuto ma piu' saturo
- Testo piu' grande e aggressivo

### 20. Footer

- Sfondo #050505 (quasi nero totale)
- Testo grigio scuro, link hover arancione

---

## Dettaglio Tecnico

### Nuove classi CSS (index.css)

```css
.landing-glow-card {
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}
.landing-glow-card:hover {
  border-color: rgba(240, 145, 51, 0.4);
  box-shadow: 0 0 20px rgba(240, 145, 51, 0.1);
}
.stat-glow {
  text-shadow: 0 0 40px rgba(240, 145, 51, 0.3);
}
```

### Approccio implementativo

- Applicare classi inline su ogni sezione (sostituire bg-background, bg-secondary, bg-blue-50 etc. con colori scuri fissi)
- Sostituire text-foreground con text-white, text-muted-foreground con text-white/60
- Card: sostituire il componente Card con div stilizzati scuri dove serve, oppure aggiungere className override
- Mantenere la struttura del funnel e i dati inalterati
- Nessuna nuova dipendenza richiesta
