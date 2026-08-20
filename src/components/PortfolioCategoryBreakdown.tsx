import { useState } from 'react'
import PortfolioCategoryBreakdownList from './PortfolioCategoryBreakdownList'
import PortfolioCategoryPieChart from './PortfolioCategoryPieChart'

export interface CategoryBreakdownItem {
  id: string
  label: string
  totalValueARS: number
  accentClass: string
}

type BreakdownView = 'list' | 'pie'

interface PortfolioCategoryBreakdownProps {
  categories: CategoryBreakdownItem[]
  totalCurrentARS: number
  exchangeRate: number | null
}

const VIEW_OPTIONS: { id: BreakdownView; label: string }[] = [
  { id: 'list', label: 'Lista' },
  { id: 'pie', label: 'Torta' },
]

export default function PortfolioCategoryBreakdown({
  categories,
  totalCurrentARS,
  exchangeRate,
}: PortfolioCategoryBreakdownProps) {
  const [view, setView] = useState<BreakdownView>('list')

  if (categories.length === 0) return null

  return (
    <div className="border-t border-border px-5 sm:px-7 py-4 sm:py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-subtle text-xs font-mono-data uppercase tracking-widest">
          Por tipo de inversión
        </p>
        <div className="flex gap-2 flex-wrap">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              aria-pressed={view === option.id}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-md border transition-colors ${
                view === option.id
                  ? 'bg-celeste/15 text-celeste border-celeste/30'
                  : 'text-muted border-border hover:text-paper'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid">
        <div
          className={`col-start-1 row-start-1 transition-opacity duration-150 ease-out ${
            view === 'list' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={view !== 'list'}
          inert={view !== 'list' || undefined}
        >
          <PortfolioCategoryBreakdownList
            categories={categories}
            totalCurrentARS={totalCurrentARS}
            exchangeRate={exchangeRate}
          />
        </div>
        <div
          className={`col-start-1 row-start-1 transition-opacity duration-150 ease-out ${
            view === 'pie' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={view !== 'pie'}
          inert={view !== 'pie' || undefined}
        >
          <PortfolioCategoryPieChart
            categories={categories}
            totalCurrentARS={totalCurrentARS}
            exchangeRate={exchangeRate}
          />
        </div>
      </div>
    </div>
  )
}
