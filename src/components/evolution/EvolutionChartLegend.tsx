interface LegendEntry {
  dataKey?: string | number
  value?: string
  color?: string
}

interface EvolutionChartLegendProps {
  payload?: ReadonlyArray<LegendEntry>
  hiddenSeries: string[]
  onToggleSeries: (dataKey: string) => void
}

export default function EvolutionChartLegend({
  payload,
  hiddenSeries,
  onToggleSeries,
}: EvolutionChartLegendProps) {
  if (!payload?.length) return null

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
      {payload.map((entry) => {
        const dataKey = String(entry.dataKey ?? '')
        const isHidden = hiddenSeries.includes(dataKey)
        return (
          <li key={dataKey}>
            <button
              type="button"
              onClick={() => onToggleSeries(dataKey)}
              className={`flex items-center gap-1.5 text-xs font-mono-data transition-opacity ${
                isHidden ? 'opacity-40 line-through' : 'opacity-100'
              }`}
              style={{ color: 'var(--color-muted)' }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.value}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
