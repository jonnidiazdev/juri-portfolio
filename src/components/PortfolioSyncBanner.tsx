interface PortfolioSyncBannerProps {
  isSyncing: boolean
}

export default function PortfolioSyncBanner({ isSyncing }: PortfolioSyncBannerProps) {
  if (!isSyncing) return null

  return (
    <div
      className="mb-4 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sky-700 text-sm"
      role="status"
      aria-live="polite"
    >
      <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin shrink-0" />
      <span>Cargando portfolio desde la nube… No edites hasta que termine.</span>
    </div>
  )
}
