// Servicio frontend para consumir el backend proxy de IOL
export async function fetchArgentineQuote(tipo, simbolo) {
  // En producción usa URL relativa, en desarrollo localhost
  const base = import.meta.env.PROD ? '' : 'http://localhost:4000'
  const url = `${base}/api/iol/quote/${tipo}/${simbolo}`
  
  const resp = await fetch(url)
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error || 'Error obteniendo cotización de IOL')
  }
  const data = await resp.json()
  return data.data
}
