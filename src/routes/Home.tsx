import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMaterials } from '../lib/data'

export default function Home() {
  const [total, setTotal] = useState(0)
  const [actief, setActief] = useState(0)

  useEffect(() => {
    getMaterials().then((m) => {
      setTotal(m.length)
      setActief(m.filter((x) => x.status !== 'stop').length)
    })
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">FST Coating Portal</h1>
      <p className="mt-2 text-gray-600 max-w-2xl">
        Interne tool voor coating-kennis en offertes. Materialen en spuitparameters zijn
        doorzoekbaar; de quote-generator en AI-assistent volgen.
      </p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Materialen" value={total} />
        <Stat label="Actief" value={actief} />
        <Stat label="Types" value={4} />
        <Stat label="Uitgefaseerd" value={total - actief} />
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/materialen" className="inline-block bg-fst-green text-white font-semibold px-5 py-2.5 rounded-md hover:bg-fst-greenDark transition-colors">Materialen →</Link>
        <Link to="/parameters" className="inline-block border border-fst-green text-fst-green font-semibold px-5 py-2.5 rounded-md hover:bg-fst-greenTint transition-colors">Parameters →</Link>
        <Link to="/quote?wizard=1" className="inline-block border border-fst-green text-fst-green font-semibold px-5 py-2.5 rounded-md hover:bg-fst-greenTint transition-colors">Nieuwe quote via wizard →</Link>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="font-heading text-3xl font-bold text-fst-green">{value}</div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}
