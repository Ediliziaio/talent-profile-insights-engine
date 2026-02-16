

# Aggiungere Sezioni Mancanti alla Landing Page

## Panoramica

La landing attuale ha 12 sezioni. Rispetto al funnel originale e al sito JetHR, mancano alcune sezioni chiave che rafforzano la conversione. Le aggiungiamo mantenendo lo stile JetHR (light, pulito, professionale).

---

## Sezioni da aggiungere (5 nuove)

### A. Sezione Problema (dopo Logo Bar, prima di Funzionalita')

3 card bianche con icone rosse che evidenziano i pain point HR:
- "Turnover nei primi 6 mesi" 
- "Colloqui basati sull'istinto"
- "Costi nascosti delle assunzioni sbagliate"

Badge: "IL PROBLEMA". Stile: card bianche con bordo `#e5e0db`, icone su sfondo rosso/5.

---

### B. Tabella Comparativa (dopo Calcolatore, prima di Testimonianze)

Tabella "Metodo Tradizionale vs TalentProfile" con 6-7 righe di confronto:
- CV + colloquio vs Assessment scientifico
- Soggettivo vs 15 tratti misurati
- Settimane vs 15 minuti
- etc.

Badge: "CONFRONTO". Colonna sinistra sfondo rosso/5 con X rosse, colonna destra sfondo green/5 con check verdi.

---

### C. Sezione "Per Chi E'" (dopo Testimonianze, prima di Numeri)

Due card affiancate stile JetHR:
- **Card verde** "Per chi e' TalentProfile": lista con check verdi (HR Manager, CEO PMI, recruiter, etc.)
- **Card rossa** "Non fa per te se...": lista con X rosse (cerchi soluzioni gratuite, non credi nei dati, etc.)

Badge: "PER CHI E'".

---

### D. Sezione Integrazioni / Sicurezza (dopo Numeri, prima di FAQ)

Riga con 4-5 badge/icone che comunicano trust:
- GDPR Compliant
- Server EU
- Dati crittografati  
- ISO 27001 (o simile)
- Nessuna installazione

Sfondo bianco, icone Shield in cerchi, stile sobrio come JetHR.

---

### E. CTA Intermedio (dopo Manifesto, prima di Metodo)

Un piccolo banner inline con sfondo `#f09133/5`, testo centrato e bottone arancione:
"Vuoi vedere TalentProfile in azione? Richiedi una demo gratuita."

Leggero, non aggressivo, come i CTA intermedi di JetHR.

---

## Ordine finale delle sezioni

1. Navbar
2. Hero (split layout)
3. Logo Bar
4. **Problema** (NUOVA)
5. Funzionalita'
6. Manifesto
7. **CTA Intermedio** (NUOVO)
8. Metodo (4 step)
9. Calcolatore
10. **Tabella Comparativa** (NUOVA)
11. Testimonianze
12. **Per Chi E'** (NUOVA)
13. Numeri/Contatori
14. **Trust / Sicurezza** (NUOVA)
15. FAQ
16. CTA Finale
17. Footer

---

## Dettaglio tecnico

### File: `src/pages/Home.tsx`

- Aggiungere 5 nuove sezioni JSX tra quelle esistenti
- Aggiungere i dati statici (PROBLEMS, COMPARISON_ROWS, TARGET_AUDIENCE) come costanti in cima al file
- Nessun nuovo componente esterno necessario
- Importare icone aggiuntive da lucide-react: `XCircle`, `AlertTriangle`, `Lock`, `Globe`, `Server`

### File: `src/index.css`

- Nessuna modifica necessaria: le classi `.landing-card`, `.section-badge` esistenti coprono tutti i nuovi componenti

### Nessuna nuova dipendenza

