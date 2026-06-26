import { useState } from 'react'
import { DOLAR_DESCRIPTIONS } from '../config/constants'
import { getTimeAgo } from '../utils/formatters'

import type { DolarPrices } from '../types'

interface DolarQuotesProps {
  dolares: DolarPrices | null | undefined
  isLoading: boolean
  fetchedAt?: string | null
}

const MAIN_QUOTES = [
  { key: 'blue', label: 'Blue', color: 'text-celeste' },
  { key: 'oficial', label: 'Oficial', color: 'text-peso' },
  { key: 'cripto', label: 'Cripto', color: 'text-amber-400' },
  { key: 'bolsa', label: 'MEP', color: 'text-violet-400' },
  { key: 'contadoconliqui', label: 'CCL', color: 'text-sky-300' },
] as const

export default function DolarQuotes({ dolares, isLoading, fetchedAt }: DolarQuotesProps) {
  const [showDetails, setShowDetails] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="w-3 h-3 border-2 border-celeste border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-muted">Cargando cotizaciones…</span>
      </div>
    )
  }

  if (!dolares) return null

  const getShortName = (key: string) => {
    const names: Record<string, string> = {
      blue: 'Blue',
      oficial: 'Oficial',
      cripto: 'Cripto',
      bolsa: 'MEP',
      contadoconliqui: 'CCL',
      mayorista: 'Mayorista',
      tarjeta: 'Tarjeta',
    }
    return names[key] || key
  }

  const timeAgo = fetchedAt ? getTimeAgo(fetchedAt) : ''

  const tickerItems = MAIN_QUOTES.flatMap(({ key, label, color }) => {
    const dolar = dolares[key]
    if (!dolar?.venta) return []
    return [{ key, label, color, venta: dolar.venta }]
  })

  return (
    <div className="space-y-2">
      {/* Ticker tape */}
      <div className="card overflow-hidden">
        <div className="flex items-stretch">
          <div className="shrink-0 bg-celeste/10 border-r border-border px-3 py-2 flex items-center">
            <span className="text-[10px] font-mono-data uppercase tracking-widest text-celeste">USD</span>
          </div>
          <div className="flex-1 overflow-hidden py-2">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...tickerItems, ...tickerItems].map(({ key, label, color, venta }, i) => (
                <span key={`${key}-${i}`} className="inline-flex items-center gap-1.5 px-4 text-sm">
                  <span className="text-subtle text-xs">{label}</span>
                  <span className={`font-mono-data font-semibold ${color}`}>
                    ${venta.toFixed(0)}
                  </span>
                  <span className="text-border-light mx-1">·</span>
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 border-l border-border px-3 py-2 flex items-center gap-2">
            {timeAgo && (
              <span className="text-[10px] text-subtle hidden sm:inline font-mono-data">
                {timeAgo}
              </span>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted hover:text-celeste transition-colors flex items-center gap-1"
            >
              {showDetails ? 'Ocultar' : 'Detalle'}
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
      </div>

      {showDetails && (
        <div className="card p-4 animate-fadeIn">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(dolares).map(([key, dolar]) => {
              if (!dolar || typeof dolar !== 'object') return null

              const quote = MAIN_QUOTES.find(q => q.key === key)
              const color = quote?.color || 'text-muted'

              return (
                <div key={key} className="card-raised p-3">
                  <h4 className={`text-sm font-semibold mb-2 ${color}`}>
                    {DOLAR_DESCRIPTIONS[key] || getShortName(key)}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-subtle">Compra</span>
                      <div className="font-mono-data font-semibold text-paper">
                        ${dolar.compra?.toFixed(2) || '—'}
                      </div>
                    </div>
                    <div>
                      <span className="text-subtle">Venta</span>
                      <div className="font-mono-data font-semibold text-paper">
                        ${dolar.venta?.toFixed(2) || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
