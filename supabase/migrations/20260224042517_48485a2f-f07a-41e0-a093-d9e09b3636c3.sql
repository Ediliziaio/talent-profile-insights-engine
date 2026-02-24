
-- Create candidate_sessions table for secure session token validation
CREATE TABLE public.candidate_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token text NOT NULL UNIQUE,
  azienda_id uuid NOT NULL REFERENCES public.aziende(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by token
CREATE INDEX idx_candidate_sessions_token ON public.candidate_sessions (session_token) WHERE NOT used;

-- Enable RLS (no public policies needed - only accessed via service role)
ALTER TABLE public.candidate_sessions ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup expired sessions (older than 48h) via a function
CREATE OR REPLACE FUNCTION public.cleanup_expired_candidate_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.candidate_sessions
  WHERE expires_at < now() - interval '48 hours';
$$;
