import { NavLink } from 'react-router-dom'

export default function AppNav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste ${
      isActive
        ? 'bg-celeste/15 text-celeste border border-celeste/30'
        : 'text-muted border border-transparent hover:text-paper hover:border-border'
    }`

  return (
    <nav className="flex gap-2" aria-label="Navegación principal">
      <NavLink to="/" end className={linkClass}>
        Activos
      </NavLink>
      <NavLink to="/evolucion" className={linkClass}>
        Evolución
      </NavLink>
    </nav>
  )
}
