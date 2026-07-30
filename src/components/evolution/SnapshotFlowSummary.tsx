import type { EvolutionCurrency } from '../../config/evolutionViews'
import { usePortfolioFormatters } from '../../hooks/usePortfolioFormatters'
import type { SnapshotComparisonSummary } from '../../utils/snapshotDiff'

interface SnapshotFlowSummaryProps {
  summary: SnapshotComparisonSummary
  currency: EvolutionCurrency
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
  const isPositive = value >= 0
  const tone =
    value === 0
      ? 'text-paper'
      : positiveIsGood
        ? isPositive
          ? 'text-profit'
          : 'text-loss'
        : isPositive
          ? 'text-loss'
          : 'text-profit'

  return (
    <div className="card p-4">
      <p className="text-subtle text-[10px] font-mono-data uppercase tracking-widest mb-2">{label}</p>
      <p className={`font-mono-data text-lg ${tone}`}>{formatted}</p>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
      <SummaryCard
        label="Variación total"
        value={totalDelta}
        formatted={formatCurrency(totalDelta, currency)}
      />
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
  )
}
