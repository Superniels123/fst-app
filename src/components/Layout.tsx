import { ReactNode } from 'react'
import Header from './Header'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
        FST — Flame Spray Technologies · interne tool (skeleton Fase 1)
      </footer>
    </div>
  )
}
