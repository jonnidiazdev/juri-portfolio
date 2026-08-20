import type { EvolutionCurrency } from '../../config/evolutionViews'
import { usePortfolioFormatters } from '../../hooks/usePortfolioFormatters'
import type { SnapshotComparisonSummary } from '../../utils/snapshotDiff'

interface SnapshotFlowSummaryProps {
  summary: SnapshotComparisonSummary
  currency: EvolutionCurrency
}

function toneFor(value: number, positiveIsGood: boolean): string {
  if (value === 0) return 'text-paper'
  const isPositive = value >= 0
  if (positiveIsGood) return isPositive ? 'text-profit' : 'text-loss'
  return isPositive ? 'text-loss' : 'text-profit'
}

function SummaryCard({
  label,
  value,
  formatted,
  positiveIsGood = true,
}: {
  label: string
  value: number
  formatted: string
  positiveIsGood?: boolean
}) {
  return (
    <div className="card p-4">
      <p className="text-subtle text-[10px] font-mono-data uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-mono-data text-lg ${toneFor(value, positiveIsGood)}`}>{formatted}</p>
    </div>
  )
}

export default function SnapshotFlowSummary({ summary, currency }: SnapshotFlowSummaryProps) {
  const { formatCurrency } = usePortfolioFormatters()

  const totalDelta = currency === 'ARS' ? summary.totalDeltaARS : summary.totalDeltaUSD
  const marketGain = currency === 'ARS' ? summary.marketGainARS : summary.marketGainUSD
  const capitalFlows = currency === 'ARS' ? summary.capitalFlowsARS : summary.capitalFlowsUSD
  const realizedGain = currency === 'ARS' ? summary.realizedGainARS : summary.realizedGainUSD

  return (
    <div className="mb-6">
      {/* Tiza principal: la variación total es el número que importa */}
      <div className="card p-5 mb-3">
        <p className="text-subtle text-[10px] font-mono-data uppercase tracking-widest mb-2">
          Variación total del período
        </p>
        <p className={`font-chalk text-3xl sm:text-4xl leading-none ${toneFor(totalDelta, true)}`}>
          {formatCurrency(totalDelta, currency)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          label="Por mercado"
          value={marketGain}
          formatted={formatCurrency(marketGain, currency)}
        />
        <SummaryCard
          label="Por flujos"
          value={capitalFlows}
          formatted={formatCurrency(capitalFlows, currency)}
          positiveIsGood={false}
        />
        <SummaryCard
          label="Realizado (aprox.)"
          value={realizedGain}
          formatted={formatCurrency(realizedGain, currency)}
        />
      </div>
    </div>
  )
}
