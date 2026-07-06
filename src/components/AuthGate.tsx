import { ReactNode } from 'react'
import { useSession } from '../lib/session'
import Login from '../routes/Login'

export default function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Laden…</div>
  if (!session) return <Login />
  return <>{children}</>
}
