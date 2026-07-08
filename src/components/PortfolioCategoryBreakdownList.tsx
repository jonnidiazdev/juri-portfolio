import { usePortfolioFormatters } from '../hooks/usePortfolioFormatters'
import type { CategoryBreakdownItem } from './PortfolioCategoryBreakdown'

interface PortfolioCategoryBreakdownListProps {
  categories: CategoryBreakdownItem[]
  totalCurrentARS: number
  exchangeRate: number | null
}

export default function PortfolioCategoryBreakdownList({
  categories,
  totalCurrentARS,
  exchangeRate,
}: PortfolioCategoryBreakdownListProps) {
  const { formatCurrency, formatSharePercent } = usePortfolioFormatters()

  return (
    <ul className="space-y-3">
      {categories.map((category) => {
        const totalValueUSD = exchangeRate ? category.totalValueARS / exchangeRate : null
        const percent = totalCurrentARS > 0
          ? (category.totalValueARS / totalCurrentARS) * 100
          : 0

        return (
          <li
            key={category.id}
            className={`section-rule ${category.accentClass} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4`}
          >
            <span className="text-paper text-sm font-medium">{category.label}</span>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
              <span className="font-mono-data text-sm text-paper">
                {formatCurrency(category.totalValueARS, 'ARS')}
              </span>
              {totalValueUSD !== null && (
                <span className="font-mono-data text-sm text-muted">
                  {formatCurrency(totalValueUSD, 'USD')}
                </span>
              )}
              <span className="font-mono-data text-xs text-subtle sm:ml-auto">
                {formatSharePercent(percent)}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
