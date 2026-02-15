
# Home Page di Prodotto -- TalentProfile

## Panoramica

Creazione di una landing page di prodotto per TalentProfile, accessibile su `/home`, con struttura grafica ispirata a ristrutturazionidebiti.it (layout pulito, font grandi, sezioni alternate, animazioni fade-in, numeri animati, CTA ripetute) e copy in stile direct response ispirato a gurujobs.it (problema-soluzione, pain points HR, social proof, FAQ).

La pagina `/home` sara' pubblica (non richiede autenticazione). L'attuale route `/` continua a funzionare come redirect per utenti loggati (dashboard/test). La navbar della landing avra' un bottone "Accedi" che porta a `/auth`.

---

## Struttura della Pagina (10 sezioni)

### 1. NAVBAR
- Logo TalentProfile a sinistra (talentprofile_logo_v3.png)
- Link: Funzionalita, Metodo, Numeri, Testimonianze, FAQ
- Bottone CTA "Richiedi una Demo" (accent/arancione) + "Accedi" (outline)
- Sticky con backdrop-blur su scroll

### 2. HERO (sfondo gradiente blu scuro -> chiaro, come ristrutturazionidebiti)
- Pretitolo piccolo: "Il sistema di assessment HR piu' completo d'Italia"
- H1 grande (48-64px): **BASTA** Assunzioni Sbagliate. / Scopri Chi Hai Davvero Davanti.
- Sottotitolo: "TalentProfile mappa il profilo psicologico profondo dei candidati in 15 minuti. Riduci il turnover, assumi le persone giuste, fai crescere il tuo team."
- 2 CTA: "Richiedi una Demo" (arancione pieno) + "Scopri di Piu'" (outline)
- 3 micro-badge sotto: "100+ Aziende" | "15 min per test" | "Report Istantaneo"

### 3. PROBLEMA (sfondo bianco, icone animate)
- Titolo: "Se il tuo processo di selezione non funziona, e' quasi sempre per questi 4 motivi"
- 4 card con icone e testo:
  1. "Assumi a sensazione" -- al colloquio sembrano perfetti, poi scopri il contrario
  2. "Turnover alle stelle" -- chi assumi non resta, e ricominciare costa
  3. "Nessun dato oggettivo" -- valuti le persone senza uno strumento scientifico
  4. "Team disfunzionali" -- inserisci persone sbagliate nei ruoli sbagliati

### 4. SOLUZIONE -- IL METODO (sfondo grigio chiaro, timeline verticale come ristrutturazionidebiti "4 passi")
- Titolo: "Il Metodo TalentProfile in 4 Step"
- Step numerati (01-04) con icone:
  1. "Invita il candidato" -- invii un link, il candidato compila in autonomia
  2. "Assessment Psicologico" -- 140 domande validate, 15 minuti, zero stress
  3. "Report Istantaneo" -- profilo psicologico completo con scoring V5 e mappa interiore
  4. "Decisione Informata" -- role matching, punti di forza/debolezza, guida al colloquio

### 5. FUNZIONALITA' (sfondo bianco, grid 2x3)
- Titolo: "Tutto quello che ti serve per assumere meglio"
- 6 card feature con icona + titolo + descrizione breve:
  1. Profilo Psicologico 360 gradi -- 14 scale, scoring V5, analisi completa
  2. Mappa Interiore -- psicologia profonda: identita, emozioni, attaccamento, difese
  3. Role Matching -- compatibilita automatica con 30+ ruoli aziendali
  4. Guida al Colloquio -- domande personalizzate generate dall'assessment
  5. Confronto Candidati -- confronta fino a 4 candidati fianco a fianco
  6. Report PDF Esecutivo -- scaricabile, condivisibile, pronto per il management

### 6. NUMERI (sfondo blu scuro, numeri animati bianchi/arancioni come ristrutturazionidebiti)
- Titolo: "I Numeri Che Contano"
- 4 contatori animati:
  - 100+ Aziende
  - 5.000+ Assessment completati
  - 14 Scale Psicologiche
  - 15 min Tempo Medio Test

### 7. TESTIMONIANZE (sfondo bianco, carousel di card)
- Titolo: "Le aziende che scelgono TalentProfile assumono meglio"
- 3-4 card testimonial con avatar placeholder, nome, ruolo, quote, 5 stelle
- Testo plausibile in stile gurujobs (focus su risultati concreti)

### 8. PER CHI E' / NON E' (sfondo grigio chiaro, 2 colonne come ristrutturazionidebiti)
- Colonna rossa "NON e' per te se...":
  - Assumi solo per urgenza senza voler cambiare metodo
  - Pensi che il curriculum basti a capire una persona
  - Non vuoi investire nella selezione
- Colonna verde "E' PER TE se...":
  - Vuoi smettere di assumere a sensazione
  - Cerchi uno strumento scientifico per le tue decisioni HR
  - Vuoi ridurre il turnover e costruire team stabili

### 9. FAQ (sfondo bianco, accordion)
- Titolo: "Domande Frequenti"
- 6-8 domande tipiche HR (Quanto dura il test? E' validato scientificamente? Come invio il test? Quanto costa? I dati sono sicuri? Posso usarlo per il mio team attuale?)

### 10. CTA FINALE + FOOTER
- Sezione CTA: sfondo gradiente arancione, titolo "Il futuro del tuo team inizia da qui", bottone "Richiedi una Demo"
- Footer: logo, link, copyright

---

## File da creare/modificare

### `src/pages/Home.tsx` (NUOVO)
- Pagina completa con tutte le 10 sezioni
- Animazioni fade-in on scroll usando IntersectionObserver (come ristrutturazionidebiti)
- Numeri animati con counter hook
- Accordion shadcn per FAQ
- Responsive mobile-first
- Nessuna dipendenza esterna aggiuntiva -- usa solo Tailwind, lucide-react, shadcn

### `src/App.tsx`
- Aggiungere route `/home` per la landing page
- Import lazy del componente Home

---

## Dettaglio Tecnico

### Animazioni
- Ogni sezione ha `opacity-0 translate-y-8` di default
- IntersectionObserver aggiunge classe `animate-fade-in` quando entra nel viewport
- Hook custom `useScrollAnimation` con `threshold: 0.1`
- Numeri con `useCountUp` che anima da 0 al valore target in 2 secondi

### Palette
- Hero/Numeri: sfondo `#1e3a5f` (brand blue scuro) con testo bianco
- CTA: `#f09133` (brand orange)
- Sezioni alternate: bianco e `hsl(210, 20%, 98%)` (background var)
- Testo: `#1a1a2e` scuro per massima leggibilita'

### Font sizing (come ristrutturazionidebiti)
- H1 Hero: `text-5xl md:text-7xl font-black`
- H2 sezioni: `text-3xl md:text-5xl font-bold`
- Body: `text-lg md:text-xl leading-relaxed`
- Pretitoli: `text-sm uppercase tracking-widest text-accent font-semibold`

### Navbar
- `position: sticky top-0 z-50`
- `backdrop-blur-md bg-white/90`
- Hamburger menu su mobile con sheet/drawer
- Smooth scroll ai section IDs (`#funzionalita`, `#metodo`, ecc.)
