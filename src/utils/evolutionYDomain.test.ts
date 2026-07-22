import { describe, expect, it } from 'vitest'
import { resolveEvolutionYDomain } from './evolutionYDomain'

describe('resolveEvolutionYDomain', () => {
  it('returns fixed 0-100 for percent stack', () => {
    expect(
      resolveEvolutionYDomain({
        isPercentStack: true,
        logScaleActive: false,
        yDomainMin: 10,
        yDomainMax: 90,
      })
    ).toEqual([0, 100])
  })

  it('returns auto domain for log scale', () => {
    expect(
      resolveEvolutionYDomain({
        isPercentStack: false,
        logScaleActive: true,
        yDomainMin: null,
        yDomainMax: null,
      })
    ).toEqual(['auto', 'auto'])
  })

  it('returns custom min and max when provided', () => {
    expect(
      resolveEvolutionYDomain({
        isPercentStack: false,
        logScaleActive: false,
        yDomainMin: 50_000_000,
        yDomainMax: 55_000_000,
      })
    ).toEqual([50_000_000, 55_000_000])
  })

  it('uses dataMin/dataMax for partial custom domain', () => {
    expect(
      resolveEvolutionYDomain({
        isPercentStack: false,
        logScaleActive: false,
        yDomainMin: null,
        yDomainMax: 55_000_000,
      })
    ).toEqual(['dataMin', 55_000_000])
  })

  it('falls back to padded auto domain when custom min >= max', () => {
    const domain = resolveEvolutionYDomain({
      isPercentStack: false,
      logScaleActive: false,
      yDomainMin: 60_000_000,
      yDomainMax: 50_000_000,
    })

    expect(domain).toHaveLength(2)
    expect(typeof domain?.[0]).toBe('function')
    expect(typeof domain?.[1]).toBe('function')
    expect((domain?.[0] as (min: number) => number)(50_000_000)).toBeLessThan(50_000_000)
    expect((domain?.[1] as (max: number) => number)(55_000_000)).toBeGreaterThan(55_000_000)
  })

  it('returns padded functions for default auto mode', () => {
    const domain = resolveEvolutionYDomain({
      isPercentStack: false,
      logScaleActive: false,
      yDomainMin: null,
      yDomainMax: null,
    })

    expect(domain).toHaveLength(2)
    expect(typeof domain?.[0]).toBe('function')
    expect(typeof domain?.[1]).toBe('function')

    const minFn = domain?.[0] as (min: number) => number
    const maxFn = domain?.[1] as (max: number) => number

    expect(minFn(50_000_000)).toBeCloseTo(47_500_000)
    expect(maxFn(55_000_000)).toBeCloseTo(57_750_000)
  })

  it('applies symmetric padding for negative values', () => {
    const domain = resolveEvolutionYDomain({
      isPercentStack: false,
      logScaleActive: false,
      yDomainMin: null,
      yDomainMax: null,
    })

    const minFn = domain?.[0] as (min: number) => number
    const maxFn = domain?.[1] as (max: number) => number

    expect(minFn(-1_000)).toBeCloseTo(-1_050)
    expect(maxFn(500)).toBeCloseTo(525)
  })
})
