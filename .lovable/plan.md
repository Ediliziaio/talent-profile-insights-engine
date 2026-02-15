

# Aggiunta Immagini alla Home Page

## Panoramica

Sostituire l'elemento decorativo CSS nella Hero con una vera immagine di un team professionale, e aggiungere immagini in altre sezioni chiave per dare piu' impatto visivo. Le immagini verranno prese da Unsplash (gratuite, alta qualita', nessun file da caricare).

---

## Modifiche

### 1. HERO -- Immagine Team (sostituisce il blocco glassmorphism)
- Rimuovere il div decorativo con forme sfocate (linee 519-536)
- Inserire un'immagine Unsplash di un team professionale in ufficio
- Applicare `rounded-2xl overflow-hidden shadow-2xl` + leggero overlay gradiente per integrarla col background blu
- L'immagine resta `hidden lg:block` (nascosta su mobile)

### 2. SEZIONE "IL METODO" -- Immagine laterale
- Aggiungere un'immagine a destra della timeline (persona che lavora al laptop / dashboard)
- Layout: timeline a sinistra (60%), immagine a destra (40%) su desktop
- Su mobile l'immagine va sopra la timeline

### 3. SEZIONE "BUONA NOTIZIA" -- Immagine di sfondo
- Aggiungere un'immagine decorativa (team che collabora) a fianco del contenuto
- Layout split come la Hero: testo a sinistra, immagine a destra

### 4. SEZIONE "TESTIMONIANZE" -- Foto profilo realistiche
- Sostituire le iniziali nei cerchi con immagini Unsplash di volti professionali
- 3 foto diverse per i 3 testimonial

### 5. SEZIONE "CTA FINALE" -- Immagine di sfondo
- Aggiungere un'immagine di sfondo sfocata dietro il gradiente arancione per dare profondita'

---

## Dettaglio Tecnico

### File da modificare
Solo `src/pages/Home.tsx`

### Immagini Unsplash utilizzate (URL diretti, nessun download)
- Hero team: `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80` (team al lavoro)
- Metodo: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80` (dashboard/laptop)
- Buona notizia: `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80` (team collabora)
- Testimonial 1: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80`
- Testimonial 2: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80`
- Testimonial 3: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80`

### Stile immagini
- Hero: `object-cover w-full h-full rounded-2xl` con overlay `bg-gradient-to-r from-[#1e3a5f]/40 to-transparent`
- Metodo/Buona notizia: `rounded-xl shadow-lg object-cover`
- Testimonial: `w-10 h-10 rounded-full object-cover`
- CTA finale: immagine posizionata `absolute inset-0 object-cover opacity-20 blur-sm`

### Nessuna dipendenza aggiuntiva
Solo tag `<img>` con URL Unsplash.

