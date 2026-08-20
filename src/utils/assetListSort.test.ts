import { describe, it, expect } from 'vitest'
import { ASSET_TYPES } from '../config/constants'
import type { Asset } from '../types'
import { compareAssetsByName, nextAssetSort, sortAssets } from './assetListSort'

function asset(partial: Partial<Asset> & Pick<Asset, 'id' | 'name'>): Asset {
  return {
    type: ASSET_TYPES.STOCK,
    amount: 1,
    currency: 'ARS',
    ...partial,
  }
}

describe('compareAssetsByName', () => {
  it('orders by visible name with Spanish locale', () => {
    const a = asset({ id: 1, name: 'Águila' })
    const b = asset({ id: 2, name: 'beta' })
    expect(compareAssetsByName(a, b)).toBeLessThan(0)
  })
})

describe('nextAssetSort', () => {
  it('activates name A–Z when switching to name', () => {
    expect(nextAssetSort('plPct', 'desc', 'name')).toEqual({ key: 'name', dir: 'asc' })
  })

  it('activates % ganancia high-to-low when switching to plPct', () => {
    expect(nextAssetSort('name', 'asc', 'plPct')).toEqual({ key: 'plPct', dir: 'desc' })
  })

  it('toggles direction when the active criterion is clicked', () => {
    expect(nextAssetSort('name', 'asc', 'name')).toEqual({ key: 'name', dir: 'desc' })
    expect(nextAssetSort('plPct', 'desc', 'plPct')).toEqual({ key: 'plPct', dir: 'asc' })
  })
})

describe('sortAssets', () => {
  const alfa = asset({ id: 1, name: 'Alfa' })
  const zeta = asset({ id: 2, name: 'Zeta' })
  const beta = asset({ id: 3, name: 'Beta' })
  const list = [zeta, alfa, beta]
  const plPctById = { 1: 10, 2: 10, 3: -5 }

  it('returns an empty list unchanged', () => {
    expect(sortAssets([], 'name', 'asc', {})).toEqual([])
  })

  it('sorts by name ascending and descending', () => {
    expect(sortAssets(list, 'name', 'asc', plPctById).map(a => a.name)).toEqual(['Alfa', 'Beta', 'Zeta'])
    expect(sortAssets(list, 'name', 'desc', plPctById).map(a => a.name)).toEqual(['Zeta', 'Beta', 'Alfa'])
  })

  it('sorts by profit % and breaks ties by name', () => {
    expect(sortAssets(list, 'plPct', 'desc', plPctById).map(a => a.name)).toEqual(['Alfa', 'Zeta', 'Beta'])
    expect(sortAssets(list, 'plPct', 'asc', plPctById).map(a => a.name)).toEqual(['Beta', 'Alfa', 'Zeta'])
  })

  it('treats missing profit % as zero', () => {
    const unknown = asset({ id: 9, name: 'Nulo' })
    const ordered = sortAssets([unknown, beta], 'plPct', 'desc', { 3: -5 })
    expect(ordered.map(a => a.name)).toEqual(['Nulo', 'Beta'])
  })
})
