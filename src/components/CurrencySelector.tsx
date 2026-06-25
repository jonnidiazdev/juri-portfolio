import { CURRENCY_OPTIONS } from '../hooks/useCurrencyPreference'

import type { DolarPrices } from '../types'

interface CurrencySelectorProps {
  dolarData: DolarPrices | null | undefined
  currencyPreference: string
  onCurrencyChange: (currencyId: string) => void
  className?: string
}

export default function CurrencySelector({
  dolarData,
  currencyPreference,
  onCurrencyChange,
  className = '',
}: CurrencySelectorProps) {
  const selectedOption = CURRENCY_OPTIONS.find(opt => opt.id === currencyPreference)
  const currentRate = selectedOption ? dolarData?.[selectedOption.apiKey]?.venta : undefined

  return (
    <div className={`flex flex-wrap items-center gap-2 sm:gap-4 text-sm ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-slate-400 whitespace-nowrap text-xs sm:text-sm">Cotización:</span>
        <div className="relative group">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center cursor-help hover:bg-slate-100 transition-colors border border-slate-300"
            title="La cotización seleccionada se usa para convertir entre ARS y USD en los totales del portfolio"
          >
            <span className="text-xs font-bold text-slate-400 hover:text-slate-600">?</span>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            La cotización seleccionada se usa para convertir entre ARS y USD en los totales del portfolio
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {CURRENCY_OPTIONS.map((option) => {
          const rate = dolarData?.[option.apiKey]
          const isSelected = currencyPreference === option.id
          const isAvailable = rate && rate.venta

          return (
            <button
              key={option.id}
              onClick={() => onCurrencyChange(option.id)}
              disabled={!isAvailable}
              className={`
                px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${isSelected
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : isAvailable
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }
              `}
              title={isAvailable ? `$${rate.venta?.toFixed(2)}` : 'No disponible'}
            >
              {option.name}
            </button>
          )
        })}
      </div>

      {currentRate && (
        <span className="text-indigo-500 font-semibold whitespace-nowrap">
          ${currentRate.toFixed(2)}
        </span>
      )}
    </div>
  )
}
