-- Richieste dal sito: da tabella-cimitero a lista di lavoro.
--
-- Il form pubblico scrive in `leads` e promette "ti contattiamo entro 24 ore
-- lavorative". Nessuno però legge quella tabella: non c'è una pagina, non
-- parte una notifica. Tutto il lavoro SEO converge su un contatto che resta
-- lì finché a qualcuno non viene in mente di aprire il database.
--
-- Perché diventi lavorabile servono tre cose: uno stato, uno spazio per le
-- note, e il telefono (a un titolare di impresa si telefona, non si scrive).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'stato_richiesta') then
    create type public.stato_richiesta as enum (
      'nuova',      -- arrivata, nessuno l'ha ancora presa
      'contattata', -- risposto, in corso
      'cliente',    -- diventata azienda
      'persa'       -- non se n'è fatto niente
    );
  end if;
end $$;

alter table public.leads
  add column if not exists stato public.stato_richiesta not null default 'nuova',
  add column if not exists telefono text,
  add column if not exists note text,
  add column if not exists stato_aggiornato_il timestamptz;

comment on column public.leads.stato is 'A che punto è la lavorazione della richiesta.';
comment on column public.leads.note is 'Cosa ci siamo detti. Serve a chi la riprende in mano dopo.';

-- La lista si apre sulle richieste da lavorare, ordinate dalla più vecchia:
-- è quella che aspetta da più tempo il problema, non l'ultima arrivata.
create index if not exists idx_leads_da_lavorare
  on public.leads (created_at)
  where stato = 'nuova';

create or replace function public.tocca_stato_richiesta()
returns trigger
language plpgsql
as $$
begin
  if new.stato is distinct from old.stato then
    new.stato_aggiornato_il := now();
  end if;
  return new;
end $$;

drop trigger if exists trg_tocca_stato_richiesta on public.leads;
create trigger trg_tocca_stato_richiesta
  before update on public.leads
  for each row execute function public.tocca_stato_richiesta();

-- Il form pubblico inserisce da anonimo: deve poter scrivere anche il
-- telefono, senza però poter decidere lo stato della propria richiesta.
create or replace function public.forza_stato_richiesta_nuova()
returns trigger
language plpgsql
as $$
begin
  new.stato := 'nuova';
  new.note := null;
  return new;
end $$;

drop trigger if exists trg_forza_stato_richiesta_nuova on public.leads;
create trigger trg_forza_stato_richiesta_nuova
  before insert on public.leads
  for each row execute function public.forza_stato_richiesta_nuova();
