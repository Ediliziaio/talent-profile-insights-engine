-- Impostazioni: dati di fatturazione e accessi multipli.
--
-- Due buchi che si tenevano per mano:
--
-- 1. Su `aziende` non c'era partita IVA né codice SDI. Per fatturare
--    servono, e finora stavano fuori dalla piattaforma.
-- 2. Un'azienda poteva solo LEGGERE la propria riga, e vedere solo il
--    proprio profilo. Risultato: nessuno poteva aggiornare i dati della
--    propria impresa, e tutti in azienda entravano con lo stesso login.
--    Con la fase della selezione appena introdotta questo diventa un
--    problema vero: "chi ha scartato questo candidato?" non ha risposta.

-- ── Dati di fatturazione ───────────────────────────────────────────────
alter table public.aziende
  add column if not exists partita_iva text,
  add column if not exists codice_fiscale text,
  add column if not exists codice_sdi text,
  add column if not exists pec text,
  add column if not exists citta text,
  add column if not exists cap text,
  add column if not exists provincia text;

comment on column public.aziende.codice_sdi is
  'Codice destinatario per la fattura elettronica.';

-- ── L''azienda può aggiornare i propri dati ────────────────────────────
drop policy if exists "Azienda users can update own azienda" on public.aziende;
create policy "Azienda users can update own azienda" on public.aziende
for update
using (id = public.get_user_azienda_id(auth.uid()))
with check (id = public.get_user_azienda_id(auth.uid()));

-- `attiva` decide se l''azienda può entrare: non può essere lei a
-- deciderlo. La policy sopra da sola glielo permetterebbe.
-- Un trigger invece del revoke sulla colonna, perché il revoke colpirebbe
-- anche il superadmin, che passa dallo stesso ruolo `authenticated`.
create or replace function public.blocca_autoattivazione_azienda()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.attiva is distinct from old.attiva and not public.is_superadmin(auth.uid()) then
    raise exception 'Solo un amministratore può attivare o disattivare un''azienda';
  end if;
  return new;
end $$;

drop trigger if exists trg_blocca_autoattivazione_azienda on public.aziende;
create trigger trg_blocca_autoattivazione_azienda
  before update on public.aziende
  for each row execute function public.blocca_autoattivazione_azienda();

-- ── Chi lavora nella stessa azienda si vede ────────────────────────────
-- Serve alla lista "chi accede". Senza, ognuno vede solo se stesso e la
-- pagina mostrerebbe sempre un utente solo.
drop policy if exists "Colleghi della stessa azienda" on public.profiles;
create policy "Colleghi della stessa azienda" on public.profiles
for select
using (
  azienda_id is not null
  and azienda_id = public.get_user_azienda_id(auth.uid())
  -- I candidati non sono colleghi: hanno azienda_id valorizzato ma non
  -- devono comparire nell'elenco degli accessi.
  and ruolo <> 'candidato'
);
