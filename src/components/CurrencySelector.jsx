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
      <div className="flex items-center gap-2">
        <span className="text-gray-400 whitespace-nowrap">Cotización de conversión:</span>
        <div className="relative group">
          <div 
            className="w-4 h-4 rounded-full flex items-center justify-center cursor-help hover:bg-gray-700 transition-colors border border-gray-400"
            title="La cotización seleccionada se usa para convertir entre ARS y USD en los totales del portfolio"
          >
            <span className="text-xs font-bold text-gray-300 hover:text-white">?</span>
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 border border-gray-700">
            La cotización seleccionada se usa para convertir entre ARS y USD en los totales del portfolio
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
      
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