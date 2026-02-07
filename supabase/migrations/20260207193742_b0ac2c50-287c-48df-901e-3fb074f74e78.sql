-- =====================================================
-- MIGRAZIONE V5: Sistema Assessment Psicometrico
-- =====================================================

-- 1. Aggiornamento tabella profili_candidato per V5
ALTER TABLE profili_candidato 
  ADD COLUMN IF NOT EXISTS assessment_version VARCHAR(10) DEFAULT 'v4',
  ADD COLUMN IF NOT EXISTS essere_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS fare_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS avere_pct NUMERIC,
  ADD COLUMN IF NOT EXISTS reliability_index VARCHAR(10) DEFAULT 'YES',
  ADD COLUMN IF NOT EXISTS syndromes_detected JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS traits_v5 JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS profilo_tipo_v5 VARCHAR(50);

-- 2. Aggiornamento tabella domande per supportare nuovi tratti e polarità V5
-- La colonna scala_primaria già esiste, aggiungiamo solo un commento sulla nuova struttura
-- Le nuove domande (201-242) useranno i nuovi codici tratto

-- 3. Aggiornamento tabella risposte per supportare risposta "D"
-- Il campo valore è già character, può contenere A/B/C/D

-- 4. Indice per query performance su assessment_version
CREATE INDEX IF NOT EXISTS idx_profili_assessment_version ON profili_candidato(assessment_version);

-- 5. Indice per query su reliability_index
CREATE INDEX IF NOT EXISTS idx_profili_reliability ON profili_candidato(reliability_index);