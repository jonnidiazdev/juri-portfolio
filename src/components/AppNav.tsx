import { NavLink } from 'react-router-dom'

function TrendIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function FlaskIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6v1.5l4 7.5a3 3 0 01-2.6 4.5H7.6A3 3 0 015 12l4-7.5V3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6M10 12h4" />
    </svg>
  )
}

export default function AppNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2.5 text-sm font-medium rounded-md transition-colors inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste ${
      isActive
        ? 'bg-celeste/15 text-celeste border border-celeste/30'
        : 'text-paper/80 bg-surface border border-border hover:text-paper hover:border-border-light hover:bg-surface-raised'
    }`

  return (
    <div className="sticky top-0 z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-4 bg-ink/95 backdrop-blur-sm border-b border-border">
      <nav className="flex gap-2" aria-label="Navegación principal">
        <NavLink to="/" end className={linkClass}>
          Activos
        </NavLink>
        <NavLink to="/evolucion" className={linkClass}>
          <TrendIcon />
          Evolución
        </NavLink>
        <NavLink to="/laboratorio" className={linkClass}>
          <FlaskIcon />
          Laboratorio
        </NavLink>
      </nav>
    </div>
  )
}
