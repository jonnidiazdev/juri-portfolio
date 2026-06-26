interface PortfolioSyncBannerProps {
  isSyncing: boolean
}

export default function PortfolioSyncBanner({ isSyncing }: PortfolioSyncBannerProps) {
  if (!isSyncing) return null

  return (
    <div
      className="status-banner mb-4 bg-celeste/10 border border-celeste/25 text-celeste"
      role="status"
      aria-live="polite"
    >
      <div className="w-4 h-4 border-2 border-celeste border-t-transparent rounded-full animate-spin shrink-0" aria-hidden="true" />
      <span>Cargando portfolio desde la nube… No edites hasta que termine.</span>
    </div>
  )
}
