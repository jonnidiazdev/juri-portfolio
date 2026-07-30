import type { Asset } from '../types'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  asset: Asset | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteModal({ isOpen, asset, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  if (!isOpen || !asset) return null

  return (
    <div className="modal-overlay">
      <div className="modal-panel max-w-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-loss/15 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-loss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-paper">Eliminar activo</h2>
            <p className="text-subtle text-sm">Esta acción se puede deshacer por unos segundos.</p>
          </div>
        </div>

        <div className="mb-6 p-3 card-raised">
          <div className="text-paper font-semibold truncate">{asset.name}</div>
          <div className="text-sm text-muted font-mono-data">
            {asset.symbol && <span className="uppercase">{asset.symbol}</span>}
            {asset.amount != null && (
              <span>
                {asset.symbol ? ' · ' : ''}
                {asset.amount} {asset.currency || ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="btn-ghost flex-1 px-4 py-3">
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg font-semibold bg-loss text-ink hover:bg-loss/85 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
