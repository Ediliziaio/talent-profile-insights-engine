-- Segnali di validità estesa (attendibilità oltre le domande di controllo)
--
-- tempo_ms: millisecondi fra la risposta precedente e questa, misurati dal
--   client. Serve all'analisi dei tempi di compilazione (validityV5.ts).
-- validity_flags: risultato di calcolaValiditaEstesa al momento del submit
--   (coerenza intra-tratto, straight-lining, tempi), formato ValiditaEstesa.
--
-- Il client è difensivo: se queste colonne non esistono ancora, salva senza.

ALTER TABLE public.risposte
  ADD COLUMN IF NOT EXISTS tempo_ms integer;

ALTER TABLE public.profili_candidato
  ADD COLUMN IF NOT EXISTS validity_flags jsonb;

COMMENT ON COLUMN public.risposte.tempo_ms IS
  'Millisecondi trascorsi dalla risposta precedente (misura client, max 120000). NULL per risposte pre-feature o salvate in fallback.';

COMMENT ON COLUMN public.profili_candidato.validity_flags IS
  'Segnali di validità estesa calcolati al submit (algoritmo validity-v1): coerenza intra-tratto, insensibilità alla polarità, tempi di risposta.';
