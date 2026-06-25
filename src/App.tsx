import { useState, useEffect, useRef } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useCryptoPrices, useDolarPrice } from './hooks/useInvestments'
import { useArgentineQuotes } from './hooks/useArgentineQuotes'
import { useMultiCurrencyCalculations } from './hooks/useMultiCurrency'
import { useLocalStorageState, PORTFOLIO_SYNC_ERROR } from './hooks/useLocalStorageState'
import { signOutGoogle } from './config/firebase'
import { getCurrentPrice, calculateAssetTypeStats } from './utils/assetCalculations'
import { formatCurrency } from './utils/formatters'
import { ASSET_TYPES } from './config/constants'
import { IOL_SESSION_CHANGED } from './services/iolSession'
import type { Asset } from './types'
import MultiCurrencySummary from './components/MultiCurrencySummary'
import CurrencySelector from './components/CurrencySelector'
import AssetCard from './components/AssetCard'
import AddAssetModal from './components/AddAssetModal'
import EditAssetModal from './components/EditAssetModal'
import SettingsModal from './components/SettingsModal'
import IOLSessionStatus from './components/IOLSessionStatus'
import PortfolioSyncBanner from './components/PortfolioSyncBanner'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import DolarQuotes from './components/DolarQuotes'

interface AppProps {
  user: { uid: string; displayName?: string; photoURL?: string; email?: string }
}

function App({ user }: AppProps) {
  const [assets, setAssets, { isSyncing: isPortfolioSyncing }] = useLocalStorageState<Asset[]>('portfolio-assets', [], user?.uid)
  const [currencyPreference, setCurrencyPreference, { isSyncing: isPrefsSyncing }] = useLocalStorageState('portfolio-currency-preference', 'blue', user?.uid)
  const isCloudSyncing = isPortfolioSyncing || isPrefsSyncing
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showFab, setShowFab] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [iolAuthError, setIolAuthError] = useState<string | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleSyncError = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string }>).detail
      if (detail?.message) setSyncError(detail.message)
    }

    const handleIOLSession = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail
      if (detail?.reason === 'expired') {
        setIolAuthError('Tu sesión IOL expiró. Configura tus credenciales nuevamente.')
        setIsSettingsOpen(true)
      }
    }

    window.addEventListener(PORTFOLIO_SYNC_ERROR, handleSyncError)
    window.addEventListener(IOL_SESSION_CHANGED, handleIOLSession)

    return () => {
      window.removeEventListener(PORTFOLIO_SYNC_ERROR, handleSyncError)
      window.removeEventListener(IOL_SESSION_CHANGED, handleIOLSession)
    }
  }, [])

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

  const { data: cryptoPrices, isLoading: loadingCrypto, isError: errorCrypto, error: cryptoError, refetch: refetchCrypto } = useCryptoPrices(cryptoIds, user?.uid)
  const { data: dolarData, isLoading: loadingDolar, isError: errorDolar, error: dolarError, refetch: refetchDolar } = useDolarPrice(user?.uid)
  const { data: argQuotes, isLoading: loadingArgQuotes, isError: errorArgQuotes, error: argQuotesError, refetch: refetchArgQuotes } = useArgentineQuotes(assets, user?.uid)

  const multiCurrencyData = useMultiCurrencyCalculations(assets, cryptoPrices, argQuotes, dolarData, currencyPreference)
  const priceContext = { cryptoPrices, argQuotes }

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

  const getAssetPrice = (asset: Asset) => getCurrentPrice(asset, priceContext)

  // Agrupar activos por tipo
  const cryptoAssets = assets.filter(a => a.type === ASSET_TYPES.CRYPTO)
  const argentineAssets = assets.filter(a => a.type !== ASSET_TYPES.CRYPTO && a.type !== ASSET_TYPES.PLAZO_FIJO && a.type !== ASSET_TYPES.EFECTIVO)
  const plazoFijoAssets = assets.filter(a => a.type === ASSET_TYPES.PLAZO_FIJO)
  const efectivoAssets = assets.filter(a => a.type === ASSET_TYPES.EFECTIVO)

  const cryptoStats = calculateAssetTypeStats(cryptoAssets, priceContext, currencyPreference, dolarData)
  const argentineStats = calculateAssetTypeStats(argentineAssets, priceContext, currencyPreference, dolarData)
  const plazoFijoStats = calculateAssetTypeStats(plazoFijoAssets, priceContext, currencyPreference, dolarData)
  const efectivoStats = calculateAssetTypeStats(efectivoAssets, priceContext, currencyPreference, dolarData)

  // Ordenar activos alfabéticamente por ticker/símbolo cuando aplique
  const getSortKey = (asset: Asset) => {
    // Preferir ticker; fallback a símbolo (crypto) o nombre
    const key = asset.symbol || asset.name || ''
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
    <div className="bg-ink min-h-screen text-paper">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <p className="text-celeste text-xs font-mono-data uppercase tracking-widest mb-2">Observatorio financiero</p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-paper mb-1">
                El Juri-Portfolio
              </h1>
              <p className="text-muted text-sm sm:text-base">
                Gestión de inversiones del jurio
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="hidden md:flex items-center gap-3 px-3 py-2 card max-w-xs">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-celeste/15 text-celeste flex items-center justify-center text-xs font-bold">
                    {userName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-paper truncate">{userName}</p>
                  <p className="text-xs text-subtle truncate">{userEmail}</p>
                </div>
              </div>

              <button
                onClick={signOutGoogle}
                className="btn-ghost px-4 py-3"
                title={userEmail || 'Cerrar sesión'}
              >
                Salir
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="btn-ghost px-4 py-3 flex items-center gap-2"
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
                disabled={isCloudSyncing}
                className="btn-primary px-4 sm:px-6 py-3 flex items-center gap-2 justify-center flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Agregar activo</span>
                <span className="sm:hidden">Agregar</span>
              </button>
            </div>
          </div>

          <IOLSessionStatus />

          <PortfolioSyncBanner isSyncing={isCloudSyncing} />

          {syncError && (
            <div className="status-banner mb-4 bg-peso/10 border border-peso/25 text-peso justify-between">
              <span>{syncError}</span>
              <button onClick={() => setSyncError(null)} className="text-peso/70 hover:text-peso shrink-0">✕</button>
            </div>
          )}

          {iolAuthError && (
            <div className="status-banner mb-4 bg-loss/10 border border-loss/25 text-loss justify-between">
              <span>{iolAuthError}</span>
              <button onClick={() => setIolAuthError(null)} className="text-loss/70 hover:text-loss shrink-0">✕</button>
            </div>
          )}

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h3 className="text-sm font-mono-data uppercase tracking-widest text-muted">
                  Cotizaciones del dólar
                </h3>
                
                <CurrencySelector
                  dolarData={dolarData}
                  currencyPreference={currencyPreference}
                  onCurrencyChange={setCurrencyPreference}
                />
              </div>
              <DolarQuotes dolares={dolarData} isLoading={loadingDolar} fetchedAt={dolarData?._fetchedAt} />
            </div>
          )}
        </header>

        {isCloudSyncing && assets.length === 0 ? (
          <div className="text-center py-16">
            <LoadingSpinner text="Cargando portfolio desde la nube..." />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
              <svg className="w-8 h-8 text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-semibold text-muted mb-2">Portfolio vacío</h3>
            <p className="text-subtle mb-6">Agregá tu primer activo para empezar a seguir tus inversiones</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={isCloudSyncing}
              className="btn-primary px-6 py-3 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar primer activo
            </button>
          </div>
        ) : (
          <>
            {cryptoAssets.length > 0 && (
              <section className="mb-12">
                <div className="section-rule section-rule--crypto mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-paper flex items-center gap-2 sm:gap-3 flex-wrap">
                    Criptomonedas
                    <span className={`text-xs font-mono-data font-medium px-2 py-0.5 rounded ${cryptoStats.isProfit ? 'badge-profit' : 'badge-loss'}`}>
                      {cryptoStats.isProfit ? '+' : ''}{cryptoStats.profitPercent.toFixed(2)}%
                    </span>
                    <span className={`text-xs font-mono-data font-medium px-2 py-0.5 rounded ${cryptoStats.isProfit ? 'badge-profit' : 'badge-loss'}`}>
                      {cryptoStats.isProfit ? '+' : ''}{formatCurrency(cryptoStats.profit / (multiCurrencyData.exchangeRate ?? 1), 'USD')}
                    </span>
                    <span className="text-xs text-subtle basis-full sm:basis-auto font-mono-data">
                      {formatCurrency(cryptoStats.totalInvested, 'ARS')} → {formatCurrency(cryptoStats.totalValue, 'ARS')}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedCryptoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getAssetPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                      conversionRate={multiCurrencyData.exchangeRate}
                      exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
                      fetchedAt={typeof cryptoPrices?._fetchedAt === 'string' ? cryptoPrices._fetchedAt : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {argentineAssets.length > 0 && (
              <section className="mb-12">
                <div className="section-rule section-rule--argentine mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-paper flex items-center gap-2 sm:gap-3 flex-wrap">
                    Mercado argentino
                    <span className={`text-xs font-mono-data font-medium px-2 py-0.5 rounded ${argentineStats.isProfit ? 'badge-profit' : 'badge-loss'}`}>
                      {argentineStats.isProfit ? '+' : ''}{argentineStats.profitPercent.toFixed(2)}%
                    </span>
                    <span className={`text-xs font-mono-data font-medium px-2 py-0.5 rounded ${argentineStats.isProfit ? 'badge-profit' : 'badge-loss'}`}>
                      {argentineStats.isProfit ? '+' : ''}{formatCurrency(argentineStats.profit / (multiCurrencyData.exchangeRate ?? 1), 'USD')}
                    </span>
                    <span className="text-xs text-subtle basis-full sm:basis-auto font-mono-data">
                      {formatCurrency(argentineStats.totalInvested, 'ARS')} → {formatCurrency(argentineStats.totalValue, 'ARS')}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedArgentineAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getAssetPrice(asset)}
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
              <section className="mb-12">
                <div className="section-rule section-rule--plazo mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-paper flex items-center gap-2 sm:gap-3 flex-wrap">
                    Plazos fijos
                    <span className={`text-xs font-mono-data font-medium px-2 py-0.5 rounded ${plazoFijoStats.isProfit ? 'badge-profit' : 'badge-loss'}`}>
                      {plazoFijoStats.isProfit ? '+' : ''}{plazoFijoStats.profitPercent.toFixed(2)}%
                    </span>
                    <span className={`text-xs font-mono-data font-medium px-2 py-0.5 rounded ${plazoFijoStats.isProfit ? 'badge-profit' : 'badge-loss'}`}>
                      {plazoFijoStats.isProfit ? '+' : ''}{formatCurrency(plazoFijoStats.profit / (multiCurrencyData.exchangeRate ?? 1), 'USD')}
                    </span>
                    <span className="text-xs text-subtle basis-full sm:basis-auto font-mono-data">
                      {formatCurrency(plazoFijoStats.totalInvested, 'ARS')} → {formatCurrency(plazoFijoStats.totalValue, 'ARS')}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedPlazoFijoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getAssetPrice(asset)}
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
                <div className="section-rule section-rule--efectivo mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-paper flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="hidden sm:inline">Efectivo y cuentas</span>
                    <span className="sm:hidden">Efectivo</span>
                    <span className="text-xs font-mono-data font-medium px-2 py-0.5 rounded bg-surface-raised text-subtle">
                      0.00%
                    </span>
                    <span className="text-xs text-subtle basis-full sm:basis-auto font-mono-data">
                      Disponible: {formatCurrency(efectivoStats.totalValue, 'ARS')}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {sortedEfectivoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getAssetPrice(asset)}
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
          <div className="fixed bottom-4 right-4 card px-3 py-2 flex items-center gap-2 z-40">
            <div className="w-4 h-4 border-2 border-celeste border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted">Actualizando cotizaciones…</span>
          </div>
        )}

        {(errorCrypto || errorDolar || errorArgQuotes) && (
          <div className="fixed bottom-4 right-4 flex flex-col gap-2 max-w-sm z-50">
            {errorCrypto && (
              <ErrorMessage
                message={cryptoError?.message || 'Error al obtener precios de criptomonedas'}
                onRetry={() => refetchCrypto()}
              />
            )}
            {errorDolar && (
              <ErrorMessage
                message={dolarError?.message || 'Error al obtener cotización del dólar'}
                onRetry={() => refetchDolar()}
              />
            )}
            {errorArgQuotes && (
              <ErrorMessage
                message={argQuotesError?.message || 'Error al obtener cotizaciones argentinas'}
                onRetry={() => refetchArgQuotes()}
              />
            )}
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
      {showFab && !isCloudSyncing && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 btn-primary rounded-full shadow-lg shadow-celeste/20 flex items-center justify-center transition-all duration-200 z-40 active:scale-95"
          title="Agregar activo"
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