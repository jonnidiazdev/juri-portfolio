import { CartesianGrid, XAxis, YAxis } from 'recharts'
import type { EvolutionCurrency, EvolutionYMetric, EvolutionYScale } from '../../config/evolutionViews'
import { formatEvolutionAxisValue } from './evolutionChartFormatters'

interface EvolutionChartAxesProps {
  yMetric: EvolutionYMetric
  currency: EvolutionCurrency
  yScale: EvolutionYScale
  isPercentStack?: boolean
  logScaleActive?: boolean
}

export default function EvolutionChartAxes({
  yMetric,
  currency,
  yScale,
  isPercentStack = false,
  logScaleActive = false,
}: EvolutionChartAxesProps) {
  const useLog = yScale === 'log' && logScaleActive && !isPercentStack

  return (
    <>
      <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fill: 'var(--color-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
        axisLine={{ stroke: 'var(--color-border)' }}
        tickLine={false}
      />
      <YAxis
        scale={useLog ? 'log' : 'linear'}
        domain={isPercentStack ? [0, 100] : useLog ? ['auto', 'auto'] : undefined}
        tickFormatter={(value) =>
          formatEvolutionAxisValue(Number(value), currency, yMetric, isPercentStack)
        }
        tick={{ fill: 'var(--color-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
        axisLine={false}
        tickLine={false}
        width={56}
      />
    </>
  )
}
