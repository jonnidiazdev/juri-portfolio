import { Brush } from 'recharts'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import type { ChartBrushProps } from './evolutionChartTypes'

interface EvolutionChartBrushProps {
  fullData: SnapshotChartPoint[]
  brush: ChartBrushProps
}

export default function EvolutionChartBrush({ fullData, brush }: EvolutionChartBrushProps) {
  if (!brush.enabled || fullData.length < 3) return null

  const maxIndex = fullData.length - 1
  const rawStart = brush.range?.[0] ?? 0
  const rawEnd = brush.range?.[1] ?? maxIndex
  const startIndex = Math.max(0, Math.min(rawStart, maxIndex))
  const endIndex = Math.max(startIndex, Math.min(rawEnd, maxIndex))

  return (
    <Brush
      dataKey="label"
      height={24}
      stroke="var(--color-border)"
      fill="var(--color-surface)"
      travellerWidth={8}
      startIndex={startIndex}
      endIndex={endIndex}
      onChange={(range) => {
        if (range?.startIndex == null || range?.endIndex == null) {
          brush.onChange(null)
          return
        }

        const nextStart = Math.max(0, Math.min(range.startIndex, maxIndex))
        const nextEnd = Math.max(nextStart, Math.min(range.endIndex, maxIndex))

        if (nextStart === 0 && nextEnd === maxIndex) {
          brush.onChange(null)
          return
        }

        brush.onChange([nextStart, nextEnd])
      }}
    />
  )
}
