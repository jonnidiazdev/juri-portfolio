import { Outlet, Link, useLocation, useOutletContext } from 'react-router-dom'
import type { PortfolioOutletContext } from '../hooks/usePortfolioOutletContext'

const CHILD_LABELS: Record<string, string> = {
  '/laboratorio/huerto': 'Huerto de inversiones',
}

export default function LaboratorioLayout() {
  const outletContext = useOutletContext<PortfolioOutletContext>()
  const { pathname } = useLocation()
  const isHub = pathname === '/laboratorio'
  const childLabel = CHILD_LABELS[pathname]

  return (
    <div className="animate-fade-in">
      {!isHub && childLabel && (
        <nav aria-label="Miga de pan" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted mb-2">
            <li>
              <Link to="/laboratorio" className="hover:text-celeste transition-colors">
                Laboratorio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-paper" aria-current="page">
              {childLabel}
            </li>
          </ol>
          <Link
            to="/laboratorio"
            className="text-sm text-celeste hover:underline inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al laboratorio
          </Link>
        </nav>
      )}
      <Outlet context={outletContext} />
    </div>
  )
}
