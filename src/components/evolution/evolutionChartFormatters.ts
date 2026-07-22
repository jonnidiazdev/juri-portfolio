import type { EvolutionCurrency, EvolutionYMetric } from '../../config/evolutionViews'
import { HIDDEN_AMOUNT, HIDDEN_VALUE } from '../../utils/formatters'

export function formatEvolutionAxisValue(
  value: number,
  currency: EvolutionCurrency,
  yMetric: EvolutionYMetric,
  isPercentStack = false,
  hidden = false
): string {
  if (hidden) {
    if (isPercentStack || yMetric === 'profitPercent') return HIDDEN_VALUE
    return HIDDEN_AMOUNT
  }

  if (isPercentStack || yMetric === 'profitPercent') {
    return `${value.toFixed(1)}%`
  }

  if (currency === 'USD') {
    return `$${Math.round(value).toLocaleString('es-AR')}`
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${Math.round(value).toLocaleString('es-AR')}`
}
