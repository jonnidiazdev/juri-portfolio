import { Outlet } from 'react-router-dom'
import type { RefObject } from 'react'
import { signOutGoogle } from '../config/firebase'
import type { PortfolioOutletContext } from '../hooks/usePortfolioOutletContext'
import AppNav from './AppNav'
import IOLSessionStatus from './IOLSessionStatus'
import PortfolioSyncBanner from './PortfolioSyncBanner'

interface AppLayoutProps {
  user: PortfolioOutletContext['user']
  outletContext: PortfolioOutletContext
  isCloudSyncing: boolean
  syncError: string | null
  iolAuthError: string | null
  onDismissSyncError: () => void
  onDismissIolError: () => void
  onOpenSettings: () => void
  onOpenAddAsset: () => void
  hideValues: boolean
  onToggleHideValues: () => void
  addButtonRef: RefObject<HTMLButtonElement | null>
}

export default function AppLayout({
  user,
  outletContext,
  isCloudSyncing,
  syncError,
  iolAuthError,
  onDismissSyncError,
  onDismissIolError,
  onOpenSettings,
  onOpenAddAsset,
  hideValues,
  onToggleHideValues,
  addButtonRef,
}: AppLayoutProps) {
  const userName = user?.displayName || 'Usuario'
  const userEmail = user?.email || ''
  const userPhoto = user?.photoURL || ''

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
      <header className="mb-8">
        <div className="mb-4">
          <p className="text-celeste text-xs font-mono-data uppercase tracking-widest mb-2">Observatorio financiero</p>
          <h1 className="font-chalk text-3xl sm:text-4xl text-paper mb-1">
            El Juri-Portfolio
          </h1>
          <p className="text-muted text-sm sm:text-base">
            Gestión de inversiones del jurio
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 min-w-0">
            <div className="flex items-center gap-3 px-3 py-2 card max-w-xs min-w-0">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName}
                  className="w-8 h-8 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-celeste/15 text-celeste flex items-center justify-center text-xs font-bold shrink-0">
                  {userName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-paper truncate">{userName}</p>
                <p className="text-xs text-subtle truncate">{userEmail}</p>
              </div>
            </div>

            <AppNav />
          </div>

          <div className="flex flex-wrap gap-2 lg:ml-auto">
            <button
              onClick={signOutGoogle}
              className="btn-ghost px-4 py-3"
              title={userEmail || 'Cerrar sesión'}
            >
              Salir
            </button>
            <button
              onClick={onToggleHideValues}
              className="btn-ghost px-4 py-3 flex items-center gap-2"
              title={hideValues ? 'Mostrar montos' : 'Ocultar montos'}
              aria-label={hideValues ? 'Mostrar montos' : 'Ocultar montos'}
            >
              {hideValues ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={onOpenSettings}
              className="btn-ghost px-4 py-3 flex items-center gap-2"
              title="Configuración"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              ref={addButtonRef}
              onClick={onOpenAddAsset}
              disabled={isCloudSyncing}
              className="btn-primary px-4 sm:px-6 py-3 flex items-center gap-2 justify-center flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Agregar activo</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          </div>
        </div>

        <IOLSessionStatus />
        <PortfolioSyncBanner isSyncing={isCloudSyncing} />

        {syncError && (
          <div className="status-banner mb-4 bg-peso/10 border border-peso/25 text-peso justify-between">
            <span>{syncError}</span>
            <button onClick={onDismissSyncError} aria-label="Descartar aviso" className="text-peso/70 hover:text-peso shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {iolAuthError && (
          <div className="status-banner mb-4 bg-loss/10 border border-loss/25 text-loss justify-between">
            <span>{iolAuthError}</span>
            <button onClick={onDismissIolError} aria-label="Descartar aviso" className="text-loss/70 hover:text-loss shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </header>

      <Outlet context={outletContext} />
    </div>
  )
}
