import { useMemo, useState } from 'react'
import type { EvolutionCurrency } from '../../config/evolutionViews'
import type { PortfolioSnapshot } from '../../types'
import { formatSnapshotDateTime } from '../../utils/portfolioSnapshot'
import {
  canCompareSnapshots,
  compareSnapshots,
  snapshotHasHoldings,
} from '../../utils/snapshotDiff'
import SnapshotChangesTable from './SnapshotChangesTable'
import SnapshotFlowSummary from './SnapshotFlowSummary'

interface SnapshotChangesPanelProps {
  snapshots: PortfolioSnapshot[]
  currency: EvolutionCurrency
}

export default function SnapshotChangesPanel({ snapshots, currency }: SnapshotChangesPanelProps) {
  const enrichedSnapshots = useMemo(
    () => snapshots.filter((snapshot) => snapshotHasHoldings(snapshot)),
    [snapshots]
  )

  const [prevIndex, setPrevIndex] = useState(() =>
    enrichedSnapshots.length >= 2 ? enrichedSnapshots.length - 2 : 0
  )
  const [currIndex, setCurrIndex] = useState(() =>
    enrichedSnapshots.length >= 1 ? enrichedSnapshots.length - 1 : 0
  )

  const safePrevIndex = Math.min(prevIndex, Math.max(0, enrichedSnapshots.length - 2))
  const safeCurrIndex = Math.max(safePrevIndex + 1, Math.min(currIndex, enrichedSnapshots.length - 1))

  const prevSnapshot = enrichedSnapshots[safePrevIndex]
  const currSnapshot = enrichedSnapshots[safeCurrIndex]

  const comparison = useMemo(() => {
    if (!prevSnapshot || !currSnapshot || !canCompareSnapshots(prevSnapshot, currSnapshot)) {
      return null
    }
    return compareSnapshots(prevSnapshot, currSnapshot)
  }, [prevSnapshot, currSnapshot])

  if (enrichedSnapshots.length < 2) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted mb-2">Necesitás al menos 2 snapshots con detalle para ver cambios.</p>
        <p className="text-subtle text-sm">
          Los snapshots guardados a partir de ahora incluyen el detalle por activo. Los anteriores solo
          tienen totales agregados.
        </p>
      </div>
    )
  }

  const periodLabel = `${formatSnapshotDateTime(prevSnapshot.capturedAt)} → ${formatSnapshotDateTime(currSnapshot.capturedAt)}`

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <label className="flex flex-col gap-1.5 text-xs font-mono-data text-muted">
          Desde
          <select
            value={safePrevIndex}
            onChange={(event) => {
              const nextPrev = Number(event.target.value)
              setPrevIndex(nextPrev)
              if (nextPrev >= safeCurrIndex) {
                setCurrIndex(Math.min(nextPrev + 1, enrichedSnapshots.length - 1))
              }
            }}
            className="px-3 py-2 rounded-md border border-border bg-surface text-paper text-sm"
          >
            {enrichedSnapshots.slice(0, -1).map((snapshot, index) => (
              <option key={snapshot.id} value={index}>
                {formatSnapshotDateTime(snapshot.capturedAt)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-mono-data text-muted">
          Hasta
          <select
            value={safeCurrIndex}
            onChange={(event) => setCurrIndex(Number(event.target.value))}
            className="px-3 py-2 rounded-md border border-border bg-surface text-paper text-sm"
          >
            {enrichedSnapshots.slice(safePrevIndex + 1).map((snapshot, offset) => {
              const index = safePrevIndex + 1 + offset
              return (
                <option key={snapshot.id} value={index}>
                  {formatSnapshotDateTime(snapshot.capturedAt)}
                </option>
              )
            })}
          </select>
        </label>
      </div>

      {comparison && (
        <>
          <SnapshotFlowSummary summary={comparison.summary} currency={currency} />

          <p className="text-subtle text-xs mb-3">
            Cambios inferidos entre snapshots. Los movimientos pueden ser aproximados si hubo ediciones
            manuales o varias operaciones entre fechas.
          </p>

          <SnapshotChangesTable
            events={comparison.events}
            currency={currency}
            periodLabel={periodLabel}
          />

          {comparison.rotations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-chalk text-lg text-paper mb-3">Rotaciones detectadas</h3>
              <ul className="space-y-2">
                {comparison.rotations.map((rotation, index) => (
                  <li key={`${rotation.closed.assetId}-${rotation.opened.assetId}-${index}`} className="card px-4 py-3">
                    <p className="text-sm text-paper font-mono-data">
                      Salió{' '}
                      <span className="text-loss">
                        {rotation.closed.symbol ?? rotation.closed.name}
                      </span>{' '}
                      → entró{' '}
                      <span className="text-profit">
                        {rotation.opened.symbol ?? rotation.opened.name}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
