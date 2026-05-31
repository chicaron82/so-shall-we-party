import { useState, useRef } from 'react';
import type { Event } from '../types';

interface Props {
  initial?: Event;
  onSubmit: (name: string, date: string, photo?: string) => void;
  onClose: () => void;
}

export function EventFormModal({ initial, onSubmit, onClose }: Props) {
  const editing = !!initial;
  const [name, setName]   = useState(initial?.name ?? '');
  const [date, setDate]   = useState(initial?.date ?? '');
  const [photo, setPhoto] = useState<string | undefined>(initial?.photo);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError('Event name is required.'); return; }
    if (!date)        { setError('Date is required.'); return; }
    onSubmit(name.trim(), date, photo);
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
          <h2 className="text-base font-bold text-slate-100">{editing ? 'Edit Event' : 'New Event'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer">✕</button>
        </div>

        {/* Photo upload / preview */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-32 rounded-2xl border-2 border-dashed border-[#2a2b38] hover:border-purple-700 transition cursor-pointer overflow-hidden"
        >
          {photo ? (
            <img src={photo} alt="Event header" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1">
              <span className="text-2xl">📸</span>
              <span className="text-xs text-slate-500">Tap to add event photo</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Event Name</label>
          <input className={inputCls} placeholder="UV7 Night" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400">Date</label>
          <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition cursor-pointer"
        >
          {editing ? 'Save Changes' : 'Create Event'}
        </button>
      </div>
    </div>
  );
}
