import { useState, useEffect } from 'react'
import { IOL_SESSION_CHANGED, hasIOLSession } from '../services/iolSession'

export function useIOLSession(): boolean {
  const [hasSession, setHasSession] = useState(hasIOLSession)

  useEffect(() => {
    const checkSession = () => setHasSession(hasIOLSession())

    checkSession()
    window.addEventListener('storage', checkSession)
    window.addEventListener(IOL_SESSION_CHANGED, checkSession)

    const interval = setInterval(checkSession, 30000)

    return () => {
      window.removeEventListener('storage', checkSession)
      window.removeEventListener(IOL_SESSION_CHANGED, checkSession)
      clearInterval(interval)
    }
  }, [])

  return hasSession
}
