import { usePortfolioOutletContext } from './usePortfolioOutletContext'
import {
  formatCurrency as formatCurrencyBase,
  formatPercentage as formatPercentageBase,
  formatQuantity as formatQuantityBase,
  HIDDEN_VALUE,
} from '../utils/formatters'
import { formatEvolutionAxisValue as formatEvolutionAxisValueBase } from '../components/evolution/evolutionChartFormatters'
import type { EvolutionCurrency, EvolutionYMetric } from '../config/evolutionViews'

export function usePortfolioFormatters() {
  const { hideValues } = usePortfolioOutletContext()

  return {
    hideValues,
    formatCurrency: (amount: number, currency?: string, decimals?: number) =>
      formatCurrencyBase(amount, currency, decimals, hideValues),
    formatPercentage: (value: number) => formatPercentageBase(value, hideValues),
    formatQuantity: (value: number, options?: Intl.NumberFormatOptions) =>
      formatQuantityBase(value, options, hideValues),
    formatSharePercent: (value: number) =>
      hideValues ? HIDDEN_VALUE : `${value.toFixed(1)}%`,
    formatEvolutionAxisValue: (
      value: number,
      currency: EvolutionCurrency,
      yMetric: EvolutionYMetric,
      isPercentStack = false
    ) => formatEvolutionAxisValueBase(value, currency, yMetric, isPercentStack, hideValues),
    formatEvolutionPercent: (value: number, withSign = false) => {
      if (hideValues) return HIDDEN_VALUE
      const sign = withSign && value >= 0 ? '+' : ''
      return `${sign}${value.toFixed(2)}%`
    },
  }
}
