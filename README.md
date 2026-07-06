# FST Coating Portal — web-app

Interne web-app voor FST (Flame Spray Technologies): coating-kennisbank + offerte-generator.
Dit is het **skeleton (Fase 1)**: Vite + React + TypeScript + Tailwind, met de FST-huisstijl
en de materiaaldatabase (89 materialen) uit `src/data/materials.json`.

## Starten
```bash
npm install
npm run dev
```
Open de URL die Vite toont (meestal http://localhost:5173).

## Build
```bash
npm run build      # tsc + vite build → dist/
npm run preview    # bekijk de productie-build
```

## Structuur
```
src/
  constants/   design-tokens (colors, typography) + feature-flags
  lib/         supabaseClient (Fase 2)
  data/        materials.json (tijdelijke databron tot Supabase)
  components/  Header, Layout, MaterialCard
  routes/      Home, Materials, MaterialDetail
```

## Volgende fasen
- Fase 2: Supabase (Auth, RLS, tabellen, import van de JSON) — vul `.env` (zie `.env.example`).
- Fase 3+: parameter-finder, approvals, quote-wizard (`FLAGS` in `src/constants/flags.ts`).
