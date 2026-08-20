import type { Asset } from '../types'

export type AssetSortKey = 'name' | 'plPct'
export type AssetSortDir = 'asc' | 'desc'

export function compareAssetsByName(a: Asset, b: Asset): number {
  return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' })
}

export function nextAssetSort(
  currentKey: AssetSortKey,
  currentDir: AssetSortDir,
  clickedKey: AssetSortKey
): { key: AssetSortKey; dir: AssetSortDir } {
  if (clickedKey !== currentKey) {
    return { key: clickedKey, dir: clickedKey === 'plPct' ? 'desc' : 'asc' }
  }
  return { key: currentKey, dir: currentDir === 'asc' ? 'desc' : 'asc' }
}

export function sortAssets(
  assets: Asset[],
  key: AssetSortKey,
  dir: AssetSortDir,
  plPctById: Record<number, number>
): Asset[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...assets].sort((a, b) => {
    if (key === 'plPct') {
      const pctA = plPctById[a.id] ?? 0
      const pctB = plPctById[b.id] ?? 0
      const diff = pctA - pctB
      if (diff !== 0) return diff * sign
    }
    return compareAssetsByName(a, b) * (key === 'name' ? sign : 1)
  })
}
