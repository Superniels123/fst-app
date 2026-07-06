import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Inloggen mislukt. Controleer je gegevens.')
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="font-heading text-3xl font-bold text-fst-green">FST</div>
          <div className="text-sm text-gray-500">Coating Portal — inloggen</div>
        </div>
        {error && <div className="mb-3 text-sm text-fst-red bg-fst-red/10 rounded px-3 py-2">{error}</div>}
        <label className="block text-xs text-gray-500 mb-1">E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full mb-3 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
        <label className="block text-xs text-gray-500 mb-1">Wachtwoord</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
          className="w-full mb-4 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-fst-green focus:ring-1 focus:ring-fst-green outline-none" />
        <button type="submit" disabled={busy}
          className="w-full bg-fst-green text-white font-semibold py-2.5 rounded-md hover:bg-fst-greenDark transition-colors disabled:opacity-60">
          {busy ? 'Bezig…' : 'Inloggen'}
        </button>
        <p className="mt-4 text-xs text-gray-400 text-center">Alleen voor FST-medewerkers. Geen account? Vraag een uitnodiging aan de beheerder.</p>
      </form>
    </div>
  )
}
