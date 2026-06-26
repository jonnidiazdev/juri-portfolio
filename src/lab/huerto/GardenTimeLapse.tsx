import type { PortfolioSnapshot } from '../../types'
import { formatCurrency, formatPercentage } from '../../utils/formatters'

interface GardenTimeLapseProps {
  snapshots: PortfolioSnapshot[]
}

export default function GardenTimeLapse({ snapshots }: GardenTimeLapseProps) {
  if (snapshots.length < 2) return null

  const recent = snapshots.slice(-6)

  return (
    <div className="card p-4 mt-4">
      <h3 className="font-display text-lg font-semibold text-paper mb-1">
        Timelapse del clima
      </h3>
      <p className="text-muted text-sm mb-4">
        Evolución del rendimiento de tu cartera según snapshots guardados
      </p>

      <ol className="space-y-2" aria-label="Historial de snapshots">
        {recent.map(snapshot => {
          const date = new Date(snapshot.capturedAt).toLocaleString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          const profitPct = snapshot.totalsARS.profitPercent
          const mood =
            profitPct < -10 ? 'Tormenta' :
            profitPct < 0 ? 'Nublado' :
            profitPct < 5 ? 'Neutral' :
            profitPct < 20 ? 'Soleado' : 'Dorado'

          return (
            <li
              key={snapshot.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-md bg-surface-raised border border-border text-sm"
            >
              <span className="text-paper font-mono-data">{date}</span>
              <span className="text-muted">{mood}</span>
              <span className={profitPct >= 0 ? 'text-profit' : 'text-loss'}>
                {formatPercentage(profitPct)}
              </span>
              <span className="text-subtle">{formatCurrency(snapshot.totalsARS.current, 'ARS')}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
