export const HIDDEN_AMOUNT = '$ ••••••'
export const HIDDEN_VALUE = '••••'

export const formatCurrency = (amount: number, currency: string = 'USD', decimals: number = 2, hidden: boolean = false): string => {
  if (hidden) return HIDDEN_AMOUNT
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export const formatPercentage = (value: number, hidden: boolean = false): string => {
  if (hidden) return HIDDEN_VALUE
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export const formatQuantity = (
  value: number,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 8 },
  hidden: boolean = false
): string => {
  if (hidden) return HIDDEN_VALUE
  return value.toLocaleString('es-AR', options)
}

export const getTimeAgo = (isoDateString: string | null | undefined): string => {
  if (!isoDateString) return 'nunca'
  
  const date = new Date(isoDateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'hace menos de 1 min'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}

export const formatNumber = (num: number): string => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

interface Holding {
  id: string
  amount: number
  currency: string
}

interface PriceMap {
  [id: string]: { [currency: string]: number }
}

export const calculatePortfolioValue = (holdings: Holding[], prices: PriceMap): number => {
  return holdings.reduce((total, holding) => {
    const price = prices[holding.id]?.[holding.currency] || 0
    return total + (holding.amount * price)
  }, 0)
}

export const calculatePortfolioChange = (holdings: Holding[], prices: PriceMap): number => {
  let totalValue = 0
  let totalChange = 0

  holdings.forEach(holding => {
    const priceData = prices[holding.id]
    if (priceData) {
      const currentPrice = priceData[holding.currency] || 0
      const changePercent = priceData[`${holding.currency}_24h_change`] || 0
      const value = holding.amount * currentPrice
      totalValue += value
      totalChange += value * (changePercent / 100)
    }
  })

  return totalValue > 0 ? (totalChange / totalValue) * 100 : 0
}
