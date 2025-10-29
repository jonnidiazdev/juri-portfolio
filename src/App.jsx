import { useState, useEffect } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useCryptoPrices, useDolarPrice } from './hooks/useInvestments'
import { useArgentineQuotes } from './hooks/useArgentineQuotes'
import { useMultiCurrencyCalculations } from './hooks/useMultiCurrency'
import { ASSET_TYPES } from './config/constants'
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

function App() {
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('portfolio-assets')
    return saved ? JSON.parse(saved) : []
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Obtener IDs únicos de criptomonedas
  const cryptoIds = assets
    .filter(a => a.type === ASSET_TYPES.CRYPTO)
    .map(a => a.symbol)

  const { data: cryptoPrices, isLoading: loadingCrypto, isError: errorCrypto, error: cryptoError } = useCryptoPrices(cryptoIds)
  const { data: dolarData, isLoading: loadingDolar } = useDolarPrice()
  const { data: argQuotes, isLoading: loadingArgQuotes } = useArgentineQuotes(assets)
  
  // Nuevos cálculos multi-moneda
  const multiCurrencyData = useMultiCurrencyCalculations(assets, cryptoPrices, argQuotes, dolarData)

  useEffect(() => {
    localStorage.setItem('portfolio-assets', JSON.stringify(assets))
  }, [assets])

  const handleAddAsset = (newAsset) => {
    setAssets([...assets, newAsset])
  }

  const handleEditAsset = (updatedAsset) => {
    setAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a))
    setEditingAsset(null)
  }

  const handleDeleteAsset = (id) => {
    if (confirm('¿Estás seguro de eliminar este activo?')) {
      setAssets(assets.filter(a => a.id !== id))
    }
  }

  const getCurrentPrice = (asset) => {
    if (asset.type === ASSET_TYPES.CRYPTO) {
      // cryptoPrices es un objeto con symbols como claves
      const cryptoData = cryptoPrices?.[asset.symbol]
      const price = cryptoData?.usd
      return (typeof price === 'number' && price > 0) ? price : asset.purchasePrice
    } else {
      // argQuotes usa asset.id como clave
      const quote = argQuotes?.[asset.id]
      const price = quote?.price
      return (typeof price === 'number' && price > 0) ? price : asset.purchasePrice
    }
  }

  const calculateTotals = () => {
    let totalValue = 0
    let totalInvested = 0

    assets.forEach(asset => {
      const currentPrice = getCurrentPrice(asset)
      const assetCurrency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')
      const value = asset.amount * currentPrice
      const invested = asset.amount * asset.purchasePrice
      
      // Convertir todo a ARS para el total unificado
      if (assetCurrency === 'USD' && dolarData?.blue) {
        totalValue += value * dolarData.blue.venta
        totalInvested += invested * dolarData.blue.venta
      } else {
        totalValue += value
        totalInvested += invested
      }
    })

    const change = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0
    return { totalValue, totalInvested, change }
  }

  const totals = calculateTotals()

  // Agrupar activos por tipo
  const cryptoAssets = assets.filter(a => a.type === ASSET_TYPES.CRYPTO)
  const argentineAssets = assets.filter(a => a.type !== ASSET_TYPES.CRYPTO)

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                El Juri-Portfolio
              </h1>
              <p className="text-gray-400">
                La app para gestionar las inversiones del jurio
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-semibold transition-colors flex items-center gap-2"
                title="Configuración"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Activo
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
                <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cotizaciones del Dólar
                </h3>
                
                {/* Selector minimalista */}
                <CurrencySelector 
                  dolarData={dolarData}
                />
              </div>
              <DolarQuotes dolares={dolarData} isLoading={loadingDolar} />
            </div>
          )}
        </header>

        {assets.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">Portfolio Vacío</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tus primeras inversiones</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
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
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Criptomonedas
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cryptoAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getCurrentPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                    />
                  ))}
                </div>
              </section>
            )}

            {argentineAssets.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Mercado Argentino
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {argentineAssets.map(asset => (
                    <AssetCard 
                      key={asset.id}
                      asset={asset}
                      currentPrice={getCurrentPrice(asset)}
                      onEdit={setEditingAsset}
                      onDelete={handleDeleteAsset}
                      dolarPrice={dolarData?.blue?.venta}
                      dolarMepPrice={dolarData?.bolsa?.venta}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {(loadingCrypto || loadingDolar || loadingArgQuotes) && assets.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-gray-800 border border-cyan-500 rounded-lg p-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-300">Actualizando cotizaciones...</span>
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
    </div>
  )
}

export default App