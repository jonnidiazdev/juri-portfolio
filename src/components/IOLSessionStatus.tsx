import { useIOLSession } from '../hooks/useIOLSession'

export default function IOLSessionStatus() {
  const hasSession = useIOLSession()

  if (!hasSession) {
    return (
      <div className="status-banner bg-peso/10 border border-peso/25 text-peso">
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Configurá credenciales IOL para ver cotizaciones argentinas</span>
      </div>
    )
  }

  return (
    <div className="status-banner bg-profit/10 border border-profit/25 text-profit">
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Sesión IOL activa — cotizaciones argentinas disponibles</span>
    </div>
  )
}
