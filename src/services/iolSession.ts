export const IOL_SESSION_CHANGED = 'iol-session-changed'

export function notifyIOLSessionChanged(reason?: 'expired' | 'logout'): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(IOL_SESSION_CHANGED, { detail: { reason } }))
}

export function clearIOLSession(reason: 'expired' | 'logout' = 'logout'): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('iol-session-token')
  notifyIOLSessionChanged(reason)
}

export function setIOLSession(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('iol-session-token', token)
  notifyIOLSessionChanged()
}

export function hasIOLSession(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('iol-session-token')
}
