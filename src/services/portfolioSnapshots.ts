import { getFirestoreClient, isFirebaseConfigured } from '../config/firebase'
import type { PortfolioSnapshot, PortfolioSnapshotPayload } from '../types'

function mapDocToSnapshot(id: string, data: Record<string, unknown>): PortfolioSnapshot {
  return {
    id,
    capturedAt: String(data.capturedAt ?? ''),
    currencyPreference: String(data.currencyPreference ?? ''),
    exchangeRate: Number(data.exchangeRate ?? 0),
    exchangeRateName: String(data.exchangeRateName ?? ''),
    totalsARS: data.totalsARS as PortfolioSnapshot['totalsARS'],
    totalsUSD: data.totalsUSD as PortfolioSnapshot['totalsUSD'],
    byTypeARS: data.byTypeARS as PortfolioSnapshot['byTypeARS'],
    byTypeUSD: data.byTypeUSD as PortfolioSnapshot['byTypeUSD'],
  }
}

export async function savePortfolioSnapshot(
  ownerId: string,
  payload: PortfolioSnapshotPayload
): Promise<PortfolioSnapshot> {
  if (!ownerId || !isFirebaseConfigured) {
    throw new Error('Firebase no está configurado o no hay sesión activa.')
  }

  const client = await getFirestoreClient()
  if (!client) {
    throw new Error('No se pudo conectar con Firebase.')
  }

  const { db, collection, addDoc } = client
  const snapshotsRef = collection(db, 'portfolios', ownerId, 'snapshots')

  try {
    const docRef = await addDoc(snapshotsRef, payload)
    return mapDocToSnapshot(docRef.id, payload as unknown as Record<string, unknown>)
  } catch (error) {
    console.error('No se pudo guardar el snapshot del portfolio.', error)
    throw new Error('No se pudo guardar el snapshot. Intentá de nuevo.')
  }
}

export async function getPortfolioSnapshots(
  ownerId: string,
  maxResults = 100
): Promise<PortfolioSnapshot[]> {
  if (!ownerId || !isFirebaseConfigured) return []

  const client = await getFirestoreClient()
  if (!client) return []

  const { db, collection, query, orderBy, limit, getDocs } = client
  const snapshotsRef = collection(db, 'portfolios', ownerId, 'snapshots')
  const snapshotsQuery = query(snapshotsRef, orderBy('capturedAt', 'asc'), limit(maxResults))

  try {
    const snapshot = await getDocs(snapshotsQuery)
    return snapshot.docs.map((docSnap) =>
      mapDocToSnapshot(docSnap.id, docSnap.data() as Record<string, unknown>)
    )
  } catch (error) {
    console.error('No se pudieron cargar los snapshots del portfolio.', error)
    throw new Error('No se pudieron cargar los snapshots.')
  }
}

export async function deletePortfolioSnapshot(ownerId: string, snapshotId: string): Promise<void> {
  if (!ownerId || !isFirebaseConfigured) return

  const client = await getFirestoreClient()
  if (!client) return

  const { db, doc, deleteDoc } = client

  try {
    await deleteDoc(doc(db, 'portfolios', ownerId, 'snapshots', snapshotId))
  } catch (error) {
    console.error('No se pudo eliminar el snapshot.', error)
    throw new Error('No se pudo eliminar el snapshot.')
  }
}
