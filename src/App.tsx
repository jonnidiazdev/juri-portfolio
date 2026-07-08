import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useCryptoPrices, useDolarPrice } from './hooks/useInvestments'
import { useArgentineQuotes } from './hooks/useArgentineQuotes'
import { useMultiCurrencyCalculations } from './hooks/useMultiCurrency'
import { useLocalStorageState, PORTFOLIO_SYNC_ERROR } from './hooks/useLocalStorageState'
import { getCurrentPrice, calculateAssetTypeStats } from './utils/assetCalculations'
import { ASSET_TYPES } from './config/constants'
import { IOL_SESSION_CHANGED } from './services/iolSession'
import type { Asset } from './types'
import type { PortfolioOutletContext } from './hooks/usePortfolioOutletContext'
import AppLayout from './components/AppLayout'
import PortfolioView from './components/PortfolioView'
import PortfolioEvolutionPage from './components/PortfolioEvolutionPage'
import AddAssetModal from './components/AddAssetModal'
import EditAssetModal from './components/EditAssetModal'
import SettingsModal from './components/SettingsModal'
import ErrorMessage from './components/ErrorMessage'
import NightForestBackground from './components/NightForestBackground'

interface AppProps {
  user: { uid: string; displayName?: string; photoURL?: string; email?: string }
}

function App({ user }: AppProps) {
  const [assets, setAssets, { isSyncing: isPortfolioSyncing }] = useLocalStorageState<Asset[]>('portfolio-assets', [], user?.uid)
  const [currencyPreference, setCurrencyPreference, { isSyncing: isPrefsSyncing }] = useLocalStorageState('portfolio-currency-preference', 'blue', user?.uid)
  const [hideValues, setHideValues, { isSyncing: isHideValuesSyncing }] = useLocalStorageState('portfolio-hide-values', false, user?.uid)
  const isCloudSyncing = isPortfolioSyncing || isPrefsSyncing || isHideValuesSyncing
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

  const cryptoIds = assets
    .filter(a => a.type === ASSET_TYPES.CRYPTO)
    .map(a => a.symbol)
    .filter((s): s is string => !!s)

  const { data: cryptoPrices, isFetching: fetchingCrypto, isError: errorCrypto, error: cryptoError, refetch: refetchCrypto } = useCryptoPrices(cryptoIds, user?.uid)
  const { data: dolarData, isFetching: fetchingDolar, isError: errorDolar, error: dolarError, refetch: refetchDolar } = useDolarPrice(user?.uid)
  const { data: argQuotes, isFetching: fetchingArgQuotes, isError: errorArgQuotes, error: argQuotesError, refetch: refetchArgQuotes } = useArgentineQuotes(assets, user?.uid)

  const loadingCrypto = fetchingCrypto && !cryptoPrices
  const loadingDolar = fetchingDolar && !dolarData
  const loadingArgQuotes = fetchingArgQuotes && !argQuotes

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

  const cryptoAssets = assets.filter(a => a.type === ASSET_TYPES.CRYPTO)
  const argentineAssets = assets.filter(a => a.type !== ASSET_TYPES.CRYPTO && a.type !== ASSET_TYPES.PLAZO_FIJO && a.type !== ASSET_TYPES.EFECTIVO)
  const plazoFijoAssets = assets.filter(a => a.type === ASSET_TYPES.PLAZO_FIJO)
  const efectivoAssets = assets.filter(a => a.type === ASSET_TYPES.EFECTIVO)

  const cryptoStats = calculateAssetTypeStats(cryptoAssets, priceContext, currencyPreference, dolarData)
  const argentineStats = calculateAssetTypeStats(argentineAssets, priceContext, currencyPreference, dolarData)
  const plazoFijoStats = calculateAssetTypeStats(plazoFijoAssets, priceContext, currencyPreference, dolarData)
  const efectivoStats = calculateAssetTypeStats(efectivoAssets, priceContext, currencyPreference, dolarData)

  const outletContext: PortfolioOutletContext = {
    user,
    assets,
    isCloudSyncing,
    currencyPreference,
    setCurrencyPreference,
    hideValues,
    setHideValues,
    multiCurrencyData,
    cryptoStats,
    argentineStats,
    plazoFijoStats,
    efectivoStats,
    cryptoPrices,
    argQuotes,
    dolarData,
    loadingCrypto,
    loadingDolar,
    loadingArgQuotes,
    errorCrypto,
    errorDolar,
    errorArgQuotes,
    cryptoError: cryptoError ?? null,
    dolarError: dolarError ?? null,
    argQuotesError: argQuotesError ?? null,
    refetchCrypto,
    refetchDolar,
    refetchArgQuotes,
    onAddAsset: () => setIsAddModalOpen(true),
    onEditAsset: setEditingAsset,
    onDeleteAsset: handleDeleteAsset,
    getAssetPrice,
  }

  return (
    <div className="relative min-h-screen text-paper">
      <NightForestBackground />
      <Routes>
        <Route
          element={
            <AppLayout
              user={user}
              outletContext={outletContext}
              isCloudSyncing={isCloudSyncing}
              syncError={syncError}
              iolAuthError={iolAuthError}
              onDismissSyncError={() => setSyncError(null)}
              onDismissIolError={() => setIolAuthError(null)}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenAddAsset={() => setIsAddModalOpen(true)}
              hideValues={hideValues}
              onToggleHideValues={() => setHideValues(!hideValues)}
              addButtonRef={addButtonRef}
            />
          }
        >
          <Route index element={<PortfolioView />} />
          <Route path="evolucion" element={<PortfolioEvolutionPage />} />
        </Route>
      </Routes>

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
