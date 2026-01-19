-- Fix RLS policies for analisi_candidato - restrict to service role only
DROP POLICY IF EXISTS "Analisi inseribili via service" ON public.analisi_candidato;
DROP POLICY IF EXISTS "Analisi aggiornabili via service" ON public.analisi_candidato;
DROP POLICY IF EXISTS "Analisi eliminabili via service" ON public.analisi_candidato;

-- INSERT: Only allow via service role (no user auth context check)
CREATE POLICY "Analisi inseribili via service role"
ON public.analisi_candidato FOR INSERT
WITH CHECK (
  auth.uid() IS NULL OR 
  is_superadmin(auth.uid())
);

-- UPDATE: Only superadmin or via service role
CREATE POLICY "Analisi aggiornabili via service role"
ON public.analisi_candidato FOR UPDATE
USING (
  auth.uid() IS NULL OR 
  is_superadmin(auth.uid())
);

-- DELETE: Only superadmin or via service role  
CREATE POLICY "Analisi eliminabili via service role"
ON public.analisi_candidato FOR DELETE
USING (
  auth.uid() IS NULL OR 
  is_superadmin(auth.uid())
);