import { 
  calculateEfectivo, 
  formatEfectivoInfo, 
  getEfectivoIcon, 
  getEfectivoColor 
} from '../utils/efectivoCalculations'

export default function EfectivoCard({ asset, onEdit, onRemove }) {
  const efectivoData = calculateEfectivo(
    asset.amount,
    asset.tipoEfectivo,
    asset.currency,
    asset.banco,
    asset.descripcion
  )
  
  const formattedInfo = formatEfectivoInfo(efectivoData)
  const icon = getEfectivoIcon(asset.tipoEfectivo)
  const colorClass = getEfectivoColor(asset.tipoEfectivo)

  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-${colorClass}-500/20 hover:border-${colorClass}-500/40 transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`text-2xl bg-${colorClass}-500/10 rounded-lg p-2`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
            <p className="text-gray-400 text-sm">{formattedInfo.subtitulo}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(asset)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(asset.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Monto principal */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Monto Disponible</span>
            <span className={`text-xl font-bold text-${colorClass}-400`}>
              {formattedInfo.montoFormateado}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">Disponibilidad</p>
            <p className={`font-semibold text-${colorClass}-400`}>{formattedInfo.disponibilidad}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Liquidez</p>
            <p className={`font-semibold text-${colorClass}-400`}>{formattedInfo.liquidez}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Riesgo</p>
            <p className={`font-semibold text-${colorClass}-400`}>{formattedInfo.riesgo}</p>
          </div>
        </div>

        {/* Descripción si existe */}
        {asset.descripcion && (
          <div className="bg-gray-900/30 rounded-lg p-3">
            <p className="text-gray-300 text-sm">{asset.descripcion}</p>
          </div>
        )}

        {/* Información del tipo */}
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Tipo</span>
            <span className="text-gray-300">{formattedInfo.titulo}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-400">Identificador</span>
            <span className="text-gray-300 font-mono">{asset.symbol}</span>
          </div>
          {asset.banco && asset.banco !== 'Sin banco' && (
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-400">Entidad</span>
              <span className="text-gray-300">{asset.banco}</span>
            </div>
          )}
        </div>

        {/* Indicadores visuales */}
        <div className="flex space-x-2">
          <div className={`flex-1 bg-${colorClass}-500/10 rounded-lg p-2 text-center`}>
            <div className={`text-${colorClass}-400 text-xs font-semibold`}>LÍQUIDO</div>
          </div>
          <div className="flex-1 bg-green-500/10 rounded-lg p-2 text-center">
            <div className="text-green-400 text-xs font-semibold">SIN RIESGO</div>
          </div>
        </div>
      </div>
    </div>
  )
}