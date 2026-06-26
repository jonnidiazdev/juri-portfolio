import { describe, it, expect } from 'vitest'
import { ASSET_TYPES } from '../../config/constants'
import type { Asset } from '../../types'
import {
  buildGardenMetaphor,
  getAssetWind,
  getPlantSpecies,
  healthFromPlPct,
  logNormalizeValue,
  scaleFromNormalized,
  skyMoodFromProfit,
} from './portfolioMetaphor'

const baseAssets: Asset[] = [
  {
    id: 1,
    type: ASSET_TYPES.CRYPTO,
    name: 'Bitcoin',
    symbol: 'bitcoin',
    amount: 1,
    purchasePrice: 40000,
    currency: 'USD',
  },
  {
    id: 2,
    type: ASSET_TYPES.STOCK,
    name: 'YPF',
    symbol: 'YPFD',
    amount: 100,
    purchasePrice: 1000,
    currency: 'ARS',
  },
  {
    id: 3,
    type: ASSET_TYPES.PLAZO_FIJO,
    name: 'PF Banco',
    amount: 100000,
    tna: 100,
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    currency: 'ARS',
  },
  {
    id: 4,
    type: ASSET_TYPES.EFECTIVO,
    name: 'Efectivo',
    amount: 50000,
    currency: 'ARS',
  },
]

describe('getPlantSpecies', () => {
  it('maps asset types to plant species', () => {
    expect(getPlantSpecies(baseAssets[0])).toBe('exotic')
    expect(getPlantSpecies(baseAssets[1])).toBe('native')
    expect(getPlantSpecies(baseAssets[2])).toBe('slow')
    expect(getPlantSpecies(baseAssets[3])).toBe('ground')
  })
})

describe('healthFromPlPct', () => {
  it('maps -50% to 0 and +50% to 1', () => {
    expect(healthFromPlPct(-50)).toBe(0)
    expect(healthFromPlPct(0)).toBe(0.5)
    expect(healthFromPlPct(50)).toBe(1)
  })

  it('clamps beyond range', () => {
    expect(healthFromPlPct(-100)).toBe(0)
    expect(healthFromPlPct(100)).toBe(1)
  })
})

describe('logNormalizeValue', () => {
  it('returns 0.5 when min equals max', () => {
    expect(logNormalizeValue(1000, 1000, 1000)).toBe(0.5)
  })

  it('normalizes logarithmically', () => {
    const low = logNormalizeValue(100, 100, 10000)
    const high = logNormalizeValue(10000, 100, 10000)
    expect(low).toBeLessThan(high)
    expect(high).toBeCloseTo(1)
    expect(low).toBeCloseTo(0)
  })
})

describe('scaleFromNormalized', () => {
  it('maps to visible scale range', () => {
    expect(scaleFromNormalized(0)).toBeCloseTo(0.35)
    expect(scaleFromNormalized(1)).toBeCloseTo(1.2)
  })
})

describe('getAssetWind', () => {
  it('reads crypto 24h change', () => {
    const wind = getAssetWind(baseAssets[0], {
      bitcoin: { usd: 50000, usd_24h_change: -8 },
    })
    expect(wind).toBeCloseTo(0.8)
  })

  it('reads argentine variacionPorcentual', () => {
    const wind = getAssetWind(baseAssets[1], undefined, {
      2: { raw: { ultimoPrecio: 1500, variacionPorcentual: 5, simbolo: 'YPFD', descripcion: 'YPF', moneda: 'ARS' } },
    })
    expect(wind).toBeCloseTo(0.5)
  })

  it('returns 0 for plazo fijo and efectivo', () => {
    expect(getAssetWind(baseAssets[2])).toBe(0)
    expect(getAssetWind(baseAssets[3])).toBe(0)
  })
})

describe('skyMoodFromProfit', () => {
  it('maps profit bands to moods', () => {
    expect(skyMoodFromProfit(-15)).toBe('stormy')
    expect(skyMoodFromProfit(-5)).toBe('cloudy')
    expect(skyMoodFromProfit(2)).toBe('neutral')
    expect(skyMoodFromProfit(10)).toBe('sunny')
    expect(skyMoodFromProfit(25)).toBe('golden')
  })
})

describe('buildGardenMetaphor', () => {
  const getAssetPrice = (asset: Asset) => {
    if (asset.type === ASSET_TYPES.CRYPTO) return 50000
    if (asset.type === ASSET_TYPES.STOCK) return 1500
    return asset.purchasePrice ?? 1
  }

  it('builds one plant per asset in ordered beds', () => {
    const result = buildGardenMetaphor({
      assets: baseAssets,
      getAssetPrice,
      exchangeRate: 1000,
      cryptoPrices: { bitcoin: { usd: 50000, usd_24h_change: 3 } },
      argQuotes: {
        2: { raw: { ultimoPrecio: 1500, variacionPorcentual: 2, simbolo: 'YPFD', descripcion: 'YPF', moneda: 'ARS' } },
      },
      portfolioProfitPercent: 12,
    })

    expect(result.plants).toHaveLength(4)
    expect(result.skyMood).toBe('sunny')

    const exotic = result.plants.find(p => p.species === 'exotic')!
    const native = result.plants.find(p => p.species === 'native')!
    expect(exotic.bedIndex).toBe(0)
    expect(exotic.bedLabel).toBe('Cripto')
    expect(native.bedIndex).toBe(1)
    expect(exotic.position.x).toBeLessThan(0)
    expect(native.position.x).toBeGreaterThan(0)
    expect(exotic.health).toBeGreaterThan(0)
    expect(exotic.scale).toBeGreaterThan(0)
    expect(exotic.cellRow).toBe(0)
    expect(exotic.cellCol).toBe(0)
  })

  it('returns empty plants for empty portfolio', () => {
    const result = buildGardenMetaphor({
      assets: [],
      getAssetPrice,
      exchangeRate: 1000,
      portfolioProfitPercent: 0,
    })
    expect(result.plants).toHaveLength(0)
    expect(result.skyMood).toBe('neutral')
  })
})
