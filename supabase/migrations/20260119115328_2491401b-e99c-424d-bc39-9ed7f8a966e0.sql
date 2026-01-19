-- =====================================================
-- FIX: Infinite Recursion in RLS Policies
-- =====================================================

-- Step 1: Create Security Definer Functions
-- These bypass RLS to check user roles without recursion

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ruolo FROM public.profiles WHERE user_id = user_uuid LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = user_uuid AND ruolo = 'superadmin'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_azienda_id(user_uuid uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT azienda_id FROM public.profiles WHERE user_id = user_uuid LIMIT 1
$$;

-- Step 2: Drop existing problematic policies on profiles
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 3: Create new policies on profiles using functions
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can view all profiles" ON profiles
FOR SELECT USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can update all profiles" ON profiles
FOR UPDATE USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 4: Drop and recreate policies on aziende
DROP POLICY IF EXISTS "Superadmin can manage all aziende" ON aziende;
DROP POLICY IF EXISTS "Azienda users can view own azienda" ON aziende;

CREATE POLICY "Superadmin full access aziende" ON aziende
FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Azienda users can view own azienda" ON aziende
FOR SELECT USING (id = public.get_user_azienda_id(auth.uid()));

-- Step 5: Drop and recreate policies on candidati
DROP POLICY IF EXISTS "Superadmin can manage all candidati" ON candidati;
DROP POLICY IF EXISTS "Azienda can manage own candidati" ON candidati;
DROP POLICY IF EXISTS "Candidato can view own record" ON candidati;

CREATE POLICY "Superadmin full access candidati" ON candidati
FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Azienda can manage own candidati" ON candidati
FOR ALL USING (azienda_id = public.get_user_azienda_id(auth.uid()));

CREATE POLICY "Candidato can view own record" ON candidati
FOR SELECT USING (user_id = auth.uid());

-- Step 6: Drop and recreate policies on risultati
DROP POLICY IF EXISTS "Superadmin can view all risultati" ON risultati;
DROP POLICY IF EXISTS "Azienda can view own candidati risultati" ON risultati;
DROP POLICY IF EXISTS "Candidato can view own risultati" ON risultati;

CREATE POLICY "Superadmin full access risultati" ON risultati
FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Azienda can view own candidati risultati" ON risultati
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidati 
    WHERE candidati.id = risultati.candidato_id 
    AND candidati.azienda_id = public.get_user_azienda_id(auth.uid())
  )
);

CREATE POLICY "Candidato can view own risultati" ON risultati
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidati 
    WHERE candidati.id = risultati.candidato_id 
    AND candidati.user_id = auth.uid()
  )
);

-- Step 7: Drop and recreate policies on profili_candidato
DROP POLICY IF EXISTS "Superadmin can view all profili" ON profili_candidato;
DROP POLICY IF EXISTS "Azienda can view own candidati profili" ON profili_candidato;
DROP POLICY IF EXISTS "Candidato can view own profilo" ON profili_candidato;

CREATE POLICY "Superadmin full access profili_candidato" ON profili_candidato
FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Azienda can view own candidati profili" ON profili_candidato
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidati 
    WHERE candidati.id = profili_candidato.candidato_id 
    AND candidati.azienda_id = public.get_user_azienda_id(auth.uid())
  )
);

CREATE POLICY "Candidato can view own profilo" ON profili_candidato
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM candidati 
    WHERE candidati.id = profili_candidato.candidato_id 
    AND candidati.user_id = auth.uid()
  )
);

-- Step 8: Drop and recreate policies on risposte
DROP POLICY IF EXISTS "Superadmin can view all risposte" ON risposte;
DROP POLICY IF EXISTS "Candidato can manage own risposte" ON risposte;

CREATE POLICY "Superadmin full access risposte" ON risposte
FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Candidato can manage own risposte" ON risposte
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM candidati 
    WHERE candidati.id = risposte.candidato_id 
    AND candidati.user_id = auth.uid()
  )
);

-- Step 9: Drop and recreate policies on domande
DROP POLICY IF EXISTS "Anyone can view domande" ON domande;
DROP POLICY IF EXISTS "Superadmin can manage domande" ON domande;

CREATE POLICY "Anyone can view domande" ON domande
FOR SELECT USING (true);

CREATE POLICY "Superadmin can manage domande" ON domande
FOR ALL USING (public.is_superadmin(auth.uid()));