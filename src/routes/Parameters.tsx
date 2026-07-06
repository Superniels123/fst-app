import { useEffect, useMemo, useState } from 'react'
import type { Parameter } from '../types'
import { getParameters } from '../lib/data'

export default function Parameters() {
  const [params, setParams] = useState<Parameter[]>([])
  const [loading, setLoading] = useState(true)
  const [gun, setGun] = useState('all')
  const [gas, setGas] = useState('all')

  useEffect(() => { getParameters().then((p) => { setParams(p); setLoading(false) }) }, [])

  const guns = useMemo(() => Array.from(new Set(params.map((p) => p.gun).filter(Boolean))).sort() as string[], [params])
  const gases = useMemo(() => Array.from(new Set(params.map((p) => p.gas).filter(Boolean))).sort() as string[], [params])

  const results = params.filter((p) => (gun === 'all' || p.gun === gun) && (gas === 'all' || p.gas === gas))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Spuitparameters</h1>
      <p className="mt-1 text-sm text-gray-600">Filter op gun en gascombinatie om de juiste parametersheet te vinden.</p>

      <div className="mt-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Gun / torch</label>
          <select value={gun} onChange={(e) => setGun(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">Alle guns</option>
            {guns.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Gas</label>
          <select value={gas} onChange={(e) => setGas(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">Alle gassen</option>
            {gases.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500">{loading ? 'Laden…' : `${results.length} sheets`}</p>
      <div className="mt-2 overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr><th className="px-4 py-2 font-medium">Gun</th><th className="px-4 py-2 font-medium">Gas</th><th className="px-4 py-2 font-medium">Bestand</th></tr>
          </thead>
          <tbody>
            {results.map((p, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-800">{p.gun}</td>
                <td className="px-4 py-2 text-gray-600">{p.gas || '—'}</td>
                <td className="px-4 py-2 text-gray-600">{p.bestand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
