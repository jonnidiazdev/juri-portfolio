import { formatCurrency, formatPercentage } from '../utils/formatters'

export default function MultiCurrencySummary({ 
  totalsARS, 
  totalsUSD, 
  exchangeRateInfo,
  className = '' 
}) {
  const isPositiveARS = totalsARS.profit >= 0
  const isPositiveUSD = totalsUSD.profit >= 0

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Totales en ARS */}
      <div className="bg-gradient-to-br from-green-800/20 to-green-900/20 rounded-xl p-6 border border-green-700/30 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Portfolio en Pesos</h3>
            <p className="text-green-400 text-sm">Todos los valores convertidos a ARS</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-green-300 text-sm uppercase tracking-wide mb-1">
              Valor Total
            </p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(totalsARS.current, 'ARS')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm">Invertido</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(totalsARS.invested, 'ARS')}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-green-300 text-sm">Ganancia/Pérdida</p>
              <div className={`text-xl font-semibold ${isPositiveARS ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalsARS.profit, 'ARS')}
              </div>
              <div className={`text-sm ${isPositiveARS ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(totalsARS.profitPercent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totales en USD */}
      <div className="bg-gradient-to-br from-blue-800/20 to-blue-900/20 rounded-xl p-6 border border-blue-700/30 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Portfolio en Dólares</h3>
            <p className="text-blue-400 text-sm">Todos los valores convertidos a USD</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-blue-300 text-sm uppercase tracking-wide mb-1">
              Valor Total
            </p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(totalsUSD.current, 'USD')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm">Invertido</p>
              <p className="text-xl font-semibold text-white">
                {formatCurrency(totalsUSD.invested, 'USD')}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-blue-300 text-sm">Ganancia/Pérdida</p>
              <div className={`text-xl font-semibold ${isPositiveUSD ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalsUSD.profit, 'USD')}
              </div>
              <div className={`text-sm ${isPositiveUSD ? 'text-green-400' : 'text-red-400'}`}>
                {formatPercentage(totalsUSD.profitPercent)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}