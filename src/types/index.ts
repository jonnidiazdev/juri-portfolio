// Shared types for the portfolio application

export interface Asset {
  id: number
  type: string
  name: string
  symbol?: string
  amount: number
  purchasePrice?: number
  currency: string
  // Plazo fijo fields
  tna?: number
  startDate?: string
  endDate?: string
  bank?: string
  // Efectivo fields
  tipoEfectivo?: string
  banco?: string
  descripcion?: string
}

export interface CryptoPriceData {
  usd?: number
  ars?: number
  usd_24h_change?: number
  ars_24h_change?: number
  _fetchedAt?: string
}

export interface CryptoPrices {
  [key: string]: CryptoPriceData | string | undefined
}

export interface DolarQuote {
  compra: number
  venta: number
  nombre: string
  casa: string
  fechaActualizacion?: string
}

export interface ArgentineQuote {
  ultimoPrecio: number
  variacionPorcentual: number
  simbolo: string
  descripcion: string
  moneda: string
  puntas?: {
    precioCompra: number
    precioVenta: number
  }
}

export interface PlazoFijoResult {
  capital: number
  tna: number
  totalDays: number
  elapsedDays: number
  remainingDays: number
  currentValue: number
  finalValue: number
  earnedInterest: number
  totalInterest: number
  completionPercentage: number
  dailyRate: number
  isExpired: boolean
  isActive: boolean
  status: 'vencido' | 'activo' | 'pendiente'
}

export interface PlazoFijoFormatted {
  durationText: string
  progressText: string
  remainingText: string
  statusText: string
  statusColor: string
  progressPercentage: number
  progressBarColor: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface AssetPL {
  investedUSD: number
  currentUSD: number
  plUSD: number
  plPctUSD: number
  investedARS: number
  currentARS: number
  plARS: number
  plPctARS: number
}

export interface EfectivoInfo {
  availableAmount: number
  currentValue: number
  tipoEfectivo: string
  tipoDescripcion: string
  banco: string
  currency: string
  descripcion: string
  isLiquid: boolean
  hasRisk: boolean
  rentabilidad: number
  yields: number
}

export interface MultiCurrencyData {
  totalUSD: number
  totalARS: number
  totalPLUSD: number
  totalPLARS: number
  totalPLPctUSD: number
  totalPLPctARS: number
}

export interface ArgentineQuoteResult {
  raw?: ArgentineQuote
  price?: number | string
  error?: string
}

export interface ArgentineQuotes {
  [assetId: number]: ArgentineQuoteResult
  _fetchedAt?: string
}

export type DolarPrices = Record<string, DolarQuote | undefined> & {
  _fetchedAt?: string
}

export interface SnapshotTotals {
  current: number
  invested: number
  profit: number
  profitPercent: number
}

export interface SnapshotByType {
  crypto: SnapshotTotals
  argentine: SnapshotTotals
  plazoFijo: SnapshotTotals
  efectivo: SnapshotTotals
}

export interface PortfolioSnapshotPayload {
  capturedAt: string
  currencyPreference: string
  exchangeRate: number
  exchangeRateName: string
  totalsARS: SnapshotTotals
  totalsUSD: SnapshotTotals
  byTypeARS: SnapshotByType
  byTypeUSD: SnapshotByType
}

export interface PortfolioSnapshot extends PortfolioSnapshotPayload {
  id: string
}
