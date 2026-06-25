import { useQuery } from '@tanstack/react-query'
import { API_ENDPOINTS, REFRESH_INTERVALS } from '../config/constants'
import { getQuoteCache, saveQuoteCache } from '../services/quoteCache'

// Hook para obtener precios de criptomonedas
export const useCryptoPrices = (coinIds: string[], ownerId: string | null) => {
  const normalizedIds = (coinIds || [])
    .map((id) => String(id || '').trim().toLowerCase())
    .filter(Boolean)

  return useQuery({
    queryKey: ['cryptoPrices', normalizedIds],
    queryFn: async (): Promise<Record<string, unknown>> => {
      if (normalizedIds.length === 0) return {}
      const ids = normalizedIds.join(',')
      const cacheKey = ids
      const apiKey = import.meta.env.VITE_COINGECKO_API_KEY
      const url = `${API_ENDPOINTS.crypto}?ids=${encodeURIComponent(ids)}&vs_currencies=usd,ars&include_24hr_change=true`
      const headers: Record<string, string> = {}
      if (apiKey) headers['x-cg-pro-api-key'] = apiKey

      try {
        const response = await fetch(url, { headers })
        if (!response.ok) {
          throw new Error('Error al obtener precios de criptomonedas')
        }

        const data = await response.json()
        const fetchedAt = new Date().toISOString()
        data._fetchedAt = fetchedAt
        await saveQuoteCache({ ownerId, type: 'crypto', key: cacheKey, data })
        return data
      } catch (error) {
        const cached = await getQuoteCache({ ownerId, type: 'crypto', key: cacheKey })
        if (cached?.data) {
          (cached.data as Record<string, unknown>)._fetchedAt = cached.fetchedAt
          return cached.data as Record<string, unknown>
        }

        throw error
      }
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
    enabled: normalizedIds.length > 0,
  })
}

// Hook para obtener cotización del dólar
export const useDolarPrice = (ownerId: string | null) => {
  return useQuery({
    queryKey: ['dolarPrice'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.dolarAPI}`)
        if (!response.ok) {
          throw new Error('Error al obtener cotización del dólar')
        }

        const data = await response.json()
        const dolares: Record<string, unknown> = {}
        data.forEach((dolar: { casa: string }) => {
          dolares[dolar.casa] = dolar
        })

        const fetchedAt = new Date().toISOString()
        dolares._fetchedAt = fetchedAt
        await saveQuoteCache({ ownerId, type: 'dolar', key: 'all', data: dolares })
        return dolares
      } catch (error) {
        const cached = await getQuoteCache({ ownerId, type: 'dolar', key: 'all' })
        if (cached?.data) {
          (cached.data as Record<string, unknown>)._fetchedAt = cached.fetchedAt
          return cached.data as Record<string, unknown>
        }

        throw error
      }
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
  })
}

// Hook para obtener cotización específica de un tipo de dólar
export const useDolarByType = (tipo: string) => {
  return useQuery({
    queryKey: ['dolar', tipo],
    queryFn: async () => {
      const endpoint = (API_ENDPOINTS as Record<string, string>)[`dolar${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`]
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
