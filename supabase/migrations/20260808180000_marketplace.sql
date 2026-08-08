-- ═══════════════════════════════════════════════════════════════════
-- MARKETPLACE TALENTI
--
-- I candidati si registrano da soli (senza azienda), completano l'analisi
-- e scelgono se rendersi visibili. Le aziende consultano i profili in forma
-- ANONIMA e vedono i dati di contatto solo dopo lo sblocco.
--
-- Architettura della privacy:
--  - la vista marketplace_profili espone SOLO colonne anonime (niente nome,
--    cognome, email, telefono) e gira con i privilegi del proprietario:
--    è l'unico punto in cui un'azienda vede candidati non suoi né sbloccati;
--  - lo sblocco inserisce una riga in marketplace_sblocchi; da quel momento
--    le policy su candidati/profili_candidato aprono la riga completa
--    a quella sola azienda.
-- ═══════════════════════════════════════════════════════════════════

-- 1) I candidati auto-registrati non hanno azienda
ALTER TABLE public.candidati ALTER COLUMN azienda_id DROP NOT NULL;

-- 2) Campi marketplace sul candidato
ALTER TABLE public.candidati
  ADD COLUMN IF NOT EXISTS marketplace_visible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketplace_consenso_at timestamptz,
  ADD COLUMN IF NOT EXISTS provincia text,
  ADD COLUMN IF NOT EXISTS anni_esperienza integer;

COMMENT ON COLUMN public.candidati.marketplace_visible IS
  'Il candidato ha scelto di essere visibile alle aziende nel marketplace (revocabile).';
COMMENT ON COLUMN public.candidati.marketplace_consenso_at IS
  'Momento del consenso esplicito alla visibilità marketplace (GDPR).';

-- 3) Il candidato gestisce la propria riga
--    Insert: solo la propria e solo senza azienda (non può auto-assegnarsi a un'azienda).
CREATE POLICY "Candidato can insert own row" ON public.candidati
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND azienda_id IS NULL
  );

CREATE POLICY "Candidato can view own row" ON public.candidati
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Candidato can update own row" ON public.candidati
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3b) La policy di update del candidato controlla solo user_id: senza questo
--     trigger un candidato potrebbe auto-assegnarsi un'azienda (azienda_id)
--     comparendo nella lista candidati di quell'impresa. Le colonne di
--     appartenenza le cambia solo il superadmin o il service role (edge
--     functions: auth.uid() IS NULL).
CREATE OR REPLACE FUNCTION public.protect_candidati_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.azienda_id IS DISTINCT FROM OLD.azienda_id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id)
     AND auth.uid() IS NOT NULL
     AND NOT public.is_superadmin(auth.uid()) THEN
    RAISE EXCEPTION 'Non è consentito modificare azienda_id o user_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_candidati_ownership ON public.candidati;
CREATE TRIGGER protect_candidati_ownership
  BEFORE UPDATE ON public.candidati
  FOR EACH ROW EXECUTE FUNCTION public.protect_candidati_ownership();

-- 4) Registro degli sblocchi
CREATE TABLE IF NOT EXISTS public.marketplace_sblocchi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  azienda_id uuid NOT NULL REFERENCES public.aziende(id) ON DELETE CASCADE,
  candidato_id uuid NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  sbloccato_da uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (azienda_id, candidato_id)
);

ALTER TABLE public.marketplace_sblocchi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin full access sblocchi" ON public.marketplace_sblocchi
  FOR ALL USING (public.is_superadmin(auth.uid()));

CREATE POLICY "Azienda can view own sblocchi" ON public.marketplace_sblocchi
  FOR SELECT USING (azienda_id = public.get_user_azienda_id(auth.uid()));

-- Sbloccabili solo candidati che hanno scelto il marketplace e completato il test
CREATE POLICY "Azienda can unlock marketplace candidati" ON public.marketplace_sblocchi
  FOR INSERT WITH CHECK (
    azienda_id = public.get_user_azienda_id(auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.candidati c
      WHERE c.id = candidato_id
        AND c.marketplace_visible = true
        AND c.test_completato = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_sblocchi_azienda ON public.marketplace_sblocchi(azienda_id);
CREATE INDEX IF NOT EXISTS idx_sblocchi_candidato ON public.marketplace_sblocchi(candidato_id);
CREATE INDEX IF NOT EXISTS idx_candidati_marketplace
  ON public.candidati(marketplace_visible, test_completato) WHERE marketplace_visible = true;

-- 5) Dopo lo sblocco, l'azienda vede la riga completa del candidato
CREATE POLICY "Azienda can view unlocked candidati" ON public.candidati
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_sblocchi s
      WHERE s.candidato_id = candidati.id
        AND s.azienda_id = public.get_user_azienda_id(auth.uid())
    )
  );

CREATE POLICY "Azienda can view unlocked profili" ON public.profili_candidato
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_sblocchi s
      WHERE s.candidato_id = profili_candidato.candidato_id
        AND s.azienda_id = public.get_user_azienda_id(auth.uid())
    )
  );

CREATE POLICY "Azienda can view unlocked risultati" ON public.risultati
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_sblocchi s
      WHERE s.candidato_id = risultati.candidato_id
        AND s.azienda_id = public.get_user_azienda_id(auth.uid())
    )
  );

-- 6) Vista anonima del marketplace.
--    SECURITY DEFINER intenzionale (default owner): deve attraversare la RLS
--    di candidati/profili_candidato per mostrare le colonne anonime a tutte
--    le aziende autenticate. La superficie esposta è SOLO l'elenco qui sotto.
CREATE OR REPLACE VIEW public.marketplace_profili AS
SELECT
  c.id,
  c.funzione,
  c.ruolo_attuale,
  c.eta,
  c.provincia,
  c.anni_esperienza,
  c.created_at,
  p.profilo_tipo_v5,
  p.essere_pct,
  p.fare_pct,
  p.avere_pct,
  p.traits_v5,
  p.reliability_index,
  EXISTS (
    SELECT 1
    FROM public.marketplace_sblocchi s
    WHERE s.candidato_id = c.id
      AND s.azienda_id = public.get_user_azienda_id(auth.uid())
  ) AS sbloccato
FROM public.candidati c
JOIN public.profili_candidato p ON p.candidato_id = c.id
WHERE c.marketplace_visible = true
  AND c.test_completato = true;

-- Solo utenti autenticati: il marketplace non è pubblico
REVOKE ALL ON public.marketplace_profili FROM anon;
GRANT SELECT ON public.marketplace_profili TO authenticated;

COMMENT ON VIEW public.marketplace_profili IS
  'Elenco anonimo dei candidati che hanno scelto il marketplace. Niente dati di contatto: quelli arrivano solo con lo sblocco (marketplace_sblocchi).';
