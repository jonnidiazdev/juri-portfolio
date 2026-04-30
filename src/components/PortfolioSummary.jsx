import { formatCurrency, formatPercentage } from '../utils/formatters'

export default function PortfolioSummary({ totalValue, change24h, currency = 'usd' }) {
  const isPositive = change24h >= 0

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <h2 className="text-slate-400 text-sm uppercase tracking-wide mb-2">
        Valor Total del Portfolio
      </h2>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold text-slate-800 mb-2">
            {formatCurrency(totalValue, currency.toUpperCase())}
          </p>
          
          <div className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatPercentage(change24h)}
            </span>
            <span className="text-slate-400 text-sm">últimas 24h</span>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          {isPositive ? (
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
