import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Quote, QuoteLine } from '../types'
import { getQuote } from '../lib/data'

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export default function OfferteDetail() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<{ quote: Quote; lines: QuoteLine[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getQuote(id).then((d) => { setData(d); setLoading(false) })
  }, [id])

  if (loading) return <p className="text-sm text-gray-500">Laden…</p>
  if (!data) return (
    <div>
      <p className="text-sm text-gray-600">Offerte niet gevonden.</p>
      <Link to="/offertes" className="mt-2 inline-block text-fst-green font-semibold hover:underline">← Terug naar offertes</Link>
    </div>
  )

  const { quote, lines } = data

  return (
    <div>
      <Link to="/offertes" className="text-sm text-fst-green font-semibold hover:underline">← Offertes</Link>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{quote.klant || '—'}</h1>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
        <span>Projectnr: <span className="font-medium text-gray-800">{quote.projectnr || '—'}</span></span>
        <span>Datum: <span className="font-medium text-gray-800">{quote.datum}</span></span>
        <span>Status: <span className="inline-block rounded-full bg-fst-greenTint text-fst-greenDark px-2 py-0.5 text-xs font-semibold">{quote.status}</span></span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Soort</th>
              <th className="px-4 py-2 font-medium">Omschrijving</th>
              <th className="px-4 py-2 font-medium text-right">Aantal</th>
              <th className="px-4 py-2 font-medium text-right">Uren</th>
              <th className="px-4 py-2 font-medium text-right">Tarief / Kostprijs</th>
              <th className="px-4 py-2 font-medium text-right">Regeltotaal</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-600 capitalize whitespace-nowrap">{l.soort}</td>
                <td className="px-4 py-2 text-gray-800">
                  {l.omschrijving}
                  {l.categorie && <span className="block text-xs text-gray-400">{l.categorie}</span>}
                </td>
                <td className="px-4 py-2 text-gray-600 text-right tabular-nums">{l.aantal ?? '—'}</td>
                <td className="px-4 py-2 text-gray-600 text-right tabular-nums">{l.uren ?? '—'}</td>
                <td className="px-4 py-2 text-gray-600 text-right tabular-nums whitespace-nowrap">
                  {l.soort === 'arbeid'
                    ? (l.tarief != null ? `${eur.format(l.tarief)}/u` : '—')
                    : (l.kostprijs != null ? eur.format(l.kostprijs) : '—')}
                </td>
                <td className="px-4 py-2 text-gray-800 text-right tabular-nums whitespace-nowrap">{eur.format(l.regel_totaal ?? 0)}</td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">Geen regels.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 sm:ml-auto sm:max-w-xs rounded-lg border border-gray-200 p-5">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-600">Materiaalkosten</dt><dd className="font-medium text-gray-800 tabular-nums">{eur.format(quote.materiaalkosten ?? 0)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-600">Arbeidskosten</dt><dd className="font-medium text-gray-800 tabular-nums">{eur.format(quote.arbeidskosten ?? 0)}</dd></div>
          <div className="flex justify-between border-t border-gray-100 pt-2"><dt className="font-semibold text-gray-800">Totale kostprijs (COGS)</dt><dd className="font-bold text-gray-900 tabular-nums">{eur.format(quote.cogs ?? 0)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-600">Marge</dt><dd className="font-medium text-gray-800 tabular-nums">{quote.marge_pct}%</dd></div>
          <div className="flex justify-between border-t border-gray-100 pt-2"><dt className="font-semibold text-fst-greenDark">Verkoopprijs</dt><dd className="font-bold text-fst-greenDark tabular-nums">{eur.format(quote.verkoopprijs ?? 0)}</dd></div>
        </dl>
      </div>
    </div>
  )
}
