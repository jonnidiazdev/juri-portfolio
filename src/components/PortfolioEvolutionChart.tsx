import { useMemo } from 'react'
import type { PortfolioSnapshot } from '../types'
import { getEvolutionView } from '../config/evolutionViews'
import { useEvolutionViewPrefs } from '../hooks/useEvolutionViewPrefs'
import {
  buildSnapshotChartPoints,
  chartDataHasNonPositiveValues,
} from '../utils/portfolioSnapshot'
import { usePortfolioFormatters } from '../hooks/usePortfolioFormatters'
import EvolutionChartToolbar from './EvolutionChartToolbar'
import EvolutionChartRenderer from './evolution/EvolutionChartRenderer'

interface PortfolioEvolutionChartProps {
  snapshots: PortfolioSnapshot[]
  userId: string | null | undefined
}

const RESET_DOMAIN = { yDomainMin: null, yDomainMax: null } as const

export default function PortfolioEvolutionChart({ snapshots, userId }: PortfolioEvolutionChartProps) {
  const { prefs, updatePrefs, toggleHiddenSeries } = useEvolutionViewPrefs(userId)
  const { formatCurrency, formatEvolutionPercent } = usePortfolioFormatters()
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

  const yDomainDisabled = activeView.chartType === 'stackedPercent'

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
      ...RESET_DOMAIN,
    })
  }

  return (
    <div className="card p-5 sm:p-7">
      <EvolutionChartToolbar
        prefs={prefs}
        activeView={activeView}
        logScaleDisabled={logScaleDisabled}
        yDomainDisabled={yDomainDisabled}
        onViewChange={handleViewChange}
        onCurrencyChange={(currency) => updatePrefs({ currency, ...RESET_DOMAIN })}
        onYMetricChange={(yMetric) => updatePrefs({ yMetric, ...RESET_DOMAIN })}
        onDateFormatChange={(dateFormat) => updatePrefs({ dateFormat })}
        onYScaleChange={(yScale) => updatePrefs({ yScale: logScaleDisabled ? 'linear' : yScale })}
        onYDomainMinChange={(yDomainMin) => updatePrefs({ yDomainMin })}
        onYDomainMaxChange={(yDomainMax) => updatePrefs({ yDomainMax })}
        onResetBrush={() => updatePrefs({ brushRange: null })}
        onResetYDomain={() => updatePrefs(RESET_DOMAIN)}
        showBrushReset={prefs.brushRange !== null}
        showYDomainReset={prefs.yDomainMin !== null || prefs.yDomainMax !== null}
      />

      {singlePoint && (
        <p className="text-subtle text-sm mb-4">
          Necesitás al menos 2 snapshots para ver la tendencia. Valor actual:{' '}
          <span className="font-mono-data text-paper">
            {prefs.yMetric === 'profitPercent'
              ? formatEvolutionPercent(latestValue, true)
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
