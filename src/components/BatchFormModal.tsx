import { useState } from 'react';
import type { BatchType, TicketBatch } from '../types';

interface Props {
  onAdd: (batch: Omit<TicketBatch, 'id'>) => void;
  onClose: () => void;
}

export function BatchFormModal({ onAdd, onClose }: Props) {
  const [type, setType]       = useState<BatchType>('range');
  const [label, setLabel]     = useState('');
  const [prize, setPrize]     = useState('');
  const [rangeStart, setStart] = useState('');
  const [rangeEnd, setEnd]     = useState('');
  const [cardNum, setCardNum]  = useState('');
  const [qty, setQty]          = useState('');
  const [error, setError]      = useState('');

  const handleAdd = () => {
    setError('');
    if (!label.trim()) { setError('Label is required.'); return; }

    if (type === 'range') {
      const start = parseInt(rangeStart, 10);
      const end   = parseInt(rangeEnd, 10);
      if (isNaN(start) || isNaN(end)) { setError('Enter valid start and end numbers.'); return; }
      if (end < start) { setError('End must be ≥ start.'); return; }
      onAdd({ type, label: label.trim(), prize: prize.trim() || undefined, rangeStart: start, rangeEnd: end });
    } else {
      const number   = parseInt(cardNum, 10);
      const quantity = parseInt(qty, 10);
      if (isNaN(number)) { setError('Enter a valid card number.'); return; }
      onAdd({ type, label: label.trim(), prize: prize.trim() || undefined, number, quantity: isNaN(quantity) ? 1 : quantity });
    }
    onClose();
  };

  const inputCls = 'w-full bg-[#1e1f2b] border border-[#2a2b38] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#16171f] border border-[#2a2b38] rounded-t-3xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">Add Ticket Batch</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer">✕</button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          {(['range', 'card'] as BatchType[]).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                type === t
                  ? 'bg-purple-600 text-white'
                  : 'border border-[#2a2b38] text-slate-400 hover:border-purple-700'
              }`}
            >
              {t === 'range' ? 'Range Batch' : 'Card Style'}
            </button>
          ))}
        </div>

        {/* Label */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Label</label>
          <input
            className={inputCls}
            placeholder='e.g. Batch 1, Blue, Golden Ticket'
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
        </div>

        {/* Prize (optional) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Prize <span className="text-slate-600">(optional)</span></label>
          <input
            className={inputCls}
            placeholder='e.g. Grand Prize, 2nd Prize'
            value={prize}
            onChange={e => setPrize(e.target.value)}
          />
        </div>

        {type === 'range' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Start #</label>
              <input type="number" className={inputCls} placeholder="45660" value={rangeStart} onChange={e => setStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">End #</label>
              <input type="number" className={inputCls} placeholder="45679" value={rangeEnd} onChange={e => setEnd(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Card Number</label>
              <input type="number" className={inputCls} placeholder="007" value={cardNum} onChange={e => setCardNum(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Qty <span className="text-slate-600">(optional)</span></label>
              <input type="number" className={inputCls} placeholder="10" value={qty} onChange={e => setQty(e.target.value)} />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleAdd}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
        >
          Add Batch
        </button>
      </div>
    </div>
  );
}
