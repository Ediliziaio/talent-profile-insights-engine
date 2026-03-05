

# Hero Sub-headline con Bullet Points "Addio a..."

## Cosa cambiare

**File**: `src/pages/Home.tsx`, righe 659-665

Sostituire il paragrafo attuale con una struttura più potente: una frase d'apertura emotiva + bullet points "Addio a..." che colpiscono i dolori specifici dell'imprenditore.

### Nuovo copy

**Frase d'apertura**: _"Basta perdere soldi in assunzioni sbagliate."_

**Bullet points** (con icona ✕ o simile, stile lista):
- Addio a **colloqui a sensazione** che non predicono nulla
- Addio a **persone demotivate** dopo 3 mesi
- Addio a **turnover** che ti costa 2x lo stipendio
- Addio a **candidati sbagliati** nel ruolo sbagliato

**Chiusura**: _"Con TalentProfile sai chi hai davvero di fronte, prima di assumerlo."_

### Implementazione

Sostituire il `<motion.p>` (righe 659-665) con:
1. Una `<motion.p>` breve con la frase d'apertura
2. Una `<motion.ul>` con 4 bullet points stilizzati (icona X rossa + testo bianco/70, font-medium)
3. Una `<motion.p>` di chiusura con "Con TalentProfile..." in bianco più luminoso

Stile bullet: `flex items-center gap-2`, icona `X` in `text-red-400`, testo in `text-white/70`, spacing `space-y-2`.

### Leve psicologiche utilizzate
- **Loss aversion**: "perdere soldi", "ti costa 2x"
- **Pain points specifici**: colloqui inefficaci, demotivazione, turnover
- **Pattern interrupt**: la struttura "Addio a..." è scannerizzabile e d'impatto
- **Soluzione immediata**: la chiusura posiziona TalentProfile come risposta

