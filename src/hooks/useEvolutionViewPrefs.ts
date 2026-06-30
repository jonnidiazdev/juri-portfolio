import { useCallback } from 'react'
import { useLocalStorageState } from './useLocalStorageState'
import {
  DEFAULT_EVOLUTION_PREFS,
  sanitizeEvolutionPrefs,
  type EvolutionViewPrefs,
} from '../config/evolutionViews'

export function useEvolutionViewPrefs(userId: string | null | undefined) {
  const [rawPrefs, setRawPrefs] = useLocalStorageState<EvolutionViewPrefs>(
    'portfolio-evolution-view-prefs',
    DEFAULT_EVOLUTION_PREFS,
    userId ?? null
  )

  const prefs = sanitizeEvolutionPrefs(rawPrefs)

  const setPrefs = useCallback(
    (update: EvolutionViewPrefs | ((prev: EvolutionViewPrefs) => EvolutionViewPrefs)) => {
      setRawPrefs((prev) => {
        const next = typeof update === 'function' ? update(sanitizeEvolutionPrefs(prev)) : update
        return sanitizeEvolutionPrefs(next)
      })
    },
    [setRawPrefs]
  )

  const updatePrefs = useCallback(
    (partial: Partial<EvolutionViewPrefs>) => {
      setPrefs((prev) => sanitizeEvolutionPrefs({ ...prev, ...partial }))
    },
    [setPrefs]
  )

  const toggleHiddenSeries = useCallback(
    (dataKey: string) => {
      setPrefs((prev) => {
        const hidden = prev.hiddenSeries.includes(dataKey)
          ? prev.hiddenSeries.filter((key) => key !== dataKey)
          : [...prev.hiddenSeries, dataKey]
        return { ...prev, hiddenSeries: hidden }
      })
    },
    [setPrefs]
  )

  return {
    prefs,
    setPrefs,
    updatePrefs,
    toggleHiddenSeries,
  }
}
