import { AreaChart, Area, Tooltip, Legend } from 'recharts'
import type { EvolutionCurrency } from '../../config/evolutionViews'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import EvolutionChartAxes from './EvolutionChartAxes'
import { StackedAreaTooltip } from './EvolutionChartTooltips'
import type { ChartBrushProps, EvolutionSeries } from './evolutionChartTypes'
import EvolutionChartBrush from './EvolutionChartBrush'
import EvolutionChartLegend from './EvolutionChartLegend'

interface EvolutionStackedPercentViewProps {
  data: SnapshotChartPoint[]
  fullData: SnapshotChartPoint[]
  series: EvolutionSeries[]
  hiddenSeries: string[]
  currency: EvolutionCurrency
  yDomainMin: number | null
  yDomainMax: number | null
  brush: ChartBrushProps
  onToggleSeries: (dataKey: string) => void
}

export default function EvolutionStackedPercentView({
  data,
  fullData,
  series,
  hiddenSeries,
  currency,
  brush,
  onToggleSeries,
}: EvolutionStackedPercentViewProps) {
  const visibleSeries = series.filter((item) => !hiddenSeries.includes(item.dataKey))

  return (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: brush.enabled ? 24 : 0 }} style={{ background: 'transparent' }}>
      <EvolutionChartAxes
        yMetric="current"
        currency={currency}
        yScale="linear"
        isPercentStack
      />
      <Tooltip content={<StackedAreaTooltip currency={currency} isPercentStack />} />
      <Legend content={<EvolutionChartLegend hiddenSeries={hiddenSeries} onToggleSeries={onToggleSeries} />} />
      {visibleSeries.map((item) => (
        <Area
          key={item.dataKey}
          type="monotone"
          dataKey={item.dataKey}
          name={item.name}
          stackId="composition-percent"
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
