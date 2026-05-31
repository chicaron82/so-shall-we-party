import { useState, useRef, useEffect } from 'react';
import type { Event } from '../types';
import { lookupTicket } from '../lib/lookup';
import { prizeBadgeClass, prizeEmoji } from '../lib/prizeStyle';

interface Props {
  event: Event;
  onBack: () => void;
}

export function DrawScreen({ event, onBack }: Props) {
  const [input, setInput]   = useState('');
  const [result, setResult] = useState<ReturnType<typeof lookupTicket> | null>(null);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleLookup = () => {
    if (!input.trim()) return;
    const res = lookupTicket(event, input);
    setResult(res);
    if (!res.found) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center bg-[#16171f] border border-[#2a2b38] rounded-full text-slate-300 cursor-pointer"
        >
          ‹
        </button>
        <div>
          <p className="text-xs text-slate-500">{event.name}</p>
          <h1 className="text-lg font-bold text-slate-100">Draw Time 🎲</h1>
        </div>
      </div>

      {/* Lookup */}
      <div className="flex-1 flex flex-col px-5 pt-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Enter Ticket Number</p>

        <div className={`flex gap-2 transition-transform ${shaking ? 'animate-[shake_0.4s_ease]' : ''}`}>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 45667"
            className="flex-1 bg-[#1e1f2b] border border-[#2a2b38] focus:border-purple-500 rounded-2xl px-5 py-4 text-2xl font-bold text-slate-100 text-center focus:outline-none transition"
          />
        </div>

        <button
          onClick={handleLookup}
          disabled={!input.trim()}
          className="mt-3 w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-2xl transition cursor-pointer"
        >
          Check
        </button>

        {/* Result */}
        {result && (
          <div className={`mt-8 rounded-3xl border p-6 text-center transition-all ${
            result.found
              ? 'bg-gradient-to-br from-purple-900/40 to-cyan-900/30 border-purple-500/40'
              : 'bg-[#1e1f2b] border-[#2a2b38]'
          }`}>
            {result.found ? (
              <>
                <div className="text-5xl mb-3 animate-bounce">🎉</div>
                <p className="text-xl font-bold text-white mb-1">Winner!</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3">
                  #{result.matchedNumber}
                </p>
                <div className="bg-black/30 rounded-2xl px-4 py-3 space-y-1">
                  <p className="text-sm font-bold text-slate-200">{result.batch?.label}</p>
                  {result.batch?.prize && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${prizeBadgeClass(result.batch.prize)}`}>
                      {prizeEmoji(result.batch.prize)} {result.batch.prize}
                    </span>
                  )}
                  {result.batch?.type === 'range' && (
                    <p className="text-xs text-slate-400">Range #{result.batch.rangeStart} – #{result.batch.rangeEnd}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-3">❌</div>
                <p className="text-base font-bold text-slate-300">No match</p>
                <p className="text-xs text-slate-500 mt-1">#{input} isn't in any batch for this event.</p>
              </>
            )}
          </div>
        )}

        {result && (
          <button
            onClick={handleReset}
            className="mt-4 w-full py-3 border border-[#2a2b38] hover:border-purple-700 text-slate-400 hover:text-slate-200 font-semibold text-sm rounded-2xl transition cursor-pointer"
          >
            Check Another Number
          </button>
        )}
      </div>

      {/* Batch reference */}
      <div className="px-5 pt-6 pb-10">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Batches</p>
        <div className="space-y-1">
          {event.batches.map(b => (
            <div key={b.id} className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium text-slate-400">{b.label}</span>
              <span>
                {b.type === 'range' ? `#${b.rangeStart}–${b.rangeEnd}` : `Card #${b.number}`}
                {b.prize && <span className="ml-2">{prizeEmoji(b.prize)} {b.prize}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
