import { ASSET_TYPES } from '../config/constants'
import { calculatePlazoFijo } from './plazoFijoCalculations'

/**
 * Calcula P/L por activo en USD y ARS respetando la cotización elegida
 * @param {Object} asset - Activo del portfolio
 * @param {number} currentPrice - Precio actual por unidad (cuando aplica)
 * @param {number|null} conversionRate - Cotización USD→ARS seleccionada (venta)
 * @returns {Object} { investedUSD, currentUSD, plUSD, plPctUSD, investedARS, currentARS, plARS, plPctARS }
 */
export function computeAssetPL(asset, currentPrice, conversionRate) {
  const assetType = asset.type
  const assetCurrency = asset.currency || (assetType === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')

  let investedValue = 0
  let currentValue = 0

  if (assetType === ASSET_TYPES.PLAZO_FIJO) {
    // Para PF: capital vs valor devengado
    const pf = calculatePlazoFijo(asset.amount, asset.tna, asset.startDate, asset.endDate)
    investedValue = pf.capital
    currentValue = pf.currentValue
  } else if (assetType === ASSET_TYPES.EFECTIVO) {
    // Efectivo: sin P/L
    investedValue = asset.amount
    currentValue = asset.amount
  } else {
    // Acciones/bonos/cedears/cripto
    const priceNow = typeof currentPrice === 'number' && currentPrice > 0 ? currentPrice : asset.purchasePrice
    investedValue = asset.amount * asset.purchasePrice
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
