import { useQuery } from '@tanstack/react-query'
import { API_ENDPOINTS, REFRESH_INTERVALS } from '../config/constants'

// Hook para obtener precios de criptomonedas
export const useCryptoPrices = (coinIds) => {
  return useQuery({
    queryKey: ['cryptoPrices', coinIds],
    queryFn: async () => {
      if (!coinIds || coinIds.length === 0) return {}
      const ids = coinIds.join(',')
      const apiKey = import.meta.env.VITE_COINGECKO_API_KEY
      const url = `${API_ENDPOINTS.crypto}?symbols=${ids}&vs_currencies=usd,ars&include_24hr_change=true`
      const headers = {}
      if (apiKey) headers['x-cg-pro-api-key'] = apiKey
      const response = await fetch(url, { headers })
      if (!response.ok) {
        throw new Error('Error al obtener precios de criptomonedas')
      }
      return response.json()
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
    enabled: coinIds && coinIds.length > 0,
  })
}

// Hook para obtener cotización del dólar
export const useDolarPrice = () => {
  return useQuery({
    queryKey: ['dolarPrice'],
    queryFn: async () => {
      const response = await fetch(`${API_ENDPOINTS.dolarAPI}`)
      if (!response.ok) {
        throw new Error('Error al obtener cotización del dólar')
      }
      const data = await response.json()
      // Convertir array a objeto con keys por tipo de dólar
      const dolares = {}
      data.forEach(dolar => {
        dolares[dolar.casa] = dolar
      })
      return dolares
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
  })
}

// Hook para obtener cotización específica de un tipo de dólar
export const useDolarByType = (tipo) => {
  return useQuery({
    queryKey: ['dolar', tipo],
    queryFn: async () => {
      const endpoint = API_ENDPOINTS[`dolar${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`]
      if (!endpoint) throw new Error(`Tipo de dólar no válido: ${tipo}`)
      
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Error al obtener cotización del dólar ${tipo}`)
      }
      return response.json()
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
    enabled: !!tipo,
  })
}
