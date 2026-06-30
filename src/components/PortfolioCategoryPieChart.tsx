import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../utils/formatters'
import type { CategoryBreakdownItem } from './PortfolioCategoryBreakdown'

const CATEGORY_CHART_COLORS: Record<string, string> = {
  crypto: '#a78bfa',
  argentine: '#6badc9',
  plazo: '#c9a227',
  efectivo: '#4ade80',
}

interface PieChartDatum {
  id: string
  name: string
  value: number
  color: string
}

interface PortfolioCategoryPieChartProps {
  categories: CategoryBreakdownItem[]
  totalCurrentARS: number
  exchangeRate: number | null
}

function PieChartTooltip({
  active,
  payload,
  totalCurrentARS,
  exchangeRate,
}: {
  active?: boolean
  payload?: Array<{ payload: PieChartDatum }>
  totalCurrentARS: number
  exchangeRate: number | null
}) {
  if (!active || !payload?.length) return null

  const entry = payload[0].payload
  const percent = totalCurrentARS > 0 ? (entry.value / totalCurrentARS) * 100 : 0
  const totalValueUSD = exchangeRate ? entry.value / exchangeRate : null

  return (
    <div className="card px-3 py-2 text-sm shadow-lg">
      <p className="font-mono-data text-paper font-medium mb-2 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
        {entry.name}
      </p>
      <p className="font-mono-data text-paper">
        {formatCurrency(entry.value, 'ARS')}
      </p>
      {totalValueUSD !== null && (
        <p className="font-mono-data text-muted text-xs mt-1">
          {formatCurrency(totalValueUSD, 'USD')}
        </p>
      )}
      <p className="font-mono-data text-subtle text-xs mt-1">
        {percent.toFixed(1)}% del portfolio
      </p>
    </div>
  )
}

export default function PortfolioCategoryPieChart({
  categories,
  totalCurrentARS,
  exchangeRate,
}: PortfolioCategoryPieChartProps) {
  const chartData = useMemo<PieChartDatum[]>(
    () => categories.map((category) => ({
      id: category.id,
      name: category.label,
      value: category.totalValueARS,
      color: CATEGORY_CHART_COLORS[category.id] ?? '#8b9aab',
    })),
    [categories]
  )

  return (
    <div className="h-56 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart style={{ background: 'transparent' }}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="75%"
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.id} fill={entry.color} stroke="rgba(15, 26, 36, 0.5)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            content={
              <PieChartTooltip
                totalCurrentARS={totalCurrentARS}
                exchangeRate={exchangeRate}
              />
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
