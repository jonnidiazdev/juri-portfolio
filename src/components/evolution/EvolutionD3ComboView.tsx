import { useCallback, useMemo, useRef, useState } from 'react'
import type { EvolutionCurrency, EvolutionYMetric } from '../../config/evolutionViews'
import { formatCurrency } from '../../utils/formatters'
import type { SnapshotChartPoint } from '../../utils/portfolioSnapshot'
import { useD3EvolutionChart } from '../../hooks/useD3EvolutionChart'
import EvolutionChartLegend from './EvolutionChartLegend'
import type { EvolutionSeries } from './evolutionChartTypes'

interface EvolutionD3ComboViewProps {
  data: SnapshotChartPoint[]
  series: EvolutionSeries[]
  hiddenSeries: string[]
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
  onToggleSeries: (dataKey: string) => void
}

function getSeriesValue(point: SnapshotChartPoint, key: string): number {
  const value = point[key as keyof SnapshotChartPoint]
  return typeof value === 'number' ? value : 0
}

export default function EvolutionD3ComboView({
  data,
  series,
  hiddenSeries,
  currency,
  yMetric,
  onToggleSeries,
}: EvolutionD3ComboViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleHoverIndex = useCallback((index: number | null) => {
    setHoveredIndex(index)
  }, [])

  useD3EvolutionChart({
    containerRef,
    svgRef,
    data,
    series,
    hiddenSeries,
    currency,
    yMetric,
    onHoverIndex: handleHoverIndex,
  })

  const legendPayload = useMemo(
    () => [
      ...series.map((item) => ({
        dataKey: item.dataKey,
        value: item.name,
        color: item.color,
      })),
      {
        dataKey: 'total-line',
        value: 'Total (línea)',
        color: '#6badc9',
      },
    ],
    [series]
  )

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null
  const visibleSeries = series.filter((item) => !hiddenSeries.includes(item.dataKey))

  const tooltipEntries = hoveredPoint
    ? visibleSeries
        .map((item) => ({
          name: item.name,
          value: getSeriesValue(hoveredPoint, item.dataKey),
          color: item.color,
        }))
        .filter((entry) => entry.value !== 0)
    : []

  const tooltipTotal = tooltipEntries.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full">
        <svg ref={svgRef} role="img" aria-label="Gráfico de evolución con barras apiladas y línea de total" />
      </div>

      {hoveredPoint && tooltipEntries.length > 0 && (
        <div className="pointer-events-none absolute top-2 right-2 z-10">
          <div className="card px-3 py-2 text-sm shadow-lg">
            <p className="text-muted text-xs font-mono-data mb-2">{hoveredPoint.label}</p>
            {tooltipEntries.map((entry) => {
              const percent = tooltipTotal > 0 ? (entry.value / tooltipTotal) * 100 : 0
              return (
                <p key={entry.name} className="font-mono-data text-paper flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted">{entry.name}:</span>
                  {formatCurrency(entry.value, currency)}
                  <span className="text-subtle text-xs">({percent.toFixed(1)}%)</span>
                </p>
              )
            })}
            <p className="font-mono-data text-paper mt-2 pt-2 border-t border-border">
              Total: {formatCurrency(tooltipTotal, currency)}
            </p>
          </div>
        </div>
      )}

      <EvolutionChartLegend
        payload={legendPayload}
        hiddenSeries={hiddenSeries}
        onToggleSeries={(dataKey) => {
          if (dataKey !== 'total-line') {
            onToggleSeries(dataKey)
          }
        }}
      />
    </div>
  )
}
