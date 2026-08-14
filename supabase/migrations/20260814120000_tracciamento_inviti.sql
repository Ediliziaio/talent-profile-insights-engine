-- Tracciamento degli inviti al test.
--
-- La dashboard sa dire chi è fermo da più di 5 giorni, ma non sa se qualcuno
-- l'ha già sollecitato: senza queste due colonne si finisce per scrivere due
-- volte alla stessa persona, o per non scrivere a nessuno pensando che ci
-- abbia già pensato un collega.
--
-- Nessun default distruttivo: le righe esistenti restano a 0 inviti e data
-- nulla, che è esattamente la verità (non sappiamo se sono stati invitati).

alter table public.candidati
  add column if not exists data_ultimo_invito timestamptz,
  add column if not exists inviti_inviati integer not null default 0;

comment on column public.candidati.data_ultimo_invito is
  'Quando è stato mandato l''ultimo invito o sollecito a fare il test.';
comment on column public.candidati.inviti_inviati is
  'Quante volte è stato mandato l''invito al test, solleciti compresi.';

-- Serve alla lista "chi sollecitare": chi non ha fatto il test, ordinato per
-- chi è stato contattato meno di recente.
create index if not exists idx_candidati_invito_pendente
  on public.candidati (azienda_id, data_ultimo_invito nulls first)
  where test_completato = false;
