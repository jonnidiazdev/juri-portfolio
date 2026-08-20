import type { ReactNode } from 'react'

type ModalHeaderTone = 'celeste' | 'loss' | 'profit' | 'peso'

const TONE_CLASSES: Record<ModalHeaderTone, string> = {
  celeste: 'bg-celeste/15 text-celeste',
  loss: 'bg-loss/15 text-loss',
  profit: 'bg-profit/15 text-profit',
  peso: 'bg-peso/15 text-peso',
}

interface ModalHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: string
  onClose?: () => void
  tone?: ModalHeaderTone
}

export default function ModalHeader({ icon, title, subtitle, onClose, tone = 'celeste' }: ModalHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3 mb-6">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${TONE_CLASSES[tone]}`}>
          {icon}
        </div>
        <div>
          <h2 className="font-chalk text-xl text-paper leading-tight">{title}</h2>
          {subtitle && <p className="text-subtle text-sm mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="text-subtle hover:text-paper transition-colors shrink-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
