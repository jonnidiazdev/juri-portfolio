import { formatCurrency, formatPercentage } from '../utils/formatters'

export default function CryptoCard({ coin, holdings = 0, currency = 'usd' }) {
  if (!coin) return null

  const price = coin.current_price || 0
  const change24h = coin.price_change_percentage_24h || 0
  const totalValue = holdings * price
  const isPositive = change24h >= 0

  return (
    <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-cyan-500 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {coin.image && (
            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
          )}
          <div>
            <h3 className="text-white font-semibold text-lg">{coin.name}</h3>
            <p className="text-gray-400 text-sm uppercase">{coin.symbol}</p>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded text-sm font-semibold ${
          isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {formatPercentage(change24h)}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Precio</span>
          <span className="text-white font-semibold">
            {formatCurrency(price, currency.toUpperCase())}
          </span>
        </div>

        {holdings > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Cantidad</span>
              <span className="text-white font-semibold">
                {holdings.toFixed(8)} {coin.symbol.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-400 text-sm">Valor Total</span>
              <span className="text-cyan-400 font-bold">
                {formatCurrency(totalValue, currency.toUpperCase())}
              </span>
            </div>
          </>
        )}
      </div>

      {coin.sparkline_in_7d && (
        <div className="mt-4">
          <MiniSparkline data={coin.sparkline_in_7d.price} isPositive={isPositive} />
        </div>
      )}
    </div>
  )
}

function MiniSparkline({ data, isPositive }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={isPositive ? '#34d399' : '#f87171'}
        strokeWidth="2"
        points={points}
      />
    </svg>
  )
}
