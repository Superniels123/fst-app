import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { SystemModule, LaborRate, LaborActivity, QuoteLine } from '../types'
import { getSystemModules, getLaborRates, getLaborActivities, saveQuote } from '../lib/data'
import { supabase } from '../lib/supabaseClient'

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

type LaborState = { checked: boolean; uren: number; tarief: 'laag' | 'hoog' }
type Proces = 'HVOF' | 'Plasma' | 'eGun'
type LaborSpec = { activiteit: string; uren: number; tarief: 'laag' | 'hoog' }

function moduleKey(m: SystemModule): string {
  return `${m.categorie}::${m.module}`
}

// Deterministische voorinvul-regels voor de wizard. Namen matchen EXACT op de data.
function wizardPrefill(a: { proces: Proces; turnkey: boolean; robot: boolean; booth: boolean }): {
  moduleKeys: string[]
  labor: LaborSpec[]
} {
  const moduleKeys = ['THERMAL SPRAY SYSTEMS::50 Series', 'POWDER FEEDERS::PF-50']
  const labor: LaborSpec[] = [{ activiteit: '50 Series', uren: 128, tarief: 'laag' }]

  if (a.proces === 'HVOF') moduleKeys.push('HVOF GUNS::JP-5000', 'COOLING SYSTEMS::100 - for JP')
  else if (a.proces === 'Plasma') moduleKeys.push('PLASMA GUNS::F4-MB Plasma Gun', 'COOLING SYSTEMS::50kW - non ferrous for APS')
  else if (a.proces === 'eGun') moduleKeys.push('HVOF GUNS::eGun + Licence', 'COOLING SYSTEMS::50kW - eGun')

  if (a.turnkey) {
    moduleKeys.push(
      'ENGINEERING, INSTALLATION, TRAINING::Project Engineering',
      'ENGINEERING, INSTALLATION, TRAINING::Project Management',
      'ENGINEERING, INSTALLATION, TRAINING::Installation at customer & final acceptance',
      'OTHER ITEMS::Manual(s)',
      'OTHER ITEMS::Software Engineering',
    )
    labor.push(
      { activiteit: 'Installation at customer & final acceptance', uren: 64, tarief: 'laag' },
      { activiteit: 'Project engineering', uren: 46.2, tarief: 'hoog' },
      { activiteit: 'Project management', uren: 46.2, tarief: 'hoog' },
    )
  }
  if (a.robot) moduleKeys.push('AUXILIARY::Robot & TT', 'AUXILIARY::Gun Fixture (Robot)')
  if (a.booth) moduleKeys.push('AUXILIARY::Spray Booth', 'AUXILIARY::Dust Collector', 'AUXILIARY::Booth & Filter Install')

  return { moduleKeys, labor }
}

export default function Quote() {
  const navigate = useNavigate()
  const [modules, setModules] = useState<SystemModule[]>([])
  const [rates, setRates] = useState<LaborRate[]>([])
  const [activities, setActivities] = useState<LaborActivity[]>([])
  const [loading, setLoading] = useState(true)

  const [qty, setQty] = useState<Record<string, number>>({})
  const [labor, setLabor] = useState<Record<string, LaborState>>({})
  const [q, setQ] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [marge, setMarge] = useState('43')
  const [klant, setKlant] = useState('')
  const [projectnr, setProjectnr] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [wKlant, setWKlant] = useState('')
  const [wProjectnr, setWProjectnr] = useState('')
  const [wProces, setWProces] = useState<Proces | ''>('')
  const [wTurnkey, setWTurnkey] = useState(false)
  const [wRobot, setWRobot] = useState(false)
  const [wBooth, setWBooth] = useState(false)
  const [prefilledNote, setPrefilledNote] = useState(false)

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
    setKlant('')
    setProjectnr('')
    setSaveError(null)
  }

  const heeftSelectie = useMemo(() => {
    const modulesGekozen = modules.some((m) => (qty[moduleKey(m)] || 0) > 0)
    const arbeidGekozen = activities.some((a) => labor[a.activiteit]?.checked)
    return modulesGekozen || arbeidGekozen
  }, [modules, qty, activities, labor])

  const kanOpslaan = klant.trim() !== '' && heeftSelectie && !saving

  function buildLines(): Omit<QuoteLine, 'id' | 'quote_id'>[] {
    const lines: Omit<QuoteLine, 'id' | 'quote_id'>[] = []
    for (const m of modules) {
      const aantal = qty[moduleKey(m)] || 0
      if (aantal <= 0) continue
      lines.push({
        soort: 'module',
        categorie: m.categorie,
        omschrijving: m.module,
        aantal,
        uren: null,
        tarief: null,
        kostprijs: m.kostprijs_eur,
        regel_totaal: m.kostprijs_eur * aantal,
      })
    }
    for (const a of activities) {
      const st = labor[a.activiteit]
      if (!st || !st.checked) continue
      const tarief = st.tarief === 'laag' ? tariefLaag : tariefHoog
      lines.push({
        soort: 'arbeid',
        categorie: null,
        omschrijving: a.activiteit,
        aantal: null,
        uren: st.uren,
        tarief,
        kostprijs: null,
        regel_totaal: (st.uren || 0) * tarief,
      })
    }
    return lines
  }

  async function opslaan() {
    if (!kanOpslaan) return
    setSaving(true)
    setSaveError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      await saveQuote(
        {
          projectnr: projectnr.trim() || null,
          klant: klant.trim(),
          datum: new Date().toISOString().slice(0, 10),
          status: 'concept',
          marge_pct: margePct,
          materiaalkosten,
          arbeidskosten,
          cogs,
          verkoopprijs,
          created_by: userData.user?.id ?? null,
        },
        buildLines(),
      )
      navigate('/offertes')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Opslaan mislukt')
      setSaving(false)
    }
  }

  // Deep-link /quote?wizard=1 opent de wizard direct.
  useEffect(() => {
    if (searchParams.get('wizard') === '1') {
      setWKlant(klant)
      setWProjectnr(projectnr)
      setStep(1)
      setWizardOpen(true)
      searchParams.delete('wizard')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startWizard() {
    if (heeftSelectie && !window.confirm('Er is al een selectie. De wizard opnieuw draaien overschrijft die. Doorgaan?')) return
    setWKlant(klant)
    setWProjectnr(projectnr)
    setStep(1)
    setWizardOpen(true)
  }

  function applyWizard() {
    if (!wProces) return
    const { moduleKeys, labor: labSpec } = wizardPrefill({ proces: wProces, turnkey: wTurnkey, robot: wRobot, booth: wBooth })

    const modKeySet = new Set(modules.map(moduleKey))
    const newQty: Record<string, number> = {}
    for (const key of moduleKeys) {
      if (modKeySet.has(key)) newQty[key] = 1
      else if (import.meta.env.DEV) console.warn('Wizard: module niet gevonden, overgeslagen:', key)
    }

    const actSet = new Set(activities.map((a) => a.activiteit))
    const newLabor: Record<string, LaborState> = Object.fromEntries(
      activities.map((a) => [a.activiteit, { checked: false, uren: a.standaard_uren, tarief: 'laag' as const }]),
    )
    for (const l of labSpec) {
      if (actSet.has(l.activiteit)) newLabor[l.activiteit] = { checked: true, uren: l.uren, tarief: l.tarief }
      else if (import.meta.env.DEV) console.warn('Wizard: activiteit niet gevonden, overgeslagen:', l.activiteit)
    }

    setQty(newQty)
    setLabor(newLabor)
    setKlant(wKlant.trim())
    setProjectnr(wProjectnr.trim())
    setSaveError(null)
    setWizardOpen(false)
    setPrefilledNote(true)
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
        <div className="shrink-0 flex gap-2">
          <button onClick={startWizard} className="rounded-md bg-fst-green px-3 py-2 text-sm font-semibold text-white hover:bg-fst-greenDark transition-colors">
            Start met wizard
          </button>
          <button onClick={reset} className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>

      {prefilledNote && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-fst-greenTint px-4 py-2.5 text-sm text-fst-greenDark">
          <span>Voorgevuld via wizard — pas gerust aan.</span>
          <button onClick={() => setPrefilledNote(false)} className="shrink-0 text-fst-greenDark/70 hover:text-fst-greenDark font-semibold">✕</button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Klant <span className="text-fst-red">*</span></label>
          <input value={klant} onChange={(e) => setKlant(e.target.value)} placeholder="Naam klant"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Projectnr <span className="text-gray-400">(optioneel)</span></label>
          <input value={projectnr} onChange={(e) => setProjectnr(e.target.value)} placeholder="bv. P-2026-001"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
        </div>
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

            <div className="mt-4 border-t border-gray-100 pt-4">
              <button onClick={opslaan} disabled={!kanOpslaan}
                className="w-full rounded-md bg-fst-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-fst-greenDark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {saving ? 'Opslaan…' : 'Offerte opslaan'}
              </button>
              {!heeftSelectie && <p className="mt-2 text-xs text-gray-400">Kies minstens één module of arbeidsregel.</p>}
              {heeftSelectie && klant.trim() === '' && <p className="mt-2 text-xs text-gray-400">Vul een klantnaam in om op te slaan.</p>}
              {saveError && <p className="mt-2 text-xs text-fst-red">Fout bij opslaan: {saveError}</p>}
            </div>
          </div>
        </div>
      </div>

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setWizardOpen(false)}>
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-fst-greenDark">Quote-wizard</h2>
                <span className="text-xs text-gray-400">Stap {step} / 5</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                <div className="h-1.5 rounded-full bg-fst-green transition-all" style={{ width: `${(step / 5) * 100}%` }} />
              </div>
            </div>

            <div className="px-6 py-6 min-h-[190px]">
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Voor wie maak je deze offerte?</p>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Klant</label>
                    <input value={wKlant} onChange={(e) => setWKlant(e.target.value)} placeholder="Naam klant"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Projectnr <span className="text-gray-400">(optioneel)</span></label>
                    <input value={wProjectnr} onChange={(e) => setWProjectnr(e.target.value)} placeholder="bv. P-2026-001"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Welk spuitproces? <span className="text-fst-red">*</span></p>
                  <div className="grid grid-cols-1 gap-2">
                    {([['HVOF', 'HVOF'], ['Plasma', 'Plasma (APS)'], ['eGun', 'eGun']] as [Proces, string][]).map(([val, label]) => (
                      <button key={val} onClick={() => setWProces(val)}
                        className={`rounded-md border px-4 py-2.5 text-sm font-medium text-left transition-colors ${wProces === val ? 'border-fst-green bg-fst-greenTint text-fst-greenDark' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && <JaNee vraag="Turn-key installatie meenemen?" value={wTurnkey} onChange={setWTurnkey} />}
              {step === 4 && <JaNee vraag="Robot-manipulatie nodig?" value={wRobot} onChange={setWRobot} />}
              {step === 5 && <JaNee vraag="Spuitcabine (booth) nodig?" value={wBooth} onChange={setWBooth} />}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setWizardOpen(false)} className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                Annuleren
              </button>
              <div className="flex gap-2">
                {step > 1 && (
                  <button onClick={() => setStep((s) => s - 1)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Vorige
                  </button>
                )}
                {step < 5 ? (
                  <button onClick={() => setStep((s) => s + 1)} disabled={step === 2 && !wProces}
                    className="rounded-md bg-fst-green px-4 py-2 text-sm font-semibold text-white hover:bg-fst-greenDark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Volgende
                  </button>
                ) : (
                  <button onClick={applyWizard} disabled={!wProces}
                    className="rounded-md bg-fst-green px-4 py-2 text-sm font-semibold text-white hover:bg-fst-greenDark disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Toepassen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function JaNee({ vraag, value, onChange }: { vraag: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">{vraag}</p>
      <div className="flex gap-2">
        {([[true, 'Ja'], [false, 'Nee']] as [boolean, string][]).map(([val, label]) => (
          <button key={label} onClick={() => onChange(val)}
            className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors ${value === val ? 'border-fst-green bg-fst-greenTint text-fst-greenDark' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
