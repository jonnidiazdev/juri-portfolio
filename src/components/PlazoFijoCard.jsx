import { formatCurrency } from '../utils/formatters'
import { calculatePlazoFijo, formatPlazoFijoInfo } from '../utils/plazoFijoCalculations'

export default function PlazoFijoCard({ asset, onEdit, onDelete }) {
  // Calcular información del plazo fijo
  const plazoFijoData = calculatePlazoFijo(
    asset.amount, // capital
    asset.tna,    // tasa nominal anual
    asset.startDate,
    asset.endDate
  )

  const formatInfo = formatPlazoFijoInfo(plazoFijoData)
  const assetCurrency = asset.currency || 'ARS'

  return (
    <div className="asset-card bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-white">{asset.name}</h3>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
              Plazo Fijo
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              assetCurrency === 'USD' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {assetCurrency}
            </span>
          </div>
          
          <div className="text-sm text-gray-400 space-y-1">
            <p>{asset.bank}</p>
            <p className="font-mono">{asset.symbol}</p>
          </div>
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

      {/* Información del plazo fijo */}
      <div className="space-y-4">
        {/* Capital e intereses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Capital Inicial</p>
            <p className="text-white font-semibold">
              {formatCurrency(plazoFijoData.capital, assetCurrency)}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Valor Actual</p>
            <p className="text-green-400 font-semibold">
              {formatCurrency(plazoFijoData.currentValue, assetCurrency)}
            </p>
          </div>
        </div>

        {/* TNA y duración */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">TNA</p>
            <p className="text-cyan-400 font-semibold">{asset.tna}%</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Duración</p>
            <p className="text-white font-semibold">{formatInfo.durationText}</p>
          </div>
        </div>

        {/* Progreso del plazo */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-xs uppercase tracking-wide">Progreso</p>
            <span className={`text-xs font-semibold ${formatInfo.statusColor}`}>
              {formatInfo.statusText}
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${formatInfo.progressBarColor}`}
              style={{ width: `${formatInfo.progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatInfo.progressText}</span>
            <span>{formatInfo.remainingText}</span>
          </div>
        </div>

        {/* Rendimientos */}
        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-3 border border-green-500/20">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-green-300 text-xs uppercase tracking-wide mb-1">Interés Devengado</p>
              <p className="text-green-400 font-semibold">
                {formatCurrency(plazoFijoData.earnedInterest, assetCurrency)}
              </p>
            </div>
            <div>
              <p className="text-green-300 text-xs uppercase tracking-wide mb-1">Interés Total</p>
              <p className="text-green-400 font-semibold">
                {formatCurrency(plazoFijoData.totalInterest, assetCurrency)}
              </p>
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Inicio: </span>
            <span className="text-white">
              {new Date(asset.startDate).toLocaleDateString('es-AR')}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Vencimiento: </span>
            <span className="text-white">
              {new Date(asset.endDate).toLocaleDateString('es-AR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}