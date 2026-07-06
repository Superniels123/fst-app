# CLAUDE.md — FST Coating Portal

Context voor Claude Code. Lees dit eerst. Dit is een **interne web-app** voor FST
(Flame Spray Technologies): een coating-kennisbank + offerte-generator.

## Wat het is
- Doelgroep: FST-medewerkers (intern). Later mogelijk klanten.
- Twee pijlers: (1) coating-kennisbank (materialen, parameters, approvals, equivalents),
  (2) offerte-generator / quote-wizard (volgt in Fase 5).
- Live op Vercel: https://fst-app.vercel.app/ — elke push naar `main` deployt automatisch.

## Tech-stack
- **Vite + React 18 + TypeScript + Tailwind CSS** (frontend).
- **Supabase** (Postgres + Auth + RLS) als backend. Client: `@supabase/supabase-js`.
- **React Router** voor routing. Geen extra state-libs; `useState`/hooks volstaan.
- Hosting: **Vercel** (auto-deploy vanuit deze GitHub-repo).

## Projectstructuur
```
src/
  main.tsx            app-entry (BrowserRouter)
  App.tsx             routes + <AuthGate>
  index.css           tailwind + base
  constants/          design-tokens: colors.ts, typography.ts, flags.ts  ← ÉÉN bron van waarheid
  lib/
    supabaseClient.ts Supabase client (URL/key met veilige fallback)
    session.ts        useSession() auth-hook
    data.ts           datalaag: getMaterials/getMaterial/getParameters (Supabase, fallback JSON)
  components/         Header, Layout, AuthGate, MaterialCard
  routes/             Home, Login, Materials, MaterialDetail, Parameters
  data/               materials.json, parameters.json (fallback + dev)
supabase/migrations/  genummerde idempotente SQL
scripts/import.mjs    idempotente import van ../../data/*.json naar Supabase
```

## Supabase
- Project-id: `omehidrjddyfcfeogprr` · URL in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- **RLS staat aan**: alleen `authenticated` mag lezen. De app zit achter `<AuthGate>` (login).
- Tabellen (alle read-only voor de app):
  - `materials` (primaire_code, type C/K/M/W, type_naam, naam, status actief|stop, codes[], oem_bronnen[], bestanden[], pad)
  - `parameters` (bestand, gun, gas, pad)
  - `approvals` (bestand, pad) — losse approval-documenten
  - `equivalents` (categorie, pac_alloy, samenstelling, hardheid, korrelgrootte, praxair, amdry, metco) — 168 rijen
  - `approvals_matrix` (pac_product, omschrijving, metco, approvals jsonb {GE,PWA,RR,...}) — 11 rijen
  - `system_modules`, `labor_rates`, `labor_activities` — prijslijst voor de quote-generator (Fase 5)
  - `system_sales` — 127 historische offertes (Fase 5; **gevoelige data**, alleen achter login)
- Nieuwe data komt via `scripts/import.mjs` (idempotent). Lees data altijd via de datalaag in `lib/data.ts`.

## Design-tokens (huisstijl — gebruik deze, geen losse kleuren)
- Primair FST-groen `#008C3C` (Tailwind: `fst-green`), donker `#00662B` (`fst-greenDark`), tint `#E6F0E6`.
- Accenten: `fst-blue` #0082C8, `fst-red` #E40808, `fst-navy` #253464.
- Fonts: koppen `font-heading` (Barlow Condensed), body `font-body` (Mulish).
- Zie `src/constants/`. Feature-flags in `flags.ts` (functies aan/uit per fase).

## Conventies
- Taal UI: **Nederlands**; vaktermen (WC-Co, HVOF, Ar-H2) intact laten.
- TypeScript strict. Async data via de functies in `lib/data.ts` (niet direct in componenten querien).
- Kleine commits, **één feature per commit**, conventional commits (`feat:`, `fix:`, `refactor:`).
  Expliciete bestandslijst bij commit; **nooit `git commit -a`**.
- Nieuwe route = bestand in `routes/` + link in `Header.tsx` (+ evt. flag in `flags.ts`).
- Responsive: moet werken op mobiel én desktop.

## Commands
```
npm install
npm run dev       # lokaal (http://localhost:5173) — eerst inloggen
npm run build     # tsc + vite build (moet groen zijn vóór commit)
```

## Werkwijze met de strateeg (Cowork-chat)
De strateeg doet onderzoek + datawerk (Supabase, data-extractie) en levert **kant-en-klare
prompts** per feature. Jij (Claude Code) volgt de cyclus: **rapport → plan → GO → één commit →
build groen → push**. Bouw niets buiten de scope van de prompt zonder te overleggen.
