import Modal from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} layer="nested">
      <p className="text-muted text-sm mb-6">{message}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="btn-ghost flex-1 px-4 py-3">
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className={
            variant === 'danger'
              ? 'flex-1 px-4 py-3 border border-loss/30 text-loss hover:bg-loss/10 rounded-lg font-semibold transition-colors'
              : 'btn-primary flex-1 px-4 py-3'
          }
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
