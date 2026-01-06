import { formatCurrency } from '../utils/formatters'
import { ASSET_TYPES } from '../config/constants'
import { computeAssetPL } from '../utils/assetCalculations'
import PlazoFijoCard from './PlazoFijoCard'
import EfectivoCard from './EfectivoCard'

export default function AssetCard({ asset, currentPrice, onEdit, onDelete, currency = 'ars', dolarPrice, dolarMepPrice, conversionRate, exchangeRateInfo }) {
  // Si es un plazo fijo, usar el componente específico
  if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
    return <PlazoFijoCard asset={asset} onEdit={onEdit} onDelete={onDelete} />
  }

  // Si es efectivo, usar el componente específico
  if (asset.type === ASSET_TYPES.EFECTIVO) {
    return <EfectivoCard asset={asset} onEdit={onEdit} onDelete={onDelete} />
  }

  const isCrypto = asset.type === ASSET_TYPES.CRYPTO
  const assetCurrency = asset.currency || (isCrypto ? 'USD' : 'ARS')
  const price = currentPrice || 0
  const totalValue = asset.amount * price
  const invested = asset.amount * asset.purchasePrice
  const pl = computeAssetPL(asset, price, conversionRate)
  const isProfitLocal = (totalValue - invested) >= 0
  
  // Calcular equivalente en ARS si el activo está en USD y tenemos cotización del dólar blue
  const showArsEquivalent = assetCurrency === 'USD' && (conversionRate || dolarPrice)
  const totalValueARS = showArsEquivalent ? totalValue * (conversionRate || dolarPrice) : null
  
  // Calcular equivalente en USD MEP si el activo está en ARS y tenemos cotización MEP
  const showUSDEquivalent = assetCurrency === 'ARS' && (conversionRate || dolarMepPrice)
  const totalValueUSD = showUSDEquivalent ? totalValue / (conversionRate || dolarMepPrice) : null

  const getAssetTypeLabel = (type) => {
    const labels = {
      [ASSET_TYPES.CRYPTO]: 'Cripto',
      [ASSET_TYPES.STOCK]: 'Acción',
      [ASSET_TYPES.CEDEAR]: 'CEDEAR',
      [ASSET_TYPES.BOND]: 'Bono',
      [ASSET_TYPES.LETRA]: 'Letra',
      [ASSET_TYPES.PLAZO_FIJO]: 'Plazo Fijo',
    }
    return labels[type] || type
  }

  const getAssetIcon = (type) => {
    if (type === ASSET_TYPES.CRYPTO) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }

  return (
    <div className="asset-card bg-gray-800 rounded-lg p-5 border border-gray-700 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isCrypto ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {getAssetTypeLabel(asset.type)}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              assetCurrency === 'USD' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {assetCurrency}
            </span>
          </div>
          <h3 className="text-white font-semibold text-lg">{asset.name}</h3>
          <p className="text-gray-400 text-sm uppercase">{asset.symbol}</p>
        </div>
        
        <div className="asset-card-actions flex gap-2">
          <button
            onClick={() => onEdit(asset)}
            className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(asset.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Precio Actual</span>
          <span className="text-white font-semibold">
            {price > 0 ? formatCurrency(price, assetCurrency) : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Cantidad</span>
          <span className="text-white font-semibold">
            {asset.amount.toLocaleString('es-AR', { maximumFractionDigits: 8 })}
          </span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-gray-400 text-sm">Valor Total</span>
          <div className="text-right">
            <div className="text-cyan-400 font-bold">
              {formatCurrency(totalValue, assetCurrency)}
            </div>
            {showArsEquivalent && (
              <div className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                <span className="text-gray-500">≈</span>
                <span>{formatCurrency(totalValueARS, 'ARS')}</span>
                {exchangeRateInfo?.name && (
                  <span className="text-gray-500 text-[10px]">{exchangeRateInfo.name}</span>
                )}
              </div>
            )}
            {showUSDEquivalent && (
              <div className="text-xs text-green-400 flex items-center gap-1 justify-end">
                <span className="text-gray-500">≈</span>
                <span>{formatCurrency(totalValueUSD, 'USD')}</span>
                {exchangeRateInfo?.name && (
                  <span className="text-gray-500 text-[10px]">{exchangeRateInfo.name}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ganancia/Pérdida compacta */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-700">
          <span className="text-gray-400 text-sm">Ganancia/Pérdida</span>
          <div className="text-right">
            <div className={`font-bold ${pl.plUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(pl.plUSD, 'USD')} / {formatCurrency(pl.plARS, 'ARS')}
            </div>
            <div className={`text-sm ${pl.plUSD >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {pl.plUSD >= 0 ? '+' : ''}{pl.plPctUSD.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
