import { useEffect, useMemo, useState } from 'react'
import type { ApprovalRow } from '../types'
import { getApprovals } from '../lib/data'

const OEMS = ['GE', 'PWA', 'RR', 'AMS', 'Textron', 'Honeywell']

export default function Approvals() {
  const [rows, setRows] = useState<ApprovalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [onlyApproved, setOnlyApproved] = useState(false)

  useEffect(() => { getApprovals().then((r) => { setRows(r); setLoading(false) }) }, [])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows.filter((r) => {
      if (onlyApproved && Object.keys(r.approvals ?? {}).length === 0) return false
      if (!needle) return true
      return [r.pac_product, r.omschrijving, r.metco]
        .some((v) => (v ?? '').toLowerCase().includes(needle))
    })
  }, [rows, q, onlyApproved])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
      <p className="mt-1 text-sm text-gray-600">
        De gecureerde PAC-approvalslijst: per product het toegekende spec-nummer per OEM.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Zoek op product, omschrijving of Metco…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={onlyApproved} onChange={(e) => setOnlyApproved(e.target.checked)} /> Alleen met approval
        </label>
      </div>

      <p className="mt-4 text-sm text-gray-500">{loading ? 'Laden…' : `${results.length} producten`}</p>

      <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">PAC-product</th>
              <th className="px-4 py-2 font-medium">Omschrijving</th>
              <th className="px-4 py-2 font-medium">Metco</th>
              {OEMS.map((oem) => <th key={oem} className="px-4 py-2 font-medium">{oem}</th>)}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium text-gray-800 whitespace-nowrap">{r.pac_product}</td>
                <td className="px-4 py-2 text-gray-600">{r.omschrijving || '—'}</td>
                <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{r.metco || '—'}</td>
                {OEMS.map((oem) => {
                  const spec = r.approvals?.[oem]
                  return (
                    <td key={oem} className="px-4 py-2 whitespace-nowrap">
                      {spec
                        ? <span className="inline-block rounded-full bg-fst-greenTint text-fst-greenDark px-2 py-0.5 text-xs font-semibold">{spec}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
