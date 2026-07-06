import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Material } from '../types'
import { getMaterial } from '../lib/data'

export default function MaterialDetail() {
  const { code } = useParams()
  const [m, setM] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (code) getMaterial(code).then((x) => { setM(x); setLoading(false) }) }, [code])

  if (loading) return <p className="text-gray-400">Laden…</p>
  if (!m) return (<div><p className="text-gray-600">Materiaal niet gevonden.</p><Link to="/materialen" className="text-fst-green font-medium">← Terug</Link></div>)

  return (
    <div className="max-w-3xl">
      <Link to="/materialen" className="text-sm text-fst-green font-medium">← Materialen</Link>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="font-heading text-3xl font-bold text-gray-900">{m.primaire_code}</h1>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-fst-green/10 text-fst-greenDark">{m.type_naam}</span>
        {m.status === 'stop' && <span className="text-xs font-semibold text-fst-red">Uitgefaseerd</span>}
      </div>
      <p className="mt-1 text-lg text-gray-700">{m.naam || '—'}</p>
      <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Codes" value={(m.codes ?? []).join(', ')} />
        <Field label="Type" value={`${m.type} — ${m.type_naam}`} />
        <Field label="Status" value={m.status} />
        <Field label="OEM-bronnen" value={(m.oem_bronnen ?? []).join(', ') || '—'} />
        <Field label="Map" value={m.pad} />
      </dl>
      {(m.bestanden ?? []).length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bestanden</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
            {m.bestanden.map((b) => <li key={b}>{b}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (<div><dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt><dd className="text-sm text-gray-800">{value}</dd></div>)
}
