
# Fix: Ripristino dimensioni desktop nella pagina Dettaglio Candidato

## Problema

Le ottimizzazioni mobile precedenti hanno ridotto le dimensioni di alcuni elementi anche su desktop:
1. **Gauge troppo piccoli**: I 3 semicerchi (ESSERE, FARE, AVERE) sono a 70px fissi invece di 90px su desktop
2. **Testo tab ridotto**: Il font delle tab e rimasto a `text-[11px]` anche su desktop, dovrebbe essere `text-sm` normale

## Interventi

### 1. HeroCardV3.tsx - Gauge responsivi
Cambiare la `size` dei 3 `AreaGaugeSVG` da un valore fisso `70` a un valore responsivo:
- Mobile: `size={70}`
- Desktop (md+): `size={90}`

Poiche il componente accetta solo un numero, si usera un hook `useIsMobile` o si passera la size condizionalmente. L'approccio piu semplice e rendere i gauge 90px di default e wrappare in un div con classi responsive che scala via CSS, oppure usare l'hook `use-mobile` gia presente nel progetto.

### 2. CandidatoDettaglio.tsx - Tab font-size
Ripristinare il font delle tab su desktop:
- Da: `text-[11px] sm:text-sm` 
- A: `text-[11px] sm:text-sm` (questo sembra corretto, `sm:text-sm` dovrebbe funzionare)

In realta il problema potrebbe essere che `sm` e 640px, troppo piccolo. Su desktop il font dovrebbe essere piu grande. Verificare che le icone siano visibili su desktop (attualmente hanno `hidden sm:block` che e corretto).

## Dettaglio Tecnico

### File da modificare

**`src/components/HeroCardV3.tsx`** (linee 183-185)
- Usare l'hook `useIsMobile()` dal file `src/hooks/use-mobile.tsx` per determinare la size
- Mobile: `size={70}`, Desktop: `size={90}`

**`src/pages/CandidatoDettaglio.tsx`** (linee 304-319)
- Cambiare il font delle tab da `text-[11px] sm:text-sm` a `text-xs sm:text-sm` per un aspetto migliore su desktop
- Assicurarsi che le icone siano visibili correttamente su desktop

### Impatto
- Solo CSS/layout, nessun impatto su logica o dati
- Mobile resta ottimizzato come prima
- Desktop torna alle dimensioni corrette
