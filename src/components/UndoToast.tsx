interface UndoToastProps {
  message: string
  onUndo: () => void
}

export default function UndoToast({ message, onUndo }: UndoToastProps) {
  return (
    <div className="fixed bottom-4 left-4 card px-4 py-3 flex items-center gap-3 z-40 animate-fade-in">
      <span className="text-sm text-paper">{message}</span>
      <button
        type="button"
        onClick={onUndo}
        className="text-sm font-semibold text-celeste hover:text-[#7ec0db] transition-colors shrink-0"
      >
        Deshacer
      </button>
    </div>
  )
}
