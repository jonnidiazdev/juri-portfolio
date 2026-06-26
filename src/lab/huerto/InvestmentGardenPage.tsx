import { useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { usePortfolioOutletContext } from '../../hooks/usePortfolioOutletContext'
import { usePortfolioSnapshots } from '../../hooks/usePortfolioSnapshots'
import { formatCurrency, formatPercentage } from '../../utils/formatters'
import ThreeCanvas from '../shared/ThreeCanvas'
import { buildGardenMetaphor } from './portfolioMetaphor'
import GardenLegend from './GardenLegend'
import GardenTimeLapse from './GardenTimeLapse'

const SKY_MOOD_LABELS = {
  stormy: 'Tormenta',
  cloudy: 'Nublado',
  neutral: 'Neutral',
  sunny: 'Soleado',
  golden: 'Dorado',
} as const

export default function InvestmentGardenPage() {
  const {
    user,
    assets,
    multiCurrencyData,
    cryptoPrices,
    argQuotes,
    getAssetPrice,
    loadingCrypto,
    loadingDolar,
    loadingArgQuotes,
    onAddAsset,
  } = usePortfolioOutletContext()

  const { snapshots } = usePortfolioSnapshots(user.uid)
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [hoveredAssetId, setHoveredAssetId] = useState<number | null>(null)

  const quotesLoading = loadingCrypto || loadingDolar || loadingArgQuotes

  const garden = useMemo(
    () =>
      buildGardenMetaphor({
        assets,
        getAssetPrice,
        exchangeRate: multiCurrencyData.exchangeRate,
        cryptoPrices,
        argQuotes,
        portfolioProfitPercent: multiCurrencyData.totalsARS.profitPercent,
      }),
    [assets, getAssetPrice, multiCurrencyData.exchangeRate, multiCurrencyData.totalsARS.profitPercent, cryptoPrices, argQuotes]
  )

  const activeAssetId = hoveredAssetId ?? selectedAssetId
  const selectedPlant = garden.plants.find(p => p.assetId === activeAssetId) ?? null

  const handleHover = useCallback((id: number | null) => {
    setHoveredAssetId(id)
  }, [])

  const handleClick = useCallback((id: number | null) => {
    setSelectedAssetId(id)
  }, [])

  if (assets.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-paper mb-1">
            Huerto de inversiones
          </h2>
          <p className="text-muted text-sm">
            Tu cartera visualizada como un jardín 3D
          </p>
        </div>

        <div className="card p-8 text-center">
          <p className="text-muted mb-2">Tu huerto está vacío.</p>
          <p className="text-subtle text-sm mb-6">
            Agregá activos para ver cómo crecen las plantas de tu cartera.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-ghost px-4 py-2 inline-flex items-center justify-center">
              Ir a activos
            </Link>
            <button type="button" onClick={onAddAsset} className="btn-primary px-4 py-2">
              Agregar activo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-paper mb-1">
            Huerto de inversiones
          </h2>
          <p className="text-muted text-sm">
            Cuatro canteros por tipo de activo. Tamaño = valor, color = P/L.
          </p>
          <p className="text-subtle text-xs font-mono-data mt-2">
            Clima: {SKY_MOOD_LABELS[garden.skyMood]} ·{' '}
            {formatPercentage(multiCurrencyData.totalsARS.profitPercent)} total
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 relative">
          <ThreeCanvas
            plants={garden.plants}
            skyMood={garden.skyMood}
            highlightedAssetId={activeAssetId}
            onHover={handleHover}
            onClick={handleClick}
          />

          {quotesLoading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-ink/60 rounded-lg backdrop-blur-sm"
              role="status"
              aria-live="polite"
            >
              <div className="card px-4 py-3 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-celeste border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span className="text-sm text-muted">Actualizando cotizaciones…</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {selectedPlant && (
            <div className="card p-4 border-celeste/30">
              <h3 className="font-display text-lg font-semibold text-paper mb-2">
                {selectedPlant.assetName}
              </h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-subtle">Valor</dt>
                <dd className="text-paper font-mono-data">{formatCurrency(selectedPlant.currentValueARS, 'ARS')}</dd>
                <dt className="text-subtle">P/L</dt>
                <dd className={`font-mono-data ${selectedPlant.plPctARS >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatPercentage(selectedPlant.plPctARS)}
                </dd>
                <dt className="text-subtle">Salud</dt>
                <dd className="text-paper">{Math.round(selectedPlant.health * 100)}%</dd>
                <dt className="text-subtle">Viento</dt>
                <dd className="text-paper">{Math.round(selectedPlant.wind * 100)}%</dd>
              </dl>
            </div>
          )}

          <GardenLegend
            plants={garden.plants}
            selectedAssetId={selectedAssetId}
            hoveredAssetId={hoveredAssetId}
            onSelect={setSelectedAssetId}
            onHover={setHoveredAssetId}
          />
        </div>
      </div>

      <GardenTimeLapse snapshots={snapshots} />
    </div>
  )
}
