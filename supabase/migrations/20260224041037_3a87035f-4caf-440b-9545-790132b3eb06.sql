
-- =============================================
-- FASE 1: SECURITY HARDENING + PERFORMANCE INDEXES
-- =============================================

-- 1. Fix profiles UPDATE policy: prevent privilege escalation
-- Drop the permissive update policy that allows changing ruolo/azienda_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create restrictive policy: users can only update nome, cognome, email
-- ruolo and azienda_id are immutable from user side
CREATE POLICY "Users can update own safe fields"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND ruolo = (SELECT p.ruolo FROM public.profiles p WHERE p.user_id = auth.uid())
  AND azienda_id IS NOT DISTINCT FROM (SELECT p.azienda_id FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_candidati_azienda_test ON public.candidati(azienda_id, test_completato);
CREATE INDEX IF NOT EXISTS idx_risposte_candidato_domanda ON public.risposte(candidato_id, domanda_id);
CREATE INDEX IF NOT EXISTS idx_profili_candidato_candidato ON public.profili_candidato(candidato_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_abbonamento_data ON public.pagamenti(abbonamento_id, data_pagamento);
CREATE INDEX IF NOT EXISTS idx_risultati_candidato ON public.risultati(candidato_id);

-- 3. Login attempts table for rate limiting
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

-- Index for efficient cleanup and lookup
CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier_time ON public.login_attempts(identifier, attempted_at DESC);

-- No RLS needed - only accessed by edge functions via service role
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
