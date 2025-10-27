export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
      <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-red-400 font-semibold text-lg mb-2">Error</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
