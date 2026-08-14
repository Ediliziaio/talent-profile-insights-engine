-- Fase della selezione.
--
-- Finora l'unico stato di un candidato era "ha fatto il test / non l'ha
-- fatto". Tutto quello che viene dopo — l'ho chiamato, l'ho visto, l'ho
-- preso, l'ho scartato — viveva fuori dalla piattaforma, su un foglio Excel
-- o nella testa di chi assume. Senza questo la piattaforma resta un
-- generatore di report invece del posto dove si assume.
--
-- Il motivo dello scarto non è burocrazia: nel tempo è il dato che dice se
-- il punteggio del test prevede davvero come è andata.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'fase_selezione') then
    create type public.fase_selezione as enum (
      'nuovo',       -- inserito, non ancora contattato
      'contattato',  -- sentito, in attesa di un incontro
      'colloquio',   -- colloquio fissato o fatto
      'assunto',
      'scartato'
    );
  end if;
end $$;

alter table public.candidati
  add column if not exists fase public.fase_selezione not null default 'nuovo',
  add column if not exists motivo_scarto text,
  add column if not exists fase_aggiornata_il timestamptz;

comment on column public.candidati.fase is
  'A che punto è la selezione di questa persona.';
comment on column public.candidati.motivo_scarto is
  'Perché è stato scartato. Serve a capire, col tempo, quanto il test azzecca.';

-- Il filtro per fase è per azienda: l''indice segue la stessa forma.
create index if not exists idx_candidati_fase
  on public.candidati (azienda_id, fase);

-- La data di cambio fase si aggiorna da sola: lasciarla al client significa
-- averla giusta solo quando il client si ricorda di scriverla.
create or replace function public.tocca_fase_aggiornata()
returns trigger
language plpgsql
as $$
begin
  if new.fase is distinct from old.fase then
    new.fase_aggiornata_il := now();
    -- Uscire da "scartato" deve pulire il motivo, altrimenti resta appiccicato
    -- a un candidato che è tornato in corsa.
    if new.fase <> 'scartato' then
      new.motivo_scarto := null;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_tocca_fase_aggiornata on public.candidati;
create trigger trg_tocca_fase_aggiornata
  before update on public.candidati
  for each row execute function public.tocca_fase_aggiornata();
