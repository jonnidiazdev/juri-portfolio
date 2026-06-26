import type { PlantSpecies, PlantState } from './portfolioMetaphor'

export interface GardenBed {
  species: PlantSpecies
  label: string
  bedIndex: number
  centerX: number
  centerZ: number
  size: number
}

export const GARDEN_BEDS: GardenBed[] = [
  { species: 'exotic', label: 'Cripto', bedIndex: 0, centerX: -2.15, centerZ: -2.15, size: 3.5 },
  { species: 'native', label: 'Argentinos', bedIndex: 1, centerX: 2.15, centerZ: -2.15, size: 3.5 },
  { species: 'slow', label: 'Plazo fijo', bedIndex: 2, centerX: -2.15, centerZ: 2.15, size: 3.5 },
  { species: 'ground', label: 'Efectivo', bedIndex: 3, centerX: 2.15, centerZ: 2.15, size: 3.5 },
]

export const PLOT_WIDTH = 10
export const PLOT_DEPTH = 8
export const MAX_CELL_SIZE = 0.9

export type PlantBeforeLayout = Omit<PlantState, 'bedIndex' | 'bedLabel' | 'cellRow' | 'cellCol'>

export function getBedForSpecies(species: PlantSpecies): GardenBed {
  const bed = GARDEN_BEDS.find(b => b.species === species)
  if (!bed) throw new Error(`No bed for species: ${species}`)
  return bed
}

export function computeGridDimensions(count: number): { cols: number; rows: number } {
  if (count <= 0) return { cols: 0, rows: 0 }
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  return { cols, rows }
}

export function cellSizeForGrid(bedSize: number, cols: number, rows: number): number {
  if (cols === 0 || rows === 0) return MAX_CELL_SIZE
  const fit = bedSize / Math.max(cols, rows)
  return Math.min(MAX_CELL_SIZE, fit * 0.92)
}

export function cellToWorldPosition(
  bed: GardenBed,
  row: number,
  col: number,
  cols: number,
  rows: number,
  cellSize: number
): { x: number; z: number } {
  const gridWidth = cols * cellSize
  const gridDepth = rows * cellSize
  const startX = bed.centerX - gridWidth / 2 + cellSize / 2
  const startZ = bed.centerZ + gridDepth / 2 - cellSize / 2
  return {
    x: startX + col * cellSize,
    z: startZ - row * cellSize,
  }
}

export function layoutPlantsInBeds(plants: PlantBeforeLayout[]): PlantState[] {
  const bySpecies = new Map<PlantSpecies, PlantBeforeLayout[]>()
  for (const plant of plants) {
    const list = bySpecies.get(plant.species) ?? []
    list.push(plant)
    bySpecies.set(plant.species, list)
  }

  const laidOut: PlantState[] = []

  for (const bed of GARDEN_BEDS) {
    const bedPlants = (bySpecies.get(bed.species) ?? []).sort(
      (a, b) => b.currentValueARS - a.currentValueARS
    )
    const { cols, rows } = computeGridDimensions(bedPlants.length)
    const cellSize = cellSizeForGrid(bed.size, cols, rows)

    bedPlants.forEach((plant, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      const pos = cellToWorldPosition(bed, row, col, cols, rows, cellSize)

      laidOut.push({
        ...plant,
        position: pos,
        bedIndex: bed.bedIndex,
        bedLabel: bed.label,
        cellRow: row,
        cellCol: col,
      })
    })
  }

  return laidOut
}

export function positionsOverlap(a: { x: number; z: number }, b: { x: number; z: number }, minDist = 0.5): boolean {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dz * dz) < minDist
}
