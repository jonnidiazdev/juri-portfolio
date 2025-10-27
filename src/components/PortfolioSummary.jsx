import { formatCurrency, formatPercentage } from '../utils/formatters'

export default function PortfolioSummary({ totalValue, change24h, currency = 'usd' }) {
  const isPositive = change24h >= 0

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-xl">
      <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-2">
        Valor Total del Portfolio
      </h2>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold text-white mb-2">
            {formatCurrency(totalValue, currency.toUpperCase())}
          </p>
          
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(change24h)}
            </span>
            <span className="text-gray-500 text-sm">últimas 24h</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          {isPositive ? (
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
