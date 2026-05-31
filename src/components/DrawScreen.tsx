import { useState } from 'react';
import type { DrawnTicket, Event } from '../types';
import { getDrawStage } from '../lib/lookup';
import { prizeBadgeClass, prizeEmoji } from '../lib/prizeStyle';
import { ProgressiveReveal } from './ProgressiveReveal';

interface Props {
  event: Event;
  onAddDraw: (eventId: string, draw: Omit<DrawnTicket, 'id' | 'drawnAt' | 'claimed'>) => void;
  onMarkClaimed: (eventId: string, drawId: string, claimed: boolean) => void;
  onBack: () => void;
}

export function DrawScreen({ event, onAddDraw, onMarkClaimed, onBack }: Props) {
  const [input, setInput] = useState('');

  const stage = getDrawStage(input, event);
  const draws = event.draws ?? [];
  const unclaimed = draws.filter(d => !d.claimed).length;

  const handleConfirmWinner = () => {
    if (stage.type !== 'winner') return;
    onAddDraw(event.id, {
      number: stage.number,
      batchId: stage.batch.id,
      batchLabel: stage.batch.label,
      prize: stage.batch.prize,
    });
    setInput('');
  };

  const handleNoMatch = () => {
    // ProgressiveReveal handles the shake; just clear after a beat
    setTimeout(() => setInput(''), 500);
  };

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

      {/* Progressive entry */}
      <div className="px-5 pb-4">
        <ProgressiveReveal
          input={input}
          stage={stage}
          onChange={setInput}
          onConfirmWinner={handleConfirmWinner}
          onNoMatch={handleNoMatch}
        />
      </div>

      {/* Winners log */}
      <div className="flex-1 px-4 space-y-2 pb-8">
        {draws.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
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

      {/* Batch reference */}
      <div className="px-5 pt-2 pb-10 border-t border-[#1e1f2b]">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-2">Batches</p>
        <div className="space-y-1">
          {event.batches.map(b => (
            <div key={b.id} className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium text-slate-500">{b.label}</span>
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

function WinnerRow({ draw, onToggleClaimed }: { draw: DrawnTicket; onToggleClaimed: () => void }) {
  const time = new Date(draw.drawnAt).toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
      draw.claimed ? 'bg-[#13141a] border-[#1e1f2b] opacity-60' : 'bg-[#16171f] border-[#2a2b38]'
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
