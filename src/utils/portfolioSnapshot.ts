import type { AssetTypeStats } from './assetCalculations'

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
