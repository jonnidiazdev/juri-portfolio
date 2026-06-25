import { describe, it, expect } from 'vitest'
import { computeAssetPL, getCurrentPrice, calculateAssetTypeStats } from './assetCalculations'
import { ASSET_TYPES } from '../config/constants'
import type { Asset } from '../types'

describe('computeAssetPL', () => {
  it('calculates P/L for crypto asset in USD', () => {
    const asset: Asset = {
      id: 1,
      type: ASSET_TYPES.CRYPTO,
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: 2,
      purchasePrice: 40000,
      currency: 'USD'
    }
    
    const currentPrice = 50000
    const conversionRate = 1000 // 1 USD = 1000 ARS
    
    const result = computeAssetPL(asset, currentPrice, conversionRate)
    
    expect(result.investedUSD).toBe(80000) // 2 * 40000
    expect(result.currentUSD).toBe(100000) // 2 * 50000
    expect(result.plUSD).toBe(20000) // 100000 - 80000
    expect(result.plPctUSD).toBe(25) // (20000 / 80000) * 100
    
    expect(result.investedARS).toBe(80000000) // 80000 * 1000
    expect(result.currentARS).toBe(100000000) // 100000 * 1000
    expect(result.plARS).toBe(20000000)
    expect(result.plPctARS).toBe(25)
  })

  it('calculates P/L for stock asset in ARS', () => {
    const asset: Asset = {
      id: 2,
      type: ASSET_TYPES.STOCK,
      name: 'YPF',
      symbol: 'YPFD',
      amount: 100,
      purchasePrice: 1000,
      currency: 'ARS'
    }
    
    const currentPrice = 1500
    const conversionRate = 1000 // 1 USD = 1000 ARS
    
    const result = computeAssetPL(asset, currentPrice, conversionRate)
    
    expect(result.investedARS).toBe(100000) // 100 * 1000
    expect(result.currentARS).toBe(150000) // 100 * 1500
    expect(result.plARS).toBe(50000) // 150000 - 100000
    expect(result.plPctARS).toBe(50) // (50000 / 100000) * 100
    
    expect(result.investedUSD).toBe(100) // 100000 / 1000
    expect(result.currentUSD).toBe(150) // 150000 / 1000
    expect(result.plUSD).toBe(50)
    expect(result.plPctUSD).toBe(50)
  })

  it('handles null current price by using purchase price', () => {
    const asset: Asset = {
      id: 3,
      type: ASSET_TYPES.CRYPTO,
      name: 'Ethereum',
      amount: 10,
      purchasePrice: 2000,
      currency: 'USD'
    }
    
    const result = computeAssetPL(asset, null, 1000)
    
    // Should use purchase price as fallback
    expect(result.investedUSD).toBe(20000)
    expect(result.currentUSD).toBe(20000)
    expect(result.plUSD).toBe(0)
    expect(result.plPctUSD).toBe(0)
  })

  it('handles undefined current price', () => {
    const asset: Asset = {
      id: 4,
      type: ASSET_TYPES.STOCK,
      name: 'Test',
      amount: 5,
      purchasePrice: 100,
      currency: 'ARS'
    }
    
    const result = computeAssetPL(asset, undefined, 1000)
    
    expect(result.plARS).toBe(0)
    expect(result.plPctARS).toBe(0)
  })

  it('calculates efectivo asset (no P/L)', () => {
    const asset: Asset = {
      id: 5,
      type: ASSET_TYPES.EFECTIVO,
      name: 'Efectivo',
      amount: 50000,
      currency: 'ARS'
    }
    
    const result = computeAssetPL(asset, null, 1000)
    
    expect(result.investedARS).toBe(50000)
    expect(result.currentARS).toBe(50000)
    expect(result.plARS).toBe(0)
    expect(result.plPctARS).toBe(0)
  })

  it('calculates plazo fijo asset with interest', () => {
    const asset: Asset = {
      id: 6,
      type: ASSET_TYPES.PLAZO_FIJO,
      name: 'Plazo Fijo',
      amount: 100000, // Capital
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      currency: 'ARS'
    }
    
    const result = computeAssetPL(asset, null, 1000)
    
    expect(result.investedARS).toBe(100000) // Capital
    expect(result.currentARS).toBeGreaterThan(100000) // Should have earned interest
    expect(result.plARS).toBeGreaterThan(0)
    expect(result.plPctARS).toBeGreaterThan(0)
  })

  it('handles null conversion rate by not converting', () => {
    const asset: Asset = {
      id: 7,
      type: ASSET_TYPES.CRYPTO,
      name: 'Bitcoin',
      amount: 1,
      purchasePrice: 50000,
      currency: 'USD'
    }
    
    const result = computeAssetPL(asset, 60000, null)
    
    expect(result.investedUSD).toBe(50000)
    expect(result.currentUSD).toBe(60000)
    // Without conversion rate, ARS values should equal USD values
    expect(result.investedARS).toBe(50000)
    expect(result.currentARS).toBe(60000)
  })

  it('handles zero conversion rate', () => {
    const asset: Asset = {
      id: 8,
      type: ASSET_TYPES.CRYPTO,
      name: 'Ethereum',
      amount: 5,
      purchasePrice: 3000,
      currency: 'USD'
    }
    
    const result = computeAssetPL(asset, 3500, 0)
    
    // Should treat 0 as null/invalid
    expect(result.investedUSD).toBe(15000)
    expect(result.currentUSD).toBe(17500)
  })

  it('defaults to USD for crypto when currency not specified', () => {
    const asset: Asset = {
      id: 9,
      type: ASSET_TYPES.CRYPTO,
      name: 'Cardano',
      amount: 1000,
      purchasePrice: 0.5,
      currency: 'USD',
    }
    
    const result = computeAssetPL(asset, 0.6, 1000)
    
    // Should assume USD
    expect(result.investedUSD).toBe(500)
    expect(result.currentUSD).toBe(600)
  })

  it('defaults to ARS for non-crypto when currency not specified', () => {
    const asset: Asset = {
      id: 10,
      type: ASSET_TYPES.STOCK,
      name: 'Test Stock',
      amount: 10,
      purchasePrice: 100,
      currency: 'ARS',
    }
    
    const result = computeAssetPL(asset, 120, 1000)
    
    // Should assume ARS
    expect(result.investedARS).toBe(1000)
    expect(result.currentARS).toBe(1200)
  })

  it('handles negative P/L (loss)', () => {
    const asset: Asset = {
      id: 11,
      type: ASSET_TYPES.CRYPTO,
      name: 'Bitcoin',
      amount: 1,
      purchasePrice: 60000,
      currency: 'USD'
    }
    
    const result = computeAssetPL(asset, 50000, 1000)
    
    expect(result.plUSD).toBe(-10000)
    expect(result.plPctUSD).toBeCloseTo(-16.67, 1) // Approximately -16.67%
    expect(result.plUSD).toBeLessThan(0)
  })

  it('handles zero purchase price', () => {
    const asset: Asset = {
      id: 12,
      type: ASSET_TYPES.CRYPTO,
      name: 'Airdrop Token',
      amount: 100,
      purchasePrice: 0,
      currency: 'USD'
    }
    
    const result = computeAssetPL(asset, 10, 1000)
    
    expect(result.investedUSD).toBe(0)
    expect(result.currentUSD).toBe(1000)
    expect(result.plUSD).toBe(1000)
    // Can't calculate percentage on zero investment
    expect(result.plPctUSD).toBe(0)
  })

  it('handles plazo fijo with missing dates gracefully', () => {
    const asset: Asset = {
      id: 13,
      type: ASSET_TYPES.PLAZO_FIJO,
      name: 'Plazo Fijo Con Dates',
      amount: 10000,
      tna: 50,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      currency: 'ARS',
    }
    
    const result = computeAssetPL(asset, null, 1000)
    
    // Should calculate properly with valid dates
    expect(result.investedARS).toBe(10000)
    expect(result.currentARS).toBeGreaterThan(10000)
  })
})

describe('getCurrentPrice', () => {
  it('returns crypto USD price from prices context', () => {
    const asset: Asset = {
      id: 1,
      type: ASSET_TYPES.CRYPTO,
      name: 'Bitcoin',
      symbol: 'bitcoin',
      amount: 1,
      purchasePrice: 50000,
      currency: 'USD',
    }

    const price = getCurrentPrice(asset, {
      cryptoPrices: { bitcoin: { usd: 60000 } },
    })

    expect(price).toBe(60000)
  })

  it('falls back to purchase price when quote is missing', () => {
    const asset: Asset = {
      id: 2,
      type: ASSET_TYPES.STOCK,
      name: 'GGAL',
      symbol: 'GGAL',
      amount: 10,
      purchasePrice: 1000,
      currency: 'ARS',
    }

    const price = getCurrentPrice(asset, { argQuotes: {} })
    expect(price).toBe(1000)
  })
})

describe('calculateAssetTypeStats', () => {
  it('uses selected currency preference for USD conversion', () => {
    const assets: Asset[] = [{
      id: 1,
      type: ASSET_TYPES.CRYPTO,
      name: 'Bitcoin',
      symbol: 'bitcoin',
      amount: 1,
      purchasePrice: 100,
      currency: 'USD',
    }]

    const dolarData = {
      blue: { compra: 1000, venta: 1100, nombre: 'Blue', casa: 'blue' },
      bolsa: { compra: 1050, venta: 1150, nombre: 'MEP', casa: 'bolsa' },
    }

    const blueStats = calculateAssetTypeStats(
      assets,
      { cryptoPrices: { bitcoin: { usd: 100 } } },
      'blue',
      dolarData
    )

    const mepStats = calculateAssetTypeStats(
      assets,
      { cryptoPrices: { bitcoin: { usd: 100 } } },
      'bolsa',
      dolarData
    )

    expect(blueStats.totalValue).toBe(110000)
    expect(mepStats.totalValue).toBe(115000)
  })
})
