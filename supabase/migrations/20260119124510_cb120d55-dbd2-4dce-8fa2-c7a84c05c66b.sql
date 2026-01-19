-- Add username column to candidati table
ALTER TABLE public.candidati ADD COLUMN username text NULL;

-- Create unique partial index on username (only where not null)
CREATE UNIQUE INDEX idx_candidati_username_unique ON public.candidati (username) WHERE username IS NOT NULL;

-- Create unique constraint on user_id (one candidato per user)
CREATE UNIQUE INDEX idx_candidati_user_id_unique ON public.candidati (user_id) WHERE user_id IS NOT NULL;