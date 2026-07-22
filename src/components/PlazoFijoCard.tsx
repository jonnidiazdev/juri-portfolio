import { usePortfolioFormatters } from '../hooks/usePortfolioFormatters'
import { calculatePlazoFijo, formatPlazoFijoInfo } from '../utils/plazoFijoCalculations'

export default function PlazoFijoCard({ asset, onEdit, onDelete }) {
  const { formatCurrency } = usePortfolioFormatters()
  const plazoFijoData = calculatePlazoFijo(
    asset.amount,
    asset.tna,
    asset.startDate,
    asset.endDate
  )

  const formatInfo = formatPlazoFijoInfo(plazoFijoData)
  const assetCurrency = asset.currency || 'ARS'

  return (
    <div className="asset-card card p-5 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h3 className="text-lg font-semibold text-paper truncate">{asset.name}</h3>
            <span className="px-2 py-0.5 bg-peso/15 text-peso text-[10px] font-mono-data uppercase tracking-wide rounded">
              Plazo fijo
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-mono-data uppercase tracking-wide rounded ${
              assetCurrency === 'USD'
                ? 'bg-peso/15 text-peso'
                : 'bg-celeste/15 text-celeste'
            }`}>
              {assetCurrency}
            </span>
          </div>

          <div className="text-sm text-muted space-y-0.5">
            <p>{asset.bank}</p>
            <p className="font-mono-data text-subtle">{asset.symbol}</p>
          </div>
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

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="card-raised p-3">
            <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Capital</p>
            <p className="text-paper font-mono-data font-semibold">
              {formatCurrency(plazoFijoData.capital, assetCurrency)}
            </p>
          </div>
          <div className="card-raised p-3">
            <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Valor actual</p>
            <p className="text-profit font-mono-data font-semibold">
              {formatCurrency(plazoFijoData.currentValue, assetCurrency)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card-raised p-3">
            <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">TNA</p>
            <p className="text-celeste font-mono-data font-semibold">{asset.tna}%</p>
          </div>
          <div className="card-raised p-3">
            <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Duración</p>
            <p className="text-paper font-mono-data font-semibold">{formatInfo.durationText}</p>
          </div>
        </div>

        <div className="card-raised p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide">Progreso</p>
            <span className={`text-xs font-mono-data font-semibold ${formatInfo.statusColor}`}>
              {formatInfo.statusText}
            </span>
          </div>

          <div className="w-full bg-ink rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${formatInfo.progressBarColor}`}
              style={{ width: `${formatInfo.progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-subtle font-mono-data">
            <span>{formatInfo.progressText}</span>
            <span>{formatInfo.remainingText}</span>
          </div>
        </div>

        <div className="card-raised p-3 border-peso/20">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Devengado</p>
              <p className="text-profit font-mono-data font-semibold">
                {formatCurrency(plazoFijoData.earnedInterest, assetCurrency)}
              </p>
            </div>
            <div>
              <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Total interés</p>
              <p className="text-profit font-mono-data font-semibold">
                {formatCurrency(plazoFijoData.totalInterest, assetCurrency)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono-data">
          <div>
            <span className="text-subtle">Inicio </span>
            <span className="text-muted">
              {new Date(asset.startDate).toLocaleDateString('es-AR')}
            </span>
          </div>
          <div>
            <span className="text-subtle">Vence </span>
            <span className="text-muted">
              {new Date(asset.endDate).toLocaleDateString('es-AR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
