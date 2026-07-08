import type { EvolutionCurrency, EvolutionYMetric } from '../../config/evolutionViews'
import { usePortfolioFormatters } from '../../hooks/usePortfolioFormatters'

export function TotalChartTooltip({
  active,
  payload,
  label,
  currency,
  yMetric,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
}) {
  const { formatCurrency, formatEvolutionPercent } = usePortfolioFormatters()

  if (!active || !payload?.length) return null

  const value = payload[0].value

  return (
    <div className="card px-3 py-2 text-sm shadow-lg">
      <p className="text-muted text-xs font-mono-data mb-2">{label}</p>
      <p className="font-mono-data text-paper">
        {yMetric === 'profitPercent'
          ? formatEvolutionPercent(value, true)
          : formatCurrency(value, currency)}
      </p>
    </div>
  )
}

export function StackedAreaTooltip({
  active,
  payload,
  label,
  currency,
  isPercentStack = false,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  currency: EvolutionCurrency
  isPercentStack?: boolean
}) {
  const { formatCurrency, formatSharePercent } = usePortfolioFormatters()

  if (!active || !payload?.length) return null

  const total = payload.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="card px-3 py-2 text-sm shadow-lg">
      <p className="text-muted text-xs font-mono-data mb-2">{label}</p>
      {payload.map((entry) => {
        const percent = total > 0 ? (entry.value / total) * 100 : 0
        return (
          <p key={entry.name} className="font-mono-data text-paper flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted">{entry.name}:</span>
            {isPercentStack
              ? formatSharePercent(entry.value)
              : formatCurrency(entry.value, currency)}
            {!isPercentStack && (
              <span className="text-subtle text-xs">({formatSharePercent(percent)})</span>
            )}
          </p>
        )
      })}
      {!isPercentStack && (
        <p className="font-mono-data text-paper mt-2 pt-2 border-t border-border">
          Total: {formatCurrency(total, currency)}
        </p>
      )}
    </div>
  )
}
