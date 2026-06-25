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
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 ${className}`}>
      {/* Totales en ARS */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">Portfolio en Pesos</h3>
            <p className="text-emerald-500 text-xs">Valores convertidos a ARS</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              Valor Total
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatCurrency(totalsARS.current, 'ARS')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Invertido</p>
              <p className="text-base sm:text-xl font-semibold text-slate-700">
                {formatCurrency(totalsARS.invested, 'ARS')}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-slate-400 text-xs">Ganancia/Pérdida</p>
              <div className={`text-base sm:text-xl font-semibold ${isPositiveARS ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(totalsARS.profit, 'ARS')}
              </div>
              <div className={`text-sm ${isPositiveARS ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatPercentage(totalsARS.profitPercent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totales en USD */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-sky-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-sky-50 rounded-lg">
            <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-700">Portfolio en Dólares</h3>
            <p className="text-sky-500 text-xs">Valores convertidos a USD</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">
              Valor Total
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              {formatCurrency(totalsUSD.current, 'USD')}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Invertido</p>
              <p className="text-base sm:text-xl font-semibold text-slate-700">
                {formatCurrency(totalsUSD.invested, 'USD')}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-slate-400 text-xs">Ganancia/Pérdida</p>
              <div className={`text-base sm:text-xl font-semibold ${isPositiveUSD ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatCurrency(totalsUSD.profit, 'USD')}
              </div>
              <div className={`text-sm ${isPositiveUSD ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatPercentage(totalsUSD.profitPercent)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}