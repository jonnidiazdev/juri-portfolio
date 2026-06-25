import { getFirestoreClient, isFirebaseConfigured } from '../config/firebase'

interface CacheParams {
  ownerId: string | null
  type: string
  key: string
  data?: unknown
}

interface CacheEntry {
  data: unknown
  fetchedAt: string
}

function buildCacheFieldKey(type: string, key: string): string {
  const safeType = String(type || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  const safeKey = String(key || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
  return `${safeType}_${safeKey}`
}

// Guardar cotización en portfolios/{uid}.quoteCache.{field}
export async function saveQuoteCache({ ownerId, type, key, data }: CacheParams): Promise<void> {
  if (!ownerId || !isFirebaseConfigured) return

  const client = await getFirestoreClient()
  if (!client) return

  const { db, doc, serverTimestamp, setDoc } = client
  const cacheField = buildCacheFieldKey(type, key)

  try {
    await setDoc(
      doc(db, 'portfolios', ownerId),
      {
        [`quoteCache.${cacheField}`]: {
          data,
          fetchedAt: new Date().toISOString()
        },
        updatedAt: serverTimestamp()
      },
      { merge: true }
    )
  } catch (error) {
    console.error('No se pudo guardar cache de cotizaciones.', error)
  }
}

// Leer cotización desde portfolios/{uid}.quoteCache.{field}
export async function getQuoteCache({ ownerId, type, key }: CacheParams): Promise<CacheEntry | null> {
  if (!ownerId || !isFirebaseConfigured) return null

  const client = await getFirestoreClient()
  if (!client) return null

  const { db, doc, getDoc } = client
  const cacheField = buildCacheFieldKey(type, key)

  try {
    const snapshot = await getDoc(doc(db, 'portfolios', ownerId))
    if (!snapshot.exists()) return null

    const cacheValue = snapshot.data()?.quoteCache?.[cacheField]
    if (!cacheValue?.data) return null

    return cacheValue
  } catch (error) {
    console.error('No se pudo leer cache de cotizaciones.', error)
    return null
  }
}

// Leer TODAS las cotizaciones cacheadas de una sola lectura
export async function getAllQuoteCache({ ownerId }: { ownerId: string | null }): Promise<Record<string, CacheEntry>> {
  if (!ownerId || !isFirebaseConfigured) return {}

  const client = await getFirestoreClient()
  if (!client) return {}

  const { db, doc, getDoc } = client

  try {
    const snapshot = await getDoc(doc(db, 'portfolios', ownerId))
    if (!snapshot.exists()) return {}

    return snapshot.data()?.quoteCache || {}
  } catch (error) {
    console.error('No se pudo leer cache de cotizaciones.', error)
    return {}
  }
}

// Exponer buildCacheFieldKey para uso externo
export { buildCacheFieldKey }
