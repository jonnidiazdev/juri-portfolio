import { useEffect, useState, type RefObject } from 'react'
import * as d3 from 'd3'
import type { EvolutionCurrency, EvolutionYMetric } from '../config/evolutionViews'
import { formatEvolutionAxisValue } from '../components/evolution/evolutionChartFormatters'
import type { EvolutionSeries } from '../components/evolution/evolutionChartTypes'
import type { SnapshotChartPoint } from '../utils/portfolioSnapshot'

const MARGIN = { top: 8, right: 8, bottom: 28, left: 56 }
const TOTAL_LINE_COLOR = '#6badc9'

function getSeriesValue(point: SnapshotChartPoint, key: string): number {
  const value = point[key as keyof SnapshotChartPoint]
  return typeof value === 'number' ? value : 0
}

interface UseD3EvolutionChartOptions {
  containerRef: RefObject<HTMLDivElement | null>
  svgRef: RefObject<SVGSVGElement | null>
  data: SnapshotChartPoint[]
  series: EvolutionSeries[]
  hiddenSeries: string[]
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
  onHoverIndex: (index: number | null) => void
}

export function useD3EvolutionChart({
  containerRef,
  svgRef,
  data,
  series,
  hiddenSeries,
  currency,
  yMetric,
  onHoverIndex,
}: UseD3EvolutionChartOptions) {
  const [sizeVersion, setSizeVersion] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      setSizeVersion((value) => value + 1)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    const svgElement = svgRef.current
    if (!container || !svgElement || data.length === 0) return

    const width = container.clientWidth
    const height = container.clientHeight
    if (width <= 0 || height <= 0) return

    const innerWidth = width - MARGIN.left - MARGIN.right
    const innerHeight = height - MARGIN.top - MARGIN.bottom

    const svg = d3.select(svgElement)
    svg.selectAll('*').remove()
    svg.attr('width', width).attr('height', height).attr('class', 'evolution-d3-chart')

    const visibleSeries = series.filter((item) => !hiddenSeries.includes(item.dataKey))
    const keys = visibleSeries.map((item) => item.dataKey)

    const totals = data.map((point) =>
      keys.reduce((sum, key) => sum + getSeriesValue(point, key), 0)
    )
    const maxY = Math.max(d3.max(totals) ?? 0, 1) * 1.05

    const xScale = d3
      .scaleBand<string>()
      .domain(data.map((point) => point.label))
      .range([0, innerWidth])
      .padding(0.2)

    const yScale = d3.scaleLinear().domain([0, maxY]).range([innerHeight, 0]).nice()

    const chart = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`)

    chart
      .append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .call((selection) => selection.select('.domain').remove())

    const xAxis = chart
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))

    if (data.length > 15) {
      xAxis
        .selectAll('text')
        .attr('transform', 'rotate(-40)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.4em')
        .attr('dy', '0.15em')
    }

    chart
      .append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((value) =>
            formatEvolutionAxisValue(Number(value), currency, yMetric)
          )
      )

    if (keys.length > 0) {
      const stack = d3
        .stack<SnapshotChartPoint, string>()
        .keys(keys)
        .value((point, key) => getSeriesValue(point, key))

      const stacked = stack(data)

      stacked.forEach((layer) => {
        const key = layer.key
        const color = visibleSeries.find((item) => item.dataKey === key)?.color ?? TOTAL_LINE_COLOR

        chart
          .selectAll<SVGRectElement, d3.SeriesPoint<SnapshotChartPoint>>(`rect.bar-${key}`)
          .data(layer)
          .join('rect')
          .attr('class', `bar-${key}`)
          .attr('x', (point) => xScale(point.data.label) ?? 0)
          .attr('y', (point) => yScale(point[1]))
          .attr('height', (point) => Math.max(0, yScale(point[0]) - yScale(point[1])))
          .attr('width', xScale.bandwidth())
          .attr('fill', color)
          .attr('opacity', 0.85)
      })
    }

    const linePoints = data.map((point, index) => ({
      x: (xScale(point.label) ?? 0) + xScale.bandwidth() / 2,
      y: yScale(totals[index]),
      index,
    }))

    if (linePoints.length >= 2) {
      const line = d3
        .line<(typeof linePoints)[number]>()
        .x((point) => point.x)
        .y((point) => point.y)

      chart
        .append('path')
        .attr('class', 'total-line')
        .attr('d', line(linePoints))
        .attr('fill', 'none')
        .attr('stroke', TOTAL_LINE_COLOR)
        .attr('stroke-width', 2)
    }

    chart
      .selectAll<SVGCircleElement, (typeof linePoints)[number]>('circle.total-dot')
      .data(linePoints)
      .join('circle')
      .attr('class', 'total-dot')
      .attr('cx', (point) => point.x)
      .attr('cy', (point) => point.y)
      .attr('r', 3)
      .attr('fill', TOTAL_LINE_COLOR)

    chart
      .selectAll<SVGRectElement, SnapshotChartPoint>('rect.hover-band')
      .data(data)
      .join('rect')
      .attr('class', 'hover-band')
      .attr('x', (point) => xScale(point.label) ?? 0)
      .attr('y', 0)
      .attr('width', xScale.bandwidth())
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mouseenter', (_event, point) => {
        onHoverIndex(data.indexOf(point))
      })
      .on('mouseleave', () => {
        onHoverIndex(null)
      })

    return () => {
      svg.selectAll('*').interrupt()
      onHoverIndex(null)
    }
  }, [containerRef, svgRef, data, series, hiddenSeries, currency, yMetric, onHoverIndex, sizeVersion])
}
