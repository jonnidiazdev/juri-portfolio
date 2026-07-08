import { AreaChart, Area, Tooltip, Legend } from 'recharts'
import type { EvolutionCurrency, EvolutionYMetric, EvolutionYScale } from '../../config/evolutionViews'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import EvolutionChartAxes from './EvolutionChartAxes'
import { StackedAreaTooltip } from './EvolutionChartTooltips'
import type { ChartBrushProps, EvolutionSeries } from './evolutionChartTypes'
import EvolutionChartBrush from './EvolutionChartBrush'
import EvolutionChartLegend from './EvolutionChartLegend'

interface EvolutionStackedAreaViewProps {
  data: SnapshotChartPoint[]
  fullData: SnapshotChartPoint[]
  series: EvolutionSeries[]
  hiddenSeries: string[]
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
  yScale: EvolutionYScale
  logScaleActive: boolean
  yDomainMin: number | null
  yDomainMax: number | null
  brush: ChartBrushProps
  onToggleSeries: (dataKey: string) => void
}

export default function EvolutionStackedAreaView({
  data,
  fullData,
  series,
  hiddenSeries,
  currency,
  yMetric,
  yScale,
  logScaleActive,
  yDomainMin,
  yDomainMax,
  brush,
  onToggleSeries,
}: EvolutionStackedAreaViewProps) {
  const visibleSeries = series.filter((item) => !hiddenSeries.includes(item.dataKey))

  return (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: brush.enabled ? 24 : 0 }} style={{ background: 'transparent' }}>
      <EvolutionChartAxes
        yMetric={yMetric}
        currency={currency}
        yScale={yScale}
        logScaleActive={logScaleActive}
        yDomainMin={yDomainMin}
        yDomainMax={yDomainMax}
      />
      <Tooltip content={<StackedAreaTooltip currency={currency} />} />
      <Legend content={<EvolutionChartLegend hiddenSeries={hiddenSeries} onToggleSeries={onToggleSeries} />} />
      {visibleSeries.map((item) => (
        <Area
          key={item.dataKey}
          type="monotone"
          dataKey={item.dataKey}
          name={item.name}
          stackId="composition"
          stroke={item.color}
          fill={item.color}
          fillOpacity={0.65}
          isAnimationActive={false}
        />
      ))}
      <EvolutionChartBrush fullData={fullData} brush={brush} />
    </AreaChart>
  )
}
