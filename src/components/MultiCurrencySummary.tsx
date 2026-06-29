import { formatCurrency, formatPercentage } from '../utils/formatters'
import PortfolioCategoryBreakdown, { type CategoryBreakdownItem } from './PortfolioCategoryBreakdown'

interface MultiCurrencySummaryProps {
  totalsARS: { invested: number; current: number; profit: number; profitPercent: number }
  totalsUSD: { invested: number; current: number; profit: number; profitPercent: number }
  exchangeRateInfo: { name: string; id: string; buy: number; sell: number } | null
  exchangeRate?: number | null
  categories?: CategoryBreakdownItem[]
  className?: string
}

export default function MultiCurrencySummary({
  totalsARS,
  totalsUSD,
  exchangeRateInfo,
  exchangeRate = null,
  categories = [],
  className = '',
}: MultiCurrencySummaryProps) {
  const isPositiveARS = totalsARS.profit >= 0
  const isPositiveUSD = totalsUSD.profit >= 0

  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* Totales en ARS */}
        <div className="p-5 sm:p-7">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-peso text-xs font-mono-data uppercase tracking-widest mb-1">En pesos</p>
              <p className="text-muted text-xs">Convertido a ARS</p>
            </div>
            {exchangeRateInfo?.name && (
              <span className="text-subtle text-[10px] font-mono-data uppercase tracking-wide">
                {exchangeRateInfo.name}
              </span>
            )}
          </div>

          <p className="font-mono-data text-3xl sm:text-4xl font-semibold text-paper tracking-tight mb-6">
            {formatCurrency(totalsARS.current, 'ARS')}
          </p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-subtle text-xs mb-1">Invertido</p>
              <p className="font-mono-data text-lg text-muted">
                {formatCurrency(totalsARS.invested, 'ARS')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-subtle text-xs mb-1">Resultado</p>
              <p className={`font-mono-data text-lg font-semibold ${isPositiveARS ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(totalsARS.profit, 'ARS')}
              </p>
              <p className={`font-mono-data text-sm ${isPositiveARS ? 'text-profit' : 'text-loss'}`}>
                {formatPercentage(totalsARS.profitPercent)}
              </p>
            </div>
          </div>
        </div>

        {/* Totales en USD */}
        <div className="p-5 sm:p-7 bg-surface-raised/40">
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <p className="text-celeste text-xs font-mono-data uppercase tracking-widest mb-1">En dólares</p>
              <p className="text-muted text-xs">Convertido a USD</p>
            </div>
          </div>

          <p className="font-mono-data text-3xl sm:text-4xl font-semibold text-paper tracking-tight mb-6">
            {formatCurrency(totalsUSD.current, 'USD')}
          </p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-subtle text-xs mb-1">Invertido</p>
              <p className="font-mono-data text-lg text-muted">
                {formatCurrency(totalsUSD.invested, 'USD')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-subtle text-xs mb-1">Resultado</p>
              <p className={`font-mono-data text-lg font-semibold ${isPositiveUSD ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(totalsUSD.profit, 'USD')}
              </p>
              <p className={`font-mono-data text-sm ${isPositiveUSD ? 'text-profit' : 'text-loss'}`}>
                {formatPercentage(totalsUSD.profitPercent)}
              </p>
            </div>
          </div>
        </div>
      </div>
      {categories.length > 0 && (
        <PortfolioCategoryBreakdown
          categories={categories}
          totalCurrentARS={totalsARS.current}
          exchangeRate={exchangeRate}
        />
      )}
    </div>
  )
}
