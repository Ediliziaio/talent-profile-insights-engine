

# Miglioramento Tabella Comparativa per Mobile

## Problema
La tabella a 3 colonne su mobile (< 768px) richiede scroll orizzontale (`overflow-x-auto`), con testo che si comprime e diventa illeggibile. Le colonne "Metodo Tradizionale" e "TalentProfile" con icone + testo si sovrappongono.

## Soluzione
Su mobile, trasformare la tabella in un layout a **card stack**: per ogni riga/criterio, mostrare una card con il label in alto e le due opzioni (tradizionale vs TalentProfile) impilate verticalmente, con icone e colori chiari. La tabella classica resta visibile solo su `md:` e superiori.

### Implementazione in `src/pages/Home.tsx` (righe 1359-1424)

1. **Desktop (md+)**: mantenere la tabella attuale invariata, wrappata in `hidden md:block`
2. **Mobile (< md)**: aggiungere un blocco `md:hidden` con layout card:
   - Per ogni `COMPARISON_ROWS` item, una card con:
     - **Label** del criterio come titolo della card
     - Due righe: una rossa (❌ Tradizionale: valore) e una verde (✓ TalentProfile: valore)
   - Riga finale "Punteggio totale" con i due score affiancati (2/7 vs 7/7)
   - Stile coerente con `landing-card`, padding adeguato, font minimo 12px

### Risultato
Su mobile ogni confronto occupa tutta la larghezza dello schermo, è leggibile senza scroll orizzontale e mantiene l'impatto visivo rosso/verde.

