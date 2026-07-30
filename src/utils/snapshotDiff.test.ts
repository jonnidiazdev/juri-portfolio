import { describe, it, expect } from 'vitest'
import type { PortfolioSnapshot, SnapshotHolding } from '../types'
import {
  buildAssetEvolutionSeries,
  canCompareSnapshots,
  collectSnapshotAssets,
  compareSnapshots,
  snapshotHasHoldings,
} from './snapshotDiff'

function makeHolding(overrides: Partial<SnapshotHolding> & Pick<SnapshotHolding, 'assetId' | 'name'>): SnapshotHolding {
  return {
    type: 'accion',
    symbol: 'TEST',
    amount: 10,
    purchasePrice: 100,
    currency: 'ARS',
    marketPrice: 110,
    priceSource: 'live',
    currentValueARS: 1100,
    currentValueUSD: 1.1,
    investedARS: 1000,
    investedUSD: 1,
    profitARS: 100,
    profitUSD: 0.1,
    profitPercent: 10,
    ...overrides,
  }
}

function makeSnapshot(
  id: string,
  capturedAt: string,
  holdings: SnapshotHolding[],
  totalCurrent = 1100
): PortfolioSnapshot {
  const totals = {
    current: totalCurrent,
    invested: 1000,
    profit: totalCurrent - 1000,
    profitPercent: 10,
  }
  return {
    id,
    capturedAt,
    currencyPreference: 'blue',
    exchangeRate: 1000,
    exchangeRateName: 'Dólar blue',
    totalsARS: totals,
    totalsUSD: {
      current: totalCurrent / 1000,
      invested: 1,
      profit: (totalCurrent - 1000) / 1000,
      profitPercent: 10,
    },
    byTypeARS: {
      crypto: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      argentine: totals,
      plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
    },
    byTypeUSD: {
      crypto: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      argentine: {
        current: totalCurrent / 1000,
        invested: 1,
        profit: (totalCurrent - 1000) / 1000,
        profitPercent: 10,
      },
      plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
    },
    schemaVersion: 2,
    assetCount: holdings.length,
    holdings,
  }
}

describe('snapshotHasHoldings', () => {
  it('returns true when holdings exist', () => {
    const snapshot = makeSnapshot('1', '2026-07-01T12:00:00.000Z', [
      makeHolding({ assetId: 1, name: 'Test' }),
    ])
    expect(snapshotHasHoldings(snapshot)).toBe(true)
  })

  it('returns false for legacy snapshots', () => {
    const snapshot = makeSnapshot('1', '2026-07-01T12:00:00.000Z', [])
    expect(snapshotHasHoldings({ ...snapshot, holdings: undefined })).toBe(false)
  })
})

describe('compareSnapshots', () => {
  it('detects opened and closed positions', () => {
    const prev = makeSnapshot('1', '2026-07-01T12:00:00.000Z', [
      makeHolding({ assetId: 1, name: 'PAMP', symbol: 'PAMP', currentValueARS: 1000, investedARS: 900 }),
    ], 1000)
    const curr = makeSnapshot('2', '2026-07-15T12:00:00.000Z', [
      makeHolding({ assetId: 2, name: 'GGAL', symbol: 'GGAL', currentValueARS: 1200, investedARS: 1100 }),
    ], 1200)

    const result = compareSnapshots(prev, curr)
    expect(result.events.some((event) => event.kind === 'closed')).toBe(true)
    expect(result.events.some((event) => event.kind === 'opened')).toBe(true)
    expect(result.rotations).toHaveLength(1)
  })

  it('detects quantity increase and market move', () => {
    const prev = makeSnapshot('1', '2026-07-01T12:00:00.000Z', [
      makeHolding({
        assetId: 1,
        name: 'GGAL',
        symbol: 'GGAL',
        amount: 10,
        marketPrice: 100,
        currentValueARS: 1000,
        investedARS: 900,
      }),
    ], 1000)
    const curr = makeSnapshot('2', '2026-07-15T12:00:00.000Z', [
      makeHolding({
        assetId: 1,
        name: 'GGAL',
        symbol: 'GGAL',
        amount: 15,
        marketPrice: 110,
        currentValueARS: 1650,
        investedARS: 1350,
      }),
    ], 1650)

    const result = compareSnapshots(prev, curr)
    expect(result.events.some((event) => event.kind === 'quantityUp')).toBe(true)
    expect(canCompareSnapshots(prev, curr)).toBe(true)
  })
})

describe('buildAssetEvolutionSeries', () => {
  it('builds a series for a selected asset key', () => {
    const snapshots = [
      makeSnapshot('1', '2026-07-01T12:00:00.000Z', [
        makeHolding({ assetId: 1, name: 'GGAL', symbol: 'GGAL', currentValueARS: 1000 }),
      ]),
      makeSnapshot('2', '2026-07-15T12:00:00.000Z', [
        makeHolding({ assetId: 1, name: 'GGAL', symbol: 'GGAL', currentValueARS: 1200 }),
      ]),
    ]

    const series = buildAssetEvolutionSeries(snapshots, 'accion:ggal')
    expect(series).toHaveLength(2)
    expect(series[1].currentValueARS).toBe(1200)
  })
})

describe('collectSnapshotAssets', () => {
  it('returns unique assets across snapshots', () => {
    const snapshots = [
      makeSnapshot('1', '2026-07-01T12:00:00.000Z', [
        makeHolding({ assetId: 1, name: 'GGAL', symbol: 'GGAL' }),
      ]),
      makeSnapshot('2', '2026-07-15T12:00:00.000Z', [
        makeHolding({ assetId: 1, name: 'GGAL', symbol: 'GGAL' }),
        makeHolding({ assetId: 2, name: 'BTC', symbol: 'bitcoin', type: 'crypto' }),
      ]),
    ]

    const assets = collectSnapshotAssets(snapshots)
    expect(assets).toHaveLength(2)
  })
})
