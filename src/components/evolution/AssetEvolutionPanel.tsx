import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { EvolutionCurrency } from '../../config/evolutionViews'
import type { PortfolioSnapshot } from '../../types'
import { usePortfolioFormatters } from '../../hooks/usePortfolioFormatters'
import {
  buildAssetEvolutionSeries,
  collectSnapshotAssets,
  snapshotHasHoldings,
} from '../../utils/snapshotDiff'

interface AssetEvolutionPanelProps {
  snapshots: PortfolioSnapshot[]
  currency: EvolutionCurrency
}

type AssetMetric = 'current' | 'profit'

export default function AssetEvolutionPanel({ snapshots, currency }: AssetEvolutionPanelProps) {
  const { formatCurrency } = usePortfolioFormatters()
  const enrichedSnapshots = useMemo(
    () => snapshots.filter((snapshot) => snapshotHasHoldings(snapshot)),
    [snapshots]
  )
  const assets = useMemo(() => collectSnapshotAssets(enrichedSnapshots), [enrichedSnapshots])
  const [selectedKey, setSelectedKey] = useState(() =>
    assets.length > 0 ? `${assets[0].type}:${String(assets[0].symbol ?? assets[0].name).toLowerCase()}` : ''
  )
  const [metric, setMetric] = useState<AssetMetric>('current')

  const series = useMemo(
    () => (selectedKey ? buildAssetEvolutionSeries(enrichedSnapshots, selectedKey) : []),
    [enrichedSnapshots, selectedKey]
  )

  const chartData = useMemo(
    () =>
      series.map((point) => ({
        label: point.label,
        value: metric === 'current'
          ? currency === 'ARS'
            ? point.currentValueARS
            : point.currentValueUSD
          : currency === 'ARS'
            ? point.profitARS
            : point.profitUSD,
      })),
    [series, metric, currency]
  )

  if (enrichedSnapshots.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted mb-2">Todavía no hay snapshots con detalle por activo.</p>
        <p className="text-subtle text-sm">Guardá un snapshot nuevo para empezar a ver la evolución por ticker.</p>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted">No se encontraron activos en los snapshots enriquecidos.</p>
      </div>
    )
  }

  const selectedAsset = assets.find(
    (asset) => `${asset.type}:${String(asset.symbol ?? asset.name).toLowerCase()}` === selectedKey
  )

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <label className="flex flex-col gap-1.5 text-xs font-mono-data text-muted flex-1">
          Activo
          <select
            value={selectedKey}
            onChange={(event) => setSelectedKey(event.target.value)}
            className="px-3 py-2 rounded-md border border-border bg-surface text-paper text-sm"
          >
            {assets.map((asset) => {
              const key = `${asset.type}:${String(asset.symbol ?? asset.name).toLowerCase()}`
              const label = asset.symbol ? `${asset.name} (${asset.symbol})` : asset.name
              return (
                <option key={key} value={key}>
                  {label}
                </option>
              )
            })}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMetric('current')}
            className={`px-3 py-2 text-xs font-mono-data rounded-md border transition-colors ${
              metric === 'current'
                ? 'bg-celeste/15 text-celeste border-celeste/30'
                : 'text-muted border-border hover:text-paper'
            }`}
          >
            Valor
          </button>
          <button
            type="button"
            onClick={() => setMetric('profit')}
            className={`px-3 py-2 text-xs font-mono-data rounded-md border transition-colors ${
              metric === 'profit'
                ? 'bg-celeste/15 text-celeste border-celeste/30'
                : 'text-muted border-border hover:text-paper'
            }`}
          >
            P/L
          </button>
        </div>
      </div>

      {series.length < 2 ? (
        <p className="text-subtle text-sm mb-4">
          Este activo aparece en {series.length} snapshot. Guardá más snapshots para ver tendencia.
        </p>
      ) : null}

      <div className="card p-4 sm:p-6 mb-6" style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--color-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(Number(value), currency)}
              tick={{ fill: 'var(--color-subtle)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip
              formatter={(value) =>
                formatCurrency(Number(value ?? 0), currency)
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6badc9"
              strokeWidth={2}
              dot={{ fill: '#6badc9', r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest">
                  Snapshot
                </th>
                <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest text-right">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest text-right">
                  Precio
                </th>
                <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest text-right">
                  Valor
                </th>
                <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest text-right">
                  Invertido
                </th>
                <th className="px-4 py-3 text-subtle text-[10px] font-mono-data uppercase tracking-widest text-right">
                  P/L
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((point) => (
                <tr key={point.capturedAt} className="border-b border-border/60">
                  <td className="px-4 py-3 text-paper font-mono-data text-xs">{point.label}</td>
                  <td className="px-4 py-3 text-right font-mono-data text-paper">{point.amount}</td>
                  <td className="px-4 py-3 text-right font-mono-data text-muted">
                    {formatCurrency(point.marketPrice, selectedAsset?.currency === 'USD' ? 'USD' : 'ARS')}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-paper">
                    {formatCurrency(
                      currency === 'ARS' ? point.currentValueARS : point.currentValueUSD,
                      currency
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-muted">
                    {formatCurrency(
                      currency === 'ARS' ? point.investedARS : point.investedUSD,
                      currency
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono-data text-paper">
                    {formatCurrency(
                      currency === 'ARS' ? point.profitARS : point.profitUSD,
                      currency
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
