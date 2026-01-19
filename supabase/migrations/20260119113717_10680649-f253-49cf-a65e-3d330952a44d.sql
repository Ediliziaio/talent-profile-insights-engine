-- Fix RLS policies for aziende table
DROP POLICY IF EXISTS "Azienda can view own company" ON aziende;
CREATE POLICY "Azienda can view own company" ON aziende
  FOR SELECT
  USING (
    id IN (
      SELECT azienda_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Fix RLS policies for candidati table
DROP POLICY IF EXISTS "Azienda can view own candidati" ON candidati;
DROP POLICY IF EXISTS "Azienda can insert candidati" ON candidati;
DROP POLICY IF EXISTS "Azienda can update candidati" ON candidati;

CREATE POLICY "Azienda can view own candidati" ON candidati
  FOR SELECT
  USING (
    azienda_id IN (
      SELECT azienda_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Azienda can insert candidati" ON candidati
  FOR INSERT
  WITH CHECK (
    azienda_id IN (
      SELECT azienda_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Azienda can update candidati" ON candidati
  FOR UPDATE
  USING (
    azienda_id IN (
      SELECT azienda_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Add policy for candidato to view own record
CREATE POLICY "Candidato can view own record" ON candidati
  FOR SELECT
  USING (user_id = auth.uid());

-- Add insert policy for risposte by authenticated candidato
DROP POLICY IF EXISTS "Candidato can insert own risposte" ON risposte;
CREATE POLICY "Candidato can insert risposte" ON risposte
  FOR INSERT
  WITH CHECK (
    candidato_id IN (
      SELECT id FROM candidati WHERE user_id = auth.uid()
    )
  );

-- Add update policy for risposte (to allow changing answers)
CREATE POLICY "Candidato can update own risposte" ON risposte
  FOR UPDATE
  USING (
    candidato_id IN (
      SELECT id FROM candidati WHERE user_id = auth.uid()
    )
  );

-- Add policy for profili_candidato insert by authorized users
CREATE POLICY "Insert profili for authorized" ON profili_candidato
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.ruolo IN ('superadmin', 'azienda')
    )
    OR
    candidato_id IN (
      SELECT id FROM candidati WHERE user_id = auth.uid()
    )
  );

-- Add policy for risultati insert
CREATE POLICY "Insert risultati for authorized" ON risultati
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.ruolo IN ('superadmin', 'azienda')
    )
    OR
    candidato_id IN (
      SELECT id FROM candidati WHERE user_id = auth.uid()
    )
  );

-- Add policy for azienda to view profili_candidato
CREATE POLICY "Azienda can view profili" ON profili_candidato
  FOR SELECT
  USING (
    candidato_id IN (
      SELECT c.id FROM candidati c
      JOIN profiles p ON p.azienda_id = c.azienda_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add policy for azienda to view risultati
CREATE POLICY "Azienda can view risultati" ON risultati
  FOR SELECT
  USING (
    candidato_id IN (
      SELECT c.id FROM candidati c
      JOIN profiles p ON p.azienda_id = c.azienda_id
      WHERE p.user_id = auth.uid()
    )
  );