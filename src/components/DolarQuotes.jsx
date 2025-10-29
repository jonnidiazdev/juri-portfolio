import { useState } from 'react'
import { DOLAR_TYPES, DOLAR_DESCRIPTIONS } from '../config/constants'
import { formatCurrency } from '../utils/formatters'

export default function DolarQuotes({ dolares, isLoading }) {
  const [showDetails, setShowDetails] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-3 h-3 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-400">Cargando cotizaciones...</span>
      </div>
    )
  }

  if (!dolares) return null

  // Cotizaciones más relevantes para mostrar en línea
  const mainQuotes = [
    { key: 'blue', icon: '💵', color: 'text-blue-400' },
    { key: 'oficial', icon: '🏦', color: 'text-green-400' },
    { key: 'cripto', icon: '₿', color: 'text-orange-400' },
    { key: 'bolsa', icon: '📈', color: 'text-purple-400' },
    { key: 'contadoconliqui', icon: '💱', color: 'text-cyan-400' }
  ]

  // Compactar nombre de cotización
  const getShortName = (key) => {
    const names = {
      blue: 'Blue',
      oficial: 'Oficial',
      cripto: 'Cripto',
      bolsa: 'MEP',
      contadoconliqui: 'CCL',
      mayorista: 'Mayorista',
      tarjeta: 'Tarjeta'
    }
    return names[key] || key
  }

  const lastUpdate = dolares.blue?.fechaActualizacion || dolares.oficial?.fechaActualizacion
  const timeAgo = lastUpdate ? new Date(lastUpdate).toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : ''

  return (
    <div className="space-y-2">
      {/* Línea compacta principal */}
      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700/50">
        <div className="flex items-center gap-4 flex-wrap">
          {mainQuotes.map(({ key, icon, color }) => {
            const dolar = dolares[key]
            if (!dolar || !dolar.venta) return null
            
            return (
              <div key={key} className="flex items-center gap-1">
                <span className="text-sm">{icon}</span>
                <span className="text-xs text-gray-400">{getShortName(key)}:</span>
                <span className={`text-sm font-semibold ${color}`}>
                  ${dolar.venta.toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center gap-3">
          {timeAgo && (
            <span className="text-xs text-gray-500">
              {timeAgo}
            </span>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            {showDetails ? 'Ocultar' : 'Detalles'}
            <svg 
              className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel expandible con detalles */}
      {showDetails && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(dolares).map(([key, dolar]) => {
              if (!dolar || typeof dolar !== 'object') return null
              
              const quote = mainQuotes.find(q => q.key === key) || { 
                icon: '💲', 
                color: 'text-gray-400' 
              }
              
              return (
                <div key={key} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{quote.icon}</span>
                    <div>
                      <h4 className={`text-sm font-semibold ${quote.color}`}>
                        {DOLAR_DESCRIPTIONS[key] || getShortName(key)}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Compra:</span>
                      <div className="font-semibold">
                        ${dolar.compra?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Venta:</span>
                      <div className="font-semibold">
                        ${dolar.venta?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Leyenda compacta */}
          <div className="mt-4 pt-3 border-t border-gray-700/50">
            <div className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-blue-400">Blue:</span> Informal • 
              <span className="font-semibold text-green-400"> Oficial:</span> Banco Central • 
              <span className="font-semibold text-orange-400"> Cripto:</span> Exchanges • 
              <span className="font-semibold text-purple-400"> MEP:</span> Legal • 
              <span className="font-semibold text-cyan-400"> CCL:</span> Exterior
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
