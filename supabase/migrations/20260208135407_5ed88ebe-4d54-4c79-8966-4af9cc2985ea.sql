-- Aggiornamento domande di controllo CTRL (238-242) con testi dal Manuale V2
-- Queste domande sono "trappole" - quasi tutti dovrebbero rispondere A

UPDATE public.domande SET testo = 'A volte hai dovuto dire una bugia?' WHERE id = 238;
UPDATE public.domande SET testo = 'Hai mai conosciuto una persona antipatica?' WHERE id = 239;
UPDATE public.domande SET testo = 'Qualche volta ti capita di pensare a cose che poi non dici?' WHERE id = 240;
UPDATE public.domande SET testo = 'Qualche volta hai l''impressione di parlare troppo?' WHERE id = 241;
UPDATE public.domande SET testo = 'Qualche volta ti capita di avere pensieri critici riguardo a qualcuno?' WHERE id = 242;