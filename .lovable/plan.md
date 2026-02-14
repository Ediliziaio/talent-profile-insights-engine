

# Cleanup: Eliminare StressZoneHero.tsx

## Analisi

- `StressZoneHero.tsx` non e importato da nessun altro file. Era usato solo da `InterpretazioneDati.tsx`, gia eliminato.
- `stressZone.ts` resta necessario: e usato da `CandidatoDettaglio.tsx`, `PDFReportLayout.tsx` e `interpretazioneProfile.ts`.

## Azione

| File | Azione |
|---|---|
| `src/components/StressZoneHero.tsx` | Eliminare |
| `src/lib/stressZone.ts` | Mantenere (ancora importato da 3 file) |

Nessun altro file da modificare.

