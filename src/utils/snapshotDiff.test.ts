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
    const closedEvent = result.events.find((event) => event.kind === 'closed')
    const openedEvent = result.events.find((event) => event.kind === 'opened')
    expect(closedEvent).toBeDefined()
    expect(openedEvent).toBeDefined()
    // Compra suma el monto invertido; venta resta el monto que sale de la posición.
    expect(openedEvent?.impactARS).toBeCloseTo(1100, 5)
    expect(closedEvent?.impactARS).toBeCloseTo(-1000, 5)
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

  it('detects quantity decrease and subtracts the exit value sold (not the realized gain)', () => {
    const prev = makeSnapshot('1', '2026-07-01T12:00:00.000Z', [
      makeHolding({
        assetId: 1,
        name: 'GGAL',
        symbol: 'GGAL',
        amount: 10,
        purchasePrice: 100,
        marketPrice: 110,
        currentValueARS: 1100,
        investedARS: 1000,
      }),
    ], 1100)
    const curr = makeSnapshot('2', '2026-07-15T12:00:00.000Z', [
      makeHolding({
        assetId: 1,
        name: 'GGAL',
        symbol: 'GGAL',
        amount: 6,
        purchasePrice: 100,
        marketPrice: 110,
        currentValueARS: 660,
        investedARS: 600,
      }),
    ], 660)

    const result = compareSnapshots(prev, curr)
    const quantityDownEvent = result.events.find((event) => event.kind === 'quantityDown')
    expect(quantityDownEvent).toBeDefined()
    // Se vendieron 4 unidades a 110 = 440 de valor de salida; la ganancia realizada
    // (440 - 4*100 = 40) no debe usarse como impacto.
    expect(quantityDownEvent?.impactARS).toBeCloseTo(-440, 5)
  })
})

describe('compareSnapshots - efectivo', () => {
  function makeCashHolding(overrides: Partial<SnapshotHolding> & Pick<SnapshotHolding, 'assetId' | 'name'>): SnapshotHolding {
    return makeHolding({
      type: 'efectivo',
      symbol: '',
      purchasePrice: undefined,
      investedARS: 0,
      investedUSD: 0,
      profitARS: 0,
      profitUSD: 0,
      profitPercent: 0,
      marketPrice: 1,
      ...overrides,
    })
  }

  it('does not report movement when a single cash account is unchanged', () => {
    const cash = makeCashHolding({
      assetId: 1,
      name: 'Efectivo en pesos',
      currency: 'ARS',
      amount: 50000,
      currentValueARS: 50000,
      currentValueUSD: 50,
    })
    const prev = makeSnapshot('1', '2026-07-01T12:00:00.000Z', [cash], 50000)
    const curr = makeSnapshot('2', '2026-07-15T12:00:00.000Z', [cash], 50000)

    const result = compareSnapshots(prev, curr)
    expect(result.events).toHaveLength(0)
  })

  it('does not report a deposit/withdraw when only the exchange rate moved for USD cash', () => {
    const prev = makeSnapshot(
      '1',
      '2026-07-01T12:00:00.000Z',
      [
        makeCashHolding({
          assetId: 1,
          name: 'Cuenta en dólares',
          currency: 'USD',
          amount: 100,
          currentValueARS: 100000,
          currentValueUSD: 100,
        }),
      ],
      100000
    )
    const curr = {
      ...makeSnapshot(
        '2',
        '2026-07-15T12:00:00.000Z',
        [
          makeCashHolding({
            assetId: 1,
            name: 'Cuenta en dólares',
            currency: 'USD',
            amount: 100,
            currentValueARS: 130000,
            currentValueUSD: 100,
          }),
        ],
        130000
      ),
      exchangeRate: 1300,
    }

    const result = compareSnapshots(prev, curr)
    expect(result.events.some((event) => event.kind === 'deposit' || event.kind === 'withdraw')).toBe(false)
    expect(result.summary.marketGainARS).toBeCloseTo(30000, 5)
  })

  it('does not report a phantom retiro when the cash asset id changes but the total is unchanged', () => {
    const prev = makeSnapshot(
      '1',
      '2026-07-01T12:00:00.000Z',
      [
        makeCashHolding({
          assetId: 1,
          name: 'Cuenta bancaria',
          currency: 'ARS',
          amount: 20000,
          currentValueARS: 20000,
          currentValueUSD: 20,
        }),
      ],
      20000
    )
    const curr = makeSnapshot(
      '2',
      '2026-07-15T12:00:00.000Z',
      [
        makeCashHolding({
          assetId: 2,
          name: 'Cuenta bancaria (nueva)',
          currency: 'ARS',
          amount: 20000,
          currentValueARS: 20000,
          currentValueUSD: 20,
        }),
      ],
      20000
    )

    const result = compareSnapshots(prev, curr)
    expect(result.events.some((event) => event.kind === 'closed' || event.kind === 'opened')).toBe(false)
    expect(result.events).toHaveLength(0)
  })

  it('reports a real deposit as the net amount added across cash accounts', () => {
    const prev = makeSnapshot(
      '1',
      '2026-07-01T12:00:00.000Z',
      [
        makeCashHolding({
          assetId: 1,
          name: 'Efectivo en pesos',
          currency: 'ARS',
          amount: 10000,
          currentValueARS: 10000,
          currentValueUSD: 10,
        }),
        makeCashHolding({
          assetId: 2,
          name: 'Cuenta bancaria',
          currency: 'ARS',
          amount: 5000,
          currentValueARS: 5000,
          currentValueUSD: 5,
        }),
      ],
      15000
    )
    const curr = makeSnapshot(
      '2',
      '2026-07-15T12:00:00.000Z',
      [
        makeCashHolding({
          assetId: 1,
          name: 'Efectivo en pesos',
          currency: 'ARS',
          amount: 10000,
          currentValueARS: 10000,
          currentValueUSD: 10,
        }),
        makeCashHolding({
          assetId: 2,
          name: 'Cuenta bancaria',
          currency: 'ARS',
          amount: 12000,
          currentValueARS: 12000,
          currentValueUSD: 12,
        }),
      ],
      22000
    )

    const result = compareSnapshots(prev, curr)
    const depositEvent = result.events.find((event) => event.kind === 'deposit')
    expect(depositEvent).toBeDefined()
    expect(depositEvent?.impactARS).toBeCloseTo(7000, 5)
    expect(result.summary.capitalFlowsARS).toBeCloseTo(7000, 5)
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
