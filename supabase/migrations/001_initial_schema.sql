-- FST — initial schema (Fase 2)
-- Idempotent: veilig opnieuw te draaien.

-- ---------- MATERIALEN ----------
create table if not exists materials (
  id             bigserial primary key,
  primaire_code  text unique not null,
  map            text,
  type           text,            -- C / K / M / W
  type_naam      text,            -- keramiek / carbide / metaal / wire
  naam           text,            -- samenstelling
  status         text default 'actief',
  controle_nodig boolean default false,
  pad            text,
  codes          text[] default '{}',
  oem_bronnen    text[] default '{}',
  bestanden      text[] default '{}',
  created_at     timestamptz default now()
);
create index if not exists idx_materials_type on materials(type);
create index if not exists idx_materials_status on materials(status);

-- ---------- SPUITPARAMETERS ----------
create table if not exists parameters (
  id       bigserial primary key,
  bestand  text not null,
  gun      text,
  gas      text,
  pad      text
);

-- ---------- APPROVALS (documenten) ----------
create table if not exists approvals (
  id       bigserial primary key,
  bestand  text not null,
  pad      text
);

-- ---------- OFFERTE: PRIJSLIJST ----------
create table if not exists system_modules (
  id            bigserial primary key,
  categorie     text,
  module        text not null,
  omschrijving  text,
  kostprijs_eur numeric,
  leverancier   text,
  prijs_type    text default 'vast'   -- vast / percentage
);

create table if not exists labor_rates (
  id       bigserial primary key,
  soort    text not null,
  per_uur  numeric,
  per_dag  numeric
);

create table if not exists labor_activities (
  id             bigserial primary key,
  activiteit     text not null,
  standaard_uren numeric
);

-- ---------- SYSTEM SALES (historische offertes) ----------
create table if not exists system_sales (
  id               bigserial primary key,
  jaar             text,
  map              text unique,
  projectnr        text,
  klant            text,
  status           text,
  systeem_tags     text[] default '{}',
  heeft_calc       boolean default false,
  sales_price      numeric,
  total_cost       numeric,
  gross_margin_pct numeric
);

-- ---------- RLS ----------
alter table materials       enable row level security;
alter table parameters      enable row level security;
alter table approvals       enable row level security;
alter table system_modules  enable row level security;
alter table labor_rates     enable row level security;
alter table labor_activities enable row level security;
alter table system_sales    enable row level security;

-- Intern: ingelogde werknemers mogen lezen.
do $$
declare t text;
begin
  foreach t in array array['materials','parameters','approvals','system_modules','labor_rates','labor_activities','system_sales']
  loop
    execute format('drop policy if exists read_authenticated on %I', t);
    execute format('create policy read_authenticated on %I for select to authenticated using (true)', t);
  end loop;
end $$;
