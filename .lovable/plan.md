

# Ottimizzazione Page-Break Mappa Interiore

## Problema
Due contenitori flex rischiano di essere spezzati tra pagine:
1. **Pagina A, riga 1327**: il `div` flex che contiene narrativa sx + 3 card dx non ha `pageBreakInside: 'avoid'`
2. **Pagina B, riga 1372**: il `div` flex delle 3 colonne (Motiva/Blocca/Teme) non ha `pageBreakInside: 'avoid'` sul container padre (le singole card ce l'hanno, ma il container no)
3. **Pagina B, riga 1400**: il `div` flex narratives "Cosa lo guida + Cosa lo blocca" manca anch'esso di `pageBreakInside: 'avoid'`

## Modifiche

### File: `src/components/PremiumReportPDF.tsx`

**Riga 1327** — Aggiungere `pageBreakInside: 'avoid'` al container flex bottom di Pagina A:
```
// Da:
<div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
// A:
<div style={{ display: 'flex', gap: 20, marginBottom: 16, pageBreakInside: 'avoid' }}>
```

**Riga 1372** — Aggiungere `pageBreakInside: 'avoid'` al container flex 3 colonne di Pagina B:
```
// Da:
<div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
// A:
<div style={{ display: 'flex', gap: 14, marginBottom: 20, pageBreakInside: 'avoid' }}>
```

**Riga 1400** — Aggiungere `pageBreakInside: 'avoid'` al container narratives:
```
// Da:
<div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
// A:
<div style={{ display: 'flex', gap: 16, marginBottom: 20, pageBreakInside: 'avoid' }}>
```

Tre modifiche chirurgiche, zero regressioni.

