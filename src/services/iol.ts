import { clearIOLSession } from './iolSession'
import { queryClient } from '../config/queryClient'

// Servicio frontend para consumir el backend proxy de IOL
export async function fetchArgentineQuote(tipo: string, simbolo: string) {
  const url = `/api/iol/quote/${tipo}/${simbolo}`
  
  // Obtener session token desde localStorage
  const sessionToken = localStorage.getItem('iol-session-token')
  
  if (!sessionToken) {
    throw new Error('No hay sesión activa. Por favor configura tus credenciales de IOL.')
  }
  
  const headers = {
    'x-session-token': sessionToken
  }
  
  const resp = await fetch(url, { headers })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))

    if (resp.status === 401) {
      clearIOLSession('expired')
      queryClient.invalidateQueries({ queryKey: ['argentineQuotes'] })
    }

    const message = err.error || `Error obteniendo cotización (${resp.status})`
    throw new Error(message)
  }
  const data = await resp.json()
  return data.data
}
