import { LineChart, Line, Tooltip } from 'recharts'
import type { EvolutionCurrency, EvolutionYMetric, EvolutionYScale } from '../../config/evolutionViews'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import EvolutionChartAxes from './EvolutionChartAxes'
import { TotalChartTooltip } from './EvolutionChartTooltips'
import type { ChartBrushProps } from './evolutionChartTypes'
import EvolutionChartBrush from './EvolutionChartBrush'

interface EvolutionLineViewProps {
  data: SnapshotChartPoint[]
  fullData: SnapshotChartPoint[]
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
  yScale: EvolutionYScale
  logScaleActive: boolean
  yDomainMin: number | null
  yDomainMax: number | null
  brush: ChartBrushProps
}

export default function EvolutionLineView({
  data,
  fullData,
  currency,
  yMetric,
  yScale,
  logScaleActive,
  yDomainMin,
  yDomainMax,
  brush,
}: EvolutionLineViewProps) {
  return (
    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: brush.enabled ? 24 : 0 }} style={{ background: 'transparent' }}>
      <EvolutionChartAxes
        yMetric={yMetric}
        currency={currency}
        yScale={yScale}
        logScaleActive={logScaleActive}
        yDomainMin={yDomainMin}
        yDomainMax={yDomainMax}
      />
      <Tooltip content={<TotalChartTooltip currency={currency} yMetric={yMetric} />} />
      <Line
        type="monotone"
        dataKey="total"
        name="Total"
        stroke="#6badc9"
        strokeWidth={2}
        dot={{ fill: '#6badc9', r: 3 }}
        activeDot={{ r: 5 }}
        isAnimationActive={false}
      />
      <EvolutionChartBrush fullData={fullData} brush={brush} />
    </LineChart>
  )
}
