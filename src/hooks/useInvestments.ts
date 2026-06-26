import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { API_ENDPOINTS, REFRESH_INTERVALS } from '../config/constants'
import { getQuoteCache, saveQuoteCache } from '../services/quoteCache'
import type { CryptoPriceData, CryptoPrices, DolarPrices, DolarQuote } from '../types'

export function useCryptoPrices(
  coinIds: string[],
  ownerId: string | null
): UseQueryResult<CryptoPrices> {
  const normalizedIds = (coinIds || [])
    .map((id) => String(id || '').trim().toLowerCase())
    .filter(Boolean)

  return useQuery({
    queryKey: ['cryptoPrices', normalizedIds],
    queryFn: async (): Promise<CryptoPrices> => {
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

        const data = await response.json() as Record<string, CryptoPriceData>
        const fetchedAt = new Date().toISOString()
        const result: CryptoPrices = { ...data, _fetchedAt: fetchedAt }
        await saveQuoteCache({ ownerId, type: 'crypto', key: cacheKey, data: result })
        return result
      } catch (error) {
        const cached = await getQuoteCache({ ownerId, type: 'crypto', key: cacheKey })
        if (cached?.data) {
          const cachedData: CryptoPrices = {
            ...(cached.data as Record<string, CryptoPriceData>),
            _fetchedAt: cached.fetchedAt ?? undefined,
          }
          return cachedData
        }

        throw error
      }
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
    enabled: normalizedIds.length > 0,
  })
}

export function useDolarPrice(ownerId: string | null): UseQueryResult<DolarPrices> {
  return useQuery({
    queryKey: ['dolarPrice'],
    queryFn: async (): Promise<DolarPrices> => {
      try {
        const response = await fetch(`${API_ENDPOINTS.dolarAPI}`)
        if (!response.ok) {
          throw new Error('Error al obtener cotización del dólar')
        }

        const data = await response.json() as Array<DolarQuote & { casa: string }>
        const dolares: DolarPrices = {}
        data.forEach((dolar) => {
          const key = dolar.casa as keyof Omit<DolarPrices, '_fetchedAt'>
          dolares[key] = dolar
        })

        const fetchedAt = new Date().toISOString()
        dolares._fetchedAt = fetchedAt
        await saveQuoteCache({ ownerId, type: 'dolar', key: 'all', data: dolares })
        return dolares
      } catch (error) {
        const cached = await getQuoteCache({ ownerId, type: 'dolar', key: 'all' })
        if (cached?.data) {
          const cachedData = cached.data as DolarPrices
          cachedData._fetchedAt = cached.fetchedAt ?? undefined
          return cachedData
        }

        throw error
      }
    },
    staleTime: REFRESH_INTERVALS.normal,
    refetchInterval: REFRESH_INTERVALS.normal,
  })
}
