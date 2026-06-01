import { useState } from 'react';
import type { BatchType, TicketBatch } from '../types';

interface Props {
  initial?: TicketBatch;
  onSubmit: (batch: Omit<TicketBatch, 'id'>) => void;
  onClose: () => void;
}

const PRIZE_PRESETS = [
  { label: 'Regular',       emoji: '🎟️',  style: 'border-slate-600 text-slate-300 hover:border-slate-400'  },
  { label: 'Grand Prize',   emoji: '🏆',  style: 'border-amber-600 text-amber-300 hover:border-amber-400'   },
  { label: 'Door Prize',    emoji: '🚪',  style: 'border-green-700 text-green-300 hover:border-green-500'   },
  { label: 'Golden Ticket', emoji: '✨',  style: 'border-yellow-500 text-yellow-300 hover:border-yellow-400' },
  { label: 'Booze Wagon',   emoji: '🍾',  style: 'border-cyan-700 text-cyan-300 hover:border-cyan-500'      },
  { label: '50/50',         emoji: '🎲',  style: 'border-pink-700 text-pink-300 hover:border-pink-500'      },
] as const;

const PRIZE_ACTIVE: Record<string, string> = {
  'Regular':       'bg-slate-700 text-white border-slate-500',
  'Grand Prize':   'bg-amber-600 text-white border-amber-500',
  'Door Prize':    'bg-green-700 text-white border-green-500',
  'Golden Ticket': 'bg-yellow-500 text-black border-yellow-400',
  'Booze Wagon':   'bg-cyan-700 text-white border-cyan-500',
  '50/50':         'bg-pink-700 text-white border-pink-500',
};

export function BatchFormModal({ initial, onSubmit, onClose }: Props) {
  const editing = !!initial;
  const [type, setType]       = useState<BatchType>(initial?.type ?? 'range');
  const [label, setLabel]     = useState(initial?.label ?? '');
  const [prize, setPrize]     = useState(initial?.prize ?? '');
  const [rangeStart, setStart] = useState(initial?.rangeStart != null ? String(initial.rangeStart) : '');
  const [rangeEnd, setEnd]     = useState(initial?.rangeEnd != null ? String(initial.rangeEnd) : '');
  const [cardNum, setCardNum]  = useState(initial?.number != null ? String(initial.number) : '');
  const [error, setError]      = useState('');

  const handleSubmit = () => {
    setError('');
    if (!label.trim()) { setError('Label is required.'); return; }

    if (type === 'range') {
      const start = parseInt(rangeStart, 10);
      const end   = parseInt(rangeEnd, 10);
      if (isNaN(start) || isNaN(end)) { setError('Enter valid start and end numbers.'); return; }
      if (end < start) { setError('End must be ≥ start.'); return; }
      onSubmit({ type, label: label.trim(), prize: prize || undefined, rangeStart: start, rangeEnd: end });
    } else {
      const number = parseInt(cardNum, 10);
      if (isNaN(number)) { setError('Enter a valid card number.'); return; }
      onSubmit({ type, label: label.trim(), prize: prize || undefined, number });
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
          <h2 className="text-base font-bold text-slate-100">{editing ? 'Edit Batch' : 'Add Ticket Batch'}</h2>
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

        {/* Prize presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400">Prize Type <span className="text-slate-600">(optional)</span></label>
          <div className="grid grid-cols-3 gap-2">
            {PRIZE_PRESETS.map(p => {
              const active = prize === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPrize(active ? '' : p.label)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    active ? PRIZE_ACTIVE[p.label] : p.style
                  }`}
                >
                  {p.emoji} {p.label}
                </button>
              );
            })}
          </div>
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
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Card Number</label>
            <input type="number" className={inputCls} placeholder="0001" value={cardNum} onChange={e => setCardNum(e.target.value)} />
            <p className="text-[11px] text-slate-600">The single number printed across the sheet (e.g. silent-auction tickets).</p>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
        >
          {editing ? 'Save Changes' : 'Add Batch'}
        </button>
      </div>
    </div>
  );
}
