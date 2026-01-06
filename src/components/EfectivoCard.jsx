import { 
  calculateEfectivo, 
  formatEfectivoInfo, 
  getEfectivoIcon, 
  getEfectivoColor 
} from '../utils/efectivoCalculations'

export default function EfectivoCard({ asset, onEdit, onDelete }) {
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
  
  // Mapear colores a valores CSS reales
  const colorMap = {
    'green': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '#34d399' },
    'blue': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' },
    'indigo': { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', text: '#818cf8' },
    'purple': { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc' },
    'yellow': { border: '#eab308', bg: 'rgba(234, 179, 8, 0.1)', text: '#facc15' },
    'gray': { border: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', text: '#9ca3af' }
  }
  
  const colors = colorMap[colorClass] || colorMap['gray']

  return (
    <div 
      className="asset-card bg-gray-800 rounded-xl p-6 border transition-all duration-300 hover:shadow-lg"
      style={{ 
        borderColor: `${colors.border}33`,
        '--hover-border-color': `${colors.border}66`
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.border + '66'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = colors.border + '33'}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="text-2xl rounded-lg p-2"
            style={{ backgroundColor: colors.bg }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
            <p className="text-gray-400 text-sm">{formattedInfo.subtitulo}</p>
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

      <div className="space-y-4">
        {/* Monto principal */}
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Monto Disponible</span>
            <span 
              className="text-xl font-bold"
              style={{ color: colors.text }}
            >
              {formattedInfo.montoFormateado}
            </span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-400">Disponibilidad</p>
            <p className="font-semibold" style={{ color: colors.text }}>{formattedInfo.disponibilidad}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Liquidez</p>
            <p className="font-semibold" style={{ color: colors.text }}>{formattedInfo.liquidez}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400">Riesgo</p>
            <p className="font-semibold" style={{ color: colors.text }}>{formattedInfo.riesgo}</p>
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
          <div 
            className="flex-1 rounded-lg p-2 text-center"
            style={{ backgroundColor: colors.bg }}
          >
            <div className="text-xs font-semibold" style={{ color: colors.text }}>LÍQUIDO</div>
          </div>
          <div className="flex-1 bg-green-500/10 rounded-lg p-2 text-center">
            <div className="text-green-400 text-xs font-semibold">SIN RIESGO</div>
          </div>
        </div>

      </div>
    </div>
  )
}