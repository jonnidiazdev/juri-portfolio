import { formatCurrency, formatNumber } from '../utils/formatters'

export default function PortfolioStats({ coins, holdings, currency = 'usd' }) {
  if (!coins || coins.length === 0) return null

  const stats = coins.reduce((acc, coin) => {
    const holding = holdings.find(h => h.id === coin.id)
    if (!holding) return acc

    const currentValue = holding.amount * coin.current_price
    const investedValue = holding.amount * holding.purchasePrice
    const profit = currentValue - investedValue
    const profitPercent = ((currentValue - investedValue) / investedValue) * 100

    return {
      totalInvested: acc.totalInvested + investedValue,
      totalCurrent: acc.totalCurrent + currentValue,
      totalProfit: acc.totalProfit + profit,
      assets: acc.assets + 1,
    }
  }, {
    totalInvested: 0,
    totalCurrent: 0,
    totalProfit: 0,
    assets: 0,
  })

  const totalProfitPercent = stats.totalInvested > 0 
    ? ((stats.totalCurrent - stats.totalInvested) / stats.totalInvested) * 100 
    : 0

  const isProfitable = stats.totalProfit >= 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Activos"
        value={stats.assets.toString()}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
        color="cyan"
      />

      <StatCard
        title="Invertido"
        value={formatCurrency(stats.totalInvested, currency.toUpperCase(), 0)}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        color="blue"
      />

      <StatCard
        title="Valor Actual"
        value={formatCurrency(stats.totalCurrent, currency.toUpperCase(), 0)}
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        }
        color="purple"
      />

      <StatCard
        title="Ganancia/Pérdida"
        value={formatCurrency(stats.totalProfit, currency.toUpperCase(), 0)}
        subValue={`${isProfitable ? '+' : ''}${totalProfitPercent.toFixed(2)}%`}
        icon={
          isProfitable ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )
        }
        color={isProfitable ? 'green' : 'red'}
      />
    </div>
  )
}

function StatCard({ title, value, subValue, icon, color = 'cyan' }) {
  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 text-cyan-400 border-cyan-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 text-green-400 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 text-red-400 border-red-500/30',
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-lg p-4 border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className="opacity-50">{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-white'}`}>
        {value}
      </div>
      {subValue && (
        <div className={`text-sm font-semibold mt-1 ${color === 'green' ? 'text-green-400' : color === 'red' ? 'text-red-400' : 'text-gray-400'}`}>
          {subValue}
        </div>
      )}
    </div>
  )
}
