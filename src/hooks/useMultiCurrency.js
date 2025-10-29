import { useMemo } from 'react'
import { useCurrencyPreference, getSelectedCurrencyRate } from '../components/CurrencySelector'
import { ASSET_TYPES } from '../config/constants'
import { calculatePlazoFijo } from '../utils/plazoFijoCalculations'
import { calculateEfectivo } from '../utils/efectivoCalculations'

export function useMultiCurrencyCalculations(assets, cryptoPrices, argQuotes, dolarData) {
  const currencyPreference = useCurrencyPreference()

  const calculations = useMemo(() => {
    if (!assets || assets.length === 0) {
      return {
        totalsARS: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        exchangeRate: null,
        exchangeRateInfo: null
      }
    }

    const selectedRate = getSelectedCurrencyRate(dolarData, currencyPreference)
    if (!selectedRate) {
      return {
        totalsARS: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        totalsUSD: { invested: 0, current: 0, profit: 0, profitPercent: 0 },
        exchangeRate: null,
        exchangeRateInfo: null
      }
    }

    // Función helper para obtener precio actual
    const getCurrentPrice = (asset) => {
      if (asset.type === ASSET_TYPES.CRYPTO) {
        // cryptoPrices es un objeto con symbols como claves, no un array
        const cryptoData = cryptoPrices?.[asset.symbol]
        const price = cryptoData?.usd
        return (typeof price === 'number' && price > 0) ? price : asset.purchasePrice
      } else if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
        // Para plazos fijos, calcular el valor actual basado en TNA y días transcurridos
        const plazoFijoData = calculatePlazoFijo(
          asset.amount,
          asset.tna,
          asset.startDate,
          asset.endDate
        )
        // Retornar el precio por unidad (valor actual / cantidad)
        return plazoFijoData.currentValue / asset.amount
      } else if (asset.type === ASSET_TYPES.EFECTIVO) {
        // Para efectivo, el precio actual es 1 (sin variación)
        return 1
      } else {
        // argQuotes usa asset.id como clave
        const quote = argQuotes?.[asset.id]
        const price = quote?.price
        return (typeof price === 'number' && price > 0) ? price : asset.purchasePrice
      }
    }

    let totalInvestedARS = 0
    let totalCurrentARS = 0
    let totalInvestedUSD = 0
    let totalCurrentUSD = 0

    assets.forEach(asset => {
      const currentPrice = getCurrentPrice(asset)
      const assetCurrency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')
      
      let investedValue, currentValue
      
      if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
        // Para plazos fijos: usar cálculo específico
        const plazoFijoData = calculatePlazoFijo(
          asset.amount,
          asset.tna,
          asset.startDate,
          asset.endDate
        )
        investedValue = plazoFijoData.capital
        currentValue = plazoFijoData.currentValue
      } else if (asset.type === ASSET_TYPES.EFECTIVO) {
        // Para efectivo: valor = cantidad, sin precio de compra
        investedValue = asset.amount
        currentValue = asset.amount
      } else {
        // Para otros activos: cantidad × precio
        investedValue = asset.amount * asset.purchasePrice
        currentValue = asset.amount * currentPrice
      }

      if (assetCurrency === 'USD') {
        // Activo en USD
        totalInvestedUSD += investedValue
        totalCurrentUSD += currentValue
        
        // Convertir a ARS usando cotización seleccionada
        totalInvestedARS += investedValue * selectedRate.sell
        totalCurrentARS += currentValue * selectedRate.sell
      } else {
        // Activo en ARS
        totalInvestedARS += investedValue
        totalCurrentARS += currentValue
        
        // Convertir a USD usando cotización seleccionada
        totalInvestedUSD += investedValue / selectedRate.sell
        totalCurrentUSD += currentValue / selectedRate.sell
      }
    })

    // Calcular ganancias/pérdidas
    const profitARS = totalCurrentARS - totalInvestedARS
    const profitPercentARS = totalInvestedARS > 0 ? (profitARS / totalInvestedARS) * 100 : 0

    const profitUSD = totalCurrentUSD - totalInvestedUSD
    const profitPercentUSD = totalInvestedUSD > 0 ? (profitUSD / totalInvestedUSD) * 100 : 0

    return {
      totalsARS: {
        invested: totalInvestedARS,
        current: totalCurrentARS,
        profit: profitARS,
        profitPercent: profitPercentARS
      },
      totalsUSD: {
        invested: totalInvestedUSD,
        current: totalCurrentUSD,
        profit: profitUSD,
        profitPercent: profitPercentUSD
      },
      exchangeRate: selectedRate.sell,
      exchangeRateInfo: {
        name: selectedRate.name,
        id: selectedRate.id,
        buy: selectedRate.buy,
        sell: selectedRate.sell
      }
    }
  }, [assets, cryptoPrices, argQuotes, dolarData, currencyPreference])

  return calculations
}

// Hook para conversiones individuales
export function useCurrencyConverter(dolarData) {
  const currencyPreference = useCurrencyPreference()

  const converter = useMemo(() => {
    const selectedRate = getSelectedCurrencyRate(dolarData, currencyPreference)
    
    if (!selectedRate) {
      return {
        usdToArs: (amount) => amount,
        arsToUsd: (amount) => amount,
        rate: null,
        rateInfo: null
      }
    }

    return {
      usdToArs: (amount) => amount * selectedRate.sell,
      arsToUsd: (amount) => amount / selectedRate.sell,
      rate: selectedRate.sell,
      rateInfo: {
        name: selectedRate.name,
        id: selectedRate.id,
        buy: selectedRate.buy,
        sell: selectedRate.sell
      }
    }
  }, [dolarData, currencyPreference])

  return converter
}

// Hook para obtener assets agrupados por moneda
export function useAssetsByCurrency(assets) {
  return useMemo(() => {
    const usdAssets = assets.filter(asset => {
      const currency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')
      return currency === 'USD'
    })

    const arsAssets = assets.filter(asset => {
      const currency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')
      return currency === 'ARS'
    })

    return { usdAssets, arsAssets }
  }, [assets])
}