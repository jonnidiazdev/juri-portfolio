import { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react'
import { getFirestoreClient, isFirebaseConfigured } from '../config/firebase'

function readLocalValue<T>(key: string, initialValue: T): T {
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

function writeLocalValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  if (value === undefined) return

  window.localStorage.setItem(key, JSON.stringify(value))
}

// Función para comparar si dos valores son equivalentes (considerando arrays vacíos y valores iniciales)
function isEmptyValue<T>(value: T, initialValue: T): boolean {
  if (value === initialValue) return true
  if (Array.isArray(value) && Array.isArray(initialValue)) {
    return value.length === 0 && initialValue.length === 0
  }
  if (value === null || value === undefined) return true
  return false
}

export function useLocalStorageState<T>(key: string, initialValue: T, ownerId: string | null = null): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => readLocalValue(key, initialValue))
  const initialValueRef = useRef(initialValue)
  const isRemoteHydrated = useRef(false)
  const skipRemoteWrite = useRef(false)

  useEffect(() => {
    // Si Firebase no está configurado, solo usar localStorage
    if (!isFirebaseConfigured) {
      isRemoteHydrated.current = true
      return undefined
    }

    // Si Firebase está configurado pero no hay ownerId (usuario no autenticado),
    // esperar a que se autentique antes de sincronizar
    if (!ownerId) {
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
      const docRef = doc(db, 'portfolios', ownerId)

      unsubscribe = onSnapshot(
        docRef,
        (snapshot: { data: () => Record<string, unknown> | undefined }) => {
          const remoteData = snapshot.data()
          const remoteValue = remoteData?.[key]
          const localValue = readLocalValue(key, initialValueRef.current)

          // Si hay datos remotos, SIEMPRE priorizarlos
          if (remoteValue !== undefined) {
            skipRemoteWrite.current = true
            setValue(remoteValue as T)
            writeLocalValue(key, remoteValue as T)
            isRemoteHydrated.current = true
            return
          }

          // Si NO hay datos remotos pero hay datos locales no vacíos, migrarlos
          if (!isEmptyValue(localValue, initialValueRef.current)) {
            console.log(`Migrando datos locales de "${key}" a Firestore para usuario ${ownerId}`)
            writeLocalValue(key, localValue)

            setDoc(
              docRef,
              {
                [key]: localValue,
                updatedAt: serverTimestamp()
              },
              { merge: true }
            ).catch((error: unknown) => {
              console.error('Error al migrar datos locales hacia Firebase', error)
            })
          } else {
            // No hay datos ni remotos ni locales, usar el valor inicial
            writeLocalValue(key, initialValueRef.current)
          }

          isRemoteHydrated.current = true
        },
        (error: unknown) => {
          console.error('Error al leer estado desde Firebase. Se mantiene persistencia local.', error)
          isRemoteHydrated.current = true
        }
      )
    })

    return () => {
      isCancelled = true
      unsubscribe()
    }
  }, [ownerId, key])

  useEffect(() => {
    // Siempre guardar en localStorage como caché local
    if (value !== undefined) {
      writeLocalValue(key, value)
    }

    // Si Firebase no está configurado o no hay ownerId, solo usar localStorage
    if (!isFirebaseConfigured || !ownerId) return

    // Esperar a que se complete la hidratación inicial desde Firebase
    if (!isRemoteHydrated.current) return

    // Si estamos aplicando datos remotos, no escribir de vuelta
    if (skipRemoteWrite.current) {
      skipRemoteWrite.current = false
      return
    }

    // Sincronizar el valor actual con Firestore
    getFirestoreClient().then((client) => {
      if (!client) return

      const { db, doc, serverTimestamp, setDoc } = client
      const docRef = doc(db, 'portfolios', ownerId)

      setDoc(
        docRef,
        {
          [key]: value,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      ).catch((error: unknown) => {
        console.error('Error al sincronizar estado en Firebase', error)
      })
    })
  }, [ownerId, key, value])

  return [value, setValue] as const
}
