import { useEffect, useRef, useState } from 'react'
import { getFirestoreClient, isFirebaseConfigured } from '../config/firebase'

const PORTFOLIO_OWNER_KEY = 'portfolio-owner-id'

function getOrCreatePortfolioOwnerId() {
  if (typeof window === 'undefined') return 'anonymous-owner'

  const existing = window.localStorage.getItem(PORTFOLIO_OWNER_KEY)
  if (existing) return existing

  const generated =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `owner-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

  window.localStorage.setItem(PORTFOLIO_OWNER_KEY, generated)
  return generated
}

function readLocalValue(key, initialValue) {
  if (typeof window === 'undefined') return initialValue

  const savedValue = window.localStorage.getItem(key)
  if (!savedValue) return initialValue

  try {
    return JSON.parse(savedValue)
  } catch (error) {
    console.error('Error al parsear localStorage', error)
    return initialValue
  }
}

function writeLocalValue(key, value) {
  if (typeof window === 'undefined') return
  if (value === undefined) return

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function useLocalStorageState(key, initialValue, ownerId = null) {
  const [value, setValue] = useState(() => readLocalValue(key, initialValue))
  const initialValueRef = useRef(initialValue)
  const isRemoteHydrated = useRef(false)
  const skipRemoteWrite = useRef(false)

  const docOwnerId = ownerId || getOrCreatePortfolioOwnerId()

  useEffect(() => {
    if (!isFirebaseConfigured || !ownerId) {
      isRemoteHydrated.current = true
      return undefined
    }

    isRemoteHydrated.current = false

    let unsubscribe = () => {}
    let isCancelled = false

    getFirestoreClient().then((client) => {
      if (isCancelled || !client) {
        isRemoteHydrated.current = true
        return
      }

      const { db, doc, onSnapshot, serverTimestamp, setDoc } = client
      const docRef = doc(db, 'portfolios', docOwnerId)

      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          const remoteData = snapshot.data()
          const remoteValue = remoteData?.[key]

          if (remoteValue !== undefined) {
            skipRemoteWrite.current = true
            setValue(remoteValue)
            writeLocalValue(key, remoteValue)
            isRemoteHydrated.current = true
            return
          }

          const localValue = readLocalValue(key, initialValueRef.current)
          writeLocalValue(key, localValue)

          setDoc(
            docRef,
            {
              [key]: localValue,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          ).catch((error) => {
            console.error('Error al migrar datos locales hacia Firebase', error)
          })

          isRemoteHydrated.current = true
        },
        (error) => {
          console.error('Error al leer estado desde Firebase. Se mantiene persistencia local.', error)
          isRemoteHydrated.current = true
        }
      )
    })

    return () => {
      isCancelled = true
      unsubscribe()
    }
  }, [docOwnerId, key, ownerId])

  useEffect(() => {
    if (value !== undefined) {
      writeLocalValue(key, value)
    }

    if (!isFirebaseConfigured || !ownerId) return
    if (!isRemoteHydrated.current) return

    if (skipRemoteWrite.current) {
      skipRemoteWrite.current = false
      return
    }

    getFirestoreClient().then((client) => {
      if (!client) return

      const { db, doc, serverTimestamp, setDoc } = client
      const docRef = doc(db, 'portfolios', docOwnerId)

      setDoc(
        docRef,
        {
          [key]: value,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      ).catch((error) => {
        console.error('Error al sincronizar estado en Firebase', error)
      })
    })
  }, [docOwnerId, key, ownerId, value])

  return [value, setValue]
}
