import { useState } from 'react'
import { DOLAR_TYPES, DOLAR_DESCRIPTIONS } from '../config/constants'
import { formatCurrency } from '../utils/formatters'

export default function DolarQuotes({ dolares, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Cargando cotizaciones...</span>
        </div>
      </div>
    )
  }

  if (!dolares) return null

  // Cotizaciones principales (siempre visibles)
  const mainQuotes = ['blue', 'oficial']
  
  // Otras cotizaciones (mostrar al expandir)
  const otherQuotes = Object.keys(DOLAR_TYPES).filter(
    key => !mainQuotes.includes(DOLAR_TYPES[key])
  ).map(key => DOLAR_TYPES[key])

  const getDolarColor = (tipo) => {
    const colors = {
      blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      oficial: 'text-green-400 border-green-500/30 bg-green-500/10',
      bolsa: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
      contadoconliqui: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      mayorista: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      cripto: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
      tarjeta: 'text-red-400 border-red-500/30 bg-red-500/10',
    }
    return colors[tipo] || 'text-gray-400 border-gray-500/30 bg-gray-500/10'
  }

  const getDolarIcon = (tipo) => {
    if (tipo === 'blue') return '💵'
    if (tipo === 'oficial') return '🏦'
    if (tipo === 'bolsa') return '📈'
    if (tipo === 'contadoconliqui') return '💱'
    if (tipo === 'mayorista') return '🏢'
    if (tipo === 'cripto') return '₿'
    if (tipo === 'tarjeta') return '💳'
    return '💲'
  }

  const renderDolarCard = (tipo) => {
    const dolar = dolares[tipo]
    if (!dolar) return null

    const variation = dolar.compra && dolar.venta 
      ? ((dolar.venta - dolar.compra) / dolar.compra * 100).toFixed(2)
      : null

    return (
      <div 
        key={tipo}
        className={`rounded-lg p-4 border ${getDolarColor(tipo)} transition-all duration-300 hover:scale-105`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getDolarIcon(tipo)}</span>
            <div>
              <h3 className="font-semibold text-sm">
                {DOLAR_DESCRIPTIONS[tipo] || tipo.toUpperCase()}
              </h3>
              <p className="text-xs text-gray-500">
                {new Date(dolar.fechaActualizacion).toLocaleDateString('es-AR', { 
                  day: '2-digit', 
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Compra</div>
            <div className="font-bold text-lg">
              ${dolar.compra?.toFixed(2) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Venta</div>
            <div className="font-bold text-lg">
              ${dolar.venta?.toFixed(2) || 'N/A'}
            </div>
          </div>
        </div>

        {variation && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <div className="text-xs text-gray-400">
              Spread: <span className="font-semibold">{variation}%</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cotizaciones principales */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        {mainQuotes.map(tipo => renderDolarCard(tipo))}
      </div>

      {/* Botón expandir/contraer */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isExpanded ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Ocultar otras cotizaciones
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Ver más cotizaciones ({otherQuotes.length})
          </>
        )}
      </button>

      {/* Otras cotizaciones (expandible) */}
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fadeIn">
          {otherQuotes.map(tipo => renderDolarCard(tipo))}
        </div>
      )}

      {/* Leyenda */}
      {isExpanded && (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">📚 Guía Rápida</h4>
          <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-400">
            <div><span className="font-semibold text-blue-400">Blue:</span> Mercado informal (efectivo)</div>
            <div><span className="font-semibold text-green-400">Oficial:</span> Banco Central (operaciones limitadas)</div>
            <div><span className="font-semibold text-purple-400">MEP:</span> Mercado Electrónico de Pagos (legal)</div>
            <div><span className="font-semibold text-cyan-400">CCL:</span> Para transferir USD al exterior</div>
            <div><span className="font-semibold text-yellow-400">Mayorista:</span> Grandes empresas e importadores</div>
            <div><span className="font-semibold text-orange-400">Cripto:</span> Cotización en exchanges de crypto</div>
            <div><span className="font-semibold text-red-400">Tarjeta:</span> Compras internacionales (oficial + 30%)</div>
          </div>
        </div>
      )}
    </div>
  )
}
