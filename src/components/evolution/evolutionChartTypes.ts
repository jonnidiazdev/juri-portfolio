export interface ChartBrushProps {
  enabled: boolean
  range: [number, number] | null
  onChange: (range: [number, number] | null) => void
}

export interface EvolutionSeries {
  dataKey: string
  name: string
  color: string
}
