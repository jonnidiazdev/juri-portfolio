import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isQuoteCacheFresh, saveQuoteCacheBatch, getLocalQuoteCache } from './quoteCache'

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

describe('saveQuoteCacheBatch', () => {
  const ownerId = 'test-user'

  beforeEach(() => {
    localStorage.clear()
  })

  it('writes multiple entries to localStorage in one call', () => {
    saveQuoteCacheBatch(ownerId, [
      { type: 'arg', key: 'accion:GGAL', data: { price: 100 } },
      { type: 'arg', key: 'cedear:AAPL', data: { price: 200 } },
    ])

    const cache = getLocalQuoteCache(ownerId)
    expect(cache.arg_accion_ggal?.data).toEqual({ price: 100 })
    expect(cache.arg_cedear_aapl?.data).toEqual({ price: 200 })
  })
})
