

# Redesign Landing Page -- Stile JetHR con Colori TalentProfile

## Panoramica

Trasformazione completa della landing page dallo stile dark aggressivo attuale a un design **light, pulito e professionale** ispirato a JetHR.com, mantenendo i colori del brand TalentProfile (Arancione #f09133 e Blu #1e3a5f).

---

## Elementi chiave da JetHR da adottare

1. **Sfondo chiaro caldo** (crema/warm white, tipo `#f7f4f0`) invece del nero attuale
2. **Hero contenuto in un box arrotondato** con sfondo scuro (blu brand), non full-width
3. **Tipografia elegante e leggibile** -- grandi ma non aggressive, font-weight medio-bold
4. **Molto spazio bianco** tra le sezioni -- sensazione ariosa e premium
5. **Card pulite** con bordi sottili e ombre leggere, non glow effects
6. **Badge/pill labels** per le sezioni (es. "PIATTAFORMA", "METODO") in cornicette arrotondate
7. **Animazioni fluide** -- fade-in on scroll, hover lift sulle card, transizioni morbide
8. **Navbar bianca** con logo a sinistra, link centrali, CTA a destra -- stile JetHR
9. **Toni professionali** -- meno "aggressivo/vendita dura", piu' "autorevole/affidabile"

---

## Palette colori

| Elemento | Colore | Uso |
|---|---|---|
| Sfondo pagina | `#f7f4f0` (crema caldo) | Background globale |
| Hero sfondo | `#1e3a5f` (blu brand) | Box hero arrotondato |
| Accent/CTA | `#f09133` (arancione brand) | Pulsanti, badge, highlight |
| Testo primario | `#1a1a2e` | Titoli e body |
| Testo secondario | `#6b7280` | Descrizioni, paragrafi |
| Card | `#ffffff` | Card con shadow leggera |
| Bordi | `#e5e0db` | Bordi card e separatori |

---

## Modifiche per sezione

### 1. Container principale
- **Da:** `bg-[#0a0a0a] text-white` (nero)
- **A:** `bg-[#f7f4f0] text-[#1a1a2e]` (crema caldo)

### 2. Navbar
- Sfondo bianco con bordo sottile in basso
- Logo normale (rimuovere `brightness-0 invert`)
- Link in grigio scuro, hover arancione
- CTA "Richiedi una Demo" arancione pieno
- Pulsante "Accedi" con bordo grigio

### 3. Hero Section
- **Contenuto in un div arrotondato** (`rounded-2xl` o `rounded-3xl`) con sfondo blu brand `#1e3a5f`
- Testo bianco dentro il box blu
- Margini laterali (non full-width, come JetHR)
- Pre-titolo in arancione
- Banner urgenza con sfondo arancione/10 dentro il box
- Badges sotto in grigio chiaro

### 4. Sezione Problema
- Sfondo crema (uguale al body)
- Card bianche con bordo grigio chiaro e shadow leggera
- Icone rosse su sfondo rosso/5
- Testo scuro

### 5. Urgency Timeline
- Sfondo bianco o leggermente diverso (`#ffffff`)
- Timeline con colori originali ma su sfondo chiaro
- Cerchi numerati colorati senza glow

### 6. Calcolatore
- Card bianca con shadow media, bordo arrotondato
- Numero totale in rosso (senza glow/text-shadow)
- Sfondo sezione crema

### 7. Scenari
- Card bianche con bordo sinistro colorato (rosso)
- Testo scuro, importi in rosso

### 8. Lettera Aperta
- Sfondo bianco, testo scuro
- Linea decorativa arancione sopra (mantenuta)
- Stile corsivo elegante

### 9. Buona Notizia
- Card bianche con bordo verde leggero
- Sfondo sezione leggermente tinto

### 10. Metodo (4 Step)
- Sfondo crema
- Cerchi numerati arancione pieni
- Timeline verticale grigia

### 11. Funzionalita
- Card bianche con hover lift (translateY -4px + shadow aumentata)
- Icone arancione su sfondo arancione/5

### 12. Tabella Comparativa
- Tabella bianca con header arrotondato
- Colonna rossa/verde con sfondo molto leggero

### 13. Testimonianze + Casi Reali
- Card bianche con shadow
- Badge PRIMA/DOPO con sfondo leggero (rosso/verde)
- Stelle arancione

### 14. Numeri/Contatori
- Sfondo blu brand `#1e3a5f` (come hero) in un box arrotondato
- Numeri bianchi/arancione
- Effetto premium come JetHR

### 15. Per Chi E' / Non E'
- Due card bianche con bordo sinistro rosso/verde

### 16. FAQ
- Accordion con sfondo bianco, bordi grigi
- Hover con accento arancione

### 17. Riquadro Costo Inazione
- Card bianca con bordo rosso e sfondo rosso/5
- Rimuovere animazione glow-pulse (troppo aggressiva)

### 18. CTA Finale
- Gradiente arancione mantenuto ma in un box arrotondato
- Stile piu' elegante

### 19. Footer
- Sfondo `#1e3a5f` (blu brand)
- Testo bianco/grigio chiaro

---

## Animazioni (stile JetHR)

- **Scroll fade-in**: mantenere il sistema attuale `useScrollAnimation` ma con `translateY(20px)` piu' morbido
- **Card hover**: `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`
- **Navbar**: transizione sfondo su scroll con backdrop-blur (gia' presente, adattare colori)
- **Counter animati**: mantenere `useCountUp` (gia' presente)
- **Rimuovere**: glow effects, stat-glow, glow-pulse, glow-border-* (troppo aggressivi per un design light)

---

## File da modificare

### `src/index.css`
- Le classi `.landing-glow-card`, `.stat-glow`, `.glow-border-*` verranno sostituite con classi light:
  - `.landing-card`: card bianca con shadow e hover
  - `.section-badge`: pill label stile JetHR

### `src/pages/Home.tsx`
- Riscrittura completa degli stili inline (colori, sfondi, bordi)
- Struttura e contenuto testuale invariati
- Hero wrappato in un div arrotondato con margini

### Nessuna nuova dipendenza

