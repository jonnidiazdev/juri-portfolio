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
    <div className={`flex flex-wrap items-center gap-2 sm:gap-3 text-sm ${className}`}>
      <span className="text-subtle whitespace-nowrap text-xs">Conversión:</span>

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
                px-2.5 py-1 rounded text-xs font-mono-data font-medium transition-all
                ${isSelected
                  ? 'bg-celeste text-ink'
                  : isAvailable
                    ? 'bg-surface-raised text-muted hover:text-paper border border-border'
                    : 'bg-ink text-subtle cursor-not-allowed border border-border opacity-50'
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
        <span className="text-celeste font-mono-data font-semibold whitespace-nowrap text-sm">
          ${currentRate.toFixed(2)}
        </span>
      )}
    </div>
  )
}
