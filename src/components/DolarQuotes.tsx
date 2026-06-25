import { useState } from 'react'
import { DOLAR_TYPES, DOLAR_DESCRIPTIONS } from '../config/constants'
import { getTimeAgo } from '../utils/formatters'

interface DolarQuotesProps {
  dolares: Record<string, { compra?: number; venta?: number; nombre?: string; casa?: string }> | null | undefined
  isLoading: boolean
  fetchedAt?: string | null
}

export default function DolarQuotes({ dolares, isLoading, fetchedAt }: DolarQuotesProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400">Cargando cotizaciones...</span>
      </div>
    )
  }

  if (!dolares) return null

  // Cotizaciones más relevantes para mostrar en línea
  const mainQuotes = [
    { key: 'blue', icon: '💵', color: 'text-sky-500' },
    { key: 'oficial', icon: '🏦', color: 'text-emerald-500' },
    { key: 'cripto', icon: '₿', color: 'text-amber-500' },
    { key: 'bolsa', icon: '📈', color: 'text-violet-500' },
    { key: 'contadoconliqui', icon: '💱', color: 'text-indigo-500' }
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

  const timeAgo = fetchedAt ? getTimeAgo(fetchedAt) : ''

  return (
    <div className="space-y-2">
      {/* Línea compacta principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg px-3 sm:px-4 py-2 border border-slate-200 gap-2 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {mainQuotes.map(({ key, icon, color }) => {
            const dolar = dolares[key]
            if (!dolar || !dolar.venta) return null
            
            return (
              <div key={key} className="flex items-center gap-1">
                <span className="text-sm">{icon}</span>
                <span className="text-xs text-slate-400">{getShortName(key)}:</span>
                <span className={`text-sm font-semibold ${color}`}>
                  ${dolar.venta.toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>
        
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {timeAgo && (
            <span className="text-xs text-slate-400 hidden sm:inline">
              Actualizado {timeAgo}
            </span>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1"
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
        <div className="bg-white rounded-lg p-4 border border-slate-200 animate-fadeIn shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(dolares).map(([key, dolar]) => {
              if (!dolar || typeof dolar !== 'object') return null
              
              const quote = mainQuotes.find(q => q.key === key) || { 
                icon: '💲', 
                color: 'text-slate-400' 
              }
              
              return (
                <div key={key} className="bg-slate-50 rounded-lg p-3">
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
                      <span className="text-slate-400">Compra:</span>
                      <div className="font-semibold text-slate-700">
                        ${dolar.compra?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Venta:</span>
                      <div className="font-semibold text-slate-700">
                        ${dolar.venta?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Leyenda compacta */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="font-semibold text-sky-500">Blue:</span> Informal • 
              <span className="font-semibold text-emerald-500"> Oficial:</span> Banco Central • 
              <span className="font-semibold text-amber-500"> Cripto:</span> Exchanges • 
              <span className="font-semibold text-violet-500"> MEP:</span> Legal • 
              <span className="font-semibold text-indigo-500"> CCL:</span> Exterior
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
