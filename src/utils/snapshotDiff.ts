import { ASSET_TYPES } from '../config/constants'
import type { PortfolioSnapshot, SnapshotHolding } from '../types'

export type SnapshotEventKind =
  | 'opened'
  | 'closed'
  | 'quantityUp'
  | 'quantityDown'
  | 'priceEdit'
  | 'marketMove'
  | 'deposit'
  | 'withdraw'

export interface SnapshotEvent {
  kind: SnapshotEventKind
  assetId?: number
  name: string
  symbol?: string
  type: string
  detail: string
  impactARS: number
  impactUSD: number
}

export interface SnapshotRotation {
  closed: SnapshotHolding
  opened: SnapshotHolding
}

export interface SnapshotComparisonSummary {
  totalDeltaARS: number
  totalDeltaUSD: number
  marketGainARS: number
  marketGainUSD: number
  capitalFlowsARS: number
  capitalFlowsUSD: number
  realizedGainARS: number
  realizedGainUSD: number
}

export interface SnapshotComparison {
  prevCapturedAt: string
  currCapturedAt: string
  events: SnapshotEvent[]
  summary: SnapshotComparisonSummary
  rotations: SnapshotRotation[]
}

export function snapshotHasHoldings(snapshot: PortfolioSnapshot): boolean {
  return Array.isArray(snapshot.holdings) && snapshot.holdings.length > 0
}

export function canCompareSnapshots(prev: PortfolioSnapshot, curr: PortfolioSnapshot): boolean {
  return snapshotHasHoldings(prev) && snapshotHasHoldings(curr)
}

function holdingKey(holding: SnapshotHolding): string {
  return String(holding.assetId)
}

function symbolKey(holding: SnapshotHolding): string {
  return `${holding.type}:${String(holding.symbol ?? holding.name).toLowerCase()}`
}

function indexHoldings(holdings: SnapshotHolding[]) {
  const byId = new Map<string, SnapshotHolding>()
  const bySymbol = new Map<string, SnapshotHolding>()
  for (const holding of holdings) {
    byId.set(holdingKey(holding), holding)
    bySymbol.set(symbolKey(holding), holding)
  }
  return { byId, bySymbol }
}

function matchHolding(
  holding: SnapshotHolding,
  prevIndex: ReturnType<typeof indexHoldings>,
  currIndex: ReturnType<typeof indexHoldings>,
  side: 'prev' | 'curr'
): SnapshotHolding | undefined {
  const index = side === 'prev' ? currIndex : prevIndex
  return index.byId.get(holdingKey(holding)) ?? index.bySymbol.get(symbolKey(holding))
}

function isEfectivo(holding: SnapshotHolding): boolean {
  return holding.type === ASSET_TYPES.EFECTIVO
}

function formatQty(amount: number): string {
  if (Number.isInteger(amount)) return String(amount)
  return amount.toFixed(4).replace(/\.?0+$/, '')
}

function approxEqual(a: number, b: number, tolerance = 0.01): boolean {
  return Math.abs(a - b) <= tolerance
}

export function compareSnapshots(prev: PortfolioSnapshot, curr: PortfolioSnapshot): SnapshotComparison {
  const prevHoldings = prev.holdings ?? []
  const currHoldings = curr.holdings ?? []
  const prevIndex = indexHoldings(prevHoldings)
  const currIndex = indexHoldings(currHoldings)
  const events: SnapshotEvent[] = []

  let marketGainARS = 0
  let marketGainUSD = 0
  let capitalFlowsARS = 0
  let capitalFlowsUSD = 0
  let realizedGainARS = 0
  let realizedGainUSD = 0

  const matchedPrev = new Set<string>()
  const matchedCurr = new Set<string>()

  for (const prevHolding of prevHoldings) {
    const currHolding = matchHolding(prevHolding, prevIndex, currIndex, 'prev')
    if (!currHolding) continue
    matchedPrev.add(holdingKey(prevHolding))
    matchedCurr.add(holdingKey(currHolding))

    const qtyDelta = currHolding.amount - prevHolding.amount
    const priceDelta = currHolding.marketPrice - prevHolding.marketPrice

    if (isEfectivo(prevHolding)) {
      const deltaARS = currHolding.currentValueARS - prevHolding.currentValueARS
      const deltaUSD = currHolding.currentValueUSD - prevHolding.currentValueUSD
      if (!approxEqual(deltaARS, 0)) {
        events.push({
          kind: deltaARS > 0 ? 'deposit' : 'withdraw',
          assetId: prevHolding.assetId,
          name: prevHolding.name,
          symbol: prevHolding.symbol,
          type: prevHolding.type,
          detail: `${deltaARS > 0 ? '+' : ''}${formatAmount(deltaARS)} efectivo`,
          impactARS: deltaARS,
          impactUSD: deltaUSD,
        })
        capitalFlowsARS += deltaARS
        capitalFlowsUSD += deltaUSD
      }
      continue
    }

    if (!approxEqual(prevHolding.purchasePrice ?? 0, currHolding.purchasePrice ?? 0) && approxEqual(qtyDelta, 0)) {
      events.push({
        kind: 'priceEdit',
        assetId: prevHolding.assetId,
        name: prevHolding.name,
        symbol: prevHolding.symbol,
        type: prevHolding.type,
        detail: `PPC ${formatQty(prevHolding.purchasePrice ?? 0)} → ${formatQty(currHolding.purchasePrice ?? 0)}`,
        impactARS: 0,
        impactUSD: 0,
      })
    }

    if (qtyDelta > 0.000001) {
      const addedInvestedARS = currHolding.investedARS - prevHolding.investedARS
      const addedInvestedUSD = currHolding.investedUSD - prevHolding.investedUSD
      const marketPartARS = prevHolding.amount * priceDelta * (prevHolding.currency === 'USD' ? prev.exchangeRate : 1)
      const investedDeltaARS = addedInvestedARS - Math.max(0, marketPartARS)

      events.push({
        kind: 'quantityUp',
        assetId: prevHolding.assetId,
        name: prevHolding.name,
        symbol: prevHolding.symbol,
        type: prevHolding.type,
        detail: `+${formatQty(qtyDelta)} unidades`,
        impactARS: addedInvestedARS,
        impactUSD: addedInvestedUSD,
      })
      capitalFlowsARS += investedDeltaARS > 0 ? investedDeltaARS : addedInvestedARS
      capitalFlowsUSD += addedInvestedUSD
    } else if (qtyDelta < -0.000001) {
      const soldQty = Math.abs(qtyDelta)
      const avgExitPrice = prevHolding.marketPrice
      const costBasis = soldQty * (prevHolding.purchasePrice ?? 0)
      const exitValueNative = soldQty * avgExitPrice
      const realizedNative = exitValueNative - costBasis
      const fx = prevHolding.currency === 'USD' ? prev.exchangeRate : 1
      const realizedARS = prevHolding.currency === 'USD' ? realizedNative * fx : realizedNative
      const realizedUSD = prevHolding.currency === 'USD' ? realizedNative : realizedNative / (curr.exchangeRate || 1)

      events.push({
        kind: 'quantityDown',
        assetId: prevHolding.assetId,
        name: prevHolding.name,
        symbol: prevHolding.symbol,
        type: prevHolding.type,
        detail: `−${formatQty(soldQty)} unidades`,
        impactARS: -realizedARS,
        impactUSD: -realizedUSD,
      })
      realizedGainARS += realizedARS
      realizedGainUSD += realizedUSD
      capitalFlowsARS -= prevHolding.currency === 'USD' ? exitValueNative * fx : exitValueNative
      capitalFlowsUSD -= prevHolding.currency === 'USD' ? exitValueNative : exitValueNative / (curr.exchangeRate || 1)
    }

    if (approxEqual(qtyDelta, 0)) {
      const valueDeltaARS = currHolding.currentValueARS - prevHolding.currentValueARS
      const valueDeltaUSD = currHolding.currentValueUSD - prevHolding.currentValueUSD
      if (!approxEqual(valueDeltaARS, 0)) {
        const pct =
          prevHolding.marketPrice > 0
            ? ((priceDelta / prevHolding.marketPrice) * 100).toFixed(1)
            : '0'
        events.push({
          kind: 'marketMove',
          assetId: prevHolding.assetId,
          name: prevHolding.name,
          symbol: prevHolding.symbol,
          type: prevHolding.type,
          detail: `Precio ${priceDelta >= 0 ? '+' : ''}${pct}%`,
          impactARS: valueDeltaARS,
          impactUSD: valueDeltaUSD,
        })
        marketGainARS += valueDeltaARS
        marketGainUSD += valueDeltaUSD
      }
    } else {
      const marketPartARS = prevHolding.amount * priceDelta * (prevHolding.currency === 'USD' ? prev.exchangeRate : 1)
      const marketPartUSD =
        prevHolding.currency === 'USD'
          ? prevHolding.amount * priceDelta
          : (prevHolding.amount * priceDelta) / (curr.exchangeRate || 1)
      marketGainARS += marketPartARS
      marketGainUSD += marketPartUSD
    }
  }

  const closedHoldings: SnapshotHolding[] = []
  const openedHoldings: SnapshotHolding[] = []

  for (const prevHolding of prevHoldings) {
    if (matchedPrev.has(holdingKey(prevHolding))) continue
    if (matchHolding(prevHolding, prevIndex, currIndex, 'prev')) continue

    closedHoldings.push(prevHolding)
    const exitARS = prevHolding.currentValueARS
    const exitUSD = prevHolding.currentValueUSD
    const realizedARS = prevHolding.profitARS
    const realizedUSD = prevHolding.profitUSD

    events.push({
      kind: 'closed',
      assetId: prevHolding.assetId,
      name: prevHolding.name,
      symbol: prevHolding.symbol,
      type: prevHolding.type,
      detail: isEfectivo(prevHolding) ? 'Retiro de efectivo' : 'Posición cerrada',
      impactARS: exitARS,
      impactUSD: exitUSD,
    })

    if (!isEfectivo(prevHolding)) {
      realizedGainARS += realizedARS
      realizedGainUSD += realizedUSD
    }
    capitalFlowsARS -= exitARS
    capitalFlowsUSD -= exitUSD
  }

  for (const currHolding of currHoldings) {
    if (matchedCurr.has(holdingKey(currHolding))) continue
    if (matchHolding(currHolding, prevIndex, currIndex, 'curr')) continue

    openedHoldings.push(currHolding)
    events.push({
      kind: 'opened',
      assetId: currHolding.assetId,
      name: currHolding.name,
      symbol: currHolding.symbol,
      type: currHolding.type,
      detail: isEfectivo(currHolding) ? 'Depósito de efectivo' : 'Posición nueva',
      impactARS: -currHolding.investedARS,
      impactUSD: -currHolding.investedUSD,
    })
    capitalFlowsARS += currHolding.investedARS
    capitalFlowsUSD += currHolding.investedUSD
  }

  const rotations: SnapshotRotation[] = []
  const tradableClosed = closedHoldings.filter((h) => !isEfectivo(h))
  const tradableOpened = openedHoldings.filter((h) => !isEfectivo(h))
  const pairCount = Math.min(tradableClosed.length, tradableOpened.length)
  for (let i = 0; i < pairCount; i += 1) {
    rotations.push({ closed: tradableClosed[i], opened: tradableOpened[i] })
  }

  const totalDeltaARS = curr.totalsARS.current - prev.totalsARS.current
  const totalDeltaUSD = curr.totalsUSD.current - prev.totalsUSD.current

  return {
    prevCapturedAt: prev.capturedAt,
    currCapturedAt: curr.capturedAt,
    events,
    rotations,
    summary: {
      totalDeltaARS,
      totalDeltaUSD,
      marketGainARS,
      marketGainUSD,
      capitalFlowsARS,
      capitalFlowsUSD,
      realizedGainARS,
      realizedGainUSD,
    },
  }
}

function formatAmount(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

export function collectSnapshotAssets(snapshots: PortfolioSnapshot[]): SnapshotHolding[] {
  const seen = new Map<string, SnapshotHolding>()
  for (const snapshot of snapshots) {
    if (!snapshot.holdings) continue
    for (const holding of snapshot.holdings) {
      const key = symbolKey(holding)
      if (!seen.has(key)) {
        seen.set(key, holding)
      }
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export interface AssetSnapshotPoint {
  capturedAt: string
  label: string
  amount: number
  marketPrice: number
  currentValueARS: number
  currentValueUSD: number
  investedARS: number
  investedUSD: number
  profitARS: number
  profitUSD: number
}

export function buildAssetEvolutionSeries(
  snapshots: PortfolioSnapshot[],
  assetKey: string
): AssetSnapshotPoint[] {
  const points: AssetSnapshotPoint[] = []

  for (const snapshot of snapshots) {
    if (!snapshot.holdings) continue
    const holding =
      snapshot.holdings.find((h) => symbolKey(h) === assetKey) ??
      snapshot.holdings.find((h) => holdingKey(h) === assetKey)
    if (!holding) continue

    points.push({
      capturedAt: snapshot.capturedAt,
      label: new Date(snapshot.capturedAt).toLocaleString('es-AR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      amount: holding.amount,
      marketPrice: holding.marketPrice,
      currentValueARS: holding.currentValueARS,
      currentValueUSD: holding.currentValueUSD,
      investedARS: holding.investedARS,
      investedUSD: holding.investedUSD,
      profitARS: holding.profitARS,
      profitUSD: holding.profitUSD,
    })
  }

  return points
}
