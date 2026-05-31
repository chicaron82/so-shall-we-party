import { useState, useRef, useEffect } from 'react';
import type { DrawnTicket, Event } from '../types';
import { lookupTicket } from '../lib/lookup';
import { prizeBadgeClass, prizeEmoji } from '../lib/prizeStyle';

interface Props {
  event: Event;
  onAddDraw: (eventId: string, draw: Omit<DrawnTicket, 'id' | 'drawnAt' | 'claimed'>) => void;
  onMarkClaimed: (eventId: string, drawId: string, claimed: boolean) => void;
  onBack: () => void;
}

type FlashState = 'none' | 'nomatch';

export function DrawScreen({ event, onAddDraw, onMarkClaimed, onBack }: Props) {
  const [input, setInput]       = useState('');
  const [flash, setFlash]       = useState<FlashState>('none');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const triggerFlash = () => {
    setFlash('nomatch');
    setTimeout(() => setFlash('none'), 1400);
  };

  const handleDraw = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const result = lookupTicket(event, trimmed);
    setInput('');
    if (result.found && result.batch) {
      onAddDraw(event.id, {
        number: result.matchedNumber!,
        batchId: result.batch.id,
        batchLabel: result.batch.label,
        prize: result.batch.prize,
      });
    } else {
      triggerFlash();
    }
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleDraw();
  };

  const draws = event.draws ?? [];
  const unclaimed = draws.filter(d => !d.claimed).length;

  const inputBorder = flash === 'nomatch'
    ? 'border-red-500 bg-red-900/20'
    : 'border-[#2a2b38] focus:border-purple-500';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center bg-[#16171f] border border-[#2a2b38] rounded-full text-slate-300 cursor-pointer shrink-0"
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 truncate">{event.name}</p>
          <h1 className="text-lg font-bold text-slate-100">Draw Time 🎲</h1>
        </div>
        {unclaimed > 0 && (
          <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {unclaimed} outstanding
          </span>
        )}
      </div>

      {/* Entry bar */}
      <div className="px-5 pb-4 flex gap-2">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={input}
          onChange={e => { setInput(e.target.value); setFlash('none'); }}
          onKeyDown={handleKeyDown}
          placeholder="Ticket number…"
          className={`flex-1 bg-[#1e1f2b] border rounded-2xl px-5 py-4 text-2xl font-bold text-slate-100 text-center focus:outline-none transition ${inputBorder}`}
        />
        <button
          onClick={handleDraw}
          disabled={!input.trim()}
          className="px-5 py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-2xl transition cursor-pointer shrink-0"
        >
          Draw
        </button>
      </div>

      {flash === 'nomatch' && (
        <p className="text-center text-sm text-red-400 font-semibold pb-3 animate-pulse">
          ❌ No match — keep drawing
        </p>
      )}

      {/* Winners log */}
      <div className="flex-1 px-4 space-y-2 pb-8">
        {draws.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <span className="text-3xl">🥁</span>
            <p className="text-sm text-slate-500">No winners drawn yet.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Winners — {draws.length} drawn
            </p>
            {draws.map(draw => (
              <WinnerRow
                key={draw.id}
                draw={draw}
                onToggleClaimed={() => onMarkClaimed(event.id, draw.id, !draw.claimed)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function WinnerRow({ draw, onToggleClaimed }: { draw: DrawnTicket; onToggleClaimed: () => void }) {
  const time = new Date(draw.drawnAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
      draw.claimed
        ? 'bg-[#13141a] border-[#1e1f2b] opacity-60'
        : 'bg-[#16171f] border-[#2a2b38]'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-lg font-black ${draw.claimed ? 'text-slate-500' : 'text-white'}`}>
            #{draw.number}
          </span>
          {draw.prize && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prizeBadgeClass(draw.prize)}`}>
              {prizeEmoji(draw.prize)} {draw.prize}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{draw.batchLabel} · {time}</p>
      </div>
      <button
        onClick={onToggleClaimed}
        className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
          draw.claimed
            ? 'border-green-800 text-green-600 hover:border-green-600 hover:text-green-400'
            : 'border-purple-700 text-purple-300 hover:border-purple-500 hover:bg-purple-900/20'
        }`}
      >
        {draw.claimed ? '✓ Claimed' : 'Claim'}
      </button>
    </div>
  );
}
