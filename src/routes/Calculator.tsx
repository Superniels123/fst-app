import { useState } from 'react'

function num(v: string): number | null {
  const n = parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export default function Calculator() {
  // Blok 1 — laagdikte ↔ passes
  const [totaal, setTotaal] = useState('300')
  const [perPass, setPerPass] = useState('25')
  const [passes, setPasses] = useState('12')

  const t = num(totaal), pp = num(perPass), p = num(passes)
  const berekendPasses = t !== null && pp !== null && pp > 0 ? Math.ceil(t / pp) : null
  const berekendTotaal = p !== null && pp !== null ? p * pp : null

  // Blok 2 — verbruik
  const [oppervlak, setOppervlak] = useState('100')
  const [laagdikte, setLaagdikte] = useState('300')
  const [dichtheid, setDichtheid] = useState('8.0')
  const [rendement, setRendement] = useState('50')

  const opp = num(oppervlak), ld = num(laagdikte), rho = num(dichtheid), eta = num(rendement)
  const massa = opp !== null && ld !== null && rho !== null && eta !== null && eta > 0
    ? opp * (ld / 10000) * rho / (eta / 100)
    : null

  const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none'
  const labelCls = 'block text-xs text-gray-500 mb-1'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Coating-calculator</h1>
      <p className="mt-1 text-sm text-gray-600">
        Snelle reken-hulp voor laagopbouw en indicatief materiaalverbruik.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blok 1 */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h2 className="font-heading text-lg font-bold text-fst-greenDark">Laagdikte ↔ passes</h2>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Gewenste laagdikte (µm)</label>
              <input value={totaal} onChange={(e) => setTotaal(e.target.value)} inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Dikte per pass (µm)</label>
              <input value={perPass} onChange={(e) => setPerPass(e.target.value)} inputMode="decimal" className={inputCls} />
            </div>
          </div>
          <div className="mt-3 rounded-md bg-fst-greenTint px-4 py-3">
            <span className="text-sm text-gray-700">Benodigde passes: </span>
            <span className="text-xl font-bold text-fst-greenDark">{berekendPasses ?? '—'}</span>
          </div>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <label className={labelCls}>Aantal passes</label>
            <input value={passes} onChange={(e) => setPasses(e.target.value)} inputMode="decimal" className={inputCls} />
            <div className="mt-3 rounded-md bg-fst-greenTint px-4 py-3">
              <span className="text-sm text-gray-700">Totale laagdikte (passes × dikte/pass): </span>
              <span className="text-xl font-bold text-fst-greenDark">{berekendTotaal !== null ? `${berekendTotaal} µm` : '—'}</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-400">Passes naar boven afgerond (Math.ceil).</p>
        </div>

        {/* Blok 2 */}
        <div className="rounded-lg border border-gray-200 p-5">
          <h2 className="font-heading text-lg font-bold text-fst-greenDark">Materiaalverbruik (indicatief)</h2>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Oppervlak (cm²)</label>
              <input value={oppervlak} onChange={(e) => setOppervlak(e.target.value)} inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Laagdikte (µm)</label>
              <input value={laagdikte} onChange={(e) => setLaagdikte(e.target.value)} inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Dichtheid (g/cm³)</label>
              <input value={dichtheid} onChange={(e) => setDichtheid(e.target.value)} inputMode="decimal" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Depositierendement (%)</label>
              <input value={rendement} onChange={(e) => setRendement(e.target.value)} inputMode="decimal" className={inputCls} />
            </div>
          </div>

          <div className="mt-4 rounded-md bg-fst-greenTint px-4 py-3">
            <span className="text-sm text-gray-700">Benodigde materiaalhoeveelheid: </span>
            <span className="text-xl font-bold text-fst-greenDark">{massa !== null ? `${massa.toFixed(1)} g` : '—'}</span>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Indicatie. Formule: massa = oppervlak × (laagdikte / 10.000) × dichtheid ÷ (rendement / 100).
            Aanname: uniforme laagdikte en constant rendement.
          </p>
        </div>
      </div>
    </div>
  )
}
