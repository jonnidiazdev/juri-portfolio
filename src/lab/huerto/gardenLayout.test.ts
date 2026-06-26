import { describe, it, expect } from 'vitest'
import {
  GARDEN_BEDS,
  cellSizeForGrid,
  computeGridDimensions,
  getBedForSpecies,
  layoutPlantsInBeds,
  positionsOverlap,
} from './gardenLayout'
import type { PlantBeforeLayout } from './gardenLayout'
import type { PlantState } from './portfolioMetaphor'

function makePlant(overrides: Partial<PlantBeforeLayout> & Pick<PlantBeforeLayout, 'assetId' | 'species'>): PlantBeforeLayout {
  return {
    assetId: overrides.assetId,
    assetName: overrides.assetName ?? `Asset ${overrides.assetId}`,
    species: overrides.species,
    health: overrides.health ?? 0.5,
    scale: overrides.scale ?? 1,
    wind: overrides.wind ?? 0,
    position: overrides.position ?? { x: 0, z: 0 },
    currentValueARS: overrides.currentValueARS ?? 1000,
    plPctARS: overrides.plPctARS ?? 0,
  }
}

describe('computeGridDimensions', () => {
  it('returns 0 for empty', () => {
    expect(computeGridDimensions(0)).toEqual({ cols: 0, rows: 0 })
  })

  it('uses square-ish grid', () => {
    expect(computeGridDimensions(4)).toEqual({ cols: 2, rows: 2 })
    expect(computeGridDimensions(5)).toEqual({ cols: 3, rows: 2 })
  })
})

describe('getBedForSpecies', () => {
  it('maps each species to a bed', () => {
    expect(getBedForSpecies('exotic').label).toBe('Cripto')
    expect(getBedForSpecies('native').bedIndex).toBe(1)
    expect(getBedForSpecies('slow').bedIndex).toBe(2)
    expect(getBedForSpecies('ground').bedIndex).toBe(3)
  })
})

describe('layoutPlantsInBeds', () => {
  it('places each species in its bed without overlap', () => {
    const plants: PlantBeforeLayout[] = [
      makePlant({ assetId: 1, species: 'exotic', currentValueARS: 5000 }),
      makePlant({ assetId: 2, species: 'exotic', currentValueARS: 10000 }),
      makePlant({ assetId: 3, species: 'native', currentValueARS: 3000 }),
      makePlant({ assetId: 4, species: 'ground', currentValueARS: 1000 }),
    ]

    const laidOut = layoutPlantsInBeds(plants)
    expect(laidOut).toHaveLength(4)

    const exotic = laidOut.filter(p => p.species === 'exotic')
    expect(exotic[0].assetId).toBe(2)
    expect(exotic[0].cellRow).toBe(0)
    expect(exotic[1].assetId).toBe(1)

    for (let i = 0; i < laidOut.length; i++) {
      for (let j = i + 1; j < laidOut.length; j++) {
        expect(positionsOverlap(laidOut[i].position, laidOut[j].position, 0.35)).toBe(false)
      }
    }
  })

  it('assigns stable bed indices', () => {
    const plants = GARDEN_BEDS.map((bed, i) =>
      makePlant({ assetId: i + 1, species: bed.species, currentValueARS: 1000 * (i + 1) })
    )
    const laidOut = layoutPlantsInBeds(plants)
    laidOut.forEach(p => {
      const bed = getBedForSpecies(p.species)
      expect(p.bedIndex).toBe(bed.bedIndex)
      expect(p.bedLabel).toBe(bed.label)
    })
  })
})

describe('cellSizeForGrid', () => {
  it('fits within bed size', () => {
    const size = cellSizeForGrid(3.5, 4, 4)
    expect(size).toBeLessThanOrEqual(0.9)
    expect(size * 4).toBeLessThanOrEqual(3.5)
  })
})
