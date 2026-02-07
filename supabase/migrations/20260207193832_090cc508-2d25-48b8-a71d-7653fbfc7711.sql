-- Rimuovi il vecchio constraint e aggiungine uno nuovo con le polarità V5
ALTER TABLE domande DROP CONSTRAINT IF EXISTS domande_polarita_check;
ALTER TABLE domande ADD CONSTRAINT domande_polarita_check CHECK (polarita = ANY (ARRAY['+'::bpchar, '-'::bpchar, 'S'::bpchar, 'C'::bpchar]));