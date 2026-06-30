import { LineChart, Line, Tooltip, Legend } from 'recharts'
import type { EvolutionCurrency, EvolutionYMetric, EvolutionYScale } from '../../config/evolutionViews'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import EvolutionChartAxes from './EvolutionChartAxes'
import { StackedAreaTooltip } from './EvolutionChartTooltips'
import type { ChartBrushProps, EvolutionSeries } from './evolutionChartTypes'
import EvolutionChartBrush from './EvolutionChartBrush'
import EvolutionChartLegend from './EvolutionChartLegend'

interface EvolutionMultiLineViewProps {
  data: SnapshotChartPoint[]
  fullData: SnapshotChartPoint[]
  series: EvolutionSeries[]
  hiddenSeries: string[]
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
  yScale: EvolutionYScale
  logScaleActive: boolean
  brush: ChartBrushProps
  onToggleSeries: (dataKey: string) => void
}

export default function EvolutionMultiLineView({
  data,
  fullData,
  series,
  hiddenSeries,
  currency,
  yMetric,
  yScale,
  logScaleActive,
  brush,
  onToggleSeries,
}: EvolutionMultiLineViewProps) {
  const visibleSeries = series.filter((item) => !hiddenSeries.includes(item.dataKey))

  return (
    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: brush.enabled ? 24 : 0 }} style={{ background: 'transparent' }}>
      <EvolutionChartAxes
        yMetric={yMetric}
        currency={currency}
        yScale={yScale}
        logScaleActive={logScaleActive}
      />
      <Tooltip content={<StackedAreaTooltip currency={currency} />} />
      <Legend content={<EvolutionChartLegend hiddenSeries={hiddenSeries} onToggleSeries={onToggleSeries} />} />
      {visibleSeries.map((item) => (
        <Line
          key={item.dataKey}
          type="monotone"
          dataKey={item.dataKey}
          name={item.name}
          stroke={item.color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      ))}
      <EvolutionChartBrush fullData={fullData} brush={brush} />
    </LineChart>
  )
}
