interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="card p-5 text-center border-loss/30">
      <svg className="w-8 h-8 text-loss mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-muted text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary px-4 py-2 text-sm"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
