export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export const formatPercentage = (value) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export const formatNumber = (num) => {
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toFixed(2)
}

export const calculatePortfolioValue = (holdings, prices) => {
  return holdings.reduce((total, holding) => {
    const price = prices[holding.id]?.[holding.currency] || 0
    return total + (holding.amount * price)
  }, 0)
}

export const calculatePortfolioChange = (holdings, prices) => {
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
