import type { ReactNode } from 'react'
import type {
  EvolutionCurrency,
  EvolutionDateFormat,
  EvolutionViewDefinition,
  EvolutionViewPrefs,
  EvolutionYMetric,
  EvolutionYScale,
} from '../config/evolutionViews'
import { EVOLUTION_VIEWS, EVOLUTION_Y_METRIC_LABELS } from '../config/evolutionViews'

interface EvolutionChartToolbarProps {
  prefs: EvolutionViewPrefs
  activeView: EvolutionViewDefinition
  logScaleDisabled: boolean
  onViewChange: (viewId: string) => void
  onLayoutModeChange: (layoutMode: EvolutionViewPrefs['layoutMode']) => void
  onCurrencyChange: (currency: EvolutionCurrency) => void
  onYMetricChange: (yMetric: EvolutionYMetric) => void
  onDateFormatChange: (dateFormat: EvolutionDateFormat) => void
  onYScaleChange: (yScale: EvolutionYScale) => void
  onResetBrush: () => void
  showBrushReset: boolean
}

function ToolbarButton({
  active,
  onClick,
  children,
  disabled = false,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 text-xs font-mono-data rounded-md border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-celeste/15 text-celeste border-celeste/30'
          : 'text-muted border-border hover:text-paper'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-subtle text-[10px] font-mono-data uppercase tracking-widest">{label}</span>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  )
}

export default function EvolutionChartToolbar({
  prefs,
  activeView,
  logScaleDisabled,
  onViewChange,
  onLayoutModeChange,
  onCurrencyChange,
  onYMetricChange,
  onDateFormatChange,
  onYScaleChange,
  onResetBrush,
  showBrushReset,
}: EvolutionChartToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <ToolbarGroup label="Disposición">
        <ToolbarButton
          active={prefs.layoutMode === 'single'}
          onClick={() => onLayoutModeChange('single')}
        >
          Una vista
        </ToolbarButton>
        <ToolbarButton
          active={prefs.layoutMode === 'compare'}
          onClick={() => onLayoutModeChange('compare')}
        >
          Comparar
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup label="Vista">
        {EVOLUTION_VIEWS.map((view) => (
          <ToolbarButton
            key={view.id}
            active={prefs.viewId === view.id}
            onClick={() => onViewChange(view.id)}
          >
            {view.label}
          </ToolbarButton>
        ))}
      </ToolbarGroup>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
          <ToolbarGroup label="Moneda">
            {(['ARS', 'USD'] as EvolutionCurrency[]).map((option) => (
              <ToolbarButton
                key={option}
                active={prefs.currency === option}
                onClick={() => onCurrencyChange(option)}
              >
                {option}
              </ToolbarButton>
            ))}
          </ToolbarGroup>

          <ToolbarGroup label="Eje Y">
            {activeView.allowedYMetrics.map((metric) => (
              <ToolbarButton
                key={metric}
                active={prefs.yMetric === metric}
                onClick={() => onYMetricChange(metric)}
              >
                {EVOLUTION_Y_METRIC_LABELS[metric]}
              </ToolbarButton>
            ))}
          </ToolbarGroup>

          <ToolbarGroup label="Fecha (eje X)">
            <ToolbarButton
              active={prefs.dateFormat === 'short'}
              onClick={() => onDateFormatChange('short')}
            >
              Corto
            </ToolbarButton>
            <ToolbarButton
              active={prefs.dateFormat === 'medium'}
              onClick={() => onDateFormatChange('medium')}
            >
              Medio
            </ToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup label="Escala Y">
            <ToolbarButton
              active={prefs.yScale === 'linear'}
              onClick={() => onYScaleChange('linear')}
            >
              Lineal
            </ToolbarButton>
            <ToolbarButton
              active={prefs.yScale === 'log'}
              onClick={() => onYScaleChange('log')}
              disabled={logScaleDisabled}
            >
              Log
            </ToolbarButton>
          </ToolbarGroup>
        </div>

        {showBrushReset && (
          <button
            type="button"
            onClick={onResetBrush}
            className="btn-ghost px-3 py-1.5 text-xs font-mono-data shrink-0 self-start lg:self-auto"
          >
            Ver todo
          </button>
        )}
      </div>

      {logScaleDisabled && prefs.yScale === 'linear' && (
        <p className="text-subtle text-xs">
          La escala logarítmica no está disponible cuando hay valores ≤ 0 en la serie.
        </p>
      )}
    </div>
  )
}
