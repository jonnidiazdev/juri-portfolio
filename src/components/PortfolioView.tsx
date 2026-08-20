import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ASSET_TYPES, PORTFOLIO_CATEGORY_COLORS } from '../config/constants'
import { usePortfolioOutletContext } from '../hooks/usePortfolioOutletContext'
import { usePortfolioFormatters } from '../hooks/usePortfolioFormatters'
import { useSlidingIndicator } from '../hooks/useSlidingIndicator'
import type { Asset } from '../types'
import ChalkHeroNumber from './ChalkHeroNumber'
import CurrencySelector from './CurrencySelector'
import HoldingRow from './HoldingRow'
import PortfolioCategoryBreakdown from './PortfolioCategoryBreakdown'
import { LoadingCard } from './LoadingSpinner'
import DolarQuotes from './DolarQuotes'

type CategoryFilter = 'all' | 'crypto' | 'argentine' | 'plazo' | 'efectivo'

const CATEGORY_META: Record<Exclude<CategoryFilter, 'all'>, { label: string; color: string }> = {
  crypto: { label: 'Cripto', color: PORTFOLIO_CATEGORY_COLORS.crypto },
  argentine: { label: 'Argentino', color: PORTFOLIO_CATEGORY_COLORS.argentine },
  plazo: { label: 'Plazo fijo', color: PORTFOLIO_CATEGORY_COLORS.plazo },
  efectivo: { label: 'Efectivo', color: PORTFOLIO_CATEGORY_COLORS.efectivo },
}

function getCategory(asset: Asset): Exclude<CategoryFilter, 'all'> {
  if (asset.type === ASSET_TYPES.CRYPTO) return 'crypto'
  if (asset.type === ASSET_TYPES.PLAZO_FIJO) return 'plazo'
  if (asset.type === ASSET_TYPES.EFECTIVO) return 'efectivo'
  return 'argentine'
}

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
    dolarData,
    loadingDolar,
    onAddAsset,
    onEditAsset,
    onDeleteAsset,
    getAssetPrice,
  } = usePortfolioOutletContext()
  const { formatCurrency, formatPercentage } = usePortfolioFormatters()
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const categoryIndicator = useSlidingIndicator(categoryFilter)

  const getSortKey = (asset: Asset) => {
    const key = asset.symbol || asset.name || ''
    return typeof key === 'string' ? key.toUpperCase() : ''
  }

  const sortedAssets = useMemo(
    () => [...assets].sort((a, b) => getSortKey(a).localeCompare(getSortKey(b))),
    [assets]
  )

  const visibleCategories = useMemo(() => {
    const present = new Set(assets.map(getCategory))
    return (Object.keys(CATEGORY_META) as Exclude<CategoryFilter, 'all'>[]).filter(id => present.has(id))
  }, [assets])

  const filteredAssets = categoryFilter === 'all'
    ? sortedAssets
    : sortedAssets.filter(asset => getCategory(asset) === categoryFilter)

  const categoryBreakdown = [
    { id: 'crypto', label: 'Criptomonedas', totalValueARS: cryptoStats.totalValue, accentClass: 'section-rule--crypto', visible: assets.some(a => getCategory(a) === 'crypto') },
    { id: 'argentine', label: 'Mercado argentino', totalValueARS: argentineStats.totalValue, accentClass: 'section-rule--argentine', visible: assets.some(a => getCategory(a) === 'argentine') },
    { id: 'plazo', label: 'Plazos fijos', totalValueARS: plazoFijoStats.totalValue, accentClass: 'section-rule--plazo', visible: assets.some(a => getCategory(a) === 'plazo') },
    { id: 'efectivo', label: 'Efectivo/cuentas', totalValueARS: efectivoStats.totalValue, accentClass: 'section-rule--efectivo', visible: assets.some(a => getCategory(a) === 'efectivo') },
  ]
    .filter(c => c.visible)
    .map(({ id, label, totalValueARS, accentClass }) => ({ id, label, totalValueARS, accentClass }))

  if (isCloudSyncing) {
    return (
      <div className="space-y-6" aria-busy="true" aria-live="polite">
        <div className="card p-6 sm:p-8 animate-pulse">
          <div className="h-3 w-28 bg-surface-raised rounded mb-4" />
          <div className="h-9 w-44 bg-surface-raised rounded" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <LoadingCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-border flex items-center justify-center">
          <svg className="w-8 h-8 text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="font-chalk text-2xl text-muted mb-2">Portfolio vacío</h3>
        <p className="text-subtle mb-6">Agregá tu primer activo para empezar a seguir tus inversiones</p>
        <button onClick={onAddAsset} className="btn-primary px-6 py-3 inline-flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar primer activo
        </button>
      </div>
    )
  }

  const isProfit = multiCurrencyData.totalsARS.profit >= 0

  return (
    <div className="space-y-6">
      {/* Hero: la pizarra */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <ChalkHeroNumber
            label="Tenés hoy"
            value={formatCurrency(multiCurrencyData.totalsARS.current, 'ARS')}
            secondaryValue={`≈ ${formatCurrency(multiCurrencyData.totalsUSD.current, 'USD')}`}
          />
          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <div className="text-right">
              <p className="text-subtle text-xs mb-0.5">Resultado total</p>
              <p className={`font-mono-data font-semibold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                {formatCurrency(multiCurrencyData.totalsARS.profit, 'ARS')}
              </p>
              <p className={`font-mono-data text-sm ${isProfit ? 'text-profit' : 'text-loss'}`}>
                ≈ {formatCurrency(multiCurrencyData.totalsUSD.profit, 'USD')} · {formatPercentage(multiCurrencyData.totalsARS.profitPercent)}
              </p>
            </div>
            <Link to="/evolucion" className="btn-ghost px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
              Ver evolución histórica
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </Link>
          </div>
        </div>

        {dolarData && (
          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <span className="text-subtle text-[10px] font-mono-data uppercase tracking-widest">
                Cotizaciones del dólar
              </span>
              <CurrencySelector
                dolarData={dolarData}
                currencyPreference={currencyPreference}
                onCurrencyChange={setCurrencyPreference}
              />
            </div>
            <DolarQuotes dolares={dolarData} isLoading={loadingDolar} fetchedAt={dolarData?._fetchedAt} />
          </div>
        )}
      </div>

      {/* Chips de categoría */}
      {visibleCategories.length > 1 && (
        <div ref={categoryIndicator.containerRef} className="relative flex items-center gap-2 flex-wrap">
          {categoryIndicator.rect && (
            <div
              className="sliding-indicator rounded-full border border-celeste/30"
              style={{
                width: categoryIndicator.rect.width,
                height: categoryIndicator.rect.height,
                transform: `translate(${categoryIndicator.rect.left}px, ${categoryIndicator.rect.top}px)`,
                backgroundColor: categoryFilter === 'all' ? 'rgba(107, 173, 201, 0.15)' : `${CATEGORY_META[categoryFilter as Exclude<CategoryFilter, 'all'>]?.color ?? ''}22`,
              }}
            />
          )}
          <button
            ref={categoryIndicator.setItemRef('all')}
            type="button"
            onClick={() => setCategoryFilter('all')}
            aria-pressed={categoryFilter === 'all'}
            className={`relative z-10 px-3 py-1.5 text-xs font-mono-data rounded-full border transition-colors ${
              categoryFilter === 'all'
                ? 'text-celeste border-transparent'
                : 'text-muted border-border hover:text-paper'
            }`}
          >
            Todos
          </button>
          {visibleCategories.map(id => {
            const meta = CATEGORY_META[id]
            const active = categoryFilter === id
            return (
              <button
                key={id}
                ref={categoryIndicator.setItemRef(id)}
                type="button"
                onClick={() => setCategoryFilter(id)}
                aria-pressed={active}
                className={`relative z-10 px-3 py-1.5 text-xs font-mono-data rounded-full border transition-colors inline-flex items-center gap-1.5 ${
                  active ? 'border-transparent text-paper' : 'text-muted border-border hover:text-paper'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                {meta.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Lista unificada de holdings */}
      <div className="card overflow-hidden">
        {filteredAssets.map(asset => (
          <HoldingRow
            key={asset.id}
            asset={asset}
            currentPrice={getAssetPrice(asset)}
            conversionRate={multiCurrencyData.exchangeRate}
            categoryColor={CATEGORY_META[getCategory(asset)].color}
            onEdit={onEditAsset}
            onDelete={onDeleteAsset}
          />
        ))}
      </div>

      {categoryBreakdown.length > 1 && (
        <div className="card overflow-hidden">
          <PortfolioCategoryBreakdown
            categories={categoryBreakdown}
            totalCurrentARS={multiCurrencyData.totalsARS.current}
            exchangeRate={multiCurrencyData.exchangeRate}
          />
        </div>
      )}
    </div>
  )
}
