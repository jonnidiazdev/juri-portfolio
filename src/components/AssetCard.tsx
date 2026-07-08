import { getTimeAgo } from '../utils/formatters'
import { usePortfolioFormatters } from '../hooks/usePortfolioFormatters'
import { ASSET_TYPES } from '../config/constants'
import { computeAssetPL } from '../utils/assetCalculations'
import type { Asset } from '../types'
import PlazoFijoCard from './PlazoFijoCard'
import EfectivoCard from './EfectivoCard'

interface AssetCardProps {
  asset: Asset
  currentPrice: number
  onEdit: (asset: Asset) => void
  onDelete: (id: number) => void
  dolarPrice?: number | null
  dolarMepPrice?: number | null
  conversionRate?: number | null
  exchangeRateInfo?: { name: string; id: string; buy: number; sell: number } | null
  fetchedAt?: string | null
}

export default function AssetCard({ asset, currentPrice, onEdit, onDelete, dolarPrice, dolarMepPrice, conversionRate, exchangeRateInfo, fetchedAt }: AssetCardProps) {
  const { formatCurrency, formatPercentage, formatQuantity } = usePortfolioFormatters()

  if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
    return <PlazoFijoCard asset={asset} onEdit={onEdit} onDelete={onDelete} />
  }

  if (asset.type === ASSET_TYPES.EFECTIVO) {
    return <EfectivoCard asset={asset} onEdit={onEdit} onDelete={onDelete} />
  }

  const isCrypto = asset.type === ASSET_TYPES.CRYPTO
  const assetCurrency = asset.currency || (isCrypto ? 'USD' : 'ARS')
  const price = currentPrice || 0
  const totalValue = asset.amount * price
  const pl = computeAssetPL(asset, price, conversionRate)

  const showArsEquivalent = assetCurrency === 'USD' && (conversionRate || dolarPrice)
  const totalValueARS = showArsEquivalent ? totalValue * (conversionRate || dolarPrice || 0) : null

  const showUSDEquivalent = assetCurrency === 'ARS' && (conversionRate || dolarMepPrice)
  const totalValueUSD = showUSDEquivalent ? totalValue / (conversionRate || dolarMepPrice || 1) : null

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [ASSET_TYPES.CRYPTO]: 'Cripto',
      [ASSET_TYPES.STOCK]: 'Acción',
      [ASSET_TYPES.CEDEAR]: 'CEDEAR',
      [ASSET_TYPES.BOND]: 'Bono',
      [ASSET_TYPES.LETRA]: 'Letra',
      [ASSET_TYPES.PLAZO_FIJO]: 'Plazo Fijo',
    }
    return labels[type] || type
  }

  return (
    <div className="asset-card card p-5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data uppercase tracking-wide ${
              isCrypto ? 'bg-violet-500/15 text-violet-400' : 'bg-celeste/15 text-celeste'
            }`}>
              {getAssetTypeLabel(asset.type)}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono-data uppercase tracking-wide ${
              assetCurrency === 'USD' ? 'bg-peso/15 text-peso' : 'bg-amber-500/15 text-amber-400'
            }`}>
              {assetCurrency}
            </span>
          </div>
          <h3 className="text-paper font-semibold text-lg truncate">{asset.name}</h3>
          <p className="text-muted text-sm font-mono-data uppercase">{asset.symbol}</p>
        </div>

        <div className="asset-card-actions flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(asset)}
            className="p-2 text-subtle hover:text-celeste hover:bg-celeste/10 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(asset.id)}
            className="p-2 text-subtle hover:text-loss hover:bg-loss/10 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-subtle text-sm">Precio actual</span>
          <span className="text-paper font-mono-data font-medium">
            {price > 0 ? formatCurrency(price, assetCurrency) : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-subtle text-sm">Cantidad</span>
          <span className="text-paper font-mono-data font-medium">
            {formatQuantity(asset.amount)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-border">
          <span className="text-subtle text-sm">Valor total</span>
          <div className="text-right">
            <div className="text-celeste font-mono-data font-bold">
              {formatCurrency(totalValue, assetCurrency)}
            </div>
            {showArsEquivalent && (
              <div className="text-xs text-muted flex items-center gap-1 justify-end font-mono-data">
                <span className="text-subtle">≈</span>
                <span>{formatCurrency(totalValueARS ?? 0, 'ARS')}</span>
                {exchangeRateInfo?.name && (
                  <span className="text-subtle text-[10px]">{exchangeRateInfo.name}</span>
                )}
              </div>
            )}
            {showUSDEquivalent && (
              <div className="text-xs text-peso flex items-center gap-1 justify-end font-mono-data">
                <span className="text-subtle">≈</span>
                <span>{formatCurrency(totalValueUSD ?? 0, 'USD')}</span>
                {exchangeRateInfo?.name && (
                  <span className="text-subtle text-[10px]">{exchangeRateInfo.name}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-border">
          <span className="text-subtle text-sm">Resultado</span>
          <div className="text-right">
            <div className={`font-mono-data font-bold ${pl.plUSD >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(pl.plUSD, 'USD')} / {formatCurrency(pl.plARS, 'ARS')}
            </div>
            <div className={`text-sm font-mono-data ${pl.plUSD >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPercentage(pl.plPctUSD)}
            </div>
          </div>
        </div>

        {fetchedAt && (
          <div className="pt-2 border-t border-border">
            <p className="text-[10px] text-subtle text-center font-mono-data">Actualizado {getTimeAgo(fetchedAt)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
