const PADDING_RATIO = 0.05

export type EvolutionYAxisDomain =
  | [number, number]
  | ['auto', 'auto']
  | [string | number | ((min: number) => number), string | number | ((max: number) => number)]

export interface ResolveEvolutionYDomainOptions {
  isPercentStack: boolean
  logScaleActive: boolean
  yDomainMin: number | null
  yDomainMax: number | null
}

function withPadding(value: number, direction: 'min' | 'max'): number {
  if (value === 0) {
    return direction === 'min' ? -1 : 1
  }
  const delta = Math.abs(value) * PADDING_RATIO
  return direction === 'min' ? value - delta : value + delta
}

export function resolveEvolutionYDomain({
  isPercentStack,
  logScaleActive,
  yDomainMin,
  yDomainMax,
}: ResolveEvolutionYDomainOptions): EvolutionYAxisDomain | undefined {
  if (isPercentStack) {
    return [0, 100]
  }

  if (logScaleActive) {
    return ['auto', 'auto']
  }

  const hasCustomMin = yDomainMin !== null
  const hasCustomMax = yDomainMax !== null

  if (hasCustomMin || hasCustomMax) {
    if (hasCustomMin && hasCustomMax && yDomainMin >= yDomainMax) {
      return [
        (dataMin: number) => withPadding(dataMin, 'min'),
        (dataMax: number) => withPadding(dataMax, 'max'),
      ]
    }

    return [hasCustomMin ? yDomainMin : 'dataMin', hasCustomMax ? yDomainMax : 'dataMax']
  }

  return [
    (dataMin: number) => withPadding(dataMin, 'min'),
    (dataMax: number) => withPadding(dataMax, 'max'),
  ]
}
