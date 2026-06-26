import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchArgentineQuote } from '../services/iol'
import { ASSET_TYPES, REFRESH_INTERVALS, IOL_QUOTE_CONCURRENCY } from '../config/constants'
import {
  getAllQuoteCache,
  buildCacheFieldKey,
  saveQuoteCacheBatch,
  isQuoteCacheFresh,
  getLocalQuoteCache,
  type CacheEntry,
} from '../services/quoteCache'
import type { Asset, ArgentineQuotes } from '../types'

function getIOLQuoteTipo(assetType: string): string {
  if (assetType === ASSET_TYPES.STOCK) return 'acciones'
  return assetType
}

function buildCacheByAssetId(
  argAssets: Asset[],
  allCache: Record<string, CacheEntry>
): Record<number, { quote: unknown; fetchedAt: string | null }> {
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

  return cacheByAssetId
}

function buildResultsFromCache(
  argAssets: Asset[],
  allCache: Record<string, CacheEntry>
): ArgentineQuotes | undefined {
  const results: ArgentineQuotes = {}
  let newestTimestamp: string | null = null
  let hasAny = false

  for (const asset of argAssets) {
    const cacheKey = `${asset.type}:${asset.symbol}`
    const cacheField = buildCacheFieldKey('arg', cacheKey)
    const cached = allCache[cacheField]
    if (cached?.data) {
      hasAny = true
      results[asset.id] = cached.data as ArgentineQuotes[number]
      if (cached.fetchedAt && (!newestTimestamp || cached.fetchedAt > newestTimestamp)) {
        newestTimestamp = cached.fetchedAt
      }
    }
  }

  if (!hasAny) return undefined
  if (newestTimestamp) results._fetchedAt = newestTimestamp
  return results
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  limit: number
): Promise<T[]> {
  if (tasks.length === 0) return []

  const results: T[] = new Array(tasks.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < tasks.length) {
      const index = nextIndex++
      results[index] = await tasks[index]()
    }
  }

  const workers = Math.min(limit, tasks.length)
  await Promise.all(Array.from({ length: workers }, () => worker()))
  return results
}

interface AssetFetchResult {
  assetId: number
  quote: ArgentineQuotes[number]
  cacheEntry?: { type: string; key: string; data: unknown }
  fetchedAt?: string
}

async function fetchAssetQuote(
  asset: Asset,
  cached: { quote: unknown; fetchedAt: string | null } | undefined
): Promise<AssetFetchResult> {
  const cacheKey = `${asset.type}:${asset.symbol}`

  try {
    const q = await fetchArgentineQuote(getIOLQuoteTipo(asset.type), asset.symbol!)
    const precio = q.ultimoPrecio ?? q.precioAjuste ?? q.precioPromedio ?? 0

    if (precio !== 0) {
      const normalizedQuote = { raw: q, price: precio / q.lote }
      const fetchedAt = new Date().toISOString()
      return {
        assetId: asset.id,
        quote: normalizedQuote,
        cacheEntry: { type: 'arg', key: cacheKey, data: normalizedQuote },
        fetchedAt,
      }
    }

    return { assetId: asset.id, quote: { raw: q, price: 'N/A' } }
  } catch (e) {
    if (cached?.quote) {
      return {
        assetId: asset.id,
        quote: cached.quote as ArgentineQuotes[number],
        fetchedAt: cached.fetchedAt ?? undefined,
      }
    }

    return {
      assetId: asset.id,
      quote: { error: (e as Error).message, price: 'N/A' },
    }
  }
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

  const placeholderData = useMemo(
    () => buildResultsFromCache(argAssets, getLocalQuoteCache(ownerId)),
    [argAssets, ownerId]
  )

  return useQuery({
    queryKey: ['argentineQuotes', ownerId, symbols],
    queryFn: async (): Promise<ArgentineQuotes> => {
      const allCache = await getAllQuoteCache({ ownerId })
      const cacheByAssetId = buildCacheByAssetId(argAssets, allCache)

      const results: ArgentineQuotes = {}
      let newestTimestamp: string | null = null
      const staleAssets: Asset[] = []

      for (const asset of argAssets) {
        const cached = cacheByAssetId[asset.id]

        if (cached?.quote && isQuoteCacheFresh(cached.fetchedAt, REFRESH_INTERVALS.slow)) {
          results[asset.id] = cached.quote as ArgentineQuotes[number]
          if (cached.fetchedAt && (!newestTimestamp || cached.fetchedAt > newestTimestamp)) {
            newestTimestamp = cached.fetchedAt
          }
        } else {
          staleAssets.push(asset)
        }
      }

      if (staleAssets.length > 0) {
        const fetchResults = await runWithConcurrency(
          staleAssets.map(asset => () => fetchAssetQuote(asset, cacheByAssetId[asset.id])),
          IOL_QUOTE_CONCURRENCY
        )

        const batchItems: Array<{ type: string; key: string; data: unknown }> = []

        for (const fetchResult of fetchResults) {
          results[fetchResult.assetId] = fetchResult.quote
          if (fetchResult.cacheEntry) batchItems.push(fetchResult.cacheEntry)
          if (fetchResult.fetchedAt && (!newestTimestamp || fetchResult.fetchedAt > newestTimestamp)) {
            newestTimestamp = fetchResult.fetchedAt
          }
        }

        saveQuoteCacheBatch(ownerId, batchItems)
      }

      if (newestTimestamp) {
        results._fetchedAt = newestTimestamp
      }

      return results
    },
    placeholderData,
    staleTime: REFRESH_INTERVALS.slow,
    refetchInterval: REFRESH_INTERVALS.slow,
    retry: 0,
    enabled: argAssets.length > 0,
  })
}
