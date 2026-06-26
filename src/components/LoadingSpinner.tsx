interface LoadingSpinnerProps {
  text?: string
}

export default function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-10 h-10 border-2 border-border border-t-celeste rounded-full animate-spin" aria-hidden="true" />
      {text && <p className="text-sm text-muted">{text}</p>}
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="card p-5 animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-raised rounded-full" />
          <div>
            <div className="h-5 w-24 bg-surface-raised rounded mb-2" />
            <div className="h-4 w-16 bg-surface-raised rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-surface-raised rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-surface-raised rounded" />
        <div className="h-4 bg-surface-raised rounded" />
      </div>
    </div>
  )
}
