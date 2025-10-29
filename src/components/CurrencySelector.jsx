import { useLocalStorageState } from '../hooks/useLocalStorageState'

const CURRENCY_OPTIONS = [
  { 
    id: 'blue', 
    name: 'Blue', 
    icon: '💸',
    apiKey: 'blue'
  },
  { 
    id: 'bolsa', 
    name: 'MEP', 
    icon: '💱',
    apiKey: 'bolsa'
  },
  { 
    id: 'contadoconliqui', 
    name: 'CCL', 
    icon: '🏦',
    apiKey: 'contadoconliqui'
  },
  { 
    id: 'oficial', 
    name: 'Oficial', 
    icon: '🏛️',
    apiKey: 'oficial'
  }
]

export default function CurrencySelector({ dolarData, className = '' }) {
  const [selectedCurrency, setSelectedCurrency] = useLocalStorageState('portfolio-currency-preference', 'blue')

  const handleCurrencyChange = (currencyId) => {
    setSelectedCurrency(currencyId)
    // Trigger custom event for other components to react
    window.dispatchEvent(new CustomEvent('currencyPreferenceChanged', { 
      detail: { currency: currencyId } 
    }))
  }

  const selectedOption = CURRENCY_OPTIONS.find(opt => opt.id === selectedCurrency)
  const currentRate = dolarData?.[selectedOption?.apiKey]?.venta

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      <span className="text-gray-400 whitespace-nowrap">Cotización:</span>
      
      <div className="flex items-center gap-1">
        {CURRENCY_OPTIONS.map((option) => {
          const rate = dolarData?.[option.apiKey]
          const isSelected = selectedCurrency === option.id
          const isAvailable = rate && rate.venta

          return (
            <button
              key={option.id}
              onClick={() => handleCurrencyChange(option.id)}
              disabled={!isAvailable}
              className={`
                px-3 py-1 rounded-lg text-xs font-medium transition-all
                ${isSelected 
                  ? 'bg-cyan-500 text-white shadow-lg' 
                  : isAvailable 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
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
        <span className="text-cyan-400 font-semibold whitespace-nowrap">
          ${currentRate.toFixed(2)}
        </span>
      )}
    </div>
  )
}

// Hook para usar la cotización seleccionada en otros componentes
export function useCurrencyPreference() {
  const [selectedCurrency] = useLocalStorageState('portfolio-currency-preference', 'blue')
  return selectedCurrency
}

// Función helper para obtener la cotización seleccionada
export function getSelectedCurrencyRate(dolarData, preference = 'blue') {
  const option = CURRENCY_OPTIONS.find(opt => opt.id === preference)
  if (!option || !dolarData?.[option.apiKey]) return null
  
  return {
    buy: dolarData[option.apiKey].compra,
    sell: dolarData[option.apiKey].venta,
    name: option.name,
    id: option.id
  }
}