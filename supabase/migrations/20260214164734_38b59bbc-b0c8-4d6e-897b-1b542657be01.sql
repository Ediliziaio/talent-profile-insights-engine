-- Remove plain-text password storage for security
ALTER TABLE public.accessi_azienda ALTER COLUMN password_plain DROP NOT NULL;
ALTER TABLE public.accessi_azienda ALTER COLUMN password_plain SET DEFAULT NULL;

-- Clear all existing plain-text passwords
UPDATE public.accessi_azienda SET password_plain = NULL;
