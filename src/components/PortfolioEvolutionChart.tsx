import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { PortfolioSnapshot } from '../types'
import { formatCurrency } from '../utils/formatters'

type CurrencyMode = 'ARS' | 'USD'
type MetricMode = 'total' | 'byType'

interface PortfolioEvolutionChartProps {
  snapshots: PortfolioSnapshot[]
}

interface ChartPoint {
  label: string
  total?: number
  crypto?: number
  argentine?: number
  plazoFijo?: number
  efectivo?: number
}

function formatAxisValue(value: number, currency: CurrencyMode): string {
  if (currency === 'USD') {
    return `$${Math.round(value).toLocaleString('es-AR')}`
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${Math.round(value).toLocaleString('es-AR')}`
}

function buildChartPoints(
  snapshots: PortfolioSnapshot[],
  currency: CurrencyMode,
  metric: MetricMode
): ChartPoint[] {
  return snapshots.map((snapshot) => {
    const label = new Date(snapshot.capturedAt).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    })
    const totals = currency === 'ARS' ? snapshot.totalsARS : snapshot.totalsUSD
    const byType = currency === 'ARS' ? snapshot.byTypeARS : snapshot.byTypeUSD

    if (metric === 'total') {
      return { label, total: totals.current }
    }

    return {
      label,
      crypto: byType.crypto.current,
      argentine: byType.argentine.current,
      plazoFijo: byType.plazoFijo.current,
      efectivo: byType.efectivo.current,
    }
  })
}

function ChartTooltip({
  active,
  payload,
  label,
  currency,
  metric,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  currency: CurrencyMode
  metric: MetricMode
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="card px-3 py-2 text-sm shadow-lg">
      <p className="text-muted text-xs font-mono-data mb-2">{label}</p>
      {metric === 'total' ? (
        <p className="font-mono-data text-paper">
          {formatCurrency(payload[0].value, currency)}
        </p>
      ) : (
        payload.map((entry) => (
          <p key={entry.name} className="font-mono-data text-paper flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted">{entry.name}:</span>
            {formatCurrency(entry.value, currency)}
          </p>
        ))
      )}
    </div>
  )
}

export default function PortfolioEvolutionChart({ snapshots }: PortfolioEvolutionChartProps) {
  const [currency, setCurrency] = useState<CurrencyMode>('ARS')
  const [metric, setMetric] = useState<MetricMode>('total')

  const chartData = useMemo(
    () => buildChartPoints(snapshots, currency, metric),
    [snapshots, currency, metric]
  )

  if (snapshots.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted">Todavía no hay snapshots. Guardá el primero para ver la evolución.</p>
      </div>
    )
  }

  const singlePoint = snapshots.length === 1
  const latest = snapshots[snapshots.length - 1]
  const latestTotals = currency === 'ARS' ? latest.totalsARS : latest.totalsUSD

  return (
    <div className="card p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {(['ARS', 'USD'] as CurrencyMode[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCurrency(option)}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-md border transition-colors ${
                currency === option
                  ? option === 'ARS'
                    ? 'bg-peso/15 text-peso border-peso/30'
                    : 'bg-celeste/15 text-celeste border-celeste/30'
                  : 'text-muted border-border hover:text-paper'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {([
            { id: 'total' as MetricMode, label: 'Valor total' },
            { id: 'byType' as MetricMode, label: 'Por tipo' },
          ]).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMetric(option.id)}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-md border transition-colors ${
                metric === option.id
                  ? 'bg-celeste/15 text-celeste border-celeste/30'
                  : 'text-muted border-border hover:text-paper'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {singlePoint && (
        <p className="text-subtle text-sm mb-4">
          Necesitás al menos 2 snapshots para ver la tendencia. Valor actual:{' '}
          <span className="font-mono-data text-paper">{formatCurrency(latestTotals.current, currency)}</span>
        </p>
      )}

      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} style={{ background: 'transparent' }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatAxisValue(Number(value), currency)}
              tick={{ fill: 'var(--color-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip
              content={<ChartTooltip currency={currency} metric={metric} />}
            />
            {metric === 'total' ? (
              <Line
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#6badc9"
                strokeWidth={2}
                dot={{ fill: '#6badc9', r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            ) : (
              <>
                <Legend
                  wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
                />
                <Line type="monotone" dataKey="crypto" name="Crypto" stroke="#a78bfa" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="argentine" name="Mercado AR" stroke="#6badc9" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="plazoFijo" name="Plazo fijo" stroke="#c9a227" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="efectivo" name="Efectivo" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
