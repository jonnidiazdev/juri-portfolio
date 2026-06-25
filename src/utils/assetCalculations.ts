import { ASSET_TYPES } from '../config/constants'
import { calculatePlazoFijo } from './plazoFijoCalculations'
import type { Asset, AssetPL } from '../types'

export function computeAssetPL(asset: Asset, currentPrice: number | null | undefined, conversionRate: number | null | undefined): AssetPL {
  const assetType = asset.type
  const assetCurrency = asset.currency || (assetType === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')

  let investedValue = 0
  let currentValue = 0

  if (assetType === ASSET_TYPES.PLAZO_FIJO) {
    // Para PF: capital vs valor devengado
    const pf = calculatePlazoFijo(asset.amount, asset.tna ?? 0, asset.startDate ?? '', asset.endDate ?? '')
    investedValue = pf.capital
    currentValue = pf.currentValue
  } else if (assetType === ASSET_TYPES.EFECTIVO) {
    // Efectivo: sin P/L
    investedValue = asset.amount
    currentValue = asset.amount
  } else {
    // Acciones/bonos/cedears/cripto
    const purchasePrice = asset.purchasePrice ?? 0
    const priceNow = typeof currentPrice === 'number' && currentPrice > 0 ? currentPrice : purchasePrice
    investedValue = asset.amount * purchasePrice
    currentValue = asset.amount * priceNow
  }

  // Si no hay cotización aún, devolvemos en la moneda nativa y los convertidos iguales
  const rate = typeof conversionRate === 'number' && conversionRate > 0 ? conversionRate : null

  let investedUSD, currentUSD, investedARS, currentARS

  if (assetCurrency === 'USD') {
    investedUSD = investedValue
    currentUSD = currentValue
    investedARS = rate ? investedValue * rate : investedValue
    currentARS = rate ? currentValue * rate : currentValue
  } else {
    investedARS = investedValue
    currentARS = currentValue
    investedUSD = rate ? investedValue / rate : investedValue
    currentUSD = rate ? currentValue / rate : currentValue
  }

  const plUSD = currentUSD - investedUSD
  const plARS = currentARS - investedARS
  const plPctUSD = investedUSD > 0 ? (plUSD / investedUSD) * 100 : 0
  const plPctARS = investedARS > 0 ? (plARS / investedARS) * 100 : 0

  return {
    investedUSD,
    currentUSD,
    plUSD,
    plPctUSD,
    investedARS,
    currentARS,
    plARS,
    plPctARS,
  }
}
