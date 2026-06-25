import { useQuery } from '@tanstack/react-query'
import { fetchArgentineQuote } from '../services/iol'
import { ASSET_TYPES, REFRESH_INTERVALS } from '../config/constants'
import { getAllQuoteCache, buildCacheFieldKey, saveQuoteCache } from '../services/quoteCache'
import type { Asset } from '../types'

export function useArgentineQuotes(assets: Asset[], ownerId: string | null) {
  const argAssets = assets.filter(a => 
    a.type !== ASSET_TYPES.CRYPTO && 
    a.type !== ASSET_TYPES.PLAZO_FIJO && 
    a.type !== ASSET_TYPES.EFECTIVO
  )
  const symbols = argAssets.map(a => `${a.type}:${a.symbol}`).join('|')

  return useQuery({
    queryKey: ['argentineQuotes', ownerId, symbols],
    queryFn: async () => {
      // Leer TODO el cache de una sola lectura (1 round-trip, no N)
      const allCache = await getAllQuoteCache({ ownerId })

      const cacheByAssetId: Record<number, { quote: unknown; fetchedAt: string | null }> = {}
      for (const asset of argAssets) {
        const cacheKey = `${asset.type}:${asset.symbol}`
        const cacheField = buildCacheFieldKey('arg', cacheKey)
        const cached = allCache[cacheField]
        if (cached?.data) {
          cacheByAssetId[asset.id] = {
            quote: cached.data,
            fetchedAt: cached.fetchedAt || null
          }
        }
      }

      const results: Record<string | number, unknown> = {}
      let newestTimestamp: string | null = null

      for (const asset of argAssets) {
        const cacheKey = `${asset.type}:${asset.symbol}`

        try {
          const q = await fetchArgentineQuote(asset.type === 'accion' ? 'acciones' : asset.type, asset.symbol!)
          const precio = q.ultimoPrecio ?? q.precioAjuste ?? q.precioPromedio ?? 0
          if (precio !== 0) {
            const normalizedQuote = { raw: q, price: precio / q.lote }
            results[asset.id] = normalizedQuote

            const fetchedAt = new Date().toISOString()
            await saveQuoteCache({ ownerId, type: 'arg', key: cacheKey, data: normalizedQuote })
            newestTimestamp = fetchedAt
          } else {
            results[asset.id] = { raw: q, price: 'N/A' }
          }
        } catch (e) {
          const cached = cacheByAssetId[asset.id]
          if (cached?.quote) {
            results[asset.id] = cached.quote
            if (cached.fetchedAt && (!newestTimestamp || cached.fetchedAt > newestTimestamp)) {
              newestTimestamp = cached.fetchedAt
            }
          } else {
            results[asset.id] = { error: (e as Error).message, price: 'N/A' }
          }
        }
      }

      if (newestTimestamp) {
        results._fetchedAt = newestTimestamp
      }

      return results
    },
    staleTime: REFRESH_INTERVALS.slow,
    refetchInterval: REFRESH_INTERVALS.slow,
    enabled: argAssets.length > 0,
  })
}
