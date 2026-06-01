import { useRef, useState } from 'react';
import type { Event } from '../types';
import { serializeEvents, parseBackup } from '../lib/backup';
import { downloadJson, copyToClipboard, backupFilename } from '../lib/download';

interface Props {
  events: Event[];
  onImport: (incoming: Event[]) => void;
  onClose: () => void;
}

type Toast = { kind: 'ok' | 'err'; text: string };

export function BackupSheet({ events, onImport, onClose }: Props) {
  const [paste, setPaste] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 2500); };

  const handleDownload = () => {
    downloadJson(backupFilename('all'), serializeEvents(events));
    flash({ kind: 'ok', text: 'Backup file downloaded.' });
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(serializeEvents(events));
    flash(ok ? { kind: 'ok', text: 'Backup copied to clipboard.' } : { kind: 'err', text: 'Copy failed — try the download.' });
  };

  const restore = (raw: string) => {
    const result = parseBackup(raw);
    if ('error' in result) { flash({ kind: 'err', text: result.error }); return; }
    onImport(result.events);
    flash({ kind: 'ok', text: `Restored ${result.events.length} event${result.events.length !== 1 ? 's' : ''}.` });
    setPaste('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => restore(String(ev.target?.result ?? ''));
    reader.readAsText(file);
    e.target.value = ''; // allow re-importing the same file
  };

  const btn = 'flex-1 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#16171f] border border-[#2a2b38] rounded-t-3xl p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100">Backup &amp; Restore</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl cursor-pointer">✕</button>
        </div>

        {/* Export */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Export {events.length} event{events.length !== 1 ? 's' : ''}</p>
          <div className="flex gap-2">
            <button onClick={handleDownload} className={`${btn} bg-purple-600 hover:bg-purple-500 text-white`}>⬇ Download .json</button>
            <button onClick={handleCopy} className={`${btn} border border-[#2a2b38] text-slate-300 hover:border-purple-700`}>⧉ Copy</button>
          </div>
        </div>

        {/* Import */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Restore (merges by event)</p>
          <button
            onClick={() => fileRef.current?.click()}
            className={`${btn} w-full border border-[#2a2b38] text-slate-300 hover:border-purple-700`}
          >
            📂 Choose backup file
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
          <textarea
            value={paste}
            onChange={e => setPaste(e.target.value)}
            placeholder="…or paste backup JSON here"
            rows={3}
            className="w-full bg-[#1e1f2b] border border-[#2a2b38] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500 transition resize-none"
          />
          <button
            onClick={() => restore(paste)}
            disabled={!paste.trim()}
            className={`${btn} w-full bg-cyan-700 hover:bg-cyan-600 disabled:opacity-30 text-white`}
          >
            Restore from paste
          </button>
        </div>

        {toast && (
          <p className={`text-xs font-semibold text-center ${toast.kind === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
            {toast.text}
          </p>
        )}
      </div>
    </div>
  );
}
