import { describe, it, expect } from 'vitest'
import { buildPortfolioSnapshot } from './portfolioSnapshot'
import type { AssetTypeStats } from './assetCalculations'

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
