import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isQuoteCacheFresh } from './quoteCache'

describe('isQuoteCacheFresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-26T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true when cache is within max age', () => {
    const fetchedAt = new Date('2026-06-26T11:58:00Z').toISOString()
    expect(isQuoteCacheFresh(fetchedAt, 300_000)).toBe(true)
  })

  it('returns false when cache is older than max age', () => {
    const fetchedAt = new Date('2026-06-26T11:50:00Z').toISOString()
    expect(isQuoteCacheFresh(fetchedAt, 300_000)).toBe(false)
  })

  it('returns false when fetchedAt is missing', () => {
    expect(isQuoteCacheFresh(null, 300_000)).toBe(false)
  })
})
