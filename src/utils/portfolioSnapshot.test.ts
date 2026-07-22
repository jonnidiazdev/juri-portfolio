import { describe, it, expect } from 'vitest'
import {
  buildPortfolioSnapshot,
  buildSnapshotChartPoints,
  getActiveByTypeSeries,
  normalizeSnapshot,
  normalizeToPercentStack,
} from './portfolioSnapshot'
import type { AssetTypeStats } from './assetCalculations'
import type { PortfolioSnapshot } from '../types'

const emptyStats: AssetTypeStats = {
  totalValue: 0,
  totalInvested: 0,
  profit: 0,
  profitPercent: 0,
  isProfit: true,
}

const cryptoStats: AssetTypeStats = {
  totalValue: 1000000,
  totalInvested: 800000,
  profit: 200000,
  profitPercent: 25,
  isProfit: true,
}

const argentineStats: AssetTypeStats = {
  totalValue: 500000,
  totalInvested: 400000,
  profit: 100000,
  profitPercent: 25,
  isProfit: true,
}

describe('buildPortfolioSnapshot', () => {
  it('builds snapshot with totals and by-type breakdown in ARS and USD', () => {
    const result = buildPortfolioSnapshot({
      currencyPreference: 'blue',
      exchangeRate: 1000,
      exchangeRateName: 'Dólar blue',
      totalsARS: { current: 1500000, invested: 1200000, profit: 300000, profitPercent: 25 },
      totalsUSD: { current: 1500, invested: 1200, profit: 300, profitPercent: 25 },
      cryptoStats,
      argentineStats,
      plazoFijoStats: emptyStats,
      efectivoStats: emptyStats,
      capturedAt: '2026-06-25T12:00:00.000Z',
    })

    expect(result.capturedAt).toBe('2026-06-25T12:00:00.000Z')
    expect(result.currencyPreference).toBe('blue')
    expect(result.exchangeRate).toBe(1000)
    expect(result.totalsARS.current).toBe(1500000)
    expect(result.totalsUSD.current).toBe(1500)
    expect(result.byTypeARS.crypto.current).toBe(1000000)
    expect(result.byTypeARS.argentine.invested).toBe(400000)
    expect(result.byTypeUSD.crypto.current).toBe(1000)
    expect(result.byTypeUSD.argentine.profit).toBe(100)
  })

  it('uses current time when capturedAt is omitted', () => {
    const before = Date.now()
    const result = buildPortfolioSnapshot({
      currencyPreference: 'blue',
      exchangeRate: 1000,
      exchangeRateName: 'Dólar blue',
      totalsARS: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      totalsUSD: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      cryptoStats: emptyStats,
      argentineStats: emptyStats,
      plazoFijoStats: emptyStats,
      efectivoStats: emptyStats,
    })
    const after = Date.now()

    const captured = new Date(result.capturedAt).getTime()
    expect(captured).toBeGreaterThanOrEqual(before)
    expect(captured).toBeLessThanOrEqual(after)
  })
})

describe('normalizeSnapshot', () => {
  it('fills missing by-type fields with zero defaults', () => {
    const result = normalizeSnapshot('snap-1', {
      capturedAt: '2026-06-25T12:00:00.000Z',
      currencyPreference: 'blue',
      exchangeRate: 1000,
      exchangeRateName: 'Dólar blue',
      totalsARS: { current: 100, invested: 80, profit: 20, profitPercent: 25 },
      totalsUSD: { current: 0.1, invested: 0.08, profit: 0.02, profitPercent: 25 },
    })

    expect(result.id).toBe('snap-1')
    expect(result.byTypeARS.crypto.current).toBe(0)
    expect(result.byTypeARS.plazoFijo.profitPercent).toBe(0)
    expect(result.byTypeUSD.efectivo.invested).toBe(0)
  })

  it('normalizes partial by-type entries', () => {
    const result = normalizeSnapshot('snap-2', {
      capturedAt: '2026-06-25T12:00:00.000Z',
      byTypeARS: {
        crypto: { current: 500, invested: 400 },
      },
    })

    expect(result.byTypeARS.crypto).toEqual({
      current: 500,
      invested: 400,
      profit: 0,
      profitPercent: 0,
    })
    expect(result.byTypeARS.argentine.current).toBe(0)
  })
})

describe('buildSnapshotChartPoints', () => {
  const snapshots: PortfolioSnapshot[] = [
    {
      id: '1',
      capturedAt: '2026-06-01T12:00:00.000Z',
      currencyPreference: 'blue',
      exchangeRate: 1000,
      exchangeRateName: 'Dólar blue',
      totalsARS: { current: 1500000, invested: 1200000, profit: 300000, profitPercent: 25 },
      totalsUSD: { current: 1500, invested: 1200, profit: 300, profitPercent: 25 },
      byTypeARS: {
        crypto: { current: 1000000, invested: 800000, profit: 200000, profitPercent: 25 },
        argentine: { current: 500000, invested: 400000, profit: 100000, profitPercent: 25 },
        plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
        efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      },
      byTypeUSD: {
        crypto: { current: 1000, invested: 800, profit: 200, profitPercent: 25 },
        argentine: { current: 500, invested: 400, profit: 100, profitPercent: 25 },
        plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
        efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      },
    },
    {
      id: '2',
      capturedAt: '2026-06-15T12:00:00.000Z',
      currencyPreference: 'blue',
      exchangeRate: 1000,
      exchangeRateName: 'Dólar blue',
      totalsARS: { current: 2000000, invested: 1500000, profit: 500000, profitPercent: 33.33 },
      totalsUSD: { current: 2000, invested: 1500, profit: 500, profitPercent: 33.33 },
      byTypeARS: {
        crypto: { current: 1200000, invested: 900000, profit: 300000, profitPercent: 33.33 },
        argentine: { current: 600000, invested: 450000, profit: 150000, profitPercent: 33.33 },
        plazoFijo: { current: 200000, invested: 150000, profit: 50000, profitPercent: 33.33 },
        efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      },
      byTypeUSD: {
        crypto: { current: 1200, invested: 900, profit: 300, profitPercent: 33.33 },
        argentine: { current: 600, invested: 450, profit: 150, profitPercent: 33.33 },
        plazoFijo: { current: 200, invested: 150, profit: 50, profitPercent: 33.33 },
        efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      },
    },
  ]

  it('builds total series from snapshot totals', () => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: 'ARS',
      scope: 'total',
      yMetric: 'current',
      dateFormat: 'short',
    })

    expect(points).toHaveLength(2)
    expect(points[0].total).toBe(1500000)
    expect(points[1].total).toBe(2000000)
    expect(points[0].crypto).toBeUndefined()
  })

  it('builds by-type series with current values per category', () => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: 'USD',
      scope: 'byType',
      yMetric: 'current',
      dateFormat: 'short',
    })

    expect(points[0]).toMatchObject({
      crypto: 1000,
      argentine: 500,
      plazoFijo: 0,
      efectivo: 0,
    })
    expect(points[1].plazoFijo).toBe(200)
  })

  it('builds invested metric for total scope', () => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: 'ARS',
      scope: 'total',
      yMetric: 'invested',
      dateFormat: 'short',
    })

    expect(points[0].total).toBe(1200000)
    expect(points[1].total).toBe(1500000)
  })

  it('normalizes by-type points to percent stack', () => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: 'ARS',
      scope: 'byType',
      yMetric: 'current',
      dateFormat: 'short',
    })
    const normalized = normalizeToPercentStack(points)

    expect(normalized[0].crypto).toBeCloseTo(66.666, 2)
    expect(normalized[0].argentine).toBeCloseTo(33.333, 2)
    expect((normalized[0].crypto ?? 0) + (normalized[0].argentine ?? 0)).toBeCloseTo(100, 2)
  })

  const sameDayBase = {
    currencyPreference: 'blue',
    exchangeRate: 1000,
    exchangeRateName: 'Dólar blue',
    byTypeARS: {
      crypto: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      argentine: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
    },
    byTypeUSD: {
      crypto: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      argentine: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
    },
  } satisfies Omit<PortfolioSnapshot, 'id' | 'capturedAt' | 'totalsARS' | 'totalsUSD'>

  it('assigns unique labels with time when multiple snapshots share a day', () => {
    const sameDaySnapshots: PortfolioSnapshot[] = [
      {
        ...sameDayBase,
        id: 'a',
        capturedAt: '2026-07-22T13:00:00.000Z',
        totalsARS: { current: 1000000, invested: 800000, profit: 200000, profitPercent: 25 },
        totalsUSD: { current: 1000, invested: 800, profit: 200, profitPercent: 25 },
      },
      {
        ...sameDayBase,
        id: 'b',
        capturedAt: '2026-07-22T21:00:00.000Z',
        totalsARS: { current: 1100000, invested: 850000, profit: 250000, profitPercent: 29 },
        totalsUSD: { current: 1100, invested: 850, profit: 250, profitPercent: 29 },
      },
    ]

    const points = buildSnapshotChartPoints(sameDaySnapshots, {
      currency: 'ARS',
      scope: 'total',
      yMetric: 'current',
      dateFormat: 'short',
    })

    expect(points).toHaveLength(2)
    expect(points[0].label).not.toBe(points[1].label)
    expect(points[0].label).toContain(' · ')
    expect(points[1].label).toContain(' · ')
    expect(points[0].total).toBe(1000000)
    expect(points[1].total).toBe(1100000)
  })

  it('keeps date-only labels when each snapshot is on a different day', () => {
    const points = buildSnapshotChartPoints(snapshots, {
      currency: 'ARS',
      scope: 'total',
      yMetric: 'current',
      dateFormat: 'short',
    })

    for (const point of points) {
      expect(point.label).not.toContain(' · ')
    }
  })

  it('assigns three unique labels for three same-day snapshots', () => {
    const tripleSameDay: PortfolioSnapshot[] = [
      {
        ...sameDayBase,
        id: 'a',
        capturedAt: '2026-07-22T13:00:00.000Z',
        totalsARS: { current: 1000000, invested: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { current: 1000, invested: 0, profit: 0, profitPercent: 0 },
      },
      {
        ...sameDayBase,
        id: 'b',
        capturedAt: '2026-07-22T17:00:00.000Z',
        totalsARS: { current: 1050000, invested: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { current: 1050, invested: 0, profit: 0, profitPercent: 0 },
      },
      {
        ...sameDayBase,
        id: 'c',
        capturedAt: '2026-07-22T21:00:00.000Z',
        totalsARS: { current: 1100000, invested: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { current: 1100, invested: 0, profit: 0, profitPercent: 0 },
      },
    ]

    const points = buildSnapshotChartPoints(tripleSameDay, {
      currency: 'ARS',
      scope: 'total',
      yMetric: 'current',
      dateFormat: 'short',
    })

    const labels = points.map((point) => point.label)
    expect(new Set(labels).size).toBe(3)
  })

  it('adds numeric suffix when same-day snapshots share the same minute', () => {
    const sameMinuteSnapshots: PortfolioSnapshot[] = [
      {
        ...sameDayBase,
        id: 'a',
        capturedAt: '2026-07-22T13:00:00.000Z',
        totalsARS: { current: 1000000, invested: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { current: 1000, invested: 0, profit: 0, profitPercent: 0 },
      },
      {
        ...sameDayBase,
        id: 'b',
        capturedAt: '2026-07-22T13:00:30.000Z',
        totalsARS: { current: 1100000, invested: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { current: 1100, invested: 0, profit: 0, profitPercent: 0 },
      },
    ]

    const points = buildSnapshotChartPoints(sameMinuteSnapshots, {
      currency: 'ARS',
      scope: 'total',
      yMetric: 'current',
      dateFormat: 'short',
    })

    expect(points[0].label).not.toBe(points[1].label)
    expect(points[1].label).toMatch(/ \(2\)$/)
  })
})

describe('getActiveByTypeSeries', () => {
  const snapshots: PortfolioSnapshot[] = [
    {
      id: '1',
      capturedAt: '2026-06-01T12:00:00.000Z',
      currencyPreference: 'blue',
      exchangeRate: 1000,
      exchangeRateName: 'Dólar blue',
      totalsARS: { current: 100, invested: 80, profit: 20, profitPercent: 25 },
      totalsUSD: { current: 0.1, invested: 0.08, profit: 0.02, profitPercent: 25 },
      byTypeARS: {
        crypto: { current: 100, invested: 80, profit: 20, profitPercent: 25 },
        argentine: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
        plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
        efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      },
      byTypeUSD: {
        crypto: { current: 0.1, invested: 0.08, profit: 0.02, profitPercent: 25 },
        argentine: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
        plazoFijo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
        efectivo: { current: 0, invested: 0, profit: 0, profitPercent: 0 },
      },
    },
  ]

  it('omits categories with zero value across all snapshots', () => {
    const active = getActiveByTypeSeries(snapshots, 'ARS')

    expect(active.map((series) => series.dataKey)).toEqual(['crypto'])
  })
})
