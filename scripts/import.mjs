// Idempotente import van data/*.json naar Supabase.
// Gebruik:  SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/import.mjs
// (service key: Supabase dashboard → Project Settings → API → service_role)
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const DATA = join(__dir, '..', '..', 'data') // FST/data

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY
if (!url || !key) { console.error('Zet SUPABASE_URL en SUPABASE_SERVICE_KEY'); process.exit(1) }
const db = createClient(url, key)

const read = (f) => JSON.parse(readFileSync(join(DATA, f), 'utf8'))

async function upsert(table, rows, conflict) {
  const { error } = await db.from(table).upsert(rows, { onConflict: conflict })
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`✓ ${table}: ${rows.length}`)
}

const materials = read('materials.json').map((m) => ({
  primaire_code: m.primaire_code, map: m.map, type: m.type, type_naam: m.type_naam,
  naam: m.naam, status: m.status, controle_nodig: m.controle_nodig, pad: m.pad,
  codes: m.codes, oem_bronnen: m.oem_bronnen, bestanden: m.bestanden,
}))
const sales = read('system_sales.json').map((s) => ({
  jaar: s.jaar, map: s.map, projectnr: s.projectnr, klant: s.klant, status: s.status,
  systeem_tags: s.systeem_tags, heeft_calc: s.heeft_calc,
  sales_price: s.sales_price ?? null, total_cost: s.total_cost ?? null,
  gross_margin_pct: s.gross_margin_pct ?? null,
}))
const labor = read('labor_rates.json')

await upsert('materials', materials, 'primaire_code')
await upsert('parameters', read('parameters.json'), 'id')
await upsert('approvals', read('approvals.json'), 'id')
await upsert('system_modules', read('systems_modules.json'), 'id')
await upsert('labor_rates', labor.tarieven.map((t) => ({ soort: t.soort, per_uur: t.per_uur, per_dag: t.per_dag })), 'id')
await upsert('labor_activities', labor.activiteiten, 'id')
await upsert('system_sales', sales, 'map')
console.log('Klaar.')
