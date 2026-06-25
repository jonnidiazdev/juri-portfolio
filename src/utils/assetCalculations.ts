import { ASSET_TYPES } from '../config/constants'
import { calculatePlazoFijo } from './plazoFijoCalculations'
import { getSelectedCurrencyRate } from '../hooks/useCurrencyPreference'
import type { Asset, AssetPL, ArgentineQuotes, CryptoPriceData, CryptoPrices, DolarPrices } from '../types'

export interface PriceContext {
  cryptoPrices?: CryptoPrices | null
  argQuotes?: ArgentineQuotes | null
}

export function getCurrentPrice(asset: Asset, prices: PriceContext): number {
  if (asset.type === ASSET_TYPES.CRYPTO) {
    const normalizedSymbol = String(asset.symbol || '').trim().toLowerCase()
    const cryptoData = prices.cryptoPrices?.[normalizedSymbol]
      if (cryptoData && typeof cryptoData === 'object' && 'usd' in cryptoData) {
        const price = (cryptoData as CryptoPriceData).usd
      return (typeof price === 'number' && price > 0) ? price : (asset.purchasePrice ?? 0)
    }
    return asset.purchasePrice ?? 0
  }

  if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
    const plazoFijoData = calculatePlazoFijo(
      asset.amount,
      asset.tna ?? 0,
      asset.startDate ?? '',
      asset.endDate ?? ''
    )
    return plazoFijoData.currentValue / asset.amount
  }

  if (asset.type === ASSET_TYPES.EFECTIVO) {
    return 1
  }

  const quote = prices.argQuotes?.[asset.id]
  const price = quote?.price
  return (typeof price === 'number' && price > 0) ? price : (asset.purchasePrice ?? 0)
}

export interface AssetTypeStats {
  totalValue: number
  totalInvested: number
  profit: number
  profitPercent: number
  isProfit: boolean
}

export function calculateAssetTypeStats(
  assetList: Asset[],
  prices: PriceContext,
  currencyPreference: string,
  dolarData: DolarPrices | null | undefined
): AssetTypeStats {
  const selectedRate = getSelectedCurrencyRate(dolarData, currencyPreference)
  const fxRate = selectedRate?.sell ?? dolarData?.blue?.venta ?? 1

  let totalValue = 0
  let totalInvested = 0

  assetList.forEach(asset => {
    const currentPrice = getCurrentPrice(asset, prices)
    const assetCurrency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')

    let value: number
    let invested: number

    if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
      const plazoFijoData = calculatePlazoFijo(
        asset.amount,
        asset.tna ?? 0,
        asset.startDate ?? '',
        asset.endDate ?? ''
      )
      value = plazoFijoData.currentValue
      invested = plazoFijoData.capital
    } else if (asset.type === ASSET_TYPES.EFECTIVO) {
      value = asset.amount
      invested = asset.amount
    } else {
      value = asset.amount * currentPrice
      invested = asset.amount * (asset.purchasePrice ?? 0)
    }

    if (assetCurrency === 'USD') {
      totalValue += value * fxRate
      totalInvested += invested * fxRate
    } else {
      totalValue += value
      totalInvested += invested
    }
  })

  const profit = totalValue - totalInvested
  const profitPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0

  return {
    totalValue,
    totalInvested,
    profit,
    profitPercent,
    isProfit: profit >= 0,
  }
}

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
