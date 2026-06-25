import { useState, useEffect, useRef } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useCryptoPrices, useDolarPrice } from './hooks/useInvestments'
import { useArgentineQuotes } from './hooks/useArgentineQuotes'
import { useMultiCurrencyCalculations } from './hooks/useMultiCurrency'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { signOutGoogle } from './config/firebase'
import { calculatePlazoFijo } from './utils/plazoFijoCalculations'
import { formatCurrency } from './utils/formatters'
import { ASSET_TYPES } from './config/constants'
import type { Asset } from './types'
import PortfolioSummary from './components/PortfolioSummary'
import PortfolioStats from './components/PortfolioStats'
import MultiCurrencySummary from './components/MultiCurrencySummary'
import CurrencySelector from './components/CurrencySelector'
import AssetCard from './components/AssetCard'
import AddAssetModal from './components/AddAssetModal'
import EditAssetModal from './components/EditAssetModal'
import SettingsModal from './components/SettingsModal'
import IOLSessionStatus from './components/IOLSessionStatus'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import DolarQuotes from './components/DolarQuotes'

interface AppProps {
  user: { uid: string; displayName?: string; photoURL?: string; email?: string }
}

function App({ user }: AppProps) {
  const [assets, setAssets] = useLocalStorageState<Asset[]>('portfolio-assets', [], user?.uid)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!addButtonRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(addButtonRef.current)
    return () => observer.disconnect()
  }, [])

  // Obtener IDs únicos de criptomonedas
  const cryptoIds = assets
    .filter(a => a.type === ASSET_TYPES.CRYPTO)
    .map(a => a.symbol)
    .filter((s): s is string => !!s)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: cryptoPrices, isLoading: loadingCrypto, isError: errorCrypto, error: cryptoError } = useCryptoPrices(cryptoIds, user?.uid) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: dolarData, isLoading: loadingDolar } = useDolarPrice(user?.uid) as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: argQuotes, isLoading: loadingArgQuotes } = useArgentineQuotes(assets, user?.uid) as any
  
  // Nuevos cálculos multi-moneda
  const multiCurrencyData = useMultiCurrencyCalculations(assets, cryptoPrices, argQuotes, dolarData)

  const handleAddAsset = (newAsset: Asset) => {
    setAssets([...assets, newAsset])
  }

  const handleEditAsset = (updatedAsset: Asset) => {
    setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a))
    setEditingAsset(null)
  }

  const handleDeleteAsset = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este activo?')) {
      setAssets(assets.filter(a => a.id !== id))
    }
  }

  const getCurrentPrice = (asset: Asset) => {
    if (asset.type === ASSET_TYPES.CRYPTO) {
      // cryptoPrices es un objeto con symbols como claves
      const normalizedSymbol = String(asset.symbol || '').trim().toLowerCase()
      const cryptoData = cryptoPrices?.[normalizedSymbol]
      const price = cryptoData?.usd
      return (typeof price === 'number' && price > 0) ? price : (asset.purchasePrice ?? 0)
    } else if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
      // Para plazos fijos, calcular el valor actual basado en TNA y días transcurridos
      const plazoFijoData = calculatePlazoFijo(
        asset.amount,
        asset.tna ?? 0,
        asset.startDate ?? '',
        asset.endDate ?? ''
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
      return (typeof price === 'number' && price > 0) ? price : (asset.purchasePrice ?? 0)
    }
  }

  // Agrupar activos por tipo
  const cryptoAssets = assets.filter(a => a.type === ASSET_TYPES.CRYPTO)
  const argentineAssets = assets.filter(a => a.type !== ASSET_TYPES.CRYPTO && a.type !== ASSET_TYPES.PLAZO_FIJO && a.type !== ASSET_TYPES.EFECTIVO)
  const plazoFijoAssets = assets.filter(a => a.type === ASSET_TYPES.PLAZO_FIJO)
  const efectivoAssets = assets.filter(a => a.type === ASSET_TYPES.EFECTIVO)

  // Calcular ganancias/pérdidas por tipo de activo
  const calculateAssetTypeStats = (assetList: Asset[]) => {
    let totalValue = 0
    let totalInvested = 0

    assetList.forEach(asset => {
      const currentPrice = getCurrentPrice(asset)
      const assetCurrency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')
      
      let value: number, invested: number
      
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
      
      // Convertir todo a ARS para totales
      if (assetCurrency === 'USD' && dolarData?.blue) {
        totalValue += value * dolarData.blue.venta
        totalInvested += invested * dolarData.blue.venta
      } else {
        totalValue += value
        totalInvested += invested
      }
    })

    const profit = totalValue - totalInvested
    const profitPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
    const isProfit = profit >= 0

    return { totalValue, totalInvested, profit, profitPercent, isProfit }
  }

  const cryptoStats = calculateAssetTypeStats(cryptoAssets)
  const argentineStats = calculateAssetTypeStats(argentineAssets)
  const plazoFijoStats = calculateAssetTypeStats(plazoFijoAssets)
  const efectivoStats = calculateAssetTypeStats(efectivoAssets)

  // Ordenar activos alfabéticamente por ticker/símbolo cuando aplique
  const getSortKey = (asset) => {
    // Preferir ticker; fallback a símbolo (crypto) o nombre
    const key = asset.ticker || asset.symbol || asset.name || ''
    return typeof key === 'string' ? key.toUpperCase() : ''
  }

  const sortedCryptoAssets = [...cryptoAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
  const sortedArgentineAssets = [...argentineAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
  const sortedPlazoFijoAssets = [...plazoFijoAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
  const sortedEfectivoAssets = [...efectivoAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))

  const userName = user?.displayName || 'Usuario'
  const userEmail = user?.email || ''
  const userPhoto = user?.photoURL || ''

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-indigo-500 mb-1">
                El Juri-Portfolio
              </h1>
              <p className="text-slate-400 text-sm sm:text-base">
                La app para gestionar las inversiones del jurio
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-white border border-slate-200 rounded-lg max-w-xs shadow-sm">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold">
                    {userName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>

              <button
                onClick={signOutGoogle}
                className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-lg font-medium transition-colors shadow-sm"
                title={userEmail || 'Cerrar sesion'}
              >
                Salir
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                title="Configuración"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button
                ref={addButtonRef}
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 sm:px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center flex-1 sm:flex-none shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Agregar Activo</span>
                <span className="sm:hidden">Agregar</span>
              </button>
            </div>
          </div>

          <IOLSessionStatus />

          {assets.length > 0 && (
            <>
              {/* Nuevos totales multi-moneda */}
              <MultiCurrencySummary 
                totalsARS={multiCurrencyData.totalsARS}
                totalsUSD={multiCurrencyData.totalsUSD}
                exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
                className="mb-6"
              />
            </>
          )}

          {/* Selector de cotización minimalista integrado con las cotizaciones del dólar */}
          {dolarData && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-600 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cotizaciones del Dólar
                </h3>
                
                {/* Selector minimalista */}
                <CurrencySelector 
                  dolarData={dolarData}
                />
              </div>
              <DolarQuotes dolares={dolarData} isLoading={loadingDolar} fetchedAt={dolarData?._fetchedAt} />
            </div>
          )}
        </header>

        {assets.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-2xl font-bold text-slate-500 mb-2">Portfolio Vacío</h3>
            <p className="text-slate-400 mb-6">Comienza agregando tus primeras inversiones</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar Primer Activo
            </button>
          </div>
        ) : (
          <>
            {cryptoAssets.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap text-slate-700">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Criptomonedas
                  <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                    cryptoStats.isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {cryptoStats.isProfit ? '+' : ''}{cryptoStats.profitPercent.toFixed(2)}%
                  </span>
                  <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                    cryptoStats.isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {cryptoStats.isProfit ? '+' : ''}{formatCurrency(cryptoStats.profit / (multiCurrencyData.exchangeRate ?? 1), 'USD')}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 basis-full sm:basis-auto">
                    Invertido: {formatCurrency(cryptoStats.totalInvested, 'ARS')} → Actual: {formatCurrency(cryptoStats.totalValue, 'ARS')}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedCryptoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getCurrentPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                      conversionRate={multiCurrencyData.exchangeRate}
                      exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
                      fetchedAt={cryptoPrices?._fetchedAt}
                    />
                  ))}
                </div>
              </section>
            )}

            {argentineAssets.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap text-slate-700">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Mercado Argentino
                  <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                    argentineStats.isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {argentineStats.isProfit ? '+' : ''}{argentineStats.profitPercent.toFixed(2)}%
                  </span>
                  <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                    argentineStats.isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {argentineStats.isProfit ? '+' : ''}{formatCurrency(argentineStats.profit / (multiCurrencyData.exchangeRate ?? 1), 'USD')}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 basis-full sm:basis-auto">
                    Invertido: {formatCurrency(argentineStats.totalInvested, 'ARS')} → Actual: {formatCurrency(argentineStats.totalValue, 'ARS')}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedArgentineAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getCurrentPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                      conversionRate={multiCurrencyData.exchangeRate}
                      exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
                      fetchedAt={argQuotes?._fetchedAt}
                    />
                  ))}
                </div>
              </section>
            )}

            {plazoFijoAssets.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap text-slate-700">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Plazos Fijos
                  <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                    plazoFijoStats.isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {plazoFijoStats.isProfit ? '+' : ''}{plazoFijoStats.profitPercent.toFixed(2)}%
                  </span>
                  <span className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                    plazoFijoStats.isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                  }`}>
                    {plazoFijoStats.isProfit ? '+' : ''}{formatCurrency(plazoFijoStats.profit / (multiCurrencyData.exchangeRate ?? 1), 'USD')}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 basis-full sm:basis-auto">
                    Capital: {formatCurrency(plazoFijoStats.totalInvested, 'ARS')} → Actual: {formatCurrency(plazoFijoStats.totalValue, 'ARS')}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedPlazoFijoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getCurrentPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                      conversionRate={multiCurrencyData.exchangeRate}
                      exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
                    />
                  ))}
                </div>
              </section>
            )}

            {efectivoAssets.length > 0 && (
              <section>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 flex-wrap text-slate-700">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Efectivo y Cuentas Bancarias</span>
                  <span className="sm:hidden">Efectivo</span>
                  <span className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full bg-slate-100 text-slate-400">
                    0.00%
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 basis-full sm:basis-auto">
                    Disponible: {formatCurrency(efectivoStats.totalValue, 'ARS')}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedEfectivoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getCurrentPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                      conversionRate={multiCurrencyData.exchangeRate}
                      exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {(loadingCrypto || loadingDolar || loadingArgQuotes) && assets.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white border border-indigo-200 rounded-lg p-3 flex items-center gap-2 shadow-md">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-600">Actualizando cotizaciones...</span>
          </div>
        )}

        {errorCrypto && (
          <div className="fixed bottom-4 right-4">
            <ErrorMessage message={cryptoError.message} />
          </div>
        )}

        <AddAssetModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddAsset}
        />

        <EditAssetModal 
          isOpen={!!editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={handleEditAsset}
          asset={editingAsset}
        />

        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <ReactQueryDevtools initialIsOpen={false} />
      </div>

      {/* Floating Action Button */}
      {showFab && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center transition-all duration-200 z-40 active:scale-95"
          title="Agregar Activo"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default App