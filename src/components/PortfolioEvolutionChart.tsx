import { useMemo } from 'react'
import type { PortfolioSnapshot } from '../types'
import { getEvolutionView } from '../config/evolutionViews'
import { useEvolutionViewPrefs } from '../hooks/useEvolutionViewPrefs'
import {
  buildSnapshotChartPoints,
  chartDataHasNonPositiveValues,
} from '../utils/portfolioSnapshot'
import { formatCurrency } from '../utils/formatters'
import EvolutionChartToolbar from './EvolutionChartToolbar'
import EvolutionChartRenderer from './evolution/EvolutionChartRenderer'

interface PortfolioEvolutionChartProps {
  snapshots: PortfolioSnapshot[]
  userId: string | null | undefined
}

export default function PortfolioEvolutionChart({ snapshots, userId }: PortfolioEvolutionChartProps) {
  const { prefs, updatePrefs, toggleHiddenSeries } = useEvolutionViewPrefs(userId)
  const activeView = getEvolutionView(prefs.viewId)

  const fullChartData = useMemo(
    () =>
      buildSnapshotChartPoints(snapshots, {
        currency: prefs.currency,
        scope: activeView.scope,
        yMetric: prefs.yMetric,
        dateFormat: prefs.dateFormat,
      }),
    [snapshots, prefs.currency, prefs.yMetric, prefs.dateFormat, activeView.scope]
  )

  const logScaleDisabled = useMemo(
    () => chartDataHasNonPositiveValues(fullChartData, activeView.scope),
    [fullChartData, activeView.scope]
  )

  if (snapshots.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted">Todavía no hay snapshots. Guardá el primero para ver la evolución.</p>
      </div>
    )
  }

  const singlePoint = snapshots.length === 1
  const latest = snapshots[snapshots.length - 1]
  const latestTotals = prefs.currency === 'ARS' ? latest.totalsARS : latest.totalsUSD
  const latestValue = latestTotals[prefs.yMetric]

  const handleViewChange = (viewId: string) => {
    const view = getEvolutionView(viewId)
    updatePrefs({
      viewId,
      yMetric: view.allowedYMetrics.includes(prefs.yMetric) ? prefs.yMetric : view.defaultYMetric,
      hiddenSeries: [],
      brushRange: null,
    })
  }

  return (
    <div className="card p-5 sm:p-7">
      <EvolutionChartToolbar
        prefs={prefs}
        activeView={activeView}
        logScaleDisabled={logScaleDisabled}
        onViewChange={handleViewChange}
        onCurrencyChange={(currency) => updatePrefs({ currency })}
        onYMetricChange={(yMetric) => updatePrefs({ yMetric })}
        onDateFormatChange={(dateFormat) => updatePrefs({ dateFormat })}
        onYScaleChange={(yScale) => updatePrefs({ yScale: logScaleDisabled ? 'linear' : yScale })}
        onResetBrush={() => updatePrefs({ brushRange: null })}
        showBrushReset={prefs.brushRange !== null}
      />

      {singlePoint && (
        <p className="text-subtle text-sm mb-4">
          Necesitás al menos 2 snapshots para ver la tendencia. Valor actual:{' '}
          <span className="font-mono-data text-paper">
            {prefs.yMetric === 'profitPercent'
              ? `${latestValue >= 0 ? '+' : ''}${latestValue.toFixed(2)}%`
              : formatCurrency(latestValue, prefs.currency)}
          </span>
        </p>
      )}

      <EvolutionChartRenderer
        snapshots={snapshots}
        prefs={prefs}
        onBrushChange={(brushRange) => updatePrefs({ brushRange })}
        onToggleSeries={toggleHiddenSeries}
      />
    </div>
  )
}
