import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
import ConfirmDialog from './components/ConfirmDialog'
import ErrorMessage from './components/ErrorMessage'

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
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleSyncError = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string }>).detail
      if (detail?.message) setSyncError(detail.message)
    }

    const handleIOLSession = (event: Event) => {
      const detail = (event as CustomEvent<{ reason?: string }>).detail
      if (detail?.reason === 'expired') {
        setIolAuthError('Tu sesión IOL expiró. Configurá tus credenciales nuevamente.')
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

  const cryptoIds = useMemo(
    () => assets
      .filter(a => a.type === ASSET_TYPES.CRYPTO)
      .map(a => a.symbol)
      .filter((s): s is string => !!s)
      .sort(),
    [assets]
  )

  const { data: cryptoPrices, isLoading: loadingCrypto, isError: errorCrypto, error: cryptoError, refetch: refetchCrypto } = useCryptoPrices(cryptoIds, user?.uid)
  const { data: dolarData, isLoading: loadingDolar, isError: errorDolar, error: dolarError, refetch: refetchDolar } = useDolarPrice(user?.uid)
  const { data: argQuotes, isLoading: loadingArgQuotes, isError: errorArgQuotes, error: argQuotesError, refetch: refetchArgQuotes } = useArgentineQuotes(assets, user?.uid)

  const multiCurrencyData = useMultiCurrencyCalculations(assets, cryptoPrices, argQuotes, dolarData, currencyPreference)

  const priceContext = useMemo(
    () => ({ cryptoPrices, argQuotes }),
    [cryptoPrices, argQuotes]
  )

  const handleAddAsset = useCallback((newAsset: Asset) => {
    setAssets(prev => [...prev, newAsset])
  }, [setAssets])

  const handleEditAsset = useCallback((updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a))
    setEditingAsset(null)
  }, [setAssets])

  const handleDeleteAsset = useCallback((id: number) => {
    const asset = assets.find(a => a.id === id)
    if (asset) setDeleteTarget(asset)
  }, [assets])

  const confirmDeleteAsset = useCallback(() => {
    if (!deleteTarget) return
    setAssets(prev => prev.filter(a => a.id !== deleteTarget.id))
    setDeleteTarget(null)
  }, [deleteTarget, setAssets])

  const getAssetPrice = useCallback(
    (asset: Asset) => getCurrentPrice(asset, priceContext),
    [priceContext]
  )

  const cryptoAssets = useMemo(() => assets.filter(a => a.type === ASSET_TYPES.CRYPTO), [assets])
  const argentineAssets = useMemo(
    () => assets.filter(a => a.type !== ASSET_TYPES.CRYPTO && a.type !== ASSET_TYPES.PLAZO_FIJO && a.type !== ASSET_TYPES.EFECTIVO),
    [assets]
  )
  const plazoFijoAssets = useMemo(() => assets.filter(a => a.type === ASSET_TYPES.PLAZO_FIJO), [assets])
  const efectivoAssets = useMemo(() => assets.filter(a => a.type === ASSET_TYPES.EFECTIVO), [assets])

  const cryptoStats = useMemo(
    () => calculateAssetTypeStats(cryptoAssets, priceContext, currencyPreference, dolarData),
    [cryptoAssets, priceContext, currencyPreference, dolarData]
  )
  const argentineStats = useMemo(
    () => calculateAssetTypeStats(argentineAssets, priceContext, currencyPreference, dolarData),
    [argentineAssets, priceContext, currencyPreference, dolarData]
  )
  const plazoFijoStats = useMemo(
    () => calculateAssetTypeStats(plazoFijoAssets, priceContext, currencyPreference, dolarData),
    [plazoFijoAssets, priceContext, currencyPreference, dolarData]
  )
  const efectivoStats = useMemo(
    () => calculateAssetTypeStats(efectivoAssets, priceContext, currencyPreference, dolarData),
    [efectivoAssets, priceContext, currencyPreference, dolarData]
  )

  const openAddModal = useCallback(() => setIsAddModalOpen(true), [])
  const closeAddModal = useCallback(() => setIsAddModalOpen(false), [])
  const closeEditModal = useCallback(() => setEditingAsset(null), [])
  const closeSettings = useCallback(() => setIsSettingsOpen(false), [])
  const openSettings = useCallback(() => setIsSettingsOpen(true), [])

  const outletContext: PortfolioOutletContext = useMemo(() => ({
    user,
    assets,
    isCloudSyncing,
    currencyPreference,
    setCurrencyPreference,
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
    onAddAsset: openAddModal,
    onEditAsset: setEditingAsset,
    onDeleteAsset: handleDeleteAsset,
    getAssetPrice,
  }), [
    user, assets, isCloudSyncing, currencyPreference, setCurrencyPreference,
    multiCurrencyData, cryptoStats, argentineStats, plazoFijoStats, efectivoStats,
    cryptoPrices, argQuotes, dolarData, loadingCrypto, loadingDolar, loadingArgQuotes,
    errorCrypto, errorDolar, errorArgQuotes, cryptoError, dolarError, argQuotesError,
    refetchCrypto, refetchDolar, refetchArgQuotes, openAddModal, handleDeleteAsset, getAssetPrice,
  ])

  return (
    <div className="bg-ink min-h-screen text-paper">
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
              onOpenSettings={openSettings}
              onOpenAddAsset={openAddModal}
              addButtonRef={addButtonRef}
            />
          }
        >
          <Route index element={<PortfolioView />} />
          <Route path="evolucion" element={<PortfolioEvolutionPage />} />
        </Route>
      </Routes>

      {(loadingCrypto || loadingDolar || loadingArgQuotes) && assets.length > 0 && (
        <div className="status-banner fixed bottom-4 right-4 card px-3 py-2 z-40" role="status" aria-live="polite">
          <div className="w-4 h-4 border-2 border-celeste border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          <span className="text-sm text-muted">Actualizando cotizaciones…</span>
        </div>
      )}

      {(errorCrypto || errorDolar || errorArgQuotes) && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 max-w-sm z-50 mb-16 sm:mb-0" aria-live="assertive">
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
        onClose={closeAddModal}
        onAdd={handleAddAsset}
      />

      <EditAssetModal
        isOpen={!!editingAsset}
        onClose={closeEditModal}
        onSave={handleEditAsset}
        asset={editingAsset}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteAsset}
        title="Eliminar activo"
        message={deleteTarget ? `¿Eliminar "${deleteTarget.name}" del portfolio? Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />

      <ReactQueryDevtools initialIsOpen={false} />

      {showFab && !isCloudSyncing && (
        <button
          onClick={openAddModal}
          className="fixed bottom-6 right-6 w-14 h-14 btn-primary rounded-full shadow-lg shadow-celeste/20 flex items-center justify-center transition-all duration-200 z-40 active:scale-95"
          aria-label="Agregar activo"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default App
