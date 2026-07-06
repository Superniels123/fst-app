import { Link } from 'react-router-dom'
import type { Material } from '../types'

const typeColor: Record<string, string> = {
  C: 'bg-fst-green/10 text-fst-greenDark',
  K: 'bg-fst-blue/10 text-fst-blue',
  M: 'bg-fst-navy/10 text-fst-navy',
  W: 'bg-fst-red/10 text-fst-red',
}

export default function MaterialCard({ m }: { m: Material }) {
  return (
    <Link
      to={`/materiaal/${encodeURIComponent(m.primaire_code)}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md hover:border-fst-green transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-heading text-xl font-semibold text-gray-900">
          {m.primaire_code}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${typeColor[m.type] ?? 'bg-gray-100 text-gray-600'}`}>
          {m.type_naam}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600 min-h-[2.5rem]">{m.naam || '—'}</p>
      <div className="mt-2 flex items-center gap-2">
        {m.status === 'stop' ? (
          <span className="text-xs font-medium text-fst-red">Uitgefaseerd</span>
        ) : (
          <span className="text-xs font-medium text-fst-green">Actief</span>
        )}
      </div>
    </Link>
  )
}
