import { Brush } from 'recharts'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import type { ChartBrushProps } from './evolutionChartTypes'

interface EvolutionChartBrushProps {
  fullData: SnapshotChartPoint[]
  brush: ChartBrushProps
}

export default function EvolutionChartBrush({ fullData, brush }: EvolutionChartBrushProps) {
  if (!brush.enabled || fullData.length < 3) return null

  const startIndex = brush.range?.[0] ?? 0
  const endIndex = brush.range?.[1] ?? fullData.length - 1

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
        brush.onChange([range.startIndex, range.endIndex])
      }}
    />
  )
}
