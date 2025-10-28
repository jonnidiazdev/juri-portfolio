// Servicio frontend para consumir el backend proxy de IOL
export async function fetchArgentineQuote(tipo, simbolo) {
  // En producción usa URL relativa, en desarrollo localhost
  const base = import.meta.env.PROD ? '' : 'http://localhost:4000'
  const url = `${base}/api/iol/quote/${tipo}/${simbolo}`
  
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
    
    // Si es error de autenticación, limpiar token local
    if (resp.status === 401) {
      localStorage.removeItem('iol-session-token')
    }
    
    throw new Error(err.error || 'Error obteniendo cotización')
  }
  const data = await resp.json()
  return data.data
}
