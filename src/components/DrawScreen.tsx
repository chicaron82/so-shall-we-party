import { useState } from 'react';
import type { DrawnTicket, Event, TicketBatch } from '../types';
import { getDrawStage, isDuplicateRangeDraw } from '../lib/lookup';
import { prizeBadgeClass, prizeEmoji } from '../lib/prizeStyle';
import { batchDisplayName } from '../lib/batchName';
import { ProgressiveReveal } from './ProgressiveReveal';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  event: Event;
  onAddDraw: (eventId: string, draw: Omit<DrawnTicket, 'id' | 'drawnAt' | 'claimed'>) => void;
  onMarkClaimed: (eventId: string, drawId: string, claimed: boolean) => void;
  onBack: () => void;
}

export function DrawScreen({ event, onAddDraw, onMarkClaimed, onBack }: Props) {
  const [input, setInput] = useState('');
  const [scopeBatchId, setScopeBatchId] = useState<string | null>(null);
  const [dupWarn, setDupWarn] = useState<{ number: number; batchId: string; label: string } | null>(null);

  const stage = getDrawStage(input, event, scopeBatchId ?? undefined);
  const draws = event.draws ?? [];
  const unclaimed = draws.filter(d => !d.claimed).length;

  const selectScope = (id: string | null) => {
    setScopeBatchId(id);
    setInput(''); // reset the in-progress number when the prize on the line changes
  };

  const stageBatchName = stage.type === 'identified' || stage.type === 'winner'
    ? batchDisplayName(stage.batch, event.batches)
    : undefined;

  const commitWinner = (number: number, batch: TicketBatch) => {
    onAddDraw(event.id, {
      number,
      batchId: batch.id,
      batchName: batchDisplayName(batch, event.batches),
      prize: batch.prize,
      notes: batch.notes,
    });
    setInput('');
  };

  const handleConfirmWinner = () => {
    if (stage.type !== 'winner') return;
    const { number, batch } = stage;
    if (isDuplicateRangeDraw(event, batch.id, number)) {
      setDupWarn({ number, batchId: batch.id, label: batchDisplayName(batch, event.batches) });
      return;
    }
    commitWinner(number, batch);
  };

  const confirmDuplicate = () => {
    if (!dupWarn) return;
    const batch = event.batches.find(b => b.id === dupWarn.batchId);
    if (batch) commitWinner(dupWarn.number, batch);
    setDupWarn(null);
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

      {/* Scope selector — which prize are we calling? */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2 px-1">Drawing for</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <ScopePill
            label="All"
            active={scopeBatchId === null}
            onClick={() => selectScope(null)}
          />
          {event.batches.map(b => (
            <ScopePill
              key={b.id}
              label={`${b.prize ? prizeEmoji(b.prize) + ' ' : ''}${batchDisplayName(b, event.batches)}`}
              active={scopeBatchId === b.id}
              onClick={() => selectScope(b.id)}
            />
          ))}
        </div>
      </div>

      {/* Progressive entry */}
      <div className="px-5 pb-4">
        <ProgressiveReveal
          input={input}
          stage={stage}
          batchName={stageBatchName}
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
              <span className="font-medium text-slate-500">
                {b.prize ? `${prizeEmoji(b.prize)} ` : ''}{batchDisplayName(b, event.batches)}
              </span>
              <span>{b.type === 'range' ? `#${b.rangeStart}–${b.rangeEnd}` : `Card #${b.number}`}</span>
            </div>
          ))}
        </div>
      </div>

      {dupWarn && (
        <ConfirmDialog
          title="Already drawn"
          message={`#${dupWarn.number} was already drawn for ${dupWarn.label}. Log it again?`}
          confirmLabel="Log Anyway"
          onConfirm={confirmDuplicate}
          onCancel={() => setDupWarn(null)}
        />
      )}
    </div>
  );
}

function ScopePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition cursor-pointer ${
        active
          ? 'bg-purple-600 border-purple-500 text-white'
          : 'bg-[#16171f] border-[#2a2b38] text-slate-400 hover:border-purple-700'
      }`}
    >
      {label}
    </button>
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
              {prizeEmoji(draw.prize)} {draw.batchName}
            </span>
          )}
        </div>
        {draw.notes && <p className="text-xs text-slate-400 mt-1 truncate">{draw.notes}</p>}
        <p className="text-xs text-slate-500 mt-0.5 truncate">{!draw.prize ? draw.batchName + ' · ' : ''}{time}</p>
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
