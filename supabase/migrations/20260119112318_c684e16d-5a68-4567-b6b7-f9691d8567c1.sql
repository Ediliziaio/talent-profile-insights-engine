-- Tabella profili utente con ruoli (superadmin/azienda/candidato)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  nome VARCHAR(100),
  cognome VARCHAR(100),
  ruolo VARCHAR(20) NOT NULL DEFAULT 'candidato' CHECK (ruolo IN ('superadmin', 'azienda', 'candidato')),
  azienda_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella aziende
CREATE TABLE public.aziende (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(200) NOT NULL,
  settore VARCHAR(100),
  email_contatto VARCHAR(255),
  telefono VARCHAR(50),
  indirizzo TEXT,
  logo_url TEXT,
  attiva BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aggiorna foreign key profiles -> aziende
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_azienda 
FOREIGN KEY (azienda_id) REFERENCES public.aziende(id) ON DELETE SET NULL;

-- Tabella candidati
CREATE TABLE public.candidati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  azienda_id UUID NOT NULL REFERENCES public.aziende(id) ON DELETE CASCADE,
  cognome VARCHAR(100) NOT NULL,
  nome VARCHAR(100) NOT NULL,
  eta INTEGER,
  email VARCHAR(255),
  telefono VARCHAR(50),
  ruolo_attuale VARCHAR(100), -- Top, Intermedio, Operativo, Candidato
  funzione VARCHAR(100), -- Direzione, HR, Marketing, Vendite, etc.
  data_test TIMESTAMP WITH TIME ZONE,
  test_completato BOOLEAN DEFAULT FALSE,
  test_link_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella domande (200 item del questionario)
CREATE TABLE public.domande (
  id INTEGER PRIMARY KEY,
  testo TEXT NOT NULL,
  scala_primaria VARCHAR(5) NOT NULL, -- SV, MO, CF, EF, EC, QN, QR, SP, PA, SC, ST, LE
  scala_secondaria VARCHAR(5),
  polarita CHAR(1) NOT NULL CHECK (polarita IN ('+', '-')),
  blocco_tematico INTEGER,
  ordine INTEGER
);

-- Tabella risposte candidati
CREATE TABLE public.risposte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  domanda_id INTEGER NOT NULL REFERENCES public.domande(id),
  valore CHAR(1) NOT NULL CHECK (valore IN ('A', 'B', 'C')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidato_id, domanda_id)
);

-- Tabella risultati per scala
CREATE TABLE public.risultati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  scala VARCHAR(50) NOT NULL,
  punteggio_grezzo INTEGER,
  punteggio_normalizzato INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella profili calcolati
CREATE TABLE public.profili_candidato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL UNIQUE REFERENCES public.candidati(id) ON DELETE CASCADE,
  leadership_pct DECIMAL(5,2),
  maturita_pct DECIMAL(5,2),
  potenziale_pct DECIMAL(5,2),
  schematicita INTEGER,
  stress_zone BOOLEAN DEFAULT FALSE,
  profilo_tipo VARCHAR(50), -- EXECUTOR, STRATEGIST, LEADER, IN_TRANSIZIONE
  out_points JSONB DEFAULT '[]'::JSONB,
  strength_points JSONB DEFAULT '[]'::JSONB,
  scale_punteggi JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS su tutte le tabelle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aziende ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domande ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risposte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risultati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profili_candidato ENABLE ROW LEVEL SECURITY;

-- RLS Profiles: utenti vedono solo il proprio profilo, superadmin vede tutti
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Superadmin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
  );

CREATE POLICY "Insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Aziende: superadmin gestisce tutto, azienda vede solo la propria
CREATE POLICY "Superadmin can manage aziende" ON public.aziende
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
  );

CREATE POLICY "Azienda can view own company" ON public.aziende
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND azienda_id = id)
  );

-- RLS Candidati: superadmin vede tutti, azienda vede solo i propri
CREATE POLICY "Superadmin can manage candidati" ON public.candidati
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
  );

CREATE POLICY "Azienda can view own candidati" ON public.candidati
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.azienda_id = azienda_id)
  );

CREATE POLICY "Azienda can insert candidati" ON public.candidati
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.azienda_id = azienda_id)
  );

-- RLS Domande: tutti possono leggere
CREATE POLICY "Anyone can read domande" ON public.domande
  FOR SELECT USING (true);

CREATE POLICY "Superadmin can manage domande" ON public.domande
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
  );

-- RLS Risposte: candidato può inserire le proprie, azienda/superadmin possono leggere
CREATE POLICY "Candidato can insert own risposte" ON public.risposte
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.candidati c WHERE c.id = candidato_id AND c.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.candidati c WHERE c.id = candidato_id AND c.test_link_token IS NOT NULL)
  );

CREATE POLICY "View risposte for authorized users" ON public.risposte
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.candidati c 
      JOIN public.profiles p ON p.azienda_id = c.azienda_id 
      WHERE c.id = candidato_id AND p.user_id = auth.uid()
    )
  );

-- RLS Risultati e Profili: stesse regole di risposte
CREATE POLICY "View risultati for authorized" ON public.risultati
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.candidati c 
      JOIN public.profiles p ON p.azienda_id = c.azienda_id 
      WHERE c.id = candidato_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Superadmin can manage risultati" ON public.risultati
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
  );

CREATE POLICY "View profili for authorized" ON public.profili_candidato
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
    OR EXISTS (
      SELECT 1 FROM public.candidati c 
      JOIN public.profiles p ON p.azienda_id = c.azienda_id 
      WHERE c.id = candidato_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Superadmin can manage profili" ON public.profili_candidato
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND ruolo = 'superadmin')
  );

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aziende_updated_at BEFORE UPDATE ON public.aziende
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidati_updated_at BEFORE UPDATE ON public.candidati
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profili_candidato_updated_at BEFORE UPDATE ON public.profili_candidato
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger per creare profilo automaticamente alla registrazione
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, ruolo)
  VALUES (NEW.id, NEW.email, 'candidato');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();