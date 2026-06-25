export function getScopedStorageKey(key: string, ownerId: string | null): string {
  return ownerId ? `${key}:${ownerId}` : key
}

export function isEmptyValue<T>(value: T, initialValue: T): boolean {
  if (value === initialValue) return true
  if (Array.isArray(value) && Array.isArray(initialValue)) {
    return value.length === 0 && initialValue.length === 0
  }
  if (value === null || value === undefined) return true
  return false
}

export type InitialSyncAction = 'apply_remote' | 'migrate_local' | 'use_initial'

export interface InitialSyncResult<T> {
  action: InitialSyncAction
  value: T
}

export function resolveInitialSync<T>(
  remoteValue: T | undefined,
  localValue: T,
  initialValue: T
): InitialSyncResult<T> {
  if (remoteValue !== undefined) {
    return { action: 'apply_remote', value: remoteValue }
  }

  if (!isEmptyValue(localValue, initialValue)) {
    return { action: 'migrate_local', value: localValue }
  }

  return { action: 'use_initial', value: initialValue }
}

export function shouldPushToRemote<T>(
  value: T,
  initialValue: T,
  syncReady: boolean,
  userEdited: boolean,
  skipRemoteWrite: boolean
): boolean {
  if (!syncReady || skipRemoteWrite) return false
  if (!userEdited && isEmptyValue(value, initialValue)) return false
  return true
}
