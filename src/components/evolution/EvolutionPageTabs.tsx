import { useSlidingIndicator } from '../../hooks/useSlidingIndicator'
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
  const { containerRef, setItemRef, rect } = useSlidingIndicator(activeTab)

  return (
    <div ref={containerRef} className="relative flex gap-2 flex-wrap">
      {rect && (
        <div
          className="sliding-indicator rounded-full bg-celeste/15 border border-celeste/30"
          style={{ width: rect.width, height: rect.height, transform: `translate(${rect.left}px, ${rect.top}px)` }}
        />
      )}
      {TABS.map((tab) => (
        <button
          key={tab.id}
          ref={setItemRef(tab.id)}
          type="button"
          onClick={() => onTabChange(tab.id)}
          aria-pressed={activeTab === tab.id}
          className={`relative z-10 px-4 py-2 text-sm font-mono-data rounded-full border transition-colors ${
            activeTab === tab.id ? 'text-celeste border-transparent' : 'text-muted border-border hover:text-paper'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
