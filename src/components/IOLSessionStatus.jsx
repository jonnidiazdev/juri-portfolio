import { useState, useEffect } from 'react'

export default function IOLSessionStatus() {
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const checkSession = () => {
      const sessionToken = localStorage.getItem('iol-session-token')
      setHasSession(!!sessionToken)
    }

    // Verificar inicialmente
    checkSession()

    // Escuchar cambios en localStorage
    window.addEventListener('storage', checkSession)
    
    // También verificar cada 30 segundos por si el token expira
    const interval = setInterval(checkSession, 30000)

    return () => {
      window.removeEventListener('storage', checkSession)
      clearInterval(interval)
    }
  }, [])

  if (!hasSession) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 flex items-center gap-2 text-yellow-300 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span>Configura credenciales IOL para ver cotizaciones argentinas</span>
      </div>
    )
  }

  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 flex items-center gap-2 text-green-300 text-sm">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Sesión IOL activa - Cotizaciones argentinas disponibles</span>
    </div>
  )
}