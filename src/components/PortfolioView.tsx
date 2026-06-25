import { ASSET_TYPES } from '../config/constants'
import { usePortfolioOutletContext } from '../hooks/usePortfolioOutletContext'
import { formatCurrency } from '../utils/formatters'
import type { Asset } from '../types'
import MultiCurrencySummary from './MultiCurrencySummary'
import CurrencySelector from './CurrencySelector'
import AssetCard from './AssetCard'
import LoadingSpinner from './LoadingSpinner'
import DolarQuotes from './DolarQuotes'

export default function PortfolioView() {
  const {
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
    loadingDolar,
    onAddAsset,
    onEditAsset,
    onDeleteAsset,
    getAssetPrice,
  } = usePortfolioOutletContext()

  const cryptoAssets = assets.filter(a => a.type === ASSET_TYPES.CRYPTO)
  const argentineAssets = assets.filter(a => a.type !== ASSET_TYPES.CRYPTO && a.type !== ASSET_TYPES.PLAZO_FIJO && a.type !== ASSET_TYPES.EFECTIVO)
  const plazoFijoAssets = assets.filter(a => a.type === ASSET_TYPES.PLAZO_FIJO)
  const efectivoAssets = assets.filter(a => a.type === ASSET_TYPES.EFECTIVO)

  const getSortKey = (asset: Asset) => {
    const key = asset.symbol || asset.name || ''
    return typeof key === 'string' ? key.toUpperCase() : ''
  }

  const sortedCryptoAssets = [...cryptoAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
  const sortedArgentineAssets = [...argentineAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
  const sortedPlazoFijoAssets = [...plazoFijoAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))
  const sortedEfectivoAssets = [...efectivoAssets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b)))

  return (
    <>
      {assets.length > 0 && (
        <MultiCurrencySummary
          totalsARS={multiCurrencyData.totalsARS}
          totalsUSD={multiCurrencyData.totalsUSD}
          exchangeRateInfo={multiCurrencyData.exchangeRateInfo}
          className="mb-6"
        />
      )}

      {dolarData && (
        <div className="mb-8">
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
            onClick={onAddAsset}
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
                    onEdit={onEditAsset}
                    onDelete={onDeleteAsset}
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
                    onEdit={onEditAsset}
                    onDelete={onDeleteAsset}
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
                    onEdit={onEditAsset}
                    onDelete={onDeleteAsset}
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
                    onEdit={onEditAsset}
                    onDelete={onDeleteAsset}
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
    </>
  )
}
