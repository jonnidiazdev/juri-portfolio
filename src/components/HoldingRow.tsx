import { useState } from 'react'
import { usePortfolioFormatters } from '../hooks/usePortfolioFormatters'
import { usePortfolioOutletContext } from '../hooks/usePortfolioOutletContext'
import { ASSET_TYPES } from '../config/constants'
import { computeAssetPL } from '../utils/assetCalculations'
import { calculatePlazoFijo, formatPlazoFijoInfo } from '../utils/plazoFijoCalculations'
import { calculateEfectivo, formatEfectivoInfo } from '../utils/efectivoCalculations'
import type { Asset } from '../types'

interface HoldingRowProps {
  asset: Asset
  currentPrice: number
  conversionRate?: number | null
  categoryColor: string
  onEdit: (asset: Asset) => void
  onDelete: (id: number) => void
}

function getSubtitle(asset: Asset): string {
  if (asset.type === ASSET_TYPES.PLAZO_FIJO) {
    return `${asset.bank || 'Banco'} · TNA ${asset.tna ?? 0}%`
  }
  if (asset.type === ASSET_TYPES.EFECTIVO) {
    return asset.banco && asset.banco !== 'Sin banco' ? asset.banco : 'Efectivo'
  }
  return asset.symbol ? asset.symbol.toUpperCase() : ''
}

export default function HoldingRow({ asset, currentPrice, conversionRate, categoryColor, onEdit, onDelete }: HoldingRowProps) {
  const { formatCurrency, formatPercentage, formatQuantity } = usePortfolioFormatters()
  const { hideValues } = usePortfolioOutletContext()
  const [expanded, setExpanded] = useState(false)
  const pl = computeAssetPL(asset, currentPrice, conversionRate)
  const isPlazoFijo = asset.type === ASSET_TYPES.PLAZO_FIJO
  const isEfectivo = asset.type === ASSET_TYPES.EFECTIVO
  const isProfit = pl.plARS >= 0
  const assetCurrency = asset.currency || (asset.type === ASSET_TYPES.CRYPTO ? 'USD' : 'ARS')

  return (
    <div className="asset-card group border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 transition-colors hover:bg-surface-raised/40 text-left"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: categoryColor }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <p className="text-paper font-medium truncate">{asset.name}</p>
          <p className="text-subtle text-xs font-mono-data truncate">{getSubtitle(asset)}</p>
        </div>

        <div className="hidden sm:block text-right shrink-0 w-28">
          <p className="text-muted text-xs font-mono-data">{formatQuantity(asset.amount)}</p>
        </div>

        {!isEfectivo && (
          <div className={`text-right shrink-0 w-20 font-mono-data text-sm font-semibold ${isProfit ? 'text-profit' : 'text-loss'}`}>
            {formatPercentage(pl.plPctARS)}
          </div>
        )}

        <div className="text-right shrink-0 w-28 sm:w-32">
          <p className="text-paper font-mono-data font-semibold">{formatCurrency(pl.currentARS, 'ARS')}</p>
          <p className="text-subtle text-[11px] font-mono-data">≈ {formatCurrency(pl.currentUSD, 'USD')}</p>
        </div>

        <svg
          className={`w-4 h-4 text-subtle shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

        <div
          className="asset-card-actions flex gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            role="button"
            tabIndex={0}
            onClick={() => onEdit(asset)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onEdit(asset) }}
            className="p-1.5 text-subtle hover:text-celeste hover:bg-celeste/10 rounded-lg transition-colors inline-flex"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <span
            role="button"
            tabIndex={0}
            onClick={() => onDelete(asset.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onDelete(asset.id) }}
            className="p-1.5 text-subtle hover:text-loss hover:bg-loss/10 rounded-lg transition-colors inline-flex"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </span>
        </div>
      </button>

      {expanded && (
        <div className="px-3 sm:px-4 pb-4 animate-fadeIn">
          {isPlazoFijo && <PlazoFijoDetail asset={asset} formatCurrency={formatCurrency} />}
          {isEfectivo && <EfectivoDetail asset={asset} hideValues={hideValues} />}
          {!isPlazoFijo && !isEfectivo && (
            <div className="card-raised p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Precio actual</p>
                <p className="text-paper font-mono-data font-medium">
                  {currentPrice > 0 ? formatCurrency(currentPrice, assetCurrency) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Invertido</p>
                <p className="text-muted font-mono-data font-medium">
                  {formatCurrency(assetCurrency === 'USD' ? pl.investedUSD : pl.investedARS, assetCurrency)}
                </p>
              </div>
              <div>
                <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Resultado ARS</p>
                <p className={`font-mono-data font-medium ${isProfit ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(pl.plARS, 'ARS')}
                </p>
              </div>
              <div>
                <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Resultado USD</p>
                <p className={`font-mono-data font-medium ${isProfit ? 'text-profit' : 'text-loss'}`}>
                  {formatCurrency(pl.plUSD, 'USD')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlazoFijoDetail({ asset, formatCurrency }: { asset: Asset; formatCurrency: (v: number, c?: string) => string }) {
  const data = calculatePlazoFijo(asset.amount, asset.tna ?? 0, asset.startDate ?? '', asset.endDate ?? '')
  const info = formatPlazoFijoInfo(data)
  const assetCurrency = asset.currency || 'ARS'

  return (
    <div className="card-raised p-3 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide">Progreso</p>
        <span className={`text-xs font-mono-data font-semibold ${info.statusColor}`}>{info.statusText}</span>
      </div>
      <div className="w-full bg-ink rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${info.progressBarColor}`}
          style={{ width: `${info.progressPercentage}%` }}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Devengado</p>
          <p className="text-profit font-mono-data font-medium">{formatCurrency(data.earnedInterest, assetCurrency)}</p>
        </div>
        <div>
          <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Total interés</p>
          <p className="text-profit font-mono-data font-medium">{formatCurrency(data.totalInterest, assetCurrency)}</p>
        </div>
        <div>
          <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Inicio</p>
          <p className="text-muted font-mono-data font-medium">{new Date(asset.startDate ?? '').toLocaleDateString('es-AR')}</p>
        </div>
        <div>
          <p className="text-subtle text-[10px] font-mono-data uppercase tracking-wide mb-1">Vence</p>
          <p className="text-muted font-mono-data font-medium">{new Date(asset.endDate ?? '').toLocaleDateString('es-AR')}</p>
        </div>
      </div>
    </div>
  )
}

function EfectivoDetail({ asset, hideValues }: { asset: Asset; hideValues: boolean }) {
  const data = calculateEfectivo(asset.amount, asset.tipoEfectivo ?? 'efectivo', asset.currency ?? 'ARS', asset.banco, asset.descripcion)
  const info = formatEfectivoInfo(data, hideValues)

  return (
    <div className="card-raised p-3 space-y-3">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center">
          <p className="text-subtle text-xs mb-1">Disponibilidad</p>
          <p className="font-medium text-xs text-paper">{info.disponibilidad}</p>
        </div>
        <div className="text-center">
          <p className="text-subtle text-xs mb-1">Liquidez</p>
          <p className="font-medium text-xs text-paper">{info.liquidez}</p>
        </div>
        <div className="text-center">
          <p className="text-subtle text-xs mb-1">Riesgo</p>
          <p className="font-medium text-xs text-paper">{info.riesgo}</p>
        </div>
      </div>
      {asset.descripcion && <p className="text-muted text-sm">{asset.descripcion}</p>}
    </div>
  )
}
