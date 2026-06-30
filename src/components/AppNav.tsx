import { NavLink } from 'react-router-dom'

function TrendIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

export default function AppNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste ${
      isActive
        ? 'bg-celeste/15 text-celeste border border-celeste/30'
        : 'text-paper/80 border border-transparent hover:text-paper hover:bg-white/5 hover:border-celeste/10'
    }`

  return (
    <nav className="card inline-flex gap-2 p-2 shrink-0" aria-label="Navegación principal">
        <NavLink to="/" end className={linkClass}>
          Activos
        </NavLink>
        <NavLink to="/evolucion" className={linkClass}>
          <TrendIcon />
          Evolución
        </NavLink>
      </nav>
  )
}
