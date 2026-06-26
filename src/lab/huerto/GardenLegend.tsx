import { useMemo } from 'react'
import { formatCurrency, formatPercentage } from '../../utils/formatters'
import { GARDEN_BEDS, computeGridDimensions } from './gardenLayout'
import type { PlantState } from './portfolioMetaphor'

const SPECIES_LABELS: Record<PlantState['species'], string> = {
  exotic: 'Exótica (cripto)',
  native: 'Nativa (argentina)',
  slow: 'Lenta (plazo fijo)',
  ground: 'Suelo (efectivo)',
}

interface GardenLegendProps {
  plants: PlantState[]
  selectedAssetId: number | null
  hoveredAssetId: number | null
  onSelect: (assetId: number | null) => void
  onHover: (assetId: number | null) => void
}

export default function GardenLegend({
  plants,
  selectedAssetId,
  hoveredAssetId,
  onSelect,
  onHover,
}: GardenLegendProps) {
  const activeId = hoveredAssetId ?? selectedAssetId

  const plantsByBed = useMemo(() => {
    const map = new Map<number, PlantState[]>()
    for (const bed of GARDEN_BEDS) {
      map.set(
        bed.bedIndex,
        plants
          .filter(p => p.bedIndex === bed.bedIndex)
          .sort((a, b) => a.cellRow - b.cellRow || a.cellCol - b.cellCol)
      )
    }
    return map
  }, [plants])

  return (
    <div className="card p-4">
      <h3 className="font-display text-lg font-semibold text-paper mb-3">Leyenda del huerto</h3>

      <p className="text-subtle text-xs mb-4">
        Cuatro canteros por tipo. Tamaño = valor · Color = P/L · Viento = variación 24h
      </p>

      {plants.length > 0 && (
        <div
          className="mb-4 grid grid-cols-2 gap-2"
          aria-label="Mapa del huerto"
        >
          {GARDEN_BEDS.map(bed => {
            const bedPlants = plantsByBed.get(bed.bedIndex) ?? []
            const { cols, rows } = computeGridDimensions(bedPlants.length)
            const displayCols = Math.max(cols, 1)
            const displayRows = Math.max(rows, 1)
            return (
              <div key={bed.bedIndex} className="rounded-md border border-border p-2 bg-surface-raised/40">
                <p className="text-[10px] font-mono-data uppercase tracking-wider text-celeste mb-1.5">
                  {bed.label}
                </p>
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${displayCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${displayRows}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: displayRows * displayCols }, (_, i) => {
                    const row = Math.floor(i / displayCols)
                    const col = i % displayCols
                    const plant = bedPlants.find(p => p.cellRow === row && p.cellCol === col)
                    const isActive = plant && plant.assetId === activeId
                    return (
                      <button
                        key={`${bed.bedIndex}-${row}-${col}`}
                        type="button"
                        disabled={!plant}
                        onClick={() => plant && onSelect(plant.assetId === selectedAssetId ? null : plant.assetId)}
                        onMouseEnter={() => plant && onHover(plant.assetId)}
                        onMouseLeave={() => onHover(null)}
                        className={`h-4 rounded-sm transition-colors ${
                          plant
                            ? isActive
                              ? 'bg-celeste/60 ring-1 ring-celeste'
                              : 'bg-profit/40 hover:bg-profit/60'
                            : 'bg-border/30'
                        }`}
                        aria-label={plant ? plant.assetName : 'Celda vacía'}
                        title={plant?.assetName}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {plants.length > 0 && (
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {GARDEN_BEDS.map(bed => {
            const bedPlants = plantsByBed.get(bed.bedIndex) ?? []
            if (bedPlants.length === 0) return null
            return (
              <section key={bed.bedIndex} aria-label={`Cantero ${bed.label}`}>
                <h4 className="text-xs font-mono-data uppercase tracking-wider text-celeste mb-2">
                  {bed.label}
                </h4>
                <ul className="space-y-1">
                  {bedPlants.map(plant => {
                    const isSelected = plant.assetId === selectedAssetId
                    const isHovered = plant.assetId === hoveredAssetId
                    return (
                      <li key={plant.assetId}>
                        <button
                          type="button"
                          onClick={() => onSelect(isSelected ? null : plant.assetId)}
                          onMouseEnter={() => onHover(plant.assetId)}
                          onMouseLeave={() => onHover(null)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            isSelected || isHovered
                              ? 'bg-celeste/15 text-celeste border border-celeste/30'
                              : 'hover:bg-surface-raised text-paper border border-transparent'
                          }`}
                          aria-pressed={isSelected}
                        >
                          <span className="font-medium">{plant.assetName}</span>
                          <span className="text-muted ml-2 text-xs">
                            F{plant.cellRow + 1}·C{plant.cellCol + 1}
                          </span>
                          <span className={`ml-2 font-mono-data text-xs ${plant.plPctARS >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {formatPercentage(plant.plPctARS)}
                          </span>
                          <span className="text-subtle ml-2 text-xs">{formatCurrency(plant.currentValueARS, 'ARS')}</span>
                          <span className="block text-subtle text-[10px] mt-0.5">{SPECIES_LABELS[plant.species]}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
