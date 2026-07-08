import { CartesianGrid, XAxis, YAxis } from 'recharts'
import type { EvolutionCurrency, EvolutionYMetric, EvolutionYScale } from '../../config/evolutionViews'
import { resolveEvolutionYDomain } from '../../utils/evolutionYDomain'
import { formatEvolutionAxisValue } from './evolutionChartFormatters'

interface EvolutionChartAxesProps {
  yMetric: EvolutionYMetric
  currency: EvolutionCurrency
  yScale: EvolutionYScale
  isPercentStack?: boolean
  logScaleActive?: boolean
  yDomainMin?: number | null
  yDomainMax?: number | null
}

export default function EvolutionChartAxes({
  yMetric,
  currency,
  yScale,
  isPercentStack = false,
  logScaleActive = false,
  yDomainMin = null,
  yDomainMax = null,
}: EvolutionChartAxesProps) {
  const useLog = yScale === 'log' && logScaleActive && !isPercentStack
  const domain = resolveEvolutionYDomain({
    isPercentStack,
    logScaleActive: useLog,
    yDomainMin,
    yDomainMax,
  })

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
        domain={domain}
        allowDataOverflow={yDomainMin !== null || yDomainMax !== null}
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
