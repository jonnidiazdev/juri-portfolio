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
  
  const colorMap: Record<string, { border: string; bg: string; text: string }> = {
    'green': { border: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80' },
    'blue': { border: '#6badc9', bg: 'rgba(107, 173, 201, 0.1)', text: '#6badc9' },
    'indigo': { border: '#818cf8', bg: 'rgba(129, 140, 248, 0.1)', text: '#818cf8' },
    'purple': { border: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', text: '#c084fc' },
    'yellow': { border: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', text: '#facc15' },
    'gray': { border: '#8b9aab', bg: 'rgba(139, 154, 171, 0.1)', text: '#8b9aab' }
  }
  
  const colors = colorMap[colorClass] || colorMap['gray']

  return (
    <div 
      className="asset-card card p-5 transition-all duration-300"
      style={{ borderColor: `${colors.border}33` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="text-2xl rounded-lg p-2 shrink-0"
            style={{ backgroundColor: colors.bg }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-paper truncate">{asset.name}</h3>
            <p className="text-muted text-sm">{formattedInfo.subtitulo}</p>
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
        <div className="card-raised p-4">
          <div className="flex justify-between items-center">
            <span className="text-subtle text-sm">Disponible</span>
            <span
              className="text-xl font-mono-data font-bold"
              style={{ color: colors.text }}
            >
              {formattedInfo.montoFormateado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <p className="text-subtle text-xs mb-1">Disponibilidad</p>
            <p className="font-medium text-xs" style={{ color: colors.text }}>{formattedInfo.disponibilidad}</p>
          </div>
          <div className="text-center">
            <p className="text-subtle text-xs mb-1">Liquidez</p>
            <p className="font-medium text-xs" style={{ color: colors.text }}>{formattedInfo.liquidez}</p>
          </div>
          <div className="text-center">
            <p className="text-subtle text-xs mb-1">Riesgo</p>
            <p className="font-medium text-xs" style={{ color: colors.text }}>{formattedInfo.riesgo}</p>
          </div>
        </div>

        {asset.descripcion && (
          <div className="card-raised p-3">
            <p className="text-muted text-sm">{asset.descripcion}</p>
          </div>
        )}

        <div className="border-t border-border pt-3 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="text-subtle">Tipo</span>
            <span className="text-muted">{formattedInfo.titulo}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-subtle">ID</span>
            <span className="text-muted font-mono-data text-xs">{asset.symbol}</span>
          </div>
          {asset.banco && asset.banco !== 'Sin banco' && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-subtle">Entidad</span>
              <span className="text-muted">{asset.banco}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
