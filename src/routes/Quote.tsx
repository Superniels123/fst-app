import { useEffect, useMemo, useState } from 'react'
import type { SystemModule, LaborRate, LaborActivity } from '../types'
import { getSystemModules, getLaborRates, getLaborActivities } from '../lib/data'

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

type LaborState = { checked: boolean; uren: number; tarief: 'laag' | 'hoog' }

function moduleKey(m: SystemModule): string {
  return `${m.categorie}::${m.module}`
}

export default function Quote() {
  const [modules, setModules] = useState<SystemModule[]>([])
  const [rates, setRates] = useState<LaborRate[]>([])
  const [activities, setActivities] = useState<LaborActivity[]>([])
  const [loading, setLoading] = useState(true)

  const [qty, setQty] = useState<Record<string, number>>({})
  const [labor, setLabor] = useState<Record<string, LaborState>>({})
  const [q, setQ] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [marge, setMarge] = useState('43')

  useEffect(() => {
    Promise.all([getSystemModules(), getLaborRates(), getLaborActivities()]).then(([m, r, a]) => {
      setModules(m)
      setRates(r)
      setActivities(a)
      setLabor(Object.fromEntries(a.map((act) => [act.activiteit, { checked: false, uren: act.standaard_uren, tarief: 'laag' as const }])))
      setLoading(false)
    })
  }, [])

  // Laag = laagste per_uur, Hoog = hoogste per_uur (dynamisch)
  const tariefLaag = useMemo(() => (rates.length ? Math.min(...rates.map((r) => r.per_uur)) : 0), [rates])
  const tariefHoog = useMemo(() => (rates.length ? Math.max(...rates.map((r) => r.per_uur)) : 0), [rates])

  const categories = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const map = new Map<string, SystemModule[]>()
    for (const m of modules) {
      if (needle && !`${m.module} ${m.omschrijving ?? ''} ${m.categorie}`.toLowerCase().includes(needle)) continue
      if (!map.has(m.categorie)) map.set(m.categorie, [])
      map.get(m.categorie)!.push(m)
    }
    return Array.from(map.entries())
  }, [modules, q])

  const materiaalkosten = useMemo(
    () => modules.reduce((sum, m) => sum + m.kostprijs_eur * (qty[moduleKey(m)] || 0), 0),
    [modules, qty],
  )

  const arbeidskosten = useMemo(
    () => activities.reduce((sum, a) => {
      const st = labor[a.activiteit]
      if (!st || !st.checked) return sum
      const tarief = st.tarief === 'laag' ? tariefLaag : tariefHoog
      return sum + (st.uren || 0) * tarief
    }, 0),
    [activities, labor, tariefLaag, tariefHoog],
  )

  const cogs = materiaalkosten + arbeidskosten
  const margePct = Math.max(0, Math.min(99.9, parseFloat(marge.replace(',', '.')) || 0))
  const verkoopprijs = cogs / (1 - margePct / 100)
  const margeEur = verkoopprijs - cogs
  const controleMarge = verkoopprijs > 0 ? (margeEur / verkoopprijs) * 100 : 0

  function reset() {
    setQty({})
    setLabor(Object.fromEntries(activities.map((a) => [a.activiteit, { checked: false, uren: a.standaard_uren, tarief: 'laag' as const }])))
    setMarge('43')
    setQ('')
  }

  const inputCls = 'rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none'

  if (loading) return <p className="text-sm text-gray-500">Laden…</p>

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quote maken</h1>
          <p className="mt-1 text-sm text-gray-600">
            Vink systeem-modules en arbeid aan; kostprijs, verkoopprijs en marge worden live berekend.
            Vervangt de Excel-calc (F-08-017).
          </p>
        </div>
        <button onClick={reset} className="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          Reset
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Links: modules + arbeid */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek een module…"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
            <div className="mt-3 space-y-3">
              {categories.map(([cat, mods]) => {
                const open = !collapsed[cat]
                return (
                  <div key={cat} className="rounded-lg border border-gray-200">
                    <button onClick={() => setCollapsed((c) => ({ ...c, [cat]: open }))}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left">
                      <span className="font-heading text-sm font-bold uppercase tracking-wide text-fst-greenDark">{cat}</span>
                      <span className="text-gray-400 text-sm">{open ? '−' : '+'} {mods.length}</span>
                    </button>
                    {open && (
                      <div className="divide-y divide-gray-100 border-t border-gray-100">
                        {mods.map((m) => {
                          const key = moduleKey(m)
                          return (
                            <div key={key} className="flex items-center gap-3 px-4 py-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800 truncate">{m.module}</span>
                                  {m.prijs_type === 'percentage' && (
                                    <span className="shrink-0 rounded bg-fst-greenTint text-fst-greenDark px-1.5 py-0.5 text-[10px] font-semibold">indicatief</span>
                                  )}
                                </div>
                                {m.omschrijving && <div className="text-xs text-gray-500 truncate">{m.omschrijving}</div>}
                              </div>
                              <div className="shrink-0 text-sm text-gray-600 tabular-nums w-24 text-right">{eur.format(m.kostprijs_eur)}</div>
                              <input type="number" min={0} value={qty[key] ?? 0}
                                onChange={(e) => setQty((s) => ({ ...s, [key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                                className={`${inputCls} w-16 text-right`} />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
              {categories.length === 0 && <p className="text-sm text-gray-500 px-1">Geen modules gevonden.</p>}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-fst-greenDark">Arbeid</h2>
            <p className="text-xs text-gray-500 mt-0.5">Laag = € {tariefLaag}/u · Hoog = € {tariefHoog}/u. Alleen aangevinkte regels tellen mee.</p>
            <div className="mt-2 rounded-lg border border-gray-200 divide-y divide-gray-100">
              {activities.map((a) => {
                const st = labor[a.activiteit]
                if (!st) return null
                return (
                  <div key={a.activiteit} className="flex items-center gap-3 px-4 py-2">
                    <input type="checkbox" checked={st.checked}
                      onChange={(e) => setLabor((s) => ({ ...s, [a.activiteit]: { ...s[a.activiteit], checked: e.target.checked } }))} />
                    <span className="min-w-0 flex-1 text-sm text-gray-800 truncate">{a.activiteit}</span>
                    <input type="number" min={0} step="0.1" value={st.uren}
                      onChange={(e) => setLabor((s) => ({ ...s, [a.activiteit]: { ...s[a.activiteit], uren: Math.max(0, parseFloat(e.target.value) || 0) } }))}
                      className={`${inputCls} w-20 text-right`} />
                    <span className="text-xs text-gray-400">u</span>
                    <select value={st.tarief}
                      onChange={(e) => setLabor((s) => ({ ...s, [a.activiteit]: { ...s[a.activiteit], tarief: e.target.value as 'laag' | 'hoog' } }))}
                      className={inputCls}>
                      <option value="laag">Laag (€ {tariefLaag}/u)</option>
                      <option value="hoog">Hoog (€ {tariefHoog}/u)</option>
                    </select>
                  </div>
                )
              })}
            </div>
          </section>
        </div>

        {/* Rechts: sticky samenvatting */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 rounded-lg border border-gray-200 p-5 bg-white">
            <h2 className="font-heading text-lg font-bold text-fst-greenDark">Calculatie</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600">Materiaalkosten</dt><dd className="font-medium text-gray-800 tabular-nums">{eur.format(materiaalkosten)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Arbeidskosten</dt><dd className="font-medium text-gray-800 tabular-nums">{eur.format(arbeidskosten)}</dd></div>
              <div className="flex justify-between border-t border-gray-100 pt-2"><dt className="font-semibold text-gray-800">Totale kostprijs (COGS)</dt><dd className="font-bold text-gray-900 tabular-nums">{eur.format(cogs)}</dd></div>
            </dl>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <label className="block text-xs text-gray-500 mb-1">Gewenste bruto marge (%)</label>
              <input type="number" min={0} max={99} step="0.1" value={marge} onChange={(e) => setMarge(e.target.value)}
                className={`${inputCls} w-24`} />
            </div>

            <div className="mt-4 rounded-md bg-fst-greenTint px-4 py-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-gray-700">Verkoopprijs</span>
                <span className="text-xl font-bold text-fst-greenDark tabular-nums">{eur.format(verkoopprijs)}</span>
              </div>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-600">Marge (€)</dt><dd className="font-medium text-gray-800 tabular-nums">{eur.format(margeEur)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Marge (%) — controle</dt><dd className="font-medium text-gray-800 tabular-nums">{controleMarge.toFixed(1)}%</dd></div>
            </dl>
            <p className="mt-3 text-[11px] text-gray-400">
              Verkoopprijs = COGS ÷ (1 − marge/100). Percentage-modules worden als vast bedrag meegerekend (indicatief).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
