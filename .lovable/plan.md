

# Redesign Landing Page -- Replica Esatta Stile JetHR.com

## Panoramica

Riscrittura completa del layout e dello stile della landing page per replicare fedelmente la struttura visiva di JetHR.com, adattando contenuto e colori al brand TalentProfile.

---

## Differenze principali tra stato attuale e JetHR

| Elemento | Attuale TalentProfile | JetHR (target) |
|---|---|---|
| Hero layout | Testo centrato, no immagine | Testo a SINISTRA, screenshot prodotto a DESTRA |
| Hero CTA | 2 bottoni centrati | 2 bottoni allineati a sinistra: outline + filled |
| Social proof hero | Badge icona sotto | Widget Trustpilot-style sotto i CTA |
| Logo bar | Assente | Carosello loghi "Scelto da 1000+ aziende" sotto hero |
| Section badge | Pill con sfondo arancione/10 | Pill con BORDO, sfondo trasparente, testo nero |
| Tipografia | font-black aggressiva (text-7xl) | Piu' elegante, font-bold (text-5xl/6xl max) |
| Sezioni | Molte, funnel lungo | Piu' snello, meno sezioni visibili |
| Card features | Grid 3 colonne con icone | Grid con icone SVG + testo, piu' spaziose |
| Testimonianze | Card Prima/Dopo | Post LinkedIn con foto, nome, azienda, data |
| Manifesto | Lettera aperta stile corsivo | Box con immagine + testo bold "Odiamo la burocrazia" |
| Footer | Blu brand semplice | Piu' strutturato con colonne |

---

## File da modificare

- `src/pages/Home.tsx` -- riscrittura completa del layout
- `src/index.css` -- aggiornamento classi landing

---

## Modifiche dettagliate

### 1. Hero Section -- Split Layout (come JetHR)

Trasformare da layout centrato a layout a due colonne:
- **Sinistra (60%)**: Titolo (text-5xl/6xl, font-bold non font-black), sottotitolo, 2 bottoni affiancati ("Richiedi una demo" outline + "Inizia ora" filled arancione), widget social proof (stelle + "4.8 su 5 - Assessment validato scientificamente")
- **Destra (40%)**: Immagine/mockup dello screenshot della dashboard TalentProfile (placeholder con un div stilizzato che simula l'interfaccia del report, simile allo screenshot prodotto di JetHR)
- Sfondo: box arrotondato `rounded-3xl` con bg `#1e3a5f` e margini laterali
- Rimuovere il banner urgency dal hero (troppo aggressivo per stile JetHR)

### 2. Logo Bar sotto Hero

Aggiungere sezione "Scelto da piu' di 1.000 aziende italiane":
- Testo centrato grigio
- Riga di loghi placeholder (icone Building2 ripetute con nomi fittizi) che simulano il carosello clienti
- Sfondo crema (uguale al body)

### 3. Navbar -- Identica a JetHR

Gia' simile, piccoli aggiustamenti:
- "Accedi" con bordo grigio sottile, stile outline
- "Richiedi una demo" con sfondo scuro `#1e3a5f` (non arancione), testo bianco, bordo arrotondato `rounded-full`
- Font piu' piccolo sui link (text-sm)

### 4. Section Badges

Cambiare da pill con sfondo arancione a pill con bordo:
- `border border-[#1a1a2e] text-[#1a1a2e] bg-transparent px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider`
- Come JetHR: "PIATTAFORMA", "METODO", etc.

### 5. Sezione Problema

Mantenere ma rendere piu' elegante:
- Titoli piu' piccoli (text-4xl max, font-bold non font-black)
- Card con piu' padding e spacing
- Rimuovere eccessi di copy emotivo nelle card

### 6. Sezione Features (Funzionalita')

Ridisegnare come JetHR:
- Grid 3x3 con card linkabili
- Ogni card: icona in cerchio + titolo bold + descrizione breve (2 righe max)
- Hover: leggero lift e cambio colore bordo
- Link "Scopri di piu'" sotto la grid

### 7. Manifesto / Lettera Aperta

Trasformare nello stile JetHR "Odiamo la burocrazia":
- Layout a due colonne: immagine/illustrazione a sinistra, testo a destra
- Titolo bold grande
- Testo conciso e diretto (non corsivo lungo)
- CTA "Inizia ora"

### 8. Testimonianze

Trasformare in stile post LinkedIn come JetHR:
- Card con foto profilo, nome, ruolo, azienda, icona LinkedIn
- Data del post
- Testo della testimonianza (stile post social)
- Layout a carosello orizzontale o griglia

### 9. Numeri/Contatori

Mantenere il box arrotondato blu ma con numeri piu' contenuti:
- text-5xl invece di text-7xl
- Font-bold invece di font-black
- Piu' spazio tra i numeri

### 10. FAQ

Mantenere, stile gia' compatibile con JetHR.

### 11. CTA Finale

Piu' elegante:
- Sfondo `#1e3a5f` (blu brand) invece di gradiente arancione
- Testo bianco, bottone arancione
- Piu' minimalista

### 12. Footer

Piu' strutturato con colonne:
- Colonna 1: Logo + breve descrizione
- Colonna 2: Link rapidi
- Colonna 3: Contatti
- Barra inferiore: Copyright + P.IVA + Privacy/Cookie

### 13. Rimuovere sezioni troppo aggressive

Per allinearsi allo stile JetHR (professionale, non "vendita dura"):
- **Rimuovere**: Urgency Timeline (troppo fear-based)
- **Rimuovere**: Scenari viscerali "Ti e' mai capitato?" (troppo emotivo)
- **Rimuovere**: Riquadro "Costo dell'Inazione" con animazione
- **Semplificare**: Calcolatore -- mantenerlo ma con stile piu' sobrio
- **Rimuovere**: Sezione "Per chi e' / Non e'" (troppo diretto)
- La landing diventa piu' corta e professionale, come JetHR

### 14. CSS Updates

Aggiornare `src/index.css`:
- Aggiornare `.section-badge` da sfondo filled a bordo
- Aggiornare `.landing-card` hover (piu' sottile)
- Aggiungere `.logo-bar` per la sezione loghi clienti
- Rimuovere classi inutilizzate (`.landing-hero-box`, `.landing-counter-box` da aggiornare)

---

## Struttura finale delle sezioni (ordine)

1. Navbar (bianca, stile JetHR)
2. Hero (split: testo sx + mockup dx, box blu arrotondato)
3. Logo Bar clienti
4. Funzionalita' (grid 3x3 con badge "PIATTAFORMA")
5. Manifesto ("Odiamo le assunzioni sbagliate" -- stile JetHR)
6. Metodo (4 step, badge "COME FUNZIONA")
7. Calcolatore (semplificato, stile sobrio)
8. Testimonianze (stile post LinkedIn)
9. Numeri/Contatori (box blu arrotondato)
10. FAQ
11. CTA Finale (blu brand, elegante)
12. Footer strutturato

---

## Nessuna nuova dipendenza richiesta

