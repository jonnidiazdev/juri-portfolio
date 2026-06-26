import { ASSET_TYPES } from '../../config/constants'
import { computeAssetPL } from '../../utils/assetCalculations'
import type { Asset, ArgentineQuotes, CryptoPriceData, CryptoPrices } from '../../types'
import { layoutPlantsInBeds, type PlantBeforeLayout } from './gardenLayout'

export type PlantSpecies = 'exotic' | 'native' | 'slow' | 'ground'
export type SkyMood = 'stormy' | 'cloudy' | 'neutral' | 'sunny' | 'golden'

export interface PlantState {
  assetId: number
  assetName: string
  species: PlantSpecies
  health: number
  scale: number
  wind: number
  position: { x: number; z: number }
  currentValueARS: number
  plPctARS: number
  bedIndex: number
  bedLabel: string
  cellRow: number
  cellCol: number
}

export interface GardenMetaphorInput {
  assets: Asset[]
  getAssetPrice: (asset: Asset) => number
  exchangeRate: number | null
  cryptoPrices?: CryptoPrices | null
  argQuotes?: ArgentineQuotes | null
  portfolioProfitPercent: number
}

export interface GardenMetaphorResult {
  plants: PlantState[]
  skyMood: SkyMood
}

export function getPlantSpecies(asset: Asset): PlantSpecies {
  switch (asset.type) {
    case ASSET_TYPES.CRYPTO:
      return 'exotic'
    case ASSET_TYPES.PLAZO_FIJO:
      return 'slow'
    case ASSET_TYPES.EFECTIVO:
      return 'ground'
    default:
      return 'native'
  }
}

export function healthFromPlPct(plPct: number): number {
  return Math.max(0, Math.min(1, (plPct + 50) / 100))
}

export function logNormalizeValue(value: number, min: number, max: number): number {
  const safeVal = Math.max(value, 1)
  const logVal = Math.log10(safeVal)
  const logMin = Math.log10(Math.max(min, 1))
  const logMax = Math.log10(Math.max(max, 1))
  if (logMax === logMin) return 0.5
  return (logVal - logMin) / (logMax - logMin)
}

export function scaleFromNormalized(normalized: number): number {
  return 0.35 + normalized * 0.85
}

export function getAssetWind(
  asset: Asset,
  cryptoPrices?: CryptoPrices | null,
  argQuotes?: ArgentineQuotes | null
): number {
  if (asset.type === ASSET_TYPES.CRYPTO) {
    const symbol = String(asset.symbol || '').trim().toLowerCase()
    const data = cryptoPrices?.[symbol]
    if (data && typeof data === 'object' && 'usd_24h_change' in data) {
      const change = Math.abs((data as CryptoPriceData).usd_24h_change ?? 0)
      return Math.min(1, change / 10)
    }
    return 0
  }

  if (
    asset.type !== ASSET_TYPES.PLAZO_FIJO &&
    asset.type !== ASSET_TYPES.EFECTIVO
  ) {
    const quote = argQuotes?.[asset.id]
    const change = Math.abs(quote?.raw?.variacionPorcentual ?? 0)
    return Math.min(1, change / 10)
  }

  return 0
}

export function skyMoodFromProfit(profitPercent: number): SkyMood {
  if (profitPercent < -10) return 'stormy'
  if (profitPercent < 0) return 'cloudy'
  if (profitPercent < 5) return 'neutral'
  if (profitPercent < 20) return 'sunny'
  return 'golden'
}

interface RawPlant extends PlantBeforeLayout {}

export function buildGardenMetaphor(input: GardenMetaphorInput): GardenMetaphorResult {
  const { assets, getAssetPrice, exchangeRate, cryptoPrices, argQuotes, portfolioProfitPercent } =
    input

  const rate = exchangeRate && exchangeRate > 0 ? exchangeRate : null

  const valuesARS = assets.map(asset => {
    const pl = computeAssetPL(asset, getAssetPrice(asset), rate)
    return pl.currentARS
  })

  const minVal = valuesARS.length > 0 ? Math.min(...valuesARS) : 1
  const maxVal = valuesARS.length > 0 ? Math.max(...valuesARS) : 1

  const rawPlants: RawPlant[] = assets.map(asset => {
    const species = getPlantSpecies(asset)
    const pl = computeAssetPL(asset, getAssetPrice(asset), rate)
    const normalized = logNormalizeValue(pl.currentARS, minVal, maxVal)

    return {
      assetId: asset.id,
      assetName: asset.name,
      species,
      health: healthFromPlPct(pl.plPctARS),
      scale: scaleFromNormalized(normalized),
      wind: getAssetWind(asset, cryptoPrices, argQuotes),
      position: { x: 0, z: 0 },
      currentValueARS: pl.currentARS,
      plPctARS: pl.plPctARS,
    }
  })

  const plants = layoutPlantsInBeds(rawPlants)

  return {
    plants,
    skyMood: skyMoodFromProfit(portfolioProfitPercent),
  }
}
