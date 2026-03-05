
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  azienda TEXT,
  num_dipendenti TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Allow anonymous inserts (public landing page)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Superadmin can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmin can manage leads" ON public.leads
  FOR ALL TO authenticated
  USING (is_superadmin(auth.uid()));
