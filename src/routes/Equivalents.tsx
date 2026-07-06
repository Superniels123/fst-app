import { useEffect, useMemo, useState } from 'react'
import type { Equivalent } from '../types'
import { getEquivalents } from '../lib/data'

export default function Equivalents() {
  const [rows, setRows] = useState<Equivalent[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')

  useEffect(() => { getEquivalents().then((r) => { setRows(r); setLoading(false) }) }, [])

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.categorie).filter(Boolean))).sort() as string[],
    [rows],
  )

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (cat !== 'all' && r.categorie !== cat) return false
      if (!needle) return true
      return [r.pac_alloy, r.samenstelling, r.praxair, r.amdry, r.metco]
        .some((v) => (v ?? '').toLowerCase().includes(needle))
    })
  }, [rows, q, cat])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Equivalenten</h1>
      <p className="mt-1 text-sm text-gray-600">
        Zoek een PAC-poeder en zie in één oogopslag het equivalent bij Praxair, Amdry en Metco.
      </p>

      <div className="mt-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek op PAC, samenstelling, Praxair, Amdry of Metco…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setCat('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === 'all' ? 'bg-fst-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          Alle
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${cat === c ? 'bg-fst-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-500">{loading ? 'Laden…' : `${results.length} resultaten`}</p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">PAC-nummer</th>
              <th className="px-4 py-2 font-medium">Samenstelling</th>
              <th className="px-4 py-2 font-medium">Hardheid</th>
              <th className="px-4 py-2 font-medium">Praxair</th>
              <th className="px-4 py-2 font-medium">Amdry</th>
              <th className="px-4 py-2 font-medium">Metco</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{r.pac_alloy || '—'}</td>
                <td className="px-4 py-2 text-gray-600">{r.samenstelling || '—'}</td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{r.hardheid || '—'}</td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{r.praxair || '—'}</td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{r.amdry || '—'}</td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{r.metco || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
