import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Quote } from '../types'
import { getQuotes, deleteQuote } from '../lib/data'

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export default function Offertes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  function load() {
    setLoading(true)
    getQuotes().then((rows) => { setQuotes(rows); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return quotes
    return quotes.filter((qt) => `${qt.klant ?? ''} ${qt.projectnr ?? ''}`.toLowerCase().includes(needle))
  }, [quotes, q])

  async function verwijder(qt: Quote) {
    if (!window.confirm(`Offerte van "${qt.klant ?? '—'}" definitief verwijderen?`)) return
    try {
      await deleteQuote(qt.id)
      load()
    } catch (e) {
      window.alert('Verwijderen mislukt: ' + (e instanceof Error ? e.message : 'onbekende fout'))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Offertes</h1>
      <p className="mt-1 text-sm text-gray-600">Opgeslagen offertes — bekijk of verwijder.</p>

      <div className="mt-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek op klant of projectnr…"
          className="w-full sm:max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
      </div>

      <p className="mt-4 text-sm text-gray-500">{loading ? 'Laden…' : `${results.length} offertes`}</p>

      {!loading && results.length === 0 ? (
        <div className="mt-2 rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
          {quotes.length === 0
            ? <>Nog geen offertes opgeslagen. Maak er een via <Link to="/quote" className="text-fst-green font-semibold hover:underline">Quote maken</Link>.</>
            : 'Geen offertes gevonden voor deze zoekopdracht.'}
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Projectnr</th>
                <th className="px-4 py-2 font-medium">Klant</th>
                <th className="px-4 py-2 font-medium">Datum</th>
                <th className="px-4 py-2 font-medium text-right">Verkoopprijs</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium text-right">Acties</th>
              </tr>
            </thead>
            <tbody>
              {results.map((qt) => (
                <tr key={qt.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{qt.projectnr || '—'}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{qt.klant || '—'}</td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{qt.datum}</td>
                  <td className="px-4 py-2 text-gray-800 text-right tabular-nums whitespace-nowrap">{eur.format(qt.verkoopprijs ?? 0)}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block rounded-full bg-fst-greenTint text-fst-greenDark px-2 py-0.5 text-xs font-semibold">{qt.status}</span>
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <Link to={`/offerte/${qt.id}`} className="text-fst-green font-semibold hover:underline">Bekijk</Link>
                    <button onClick={() => verwijder(qt)} className="ml-3 text-fst-red font-semibold hover:underline">Verwijder</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
