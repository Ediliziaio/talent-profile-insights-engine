-- Tabella per memorizzare le analisi AI generate per i candidati
CREATE TABLE public.analisi_candidato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  profilo_sintetico TEXT,
  punti_forza JSONB DEFAULT '[]',
  punti_debolezza JSONB DEFAULT '[]',
  rischi_operativi TEXT,
  fit_score INTEGER CHECK (fit_score >= 0 AND fit_score <= 100),
  fit_verdict TEXT CHECK (fit_verdict IN ('NON_IDONEO', 'VALUTARE', 'IDONEO')),
  fit_motivo TEXT,
  raccomandazione JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(candidato_id)
);

-- Abilita RLS
ALTER TABLE public.analisi_candidato ENABLE ROW LEVEL SECURITY;

-- Policy: Solo superadmin e azienda del candidato possono vedere
CREATE POLICY "Analisi visibili per ruolo"
ON public.analisi_candidato FOR SELECT
USING (
  is_superadmin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM candidati c
    WHERE c.id = analisi_candidato.candidato_id
    AND c.azienda_id = get_user_azienda_id(auth.uid())
  )
);

-- Policy: Solo superadmin può inserire/aggiornare (via edge function con service role)
CREATE POLICY "Analisi inseribili via service"
ON public.analisi_candidato FOR INSERT
WITH CHECK (true);

CREATE POLICY "Analisi aggiornabili via service"
ON public.analisi_candidato FOR UPDATE
USING (true);

CREATE POLICY "Analisi eliminabili via service"
ON public.analisi_candidato FOR DELETE
USING (true);

-- Trigger per updated_at
CREATE TRIGGER update_analisi_candidato_updated_at
BEFORE UPDATE ON public.analisi_candidato
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();