import { useMemo } from 'react'
import { getSelectedCurrencyRate } from './useCurrencyPreference'
import { ASSET_TYPES } from '../config/constants'
import { calculatePlazoFijo } from '../utils/plazoFijoCalculations'
import { getCurrentPrice } from '../utils/assetCalculations'
import type { Asset, ArgentineQuotes, CryptoPrices, DolarPrices } from '../types'

export function useMultiCurrencyCalculations(
  assets: Asset[],
  cryptoPrices: CryptoPrices | null | undefined,
  argQuotes: ArgentineQuotes | null | undefined,
  dolarData: DolarPrices | null | undefined,
  currencyPreference: string
) {
  const calculations = useMemo(() => {
    if (!assets || assets.length === 0) {
      return {
        totalsARS: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        exchangeRate: null,
        exchangeRateInfo: null,
      }
    }

    const selectedRate = getSelectedCurrencyRate(dolarData, currencyPreference)
    if (!selectedRate) {
      return {
        totalsARS: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        exchangeRate: null,
        exchangeRateInfo: null,
      }
    }

    const priceContext = { cryptoPrices, argQuotes }

    let totalInvestedARS = 0
    let totalCurrentARS = 0
    let totalInvestedUSD = 0
    let totalCurrentUSD = 0

    assets.forEach(asset => {
      const currentPrice = getCurrentPrice(asset, priceContext)
      const assetCurrency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')

      let investedValue: number
      let currentValue: number

      if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
        const plazoFijoData = calculatePlazoFijo(
          asset.amount,
          asset.tna ?? 0,
          asset.startDate ?? '',
          asset.endDate ?? ''
        )
        investedValue = plazoFijoData.capital
        currentValue = plazoFijoData.currentValue
      } else if (asset.type === ASSET_TYPES.EFECTIVO) {
        investedValue = asset.amount
        currentValue = asset.amount
      } else {
        const purchasePrice = asset.purchasePrice ?? 0
        investedValue = asset.amount * purchasePrice
        currentValue = asset.amount * (currentPrice ?? purchasePrice)
      }

      if (assetCurrency === 'USD') {
        totalInvestedUSD += investedValue
        totalCurrentUSD += currentValue
        totalInvestedARS += investedValue * selectedRate.sell
        totalCurrentARS += currentValue * selectedRate.sell
      } else {
        totalInvestedARS += investedValue
        totalCurrentARS += currentValue
        totalInvestedUSD += investedValue / selectedRate.sell
        totalCurrentUSD += currentValue / selectedRate.sell
      }
    })

    const profitARS = totalCurrentARS - totalInvestedARS
    const profitPercentARS = totalInvestedARS > 0 ? (profitARS / totalInvestedARS) * 100 : 0

    const profitUSD = totalCurrentUSD - totalInvestedUSD
    const profitPercentUSD = totalInvestedUSD > 0 ? (profitUSD / totalInvestedUSD) * 100 : 0

    return {
      totalsARS: {
        invested: totalInvestedARS,
        current: totalCurrentARS,
        profit: profitARS,
        profitPercent: profitPercentARS,
      },
      totalsUSD: {
        invested: totalInvestedUSD,
        current: totalCurrentUSD,
        profit: profitUSD,
        profitPercent: profitPercentUSD,
      },
      exchangeRate: selectedRate.sell,
      exchangeRateInfo: {
        name: selectedRate.name,
        id: selectedRate.id,
        buy: selectedRate.buy,
        sell: selectedRate.sell,
      },
    }
  }, [assets, cryptoPrices, argQuotes, dolarData, currencyPreference])

  return calculations
}
