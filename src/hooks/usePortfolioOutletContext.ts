import { useOutletContext } from 'react-router-dom'
import type { Asset, ArgentineQuotes, CryptoPrices, DolarPrices } from '../types'
import type { AssetTypeStats } from '../utils/assetCalculations'

interface MultiCurrencyTotals {
  invested: number
  current: number
  profit: number
  profitPercent: number
}

export interface PortfolioOutletContext {
  user: { uid: string; displayName?: string; photoURL?: string; email?: string }
  assets: Asset[]
  isCloudSyncing: boolean
  currencyPreference: string
  setCurrencyPreference: (value: string) => void
  hideValues: boolean
  setHideValues: (value: boolean) => void
  multiCurrencyData: {
    totalsARS: MultiCurrencyTotals
    totalsUSD: MultiCurrencyTotals
    exchangeRate: number | null
    exchangeRateInfo: { name: string; id: string; buy: number; sell: number } | null
  }
  cryptoStats: AssetTypeStats
  argentineStats: AssetTypeStats
  plazoFijoStats: AssetTypeStats
  efectivoStats: AssetTypeStats
  cryptoPrices: CryptoPrices | null | undefined
  argQuotes: ArgentineQuotes | null | undefined
  dolarData: DolarPrices | null | undefined
  loadingCrypto: boolean
  loadingDolar: boolean
  loadingArgQuotes: boolean
  errorCrypto: boolean
  errorDolar: boolean
  errorArgQuotes: boolean
  cryptoError: Error | null
  dolarError: Error | null
  argQuotesError: Error | null
  refetchCrypto: () => void
  refetchDolar: () => void
  refetchArgQuotes: () => void
  onAddAsset: () => void
  onEditAsset: (asset: Asset) => void
  onDeleteAsset: (id: number) => void
  getAssetPrice: (asset: Asset) => number
}

export function usePortfolioOutletContext(): PortfolioOutletContext {
  return useOutletContext<PortfolioOutletContext>()
}
