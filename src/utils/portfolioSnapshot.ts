import { SNAPSHOT_BY_TYPE_SERIES } from '../config/constants'
import type {
  EvolutionDateFormat,
  EvolutionScope,
  EvolutionYMetric,
  EvolutionCurrency,
} from '../config/evolutionViews'
import type { AssetTypeStats } from './assetCalculations'

export type SnapshotCurrencyMode = EvolutionCurrency
export type SnapshotMetricMode = EvolutionScope

const BY_TYPE_KEYS = ['crypto', 'argentine', 'plazoFijo', 'efectivo'] as const
type ByTypeKey = (typeof BY_TYPE_KEYS)[number]

export interface BuildChartPointsOptions {
  currency: SnapshotCurrencyMode
  scope: EvolutionScope
  yMetric: EvolutionYMetric
  dateFormat: EvolutionDateFormat
}

export interface SnapshotChartPoint {
  label: string
  total?: number
  crypto?: number
  argentine?: number
  plazoFijo?: number
  efectivo?: number
}

const EMPTY_SNAPSHOT_TOTALS: SnapshotTotals = {
  current: 0,
  invested: 0,
  profit: 0,
  profitPercent: 0,
}

export interface SnapshotTotals {
  current: number
  invested: number
  profit: number
  profitPercent: number
}

export interface SnapshotByType {
  crypto: SnapshotTotals
  argentine: SnapshotTotals
  plazoFijo: SnapshotTotals
  efectivo: SnapshotTotals
}

export interface PortfolioSnapshotPayload {
  capturedAt: string
  currencyPreference: string
  exchangeRate: number
  exchangeRateName: string
  totalsARS: SnapshotTotals
  totalsUSD: SnapshotTotals
  byTypeARS: SnapshotByType
  byTypeUSD: SnapshotByType
}

export interface PortfolioSnapshot extends PortfolioSnapshotPayload {
  id: string
}

interface MultiCurrencyTotals {
  invested: number
  current: number
  profit: number
  profitPercent: number
}

interface BuildSnapshotInput {
  currencyPreference: string
  exchangeRate: number
  exchangeRateName: string
  totalsARS: MultiCurrencyTotals
  totalsUSD: MultiCurrencyTotals
  cryptoStats: AssetTypeStats
  argentineStats: AssetTypeStats
  plazoFijoStats: AssetTypeStats
  efectivoStats: AssetTypeStats
  capturedAt?: string
}

function statsToSnapshotTotals(stats: AssetTypeStats): SnapshotTotals {
  return {
    current: stats.totalValue,
    invested: stats.totalInvested,
    profit: stats.profit,
    profitPercent: stats.profitPercent,
  }
}

function statsToSnapshotTotalsUSD(stats: AssetTypeStats, exchangeRate: number): SnapshotTotals {
  const rate = exchangeRate > 0 ? exchangeRate : 1
  return {
    current: stats.totalValue / rate,
    invested: stats.totalInvested / rate,
    profit: stats.profit / rate,
    profitPercent: stats.profitPercent,
  }
}

function multiCurrencyToSnapshotTotals(totals: MultiCurrencyTotals): SnapshotTotals {
  return {
    current: totals.current,
    invested: totals.invested,
    profit: totals.profit,
    profitPercent: totals.profitPercent,
  }
}

function normalizeSnapshotTotals(value: unknown): SnapshotTotals {
  if (!value || typeof value !== 'object') {
    return { ...EMPTY_SNAPSHOT_TOTALS }
  }

  const totals = value as Record<string, unknown>
  return {
    current: Number(totals.current ?? 0),
    invested: Number(totals.invested ?? 0),
    profit: Number(totals.profit ?? 0),
    profitPercent: Number(totals.profitPercent ?? 0),
  }
}

function normalizeSnapshotByType(value: unknown): SnapshotByType {
  const byType = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  return {
    crypto: normalizeSnapshotTotals(byType.crypto),
    argentine: normalizeSnapshotTotals(byType.argentine),
    plazoFijo: normalizeSnapshotTotals(byType.plazoFijo),
    efectivo: normalizeSnapshotTotals(byType.efectivo),
  }
}

export function normalizeSnapshot(id: string, data: Record<string, unknown>): PortfolioSnapshot {
  return {
    id,
    capturedAt: String(data.capturedAt ?? ''),
    currencyPreference: String(data.currencyPreference ?? ''),
    exchangeRate: Number(data.exchangeRate ?? 0),
    exchangeRateName: String(data.exchangeRateName ?? ''),
    totalsARS: normalizeSnapshotTotals(data.totalsARS),
    totalsUSD: normalizeSnapshotTotals(data.totalsUSD),
    byTypeARS: normalizeSnapshotByType(data.byTypeARS),
    byTypeUSD: normalizeSnapshotByType(data.byTypeUSD),
  }
}

function formatSnapshotLabel(capturedAt: string, dateFormat: EvolutionDateFormat): string {
  const date = new Date(capturedAt)
  if (dateFormat === 'medium') {
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })
}

function readMetricValue(
  totals: SnapshotTotals,
  yMetric: EvolutionYMetric
): number {
  return totals[yMetric]
}

export function buildSnapshotChartPoints(
  snapshots: PortfolioSnapshot[],
  options: BuildChartPointsOptions
): SnapshotChartPoint[] {
  const { currency, scope, yMetric, dateFormat } = options

  return snapshots.map((snapshot) => {
    const label = formatSnapshotLabel(snapshot.capturedAt, dateFormat)
    const totals = currency === 'ARS' ? snapshot.totalsARS : snapshot.totalsUSD
    const byType = currency === 'ARS' ? snapshot.byTypeARS : snapshot.byTypeUSD

    if (scope === 'total') {
      return { label, total: readMetricValue(totals, yMetric) }
    }

    return {
      label,
      crypto: readMetricValue(byType.crypto, yMetric),
      argentine: readMetricValue(byType.argentine, yMetric),
      plazoFijo: readMetricValue(byType.plazoFijo, yMetric),
      efectivo: readMetricValue(byType.efectivo, yMetric),
    }
  })
}

export function normalizeToPercentStack(points: SnapshotChartPoint[]): SnapshotChartPoint[] {
  return points.map((point) => {
    const values = BY_TYPE_KEYS.map((key) => ({
      key,
      value: Math.max(0, Number(point[key] ?? 0)),
    }))
    const total = values.reduce((sum, entry) => sum + entry.value, 0)

    if (total <= 0) {
      return { label: point.label }
    }

    const normalized: SnapshotChartPoint = { label: point.label }
    for (const entry of values) {
      normalized[entry.key] = (entry.value / total) * 100
    }
    return normalized
  })
}

export function applyBrushRange(
  points: SnapshotChartPoint[],
  brushRange: [number, number] | null
): SnapshotChartPoint[] {
  if (!brushRange) return points
  const [start, end] = brushRange
  const safeStart = Math.max(0, Math.min(start, points.length - 1))
  const safeEnd = Math.max(safeStart, Math.min(end, points.length - 1))
  return points.slice(safeStart, safeEnd + 1)
}

export function getActiveByTypeSeries(
  snapshots: PortfolioSnapshot[],
  currency: SnapshotCurrencyMode,
  yMetric: EvolutionYMetric = 'current'
) {
  return SNAPSHOT_BY_TYPE_SERIES.filter((series) =>
    snapshots.some((snapshot) => {
      const byType = currency === 'ARS' ? snapshot.byTypeARS : snapshot.byTypeUSD
      return byType[series.dataKey][yMetric] !== 0
    })
  )
}

export function chartDataHasNonPositiveValues(
  points: SnapshotChartPoint[],
  scope: EvolutionScope
): boolean {
  return points.some((point) => {
    if (scope === 'total') {
      return (point.total ?? 0) <= 0
    }
    return BY_TYPE_KEYS.some((key) => (point[key] ?? 0) <= 0)
  })
}

export function buildPortfolioSnapshot(input: BuildSnapshotInput): PortfolioSnapshotPayload {
  const {
    currencyPreference,
    exchangeRate,
    exchangeRateName,
    totalsARS,
    totalsUSD,
    cryptoStats,
    argentineStats,
    plazoFijoStats,
    efectivoStats,
    capturedAt = new Date().toISOString(),
  } = input

  return {
    capturedAt,
    currencyPreference,
    exchangeRate,
    exchangeRateName,
    totalsARS: multiCurrencyToSnapshotTotals(totalsARS),
    totalsUSD: multiCurrencyToSnapshotTotals(totalsUSD),
    byTypeARS: {
      crypto: statsToSnapshotTotals(cryptoStats),
      argentine: statsToSnapshotTotals(argentineStats),
      plazoFijo: statsToSnapshotTotals(plazoFijoStats),
      efectivo: statsToSnapshotTotals(efectivoStats),
    },
    byTypeUSD: {
      crypto: statsToSnapshotTotalsUSD(cryptoStats, exchangeRate),
      argentine: statsToSnapshotTotalsUSD(argentineStats, exchangeRate),
      plazoFijo: statsToSnapshotTotalsUSD(plazoFijoStats, exchangeRate),
      efectivo: statsToSnapshotTotalsUSD(efectivoStats, exchangeRate),
    },
  }
}
