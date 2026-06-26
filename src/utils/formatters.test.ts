import { describe, it, expect, vi } from 'vitest'
import {
  formatCurrency,
  formatPercentage,
  getTimeAgo,
  formatNumber,
  calculatePortfolioValue,
  calculatePortfolioChange
} from './formatters'

describe('formatCurrency', () => {
  it('formats USD with default 2 decimals', () => {
    const result = formatCurrency(1234.56, 'USD')
    expect(result).toContain('1.234,56')
    expect(result).toContain('$')
  })

  it('formats ARS currency', () => {
    const result = formatCurrency(5000, 'ARS')
    expect(result).toContain('5.000,00')
  })

  it('respects custom decimal places', () => {
    const result = formatCurrency(1234.56789, 'USD', 4)
    expect(result).toContain('1.234,5679')
  })

  it('formats zero correctly', () => {
    const result = formatCurrency(0, 'USD')
    expect(result).toContain('0,00')
  })

  it('formats negative amounts', () => {
    const result = formatCurrency(-500, 'USD')
    expect(result).toContain('-')
    expect(result).toContain('500')
  })

  it('handles large numbers with thousands separator', () => {
    const result = formatCurrency(1234567.89, 'USD')
    expect(result).toContain('1.234.567,89')
  })
})

describe('formatPercentage', () => {
  it('adds + sign for positive values', () => {
    expect(formatPercentage(5.25)).toBe('+5.25%')
  })

  it('keeps - sign for negative values', () => {
    expect(formatPercentage(-3.14)).toBe('-3.14%')
  })

  it('adds + sign for zero', () => {
    expect(formatPercentage(0)).toBe('+0.00%')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatPercentage(7.123456)).toBe('+7.12%')
    expect(formatPercentage(-2.999)).toBe('-3.00%')
  })

  it('handles very small numbers', () => {
    expect(formatPercentage(0.001)).toBe('+0.00%')
  })
})

describe('getTimeAgo', () => {
  it('returns "nunca" for null', () => {
    expect(getTimeAgo(null)).toBe('nunca')
  })

  it('returns "nunca" for undefined', () => {
    expect(getTimeAgo(undefined)).toBe('nunca')
  })

  it('returns "hace menos de 1 min" for recent timestamps', () => {
    const now = new Date()
    const recent = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
    expect(getTimeAgo(recent.toISOString())).toBe('hace menos de 1 min')
  })

  it('returns minutes for timestamps under 1 hour', () => {
    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
    expect(getTimeAgo(fiveMinutesAgo.toISOString())).toBe('hace 5 min')
  })

  it('returns hours for timestamps under 24 hours', () => {
    const now = new Date()
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    expect(getTimeAgo(twoHoursAgo.toISOString())).toBe('hace 2h')
  })

  it('returns days for old timestamps', () => {
    const now = new Date()
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    expect(getTimeAgo(threeDaysAgo.toISOString())).toBe('hace 3d')
  })
})

describe('formatNumber', () => {
  it('formats billions with B suffix', () => {
    expect(formatNumber(5000000000)).toBe('5.00B')
    expect(formatNumber(1234567890)).toBe('1.23B')
  })

  it('formats millions with M suffix', () => {
    expect(formatNumber(5000000)).toBe('5.00M')
    expect(formatNumber(1234567)).toBe('1.23M')
  })

  it('formats thousands with K suffix', () => {
    expect(formatNumber(5000)).toBe('5.00K')
    expect(formatNumber(1234)).toBe('1.23K')
  })

  it('formats numbers under 1000 with 2 decimals', () => {
    expect(formatNumber(123.456)).toBe('123.46')
    expect(formatNumber(50)).toBe('50.00')
  })

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0.00')
  })

  it('handles edge cases at thresholds', () => {
    expect(formatNumber(999)).toBe('999.00')
    expect(formatNumber(1000)).toBe('1.00K')
    expect(formatNumber(999999)).toBe('1000.00K')
    expect(formatNumber(1000000)).toBe('1.00M')
  })
})

describe('calculatePortfolioValue', () => {
  it('calculates total value for single holding', () => {
    const holdings = [{ id: 'BTC', amount: 2, currency: 'USD' }]
    const prices = { BTC: { USD: 50000 } }
    
    expect(calculatePortfolioValue(holdings, prices)).toBe(100000)
  })

  it('calculates total value for multiple holdings', () => {
    const holdings = [
      { id: 'BTC', amount: 1, currency: 'USD' },
      { id: 'ETH', amount: 10, currency: 'USD' }
    ]
    const prices = {
      BTC: { USD: 50000 },
      ETH: { USD: 3000 }
    }
    
    expect(calculatePortfolioValue(holdings, prices)).toBe(80000)
  })

  it('returns 0 when price is missing', () => {
    const holdings = [{ id: 'BTC', amount: 2, currency: 'USD' }]
    const prices = {}
    
    expect(calculatePortfolioValue(holdings, prices)).toBe(0)
  })

  it('handles empty holdings', () => {
    const holdings: { id: string; amount: number; currency: string }[] = []
    const prices = {}
    
    expect(calculatePortfolioValue(holdings, prices)).toBe(0)
  })

  it('ignores holdings with wrong currency', () => {
    const holdings = [{ id: 'BTC', amount: 1, currency: 'EUR' }]
    const prices = { BTC: { USD: 50000 } }
    
    expect(calculatePortfolioValue(holdings, prices)).toBe(0)
  })

  it('handles mixed currencies', () => {
    const holdings = [
      { id: 'BTC', amount: 1, currency: 'USD' },
      { id: 'BTC', amount: 2, currency: 'EUR' }
    ]
    const prices = {
      BTC: { USD: 50000, EUR: 45000 }
    }
    
    expect(calculatePortfolioValue(holdings, prices)).toBe(140000)
  })
})

describe('calculatePortfolioChange', () => {
  it('calculates percentage change for single holding', () => {
    const holdings = [{ id: 'BTC', amount: 1, currency: 'USD' }]
    const prices = {
      BTC: { USD: 50000, USD_24h_change: 5 }
    }
    
    expect(calculatePortfolioChange(holdings, prices)).toBe(5)
  })

  it('calculates weighted average change for multiple holdings', () => {
    const holdings = [
      { id: 'BTC', amount: 1, currency: 'USD' }, // 50k value, +10% change
      { id: 'ETH', amount: 10, currency: 'USD' } // 30k value, -5% change
    ]
    const prices = {
      BTC: { USD: 50000, USD_24h_change: 10 },
      ETH: { USD: 3000, USD_24h_change: -5 }
    }
    
    // (50000 * 10% + 30000 * -5%) / 80000 = (5000 - 1500) / 80000 = 3500/80000 = 4.375%
    const result = calculatePortfolioChange(holdings, prices)
    expect(result).toBeCloseTo(4.375, 2)
  })

  it('returns 0 when total value is 0', () => {
    const holdings = [{ id: 'BTC', amount: 1, currency: 'USD' }]
    const prices = {}
    
    expect(calculatePortfolioChange(holdings, prices)).toBe(0)
  })

  it('handles missing change data', () => {
    const holdings = [{ id: 'BTC', amount: 1, currency: 'USD' }]
    const prices = {
      BTC: { USD: 50000 } // No USD_24h_change
    }
    
    expect(calculatePortfolioChange(holdings, prices)).toBe(0)
  })

  it('handles empty holdings', () => {
    const holdings: { id: string; amount: number; currency: string }[] = []
    const prices = {}
    
    expect(calculatePortfolioChange(holdings, prices)).toBe(0)
  })

  it('handles negative total change', () => {
    const holdings = [
      { id: 'BTC', amount: 1, currency: 'USD' },
      { id: 'ETH', amount: 1, currency: 'USD' }
    ]
    const prices = {
      BTC: { USD: 50000, USD_24h_change: -10 },
      ETH: { USD: 3000, USD_24h_change: -5 }
    }
    
    const result = calculatePortfolioChange(holdings, prices)
    expect(result).toBeLessThan(0)
  })
})
