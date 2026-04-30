export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-400 rounded-full animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-300 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
          <div>
            <div className="h-5 w-24 bg-slate-100 rounded mb-2"></div>
            <div className="h-4 w-16 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded"></div>
        <div className="h-4 bg-slate-100 rounded"></div>
      </div>
    </div>
  )
}
