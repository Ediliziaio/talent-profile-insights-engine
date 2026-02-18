
-- Tabella abbonamenti
CREATE TABLE public.abbonamenti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  azienda_id uuid NOT NULL UNIQUE REFERENCES public.aziende(id) ON DELETE CASCADE,
  stato varchar NOT NULL DEFAULT 'trial',
  importo_mensile numeric NOT NULL DEFAULT 97.00,
  data_inizio timestamptz,
  data_scadenza timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.abbonamenti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin full access abbonamenti" ON public.abbonamenti
  FOR ALL USING (is_superadmin(auth.uid()));

CREATE TRIGGER update_abbonamenti_updated_at
  BEFORE UPDATE ON public.abbonamenti
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabella pagamenti
CREATE TABLE public.pagamenti (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abbonamento_id uuid NOT NULL REFERENCES public.abbonamenti(id) ON DELETE CASCADE,
  azienda_id uuid NOT NULL REFERENCES public.aziende(id) ON DELETE CASCADE,
  importo numeric NOT NULL,
  stato varchar NOT NULL DEFAULT 'in_attesa',
  data_pagamento timestamptz NOT NULL DEFAULT now(),
  metodo varchar NOT NULL DEFAULT 'manuale',
  stripe_payment_id text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamenti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin full access pagamenti" ON public.pagamenti
  FOR ALL USING (is_superadmin(auth.uid()));
