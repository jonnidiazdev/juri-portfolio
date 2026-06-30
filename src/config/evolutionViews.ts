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
}

export function getEvolutionView(viewId: string): EvolutionViewDefinition {
  return EVOLUTION_VIEWS.find((view) => view.id === viewId) ?? EVOLUTION_VIEWS[0]
}

export function sanitizeEvolutionPrefs(prefs: EvolutionViewPrefs): EvolutionViewPrefs {
  const view = getEvolutionView(prefs.viewId)
  const yMetric = view.allowedYMetrics.includes(prefs.yMetric)
    ? prefs.yMetric
    : view.defaultYMetric

  return {
    ...prefs,
    viewId: view.id,
    yMetric,
    hiddenSeries: prefs.hiddenSeries.filter((key) =>
      view.scope === 'total' ? key === 'total' : ['crypto', 'argentine', 'plazoFijo', 'efectivo'].includes(key)
    ),
  }
}
