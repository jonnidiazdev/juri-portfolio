import { useLocalStorageState } from './useLocalStorageState'

export type EvolutionPageTab = 'evolution' | 'changes' | 'asset'

const VALID_TABS: EvolutionPageTab[] = ['evolution', 'changes', 'asset']

export function useEvolutionPageTab(userId: string | null | undefined) {
  const [tab, setTab] = useLocalStorageState<EvolutionPageTab>(
    'portfolio-evolution-tab',
    'evolution',
    userId
  )

  const safeTab = VALID_TABS.includes(tab) ? tab : 'evolution'

  return {
    tab: safeTab,
    setTab,
  }
}
