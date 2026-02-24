-- Add unique constraint on risultati(candidato_id, scala) for idempotent upsert
ALTER TABLE public.risultati 
ADD CONSTRAINT risultati_candidato_scala_unique UNIQUE (candidato_id, scala);