import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchArgentineQuote } from '../services/iol'
import { ASSET_TYPES, REFRESH_INTERVALS, IOL_QUOTE_FETCH_DELAY_MS } from '../config/constants'
import {
  getAllQuoteCache,
  buildCacheFieldKey,
  saveQuoteCache,
  isQuoteCacheFresh,
} from '../services/quoteCache'
import type { Asset, ArgentineQuotes } from '../types'

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

function getIOLQuoteTipo(assetType: string): string {
  if (assetType === ASSET_TYPES.STOCK) return 'acciones'
  return assetType
}

export function useArgentineQuotes(assets: Asset[], ownerId: string | null) {
  const argAssets = useMemo(
    () => assets.filter(a =>
      a.type !== ASSET_TYPES.CRYPTO &&
      a.type !== ASSET_TYPES.PLAZO_FIJO &&
      a.type !== ASSET_TYPES.EFECTIVO
    ),
    [assets]
  )

  const symbols = useMemo(
    () => argAssets
      .map(a => `${a.type}:${a.symbol}`)
      .sort()
      .join('|'),
    [argAssets]
  )

  return useQuery({
    queryKey: ['argentineQuotes', ownerId, symbols],
    queryFn: async (): Promise<ArgentineQuotes> => {
      const allCache = await getAllQuoteCache({ ownerId })

      const cacheByAssetId: Record<number, { quote: unknown; fetchedAt: string | null }> = {}
      for (const asset of argAssets) {
        const cacheKey = `${asset.type}:${asset.symbol}`
        const cacheField = buildCacheFieldKey('arg', cacheKey)
        const cached = allCache[cacheField]
        if (cached?.data) {
          cacheByAssetId[asset.id] = {
            quote: cached.data,
            fetchedAt: cached.fetchedAt || null,
          }
        }
      }

      const results: ArgentineQuotes = {}
      let newestTimestamp: string | null = null
      let fetchedFromNetwork = false

      for (const asset of argAssets) {
        const cacheKey = `${asset.type}:${asset.symbol}`
        const cached = cacheByAssetId[asset.id]

        if (cached?.quote && isQuoteCacheFresh(cached.fetchedAt, REFRESH_INTERVALS.slow)) {
          results[asset.id] = cached.quote as ArgentineQuotes[number]
          if (cached.fetchedAt && (!newestTimestamp || cached.fetchedAt > newestTimestamp)) {
            newestTimestamp = cached.fetchedAt
          }
          continue
        }

        if (fetchedFromNetwork) {
          await delay(IOL_QUOTE_FETCH_DELAY_MS)
        }

        try {
          fetchedFromNetwork = true
          const q = await fetchArgentineQuote(getIOLQuoteTipo(asset.type), asset.symbol!)
          const precio = q.ultimoPrecio ?? q.precioAjuste ?? q.precioPromedio ?? 0

          if (precio !== 0) {
            const normalizedQuote = { raw: q, price: precio / q.lote }
            const fetchedAt = new Date().toISOString()
            await saveQuoteCache({ ownerId, type: 'arg', key: cacheKey, data: normalizedQuote })
            results[asset.id] = normalizedQuote
            if (!newestTimestamp || fetchedAt > newestTimestamp) {
              newestTimestamp = fetchedAt
            }
          } else {
            results[asset.id] = { raw: q, price: 'N/A' }
          }
        } catch (e) {
          if (cached?.quote) {
            results[asset.id] = cached.quote as ArgentineQuotes[number]
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
