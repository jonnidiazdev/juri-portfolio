import { useEffect, useRef, useState, useCallback, Dispatch, SetStateAction } from 'react'
import { getFirestoreClient, isFirebaseConfigured } from '../config/firebase'
import {
  getScopedStorageKey,
  isEmptyValue,
  resolveInitialSync,
  shouldPushToRemote,
} from '../utils/portfolioSync'

export const PORTFOLIO_SYNC_ERROR = 'portfolio-sync-error'

function notifySyncError(key: string, message: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PORTFOLIO_SYNC_ERROR, { detail: { key, message } }))
}

function readLocalValue<T>(key: string, initialValue: T): T {
  if (typeof window === 'undefined') return initialValue

  const savedValue = window.localStorage.getItem(key)
  if (savedValue === null) return initialValue

  try {
    return JSON.parse(savedValue) as T
  } catch (error) {
    console.error('Error al parsear localStorage', error)
    return initialValue
  }
}

function writeLocalValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  if (value === undefined) return

  window.localStorage.setItem(key, JSON.stringify(value))
}

function hasLocalValue(storageKey: string): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(storageKey) !== null
}

function readScopedLocalValue<T>(key: string, ownerId: string | null, initialValue: T): T {
  const scopedKey = getScopedStorageKey(key, ownerId)

  if (hasLocalValue(scopedKey)) {
    return readLocalValue(scopedKey, initialValue)
  }

  if (ownerId && hasLocalValue(key)) {
    const legacyValue = readLocalValue(key, initialValue)
    if (!isEmptyValue(legacyValue, initialValue)) {
      writeLocalValue(scopedKey, legacyValue)
      return legacyValue
    }
  }

  return initialValue
}

function shouldWaitForRemoteSync(ownerId: string | null): boolean {
  return isFirebaseConfigured && !!ownerId
}

export interface LocalStorageSyncStatus {
  isSyncing: boolean
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  ownerId: string | null = null
): [T, Dispatch<SetStateAction<T>>, LocalStorageSyncStatus] {
  const storageKey = getScopedStorageKey(key, ownerId)
  const initialValueRef = useRef(initialValue)
  const syncReadyRef = useRef(!shouldWaitForRemoteSync(ownerId))
  const skipRemoteWriteRef = useRef(false)
  const userEditedRef = useRef(false)

  const [isSyncing, setIsSyncing] = useState(() => shouldWaitForRemoteSync(ownerId))
  const [value, setValueInternal] = useState<T>(() =>
    shouldWaitForRemoteSync(ownerId)
      ? initialValue
      : readScopedLocalValue(key, ownerId, initialValue)
  )

  const markSyncComplete = useCallback(() => {
    syncReadyRef.current = true
    setIsSyncing(false)
  }, [])

  const markSyncPending = useCallback(() => {
    syncReadyRef.current = false
    if (shouldWaitForRemoteSync(ownerId)) {
      setIsSyncing(true)
    }
  }, [ownerId])

  const setValue: Dispatch<SetStateAction<T>> = useCallback((update) => {
    if (shouldWaitForRemoteSync(ownerId) && !syncReadyRef.current) return
    userEditedRef.current = true
    setValueInternal(update)
  }, [ownerId])

  useEffect(() => {
    if (!shouldWaitForRemoteSync(ownerId)) {
      syncReadyRef.current = true
      setIsSyncing(false)
      return
    }

    markSyncPending()
    userEditedRef.current = false
    skipRemoteWriteRef.current = true
    setValueInternal(initialValueRef.current)
  }, [ownerId, key, markSyncPending])

  useEffect(() => {
    if (!isFirebaseConfigured) {
      markSyncComplete()
      return undefined
    }

    if (!ownerId) {
      markSyncComplete()
      return undefined
    }

    markSyncPending()
    let cancelled = false
    let unsubscribe = () => {}

    const applyRemoteValue = (remoteValue: T) => {
      skipRemoteWriteRef.current = true
      userEditedRef.current = false
      setValueInternal(remoteValue)
      writeLocalValue(storageKey, remoteValue)
    }

    const finishInitialSync = async () => {
      const client = await getFirestoreClient()
      if (cancelled) return

      if (!client) {
        notifySyncError(
          key,
          'No se pudieron cargar los datos desde Firebase. Reintentá refrescando la página.'
        )
        return
      }

      const { db, doc, getDocFromServer, onSnapshot, serverTimestamp, setDoc } = client
      const docRef = doc(db, 'portfolios', ownerId)
      const localValue = readScopedLocalValue(key, ownerId, initialValueRef.current)

      try {
        const serverSnapshot = await getDocFromServer(docRef)
        if (cancelled) return

        const remoteValue = serverSnapshot.data()?.[key] as T | undefined
        const resolution = resolveInitialSync(remoteValue, localValue, initialValueRef.current)

        if (resolution.action === 'apply_remote') {
          applyRemoteValue(resolution.value)
        } else if (resolution.action === 'migrate_local') {
          applyRemoteValue(resolution.value)
          await setDoc(
            docRef,
            { [key]: resolution.value, updatedAt: serverTimestamp() },
            { merge: true }
          )
        } else {
          skipRemoteWriteRef.current = true
          setValueInternal(resolution.value)
          writeLocalValue(storageKey, resolution.value)
        }
      } catch (error) {
        console.error('Error al leer estado desde el servidor Firebase', error)
        notifySyncError(
          key,
          'No se pudieron cargar los datos desde Firebase. Reintentá refrescando la página. Tus datos en la nube no se modificarán.'
        )
        return
      }

      if (cancelled) return

      markSyncComplete()

      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (cancelled) return
          if (snapshot.metadata.hasPendingWrites) return

          const remoteValue = snapshot.data()?.[key] as T | undefined
          if (remoteValue === undefined) return

          const currentLocal = readLocalValue(storageKey, initialValueRef.current)
          if (JSON.stringify(currentLocal) === JSON.stringify(remoteValue)) return

          applyRemoteValue(remoteValue)
        },
        (error: unknown) => {
          console.error('Error en sincronización en tiempo real', error)
          notifySyncError(key, 'Error de sincronización en tiempo real')
        }
      )
    }

    finishInitialSync()

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [ownerId, key, storageKey, markSyncComplete, markSyncPending])

  useEffect(() => {
    if (value === undefined) return
    writeLocalValue(storageKey, value)

    if (!shouldPushToRemote(
      syncReadyRef.current,
      userEditedRef.current,
      skipRemoteWriteRef.current
    )) {
      if (skipRemoteWriteRef.current) {
        skipRemoteWriteRef.current = false
      }
      return
    }

    if (!isFirebaseConfigured || !ownerId) return

    getFirestoreClient().then((client) => {
      if (!client) return

      const { db, doc, serverTimestamp, setDoc } = client
      const docRef = doc(db, 'portfolios', ownerId)

      setDoc(
        docRef,
        { [key]: value, updatedAt: serverTimestamp() },
        { merge: true }
      ).catch((error: unknown) => {
        console.error('Error al sincronizar estado en Firebase', error)
        notifySyncError(key, 'Error de sincronización. Los cambios se guardaron solo localmente.')
      })
    })
  }, [ownerId, key, storageKey, value])

  return [value, setValue, { isSyncing }] as const
}
