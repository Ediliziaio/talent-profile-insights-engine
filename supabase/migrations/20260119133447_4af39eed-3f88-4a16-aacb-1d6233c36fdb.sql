-- Create accessi_azienda table for shared company credentials
CREATE TABLE IF NOT EXISTS public.accessi_azienda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  azienda_id UUID NOT NULL REFERENCES public.aziende(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_plain TEXT NOT NULL,
  attivo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_azienda_accesso UNIQUE(azienda_id),
  CONSTRAINT unique_accesso_username UNIQUE(username)
);

-- Add sesso column to candidati table
ALTER TABLE public.candidati ADD COLUMN IF NOT EXISTS sesso VARCHAR(20);

-- Enable RLS on accessi_azienda
ALTER TABLE public.accessi_azienda ENABLE ROW LEVEL SECURITY;

-- RLS Policies for accessi_azienda
-- Superadmin can manage all
CREATE POLICY "Superadmin full access accessi_azienda" 
ON public.accessi_azienda 
FOR ALL 
USING (is_superadmin(auth.uid()));

-- Azienda can view and manage their own access credentials
CREATE POLICY "Azienda can view own accessi" 
ON public.accessi_azienda 
FOR SELECT 
USING (azienda_id = get_user_azienda_id(auth.uid()));

CREATE POLICY "Azienda can update own accessi" 
ON public.accessi_azienda 
FOR UPDATE 
USING (azienda_id = get_user_azienda_id(auth.uid()));

CREATE POLICY "Azienda can insert own accessi" 
ON public.accessi_azienda 
FOR INSERT 
WITH CHECK (azienda_id = get_user_azienda_id(auth.uid()));

-- Allow public to verify credentials (for login - will be done via edge function)
-- No direct SELECT policy for unauthenticated users - verification happens in edge function

-- Create trigger for updated_at
CREATE TRIGGER update_accessi_azienda_updated_at
BEFORE UPDATE ON public.accessi_azienda
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();