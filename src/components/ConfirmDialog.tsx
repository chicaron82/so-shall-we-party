interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-6" onClick={onCancel}>
      <div
        className="w-full max-w-xs bg-[#16171f] border border-[#2a2b38] rounded-3xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-1.5 text-center">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          <p className="text-sm text-slate-400">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#2a2b38] text-slate-300 text-sm font-semibold hover:bg-[#1e1f2b] transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
