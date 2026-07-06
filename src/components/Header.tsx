import { NavLink } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

const linkBase = 'px-3 py-2 rounded-md text-sm font-semibold transition-colors'
function item(isActive: boolean) {
  return `${linkBase} ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
}

export default function Header() {
  return (
    <header className="bg-fst-green text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="font-heading text-2xl font-bold tracking-wide">FST</span>
          <span className="hidden sm:inline text-xs text-white/70">Coating Portal</span>
        </NavLink>
        <nav className="flex items-center gap-1 ml-auto">
          <NavLink to="/materialen" className={({ isActive }) => item(isActive)}>Materialen</NavLink>
          <NavLink to="/parameters" className={({ isActive }) => item(isActive)}>Parameters</NavLink>
          <NavLink to="/equivalenten" className={({ isActive }) => item(isActive)}>Equivalenten</NavLink>
          <NavLink to="/approvals" className={({ isActive }) => item(isActive)}>Approvals</NavLink>
          <NavLink to="/calculator" className={({ isActive }) => item(isActive)}>Calculator</NavLink>
          <NavLink to="/quote" className={({ isActive }) => item(isActive)}>Quote maken</NavLink>
          <button onClick={() => supabase.auth.signOut()}
            className="ml-2 px-3 py-2 rounded-md text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors">
            Uitloggen
          </button>
        </nav>
      </div>
    </header>
  )
}
