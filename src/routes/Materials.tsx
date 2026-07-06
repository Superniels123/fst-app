import { useEffect, useMemo, useState } from 'react'
import type { Material } from '../types'
import { getMaterials } from '../lib/data'
import MaterialCard from '../components/MaterialCard'

const TYPES = [
  { key: 'all', label: 'Alle' },
  { key: 'C', label: 'Keramiek' },
  { key: 'K', label: 'Carbides' },
  { key: 'M', label: 'Metalen' },
  { key: 'W', label: 'Wire' },
]

export default function Materials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [hideStop, setHideStop] = useState(false)

  useEffect(() => { getMaterials().then((m) => { setMaterials(m); setLoading(false) }) }, [])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return materials.filter((m) => {
      if (type !== 'all' && m.type !== type) return false
      if (hideStop && m.status === 'stop') return false
      if (!needle) return true
      return (
        m.primaire_code.toLowerCase().includes(needle) ||
        (m.naam ?? '').toLowerCase().includes(needle) ||
        m.map.toLowerCase().includes(needle)
      )
    })
  }, [materials, q, type, hideStop])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Materialen</h1>
      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek op code of samenstelling…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={hideStop} onChange={(e) => setHideStop(e.target.checked)} /> Verberg uitgefaseerd
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setType(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${type === t.key ? 'bg-fst-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">{loading ? 'Laden…' : `${results.length} resultaten`}</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((m) => <MaterialCard key={m.map} m={m} />)}
      </div>
    </div>
  )
}
