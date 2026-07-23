import { SNAPSHOT_BY_TYPE_SERIES, ASSET_TYPES } from '../config/constants'
import type {
  EvolutionDateFormat,
  EvolutionScope,
  EvolutionYMetric,
  EvolutionCurrency,
} from '../config/evolutionViews'
import type { Asset, CryptoPriceData, SnapshotHolding, SnapshotPriceSource } from '../types'
import { SNAPSHOT_SCHEMA_VERSION } from '../types'
import type {
  PortfolioSnapshot,
  PortfolioSnapshotPayload,
  SnapshotByType,
  SnapshotTotals,
} from '../types'
import {
  computeAssetPL,
  getCurrentPrice,
  type AssetTypeStats,
  type PriceContext,
} from './assetCalculations'

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
  assets?: Asset[]
  priceContext?: PriceContext
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

function normalizeSnapshotHolding(value: unknown): SnapshotHolding | null {
  if (!value || typeof value !== 'object') return null
  const holding = value as Record<string, unknown>
  const assetId = Number(holding.assetId ?? 0)
  if (!assetId) return null

  return {
    assetId,
    type: String(holding.type ?? ''),
    name: String(holding.name ?? ''),
    symbol: holding.symbol != null ? String(holding.symbol) : undefined,
    amount: Number(holding.amount ?? 0),
    purchasePrice: holding.purchasePrice != null ? Number(holding.purchasePrice) : undefined,
    currency: String(holding.currency ?? 'ARS'),
    tna: holding.tna != null ? Number(holding.tna) : undefined,
    startDate: holding.startDate != null ? String(holding.startDate) : undefined,
    endDate: holding.endDate != null ? String(holding.endDate) : undefined,
    bank: holding.bank != null ? String(holding.bank) : undefined,
    tipoEfectivo: holding.tipoEfectivo != null ? String(holding.tipoEfectivo) : undefined,
    banco: holding.banco != null ? String(holding.banco) : undefined,
    descripcion: holding.descripcion != null ? String(holding.descripcion) : undefined,
    marketPrice: Number(holding.marketPrice ?? 0),
    priceSource: holding.priceSource === 'fallback' ? 'fallback' : 'live',
    currentValueARS: Number(holding.currentValueARS ?? 0),
    currentValueUSD: Number(holding.currentValueUSD ?? 0),
    investedARS: Number(holding.investedARS ?? 0),
    investedUSD: Number(holding.investedUSD ?? 0),
    profitARS: Number(holding.profitARS ?? 0),
    profitUSD: Number(holding.profitUSD ?? 0),
    profitPercent: Number(holding.profitPercent ?? 0),
  }
}

function normalizeHoldings(value: unknown): SnapshotHolding[] | undefined {
  if (!Array.isArray(value)) return undefined
  const holdings = value
    .map((entry) => normalizeSnapshotHolding(entry))
    .filter((entry): entry is SnapshotHolding => entry !== null)
  return holdings.length > 0 ? holdings : undefined
}

export function normalizeSnapshot(id: string, data: Record<string, unknown>): PortfolioSnapshot {
  const schemaVersion = Number(data.schemaVersion ?? 1)
  const holdings = normalizeHoldings(data.holdings)

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
    schemaVersion: schemaVersion > 1 ? schemaVersion : holdings ? SNAPSHOT_SCHEMA_VERSION : undefined,
    assetCount: typeof data.assetCount === 'number' ? data.assetCount : holdings?.length,
    holdings,
  }
}

function resolvePriceSource(asset: Asset, prices: PriceContext): SnapshotPriceSource {
  if (asset.type === ASSET_TYPES.CRYPTO) {
    const symbol = String(asset.symbol || '').trim().toLowerCase()
    const data = prices.cryptoPrices?.[symbol]
    if (data && typeof data === 'object' && 'usd' in data) {
      const price = (data as CryptoPriceData).usd
      if (typeof price === 'number' && price > 0) return 'live'
    }
    return 'fallback'
  }

  if (asset.type === ASSET_TYPES.PLAZO_FIJO || asset.type === ASSET_TYPES.EFECTIVO) {
    return 'live'
  }

  const quote = prices.argQuotes?.[asset.id]
  if (typeof quote?.price === 'number' && quote.price > 0) return 'live'
  return 'fallback'
}

export function buildSnapshotHoldings(
  assets: Asset[],
  prices: PriceContext,
  exchangeRate: number
): SnapshotHolding[] {
  const rate = exchangeRate > 0 ? exchangeRate : 1

  return assets.map((asset) => {
    const marketPrice = getCurrentPrice(asset, prices)
    const pl = computeAssetPL(asset, marketPrice, rate)
    const investedARS = pl.investedARS
    const currentARS = pl.currentARS
    const profitARS = pl.plARS
    const profitPercent = investedARS > 0 ? (profitARS / investedARS) * 100 : 0

    return {
      assetId: asset.id,
      type: asset.type,
      name: asset.name,
      symbol: asset.symbol,
      amount: asset.amount,
      purchasePrice: asset.purchasePrice,
      currency: asset.currency,
      tna: asset.tna,
      startDate: asset.startDate,
      endDate: asset.endDate,
      bank: asset.bank,
      tipoEfectivo: asset.tipoEfectivo,
      banco: asset.banco,
      descripcion: asset.descripcion,
      marketPrice,
      priceSource: resolvePriceSource(asset, prices),
      currentValueARS: currentARS,
      currentValueUSD: pl.currentUSD,
      investedARS,
      investedUSD: pl.investedUSD,
      profitARS,
      profitUSD: pl.plUSD,
      profitPercent,
    }
  })
}

export function formatSnapshotDateTime(capturedAt: string): string {
  return new Date(capturedAt).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

function formatSnapshotTime(capturedAt: string): string {
  return new Date(capturedAt).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildUniqueSnapshotLabels(
  snapshots: PortfolioSnapshot[],
  dateFormat: EvolutionDateFormat
): string[] {
  const baseLabels = snapshots.map((snapshot) =>
    formatSnapshotLabel(snapshot.capturedAt, dateFormat)
  )
  const baseCounts = new Map<string, number>()
  for (const label of baseLabels) {
    baseCounts.set(label, (baseCounts.get(label) ?? 0) + 1)
  }

  const candidates = snapshots.map((snapshot, index) => {
    const base = baseLabels[index]
    if ((baseCounts.get(base) ?? 0) <= 1) return base
    return `${base} · ${formatSnapshotTime(snapshot.capturedAt)}`
  })

  const candidateCounts = new Map<string, number>()
  for (const candidate of candidates) {
    candidateCounts.set(candidate, (candidateCounts.get(candidate) ?? 0) + 1)
  }

  const seen = new Map<string, number>()
  return candidates.map((candidate) => {
    if ((candidateCounts.get(candidate) ?? 0) <= 1) return candidate

    const occurrence = (seen.get(candidate) ?? 0) + 1
    seen.set(candidate, occurrence)
    return occurrence === 1 ? candidate : `${candidate} (${occurrence})`
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
  const labels = buildUniqueSnapshotLabels(snapshots, dateFormat)

  return snapshots.map((snapshot, index) => {
    const label = labels[index]
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
    assets,
    priceContext,
    capturedAt = new Date().toISOString(),
  } = input

  const payload: PortfolioSnapshotPayload = {
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

  if (assets && priceContext && assets.length > 0) {
    const holdings = buildSnapshotHoldings(assets, priceContext, exchangeRate)
    payload.schemaVersion = SNAPSHOT_SCHEMA_VERSION
    payload.assetCount = holdings.length
    payload.holdings = holdings
  }

  return payload
}
