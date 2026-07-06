-- FST — offertes opslaan & beheren (Fase 5b)
-- Idempotent: veilig opnieuw te draaien. Al toegepast in de DB.

-- ---------- OFFERTE-HEADER ----------
create table if not exists quotes (
  id              uuid primary key default gen_random_uuid(),
  projectnr       text,
  klant           text,
  datum           date default current_date,
  status          text default 'concept',
  marge_pct       numeric,
  materiaalkosten numeric,
  arbeidskosten   numeric,
  cogs            numeric,
  verkoopprijs    numeric,
  created_by      uuid,
  created_at      timestamptz default now()
);
create index if not exists idx_quotes_created_at on quotes(created_at desc);

-- ---------- OFFERTE-REGELS ----------
create table if not exists quote_lines (
  id           bigserial primary key,
  quote_id     uuid references quotes(id) on delete cascade,
  soort        text,             -- module / arbeid
  categorie    text,
  omschrijving text,
  aantal       numeric,
  uren         numeric,
  tarief       numeric,
  kostprijs    numeric,
  regel_totaal numeric
);
create index if not exists idx_quote_lines_quote_id on quote_lines(quote_id);

-- ---------- RLS ----------
alter table quotes      enable row level security;
alter table quote_lines enable row level security;

-- Intern: ingelogde werknemers hebben volledige toegang.
do $$
declare t text;
begin
  foreach t in array array['quotes','quote_lines']
  loop
    execute format('drop policy if exists all_authenticated on %I', t);
    execute format('create policy all_authenticated on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
