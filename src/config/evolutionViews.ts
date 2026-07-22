export type EvolutionYMetric = 'current' | 'invested' | 'profit' | 'profitPercent'
export type EvolutionChartType = 'line' | 'stackedArea' | 'stackedPercent' | 'multiLine' | 'bar'
export type EvolutionScope = 'total' | 'byType'
export type EvolutionDateFormat = 'short' | 'medium'
export type EvolutionYScale = 'linear' | 'log'
export type EvolutionCurrency = 'ARS' | 'USD'

export interface EvolutionViewDefinition {
  id: string
  label: string
  scope: EvolutionScope
  chartType: EvolutionChartType
  allowedYMetrics: EvolutionYMetric[]
  defaultYMetric: EvolutionYMetric
}

export interface EvolutionViewPrefs {
  viewId: string
  currency: EvolutionCurrency
  yMetric: EvolutionYMetric
  dateFormat: EvolutionDateFormat
  yScale: EvolutionYScale
  hiddenSeries: string[]
  brushRange: [number, number] | null
  yDomainMin: number | null
  yDomainMax: number | null
}

export const EVOLUTION_Y_METRIC_LABELS: Record<EvolutionYMetric, string> = {
  current: 'Valor actual',
  invested: 'Invertido',
  profit: 'Ganancia',
  profitPercent: '% ganancia',
}

export const EVOLUTION_VIEWS: EvolutionViewDefinition[] = [
  {
    id: 'total-line',
    label: 'Valor total',
    scope: 'total',
    chartType: 'line',
    allowedYMetrics: ['current', 'invested', 'profit'],
    defaultYMetric: 'current',
  },
  {
    id: 'type-stacked',
    label: 'Composición',
    scope: 'byType',
    chartType: 'stackedArea',
    allowedYMetrics: ['current', 'invested', 'profit'],
    defaultYMetric: 'current',
  },
  {
    id: 'type-stacked-percent',
    label: 'Composición %',
    scope: 'byType',
    chartType: 'stackedPercent',
    allowedYMetrics: ['current'],
    defaultYMetric: 'current',
  },
  {
    id: 'type-multi-line',
    label: 'Por tipo (líneas)',
    scope: 'byType',
    chartType: 'multiLine',
    allowedYMetrics: ['current', 'invested', 'profit'],
    defaultYMetric: 'current',
  },
  {
    id: 'type-bar',
    label: 'Barras por fecha',
    scope: 'byType',
    chartType: 'bar',
    allowedYMetrics: ['current', 'invested', 'profit'],
    defaultYMetric: 'current',
  },
]

export const DEFAULT_EVOLUTION_PREFS: EvolutionViewPrefs = {
  viewId: 'total-line',
  currency: 'ARS',
  yMetric: 'current',
  dateFormat: 'short',
  yScale: 'linear',
  hiddenSeries: [],
  brushRange: null,
  yDomainMin: null,
  yDomainMax: null,
}

export function getEvolutionView(viewId: string): EvolutionViewDefinition {
  if (viewId === 'type-d3-combo') {
    return EVOLUTION_VIEWS.find((view) => view.id === 'type-stacked') ?? EVOLUTION_VIEWS[0]
  }
  return EVOLUTION_VIEWS.find((view) => view.id === viewId) ?? EVOLUTION_VIEWS[0]
}

export function sanitizeEvolutionPrefs(prefs: Partial<EvolutionViewPrefs>): EvolutionViewPrefs {
  const legacyViewId = (prefs as { viewId?: string }).viewId
  const viewId = legacyViewId === 'type-d3-combo' ? 'type-stacked' : legacyViewId
  const view = getEvolutionView(viewId ?? DEFAULT_EVOLUTION_PREFS.viewId)
  const yMetric = view.allowedYMetrics.includes(prefs.yMetric as EvolutionYMetric)
    ? (prefs.yMetric as EvolutionYMetric)
    : view.defaultYMetric

  const yDomainMin = typeof prefs.yDomainMin === 'number' ? prefs.yDomainMin : null
  const yDomainMax = typeof prefs.yDomainMax === 'number' ? prefs.yDomainMax : null

  return {
    viewId: view.id,
    currency: prefs.currency === 'USD' ? 'USD' : 'ARS',
    yMetric,
    dateFormat: prefs.dateFormat === 'medium' ? 'medium' : 'short',
    yScale: prefs.yScale === 'log' ? 'log' : 'linear',
    hiddenSeries: Array.isArray(prefs.hiddenSeries)
      ? prefs.hiddenSeries.filter((key) =>
          view.scope === 'total' ? key === 'total' : ['crypto', 'argentine', 'plazoFijo', 'efectivo'].includes(key)
        )
      : [],
    brushRange:
      Array.isArray(prefs.brushRange) &&
      prefs.brushRange.length === 2 &&
      typeof prefs.brushRange[0] === 'number' &&
      typeof prefs.brushRange[1] === 'number'
        ? [prefs.brushRange[0], prefs.brushRange[1]]
        : null,
    yDomainMin,
    yDomainMax,
  }
}
