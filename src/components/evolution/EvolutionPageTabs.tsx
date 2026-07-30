import type { EvolutionPageTab } from '../../hooks/useEvolutionPageTab'

const TABS: Array<{ id: EvolutionPageTab; label: string }> = [
  { id: 'evolution', label: 'Evolución' },
  { id: 'changes', label: 'Cambios' },
  { id: 'asset', label: 'Por activo' },
]

interface EvolutionPageTabsProps {
  activeTab: EvolutionPageTab
  onTabChange: (tab: EvolutionPageTab) => void
}

export default function EvolutionPageTabs({ activeTab, onTabChange }: EvolutionPageTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-mono-data rounded-md border transition-colors ${
            activeTab === tab.id
              ? 'bg-celeste/15 text-celeste border-celeste/30'
              : 'text-muted border-border hover:text-paper'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
