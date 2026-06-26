import { getFirestoreClient, isFirebaseConfigured } from '../config/firebase'

interface CacheParams {
  ownerId: string | null
  type: string
  key: string
  data?: unknown
}

export interface CacheEntry {
  data: unknown
  fetchedAt: string
}

interface CacheBatchItem {
  type: string
  key: string
  data: unknown
}

function buildCacheFieldKey(type: string, key: string): string {
  const safeType = String(type || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  const safeKey = String(key || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  return `${safeType}_${safeKey}`
}

function getLocalStorageCacheKey(ownerId: string | null): string {
  return `juri-quote-cache:${ownerId ?? 'anon'}`
}

function readLocalQuoteCache(ownerId: string | null): Record<string, CacheEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(getLocalStorageCacheKey(ownerId))
    return raw ? JSON.parse(raw) as Record<string, CacheEntry> : {}
  } catch {
    return {}
  }
}

function writeLocalQuoteCache(ownerId: string | null, cache: Record<string, CacheEntry>): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getLocalStorageCacheKey(ownerId), JSON.stringify(cache))
  } catch (error) {
    console.warn('No se pudo guardar cache local de cotizaciones.', error)
  }
}

function pickNewerEntry(a?: CacheEntry, b?: CacheEntry): CacheEntry | undefined {
  if (!a) return b
  if (!b) return a
  return new Date(a.fetchedAt) >= new Date(b.fetchedAt) ? a : b
}

function mergeQuoteCaches(...caches: Record<string, CacheEntry>[]): Record<string, CacheEntry> {
  const merged: Record<string, CacheEntry> = {}
  for (const cache of caches) {
    for (const [field, entry] of Object.entries(cache)) {
      merged[field] = pickNewerEntry(merged[field], entry) ?? entry
    }
  }
  return merged
}

export function isQuoteCacheFresh(
  fetchedAt: string | null | undefined,
  maxAgeMs: number
): boolean {
  if (!fetchedAt) return false
  const age = Date.now() - new Date(fetchedAt).getTime()
  return age >= 0 && age < maxAgeMs
}

async function readFirestoreQuoteCache(ownerId: string): Promise<Record<string, CacheEntry>> {
  const client = await getFirestoreClient()
  if (!client) return {}

  const { db, doc, getDoc } = client

  try {
    const snapshot = await getDoc(doc(db, 'portfolios', ownerId))
    if (!snapshot.exists()) return {}
    return snapshot.data()?.quoteCache || {}
  } catch (error) {
    console.error('No se pudo leer cache de cotizaciones en Firestore.', error)
    return {}
  }
}

function persistQuoteCacheToFirestore(
  ownerId: string,
  entries: Record<string, CacheEntry>
): void {
  void (async () => {
    const client = await getFirestoreClient()
    if (!client) return

    const { db, doc, serverTimestamp, setDoc } = client
    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }

    for (const [field, entry] of Object.entries(entries)) {
      updates[`quoteCache.${field}`] = entry
    }

    try {
      await setDoc(doc(db, 'portfolios', ownerId), updates, { merge: true })
    } catch (error) {
      console.error('No se pudo guardar cache de cotizaciones en Firestore.', error)
    }
  })()
}

export function getLocalQuoteCache(ownerId: string | null): Record<string, CacheEntry> {
  return readLocalQuoteCache(ownerId)
}

export function saveQuoteCacheBatch(ownerId: string | null, items: CacheBatchItem[]): void {
  if (items.length === 0) return

  const localCache = readLocalQuoteCache(ownerId)
  const firestoreEntries: Record<string, CacheEntry> = {}

  for (const { type, key, data } of items) {
    const cacheField = buildCacheFieldKey(type, key)
    const entry: CacheEntry = {
      data,
      fetchedAt: new Date().toISOString(),
    }
    localCache[cacheField] = entry
    firestoreEntries[cacheField] = entry
  }

  writeLocalQuoteCache(ownerId, localCache)

  if (ownerId && isFirebaseConfigured) {
    persistQuoteCacheToFirestore(ownerId, firestoreEntries)
  }
}

// Guardar en localStorage (sync) + Firestore (background)
export function saveQuoteCache({ ownerId, type, key, data }: CacheParams): void {
  if (data === undefined) return
  saveQuoteCacheBatch(ownerId, [{ type, key, data }])
}

export async function getQuoteCache({ ownerId, type, key }: CacheParams): Promise<CacheEntry | null> {
  const cacheField = buildCacheFieldKey(type, key)
  const localEntry = readLocalQuoteCache(ownerId)[cacheField]

  if (!ownerId || !isFirebaseConfigured) {
    return localEntry?.data ? localEntry : null
  }

  const remoteCache = await readFirestoreQuoteCache(ownerId)
  const entry = pickNewerEntry(localEntry, remoteCache[cacheField])
  return entry?.data ? entry : null
}

export async function getAllQuoteCache({ ownerId }: { ownerId: string | null }): Promise<Record<string, CacheEntry>> {
  const localCache = readLocalQuoteCache(ownerId)

  if (!ownerId || !isFirebaseConfigured) {
    return localCache
  }

  const remoteCache = await readFirestoreQuoteCache(ownerId)
  return mergeQuoteCaches(localCache, remoteCache)
}

export { buildCacheFieldKey }
