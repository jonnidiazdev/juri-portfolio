import { useMemo } from 'react'
import { ResponsiveContainer } from 'recharts'
import { PORTFOLIO_CATEGORY_COLORS } from '../../config/constants'
import { getCompareRechartsView, getEvolutionView } from '../../config/evolutionViews'
import type { EvolutionViewDefinition, EvolutionViewPrefs } from '../../config/evolutionViews'
import type { PortfolioSnapshot } from '../../types'
import {
  applyBrushRange,
  buildSnapshotChartPoints,
  chartDataHasNonPositiveValues,
  getActiveByTypeSeries,
  normalizeToPercentStack,
} from '../../utils/portfolioSnapshot'
import EvolutionLineView from './EvolutionLineView'
import EvolutionStackedAreaView from './EvolutionStackedAreaView'
import EvolutionStackedPercentView from './EvolutionStackedPercentView'
import EvolutionMultiLineView from './EvolutionMultiLineView'
import EvolutionBarView from './EvolutionBarView'
import EvolutionD3ComboView from './EvolutionD3ComboView'
import type { ChartBrushProps, EvolutionSeries } from './evolutionChartTypes'

interface EvolutionChartRendererProps {
  snapshots: PortfolioSnapshot[]
  prefs: EvolutionViewPrefs
  onBrushChange: (range: [number, number] | null) => void
  onToggleSeries: (dataKey: string) => void
}

function buildSeries(activeKeys: ReturnType<typeof getActiveByTypeSeries>): EvolutionSeries[] {
  return activeKeys.map((item) => ({
    dataKey: item.dataKey,
    name: item.name,
    color: PORTFOLIO_CATEGORY_COLORS[item.dataKey],
  }))
}

interface RechartsViewProps {
  view: EvolutionViewDefinition
  chartData: ReturnType<typeof buildSnapshotChartPoints>
  fullChartData: ReturnType<typeof buildSnapshotChartPoints>
  activeByTypeSeries: EvolutionSeries[]
  prefs: EvolutionViewPrefs
  logScaleActive: boolean
  brush: ChartBrushProps
  onToggleSeries: (dataKey: string) => void
}

function RechartsEvolutionView({
  view,
  chartData,
  fullChartData,
  activeByTypeSeries,
  prefs,
  logScaleActive,
  brush,
  onToggleSeries,
}: RechartsViewProps) {
  const sharedByTypeProps = {
    data: chartData,
    fullData: fullChartData,
    series: activeByTypeSeries,
    hiddenSeries: prefs.hiddenSeries,
    currency: prefs.currency,
    brush,
    onToggleSeries,
  }

  return (
    <>
      {view.chartType === 'line' && (
        <EvolutionLineView
          data={chartData}
          fullData={fullChartData}
          currency={prefs.currency}
          yMetric={prefs.yMetric}
          yScale={prefs.yScale}
          logScaleActive={logScaleActive}
          brush={brush}
        />
      )}
      {view.chartType === 'stackedArea' && (
        <EvolutionStackedAreaView
          {...sharedByTypeProps}
          yMetric={prefs.yMetric}
          yScale={prefs.yScale}
          logScaleActive={logScaleActive}
        />
      )}
      {view.chartType === 'stackedPercent' && (
        <EvolutionStackedPercentView {...sharedByTypeProps} />
      )}
      {view.chartType === 'multiLine' && (
        <EvolutionMultiLineView
          {...sharedByTypeProps}
          yMetric={prefs.yMetric}
          yScale={prefs.yScale}
          logScaleActive={logScaleActive}
        />
      )}
      {view.chartType === 'bar' && (
        <EvolutionBarView
          {...sharedByTypeProps}
          yMetric={prefs.yMetric}
          yScale={prefs.yScale}
          logScaleActive={logScaleActive}
        />
      )}
    </>
  )
}

export default function EvolutionChartRenderer({
  snapshots,
  prefs,
  onBrushChange,
  onToggleSeries,
}: EvolutionChartRendererProps) {
  const view = getEvolutionView(prefs.viewId)
  const compareRechartsView = getCompareRechartsView(prefs.viewId)

  const fullChartData = useMemo(() => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: prefs.currency,
      scope: view.scope,
      yMetric: prefs.yMetric,
      dateFormat: prefs.dateFormat,
    })

    if (view.chartType === 'stackedPercent') {
      return normalizeToPercentStack(points)
    }

    return points
  }, [snapshots, prefs.currency, prefs.yMetric, prefs.dateFormat, view.scope, view.chartType])

  const compareFullChartData = useMemo(() => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: prefs.currency,
      scope: compareRechartsView.scope,
      yMetric: prefs.yMetric,
      dateFormat: prefs.dateFormat,
    })

    if (compareRechartsView.chartType === 'stackedPercent') {
      return normalizeToPercentStack(points)
    }

    return points
  }, [
    snapshots,
    prefs.currency,
    prefs.yMetric,
    prefs.dateFormat,
    compareRechartsView.scope,
    compareRechartsView.chartType,
  ])

  const chartData = useMemo(
    () => applyBrushRange(fullChartData, prefs.brushRange),
    [fullChartData, prefs.brushRange]
  )

  const compareChartData = useMemo(
    () => applyBrushRange(compareFullChartData, prefs.brushRange),
    [compareFullChartData, prefs.brushRange]
  )

  const activeByTypeSeries = useMemo(
    () => buildSeries(getActiveByTypeSeries(snapshots, prefs.currency, prefs.yMetric)),
    [snapshots, prefs.currency, prefs.yMetric]
  )

  const logScaleDisabled = useMemo(
    () => chartDataHasNonPositiveValues(fullChartData, view.scope),
    [fullChartData, view.scope]
  )

  const compareLogScaleDisabled = useMemo(
    () => chartDataHasNonPositiveValues(compareFullChartData, compareRechartsView.scope),
    [compareFullChartData, compareRechartsView.scope]
  )

  const logScaleActive = prefs.yScale === 'log' && !logScaleDisabled
  const compareLogScaleActive = prefs.yScale === 'log' && !compareLogScaleDisabled

  const brush: ChartBrushProps = {
    enabled: fullChartData.length >= 3,
    range: prefs.brushRange,
    onChange: onBrushChange,
  }

  const compareBrush: ChartBrushProps = {
    enabled: compareFullChartData.length >= 3,
    range: prefs.brushRange,
    onChange: onBrushChange,
  }

  const d3ChartData = useMemo(() => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: prefs.currency,
      scope: 'byType',
      yMetric: prefs.yMetric,
      dateFormat: prefs.dateFormat,
    })
    return applyBrushRange(points, prefs.brushRange)
  }, [snapshots, prefs.currency, prefs.yMetric, prefs.dateFormat, prefs.brushRange])

  const sharedD3Props = {
    data: d3ChartData,
    series: activeByTypeSeries,
    hiddenSeries: prefs.hiddenSeries,
    currency: prefs.currency,
    yMetric: prefs.yMetric,
    onToggleSeries,
  }

  if (prefs.layoutMode === 'compare') {
    return (
      <div className="flex flex-col gap-6">
        <section>
          <p className="text-subtle text-xs font-mono-data mb-2">
            Recharts — {compareRechartsView.label}
          </p>
          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsEvolutionView
                view={compareRechartsView}
                chartData={compareChartData}
                fullChartData={compareFullChartData}
                activeByTypeSeries={activeByTypeSeries}
                prefs={prefs}
                logScaleActive={compareLogScaleActive}
                brush={compareBrush}
                onToggleSeries={onToggleSeries}
              />
            </ResponsiveContainer>
          </div>
        </section>
        <section>
          <p className="text-subtle text-xs font-mono-data mb-2">D3 — Composición + tendencia</p>
          <div className="h-56 sm:h-64 w-full">
            <EvolutionD3ComboView {...sharedD3Props} />
          </div>
        </section>
      </div>
    )
  }

  if (view.chartType === 'd3Combo') {
    return (
      <div className="h-72 sm:h-80 w-full">
        <EvolutionD3ComboView {...sharedD3Props} />
      </div>
    )
  }

  return (
    <div className="h-72 sm:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsEvolutionView
          view={view}
          chartData={chartData}
          fullChartData={fullChartData}
          activeByTypeSeries={activeByTypeSeries}
          prefs={prefs}
          logScaleActive={logScaleActive}
          brush={brush}
          onToggleSeries={onToggleSeries}
        />
      </ResponsiveContainer>
    </div>
  )
}
