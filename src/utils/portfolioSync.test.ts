import { describe, it, expect } from 'vitest'
import {
  getScopedStorageKey,
  isEmptyValue,
  resolveInitialSync,
  shouldPushToRemote,
} from './portfolioSync'

describe('portfolioSync', () => {
  it('scopes localStorage keys per user', () => {
    expect(getScopedStorageKey('portfolio-assets', 'user-1')).toBe('portfolio-assets:user-1')
    expect(getScopedStorageKey('portfolio-assets', null)).toBe('portfolio-assets')
  })

  it('treats empty arrays as empty values', () => {
    expect(isEmptyValue([], [])).toBe(true)
    expect(isEmptyValue([{ id: 1 }], [])).toBe(false)
  })

  it('prefers remote data over empty local on new device', () => {
    const remote = [{ id: 1, name: 'GGAL' }]
    const result = resolveInitialSync(remote, [], [])

    expect(result.action).toBe('apply_remote')
    expect(result.value).toEqual(remote)
  })

  it('migrates non-empty local when remote is missing', () => {
    const local = [{ id: 2, name: 'BTC' }]
    const result = resolveInitialSync(undefined, local, [])

    expect(result.action).toBe('migrate_local')
    expect(result.value).toEqual(local)
  })

  it('uses initial value when both remote and local are empty', () => {
    const result = resolveInitialSync(undefined, [], [])

    expect(result.action).toBe('use_initial')
    expect(result.value).toEqual([])
  })

  it('blocks pushing empty portfolio before user edits', () => {
    expect(shouldPushToRemote([], [], true, false, false)).toBe(false)
  })

  it('allows pushing empty portfolio after explicit user edit', () => {
    expect(shouldPushToRemote([], [], true, true, false)).toBe(true)
  })

  it('blocks remote writes until sync is ready', () => {
    expect(shouldPushToRemote([{ id: 1 }], [], false, true, false)).toBe(false)
  })
})
