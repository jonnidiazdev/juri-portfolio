import type { EvolutionCurrency } from '../../config/evolutionViews'
import { usePortfolioFormatters } from '../../hooks/usePortfolioFormatters'
import type { SnapshotEvent, SnapshotEventKind } from '../../utils/snapshotDiff'

const EVENT_LABELS: Record<SnapshotEventKind, string> = {
  opened: 'Compra',
  closed: 'Venta',
  quantityUp: 'Compra',
  quantityDown: 'Venta',
  priceEdit: 'Edición PPC',
  marketMove: 'Mercado',
  deposit: 'Depósito',
  withdraw: 'Retiro',
}

const EVENT_TONE: Record<SnapshotEventKind, string> = {
  opened: 'bg-profit/10 text-profit border-profit/25',
  closed: 'bg-loss/10 text-loss border-loss/25',
  quantityUp: 'bg-profit/10 text-profit border-profit/25',
  quantityDown: 'bg-loss/10 text-loss border-loss/25',
  priceEdit: 'bg-muted/10 text-muted border-border',
  marketMove: 'bg-celeste/10 text-celeste border-celeste/25',
  deposit: 'bg-profit/10 text-profit border-profit/25',
  withdraw: 'bg-loss/10 text-loss border-loss/25',
}

interface SnapshotChangesTableProps {
  events: SnapshotEvent[]
  currency: EvolutionCurrency
  periodLabel: string
}

export default function SnapshotChangesTable({
  events,
  currency,
  periodLabel,
}: SnapshotChangesTableProps) {
  const { formatCurrency } = usePortfolioFormatters()

  if (events.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-muted text-sm">No hubo cambios detectables entre {periodLabel}.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest">
                Tipo
              </th>
              <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest">
                Activo
              </th>
              <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest">
                Detalle
              </th>
              <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest text-right">
                Impacto
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => {
              const impact = currency === 'ARS' ? event.impactARS : event.impactUSD
              const assetLabel = event.symbol ? `${event.name} (${event.symbol})` : event.name

              return (
                <tr key={`${event.kind}-${event.assetId ?? index}-${index}`} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border text-xs font-mono-data ${EVENT_TONE[event.kind]}`}
                    >
                      {EVENT_LABELS[event.kind]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-paper">{assetLabel}</td>
                  <td className="px-4 py-3 text-muted font-mono-data text-xs">{event.detail}</td>
                  <td className="px-4 py-3 text-right font-mono-data text-paper">
                    {event.kind === 'priceEdit' ? '—' : formatCurrency(impact, currency)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
