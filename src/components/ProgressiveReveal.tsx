import { useRef, useEffect, useState } from 'react';
import type { DrawStage } from '../lib/lookup';
import { prizeBadgeClass, prizeEmoji } from '../lib/prizeStyle';

interface Props {
  input: string;
  stage: DrawStage;
  onChange: (val: string) => void;
  onConfirmWinner: () => void;
  onNoMatch: () => void;
}

const STAGE_CONFIG = {
  idle:       { border: 'border-[#2a2b38]',    glow: '',                      label: '',                           labelColor: '' },
  eliminated: { border: 'border-red-500',       glow: '',                      label: '✗  Not a winner — keep drawing', labelColor: 'text-red-400' },
  possible:   { border: 'border-yellow-500/70', glow: 'animate-neon-gold',    label: "You're in it... 🎟️",           labelColor: 'text-yellow-400' },
} as const;

function identifiedConfig(digitsLeft: number, guaranteed: boolean) {
  if (guaranteed)    return { border: 'border-green-400',  glow: 'animate-neon-green',  label: "It's basically yours! 🔥🔥🔥", labelColor: 'text-green-300' };
  if (digitsLeft <= 1) return { border: 'border-orange-400', glow: 'animate-neon-orange', label: 'Almost there...!!!',            labelColor: 'text-orange-300' };
  return               { border: 'border-yellow-400',  glow: 'animate-neon-gold',  label: 'Getting closer... 🔥🔥',         labelColor: 'text-yellow-300' };
}

export function ProgressiveReveal({ input, stage, onChange, onConfirmWinner, onNoMatch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);
  const [winnerVisible, setWinnerVisible] = useState(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (stage.type === 'eliminated' && input) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [stage.type, input]);

  useEffect(() => {
    setWinnerVisible(stage.type === 'winner');
  }, [stage.type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if (stage.type === 'winner') { onConfirmWinner(); }
    else if (input.trim())       { onNoMatch(); }
  };

  const cfg = stage.type === 'identified'
    ? identifiedConfig(stage.digitsLeft, stage.guaranteed)
    : stage.type === 'winner'
    ? { border: 'border-green-400', glow: 'animate-neon-green', label: '', labelColor: '' }
    : STAGE_CONFIG[stage.type as keyof typeof STAGE_CONFIG] ?? STAGE_CONFIG.idle;

  const batch = stage.type === 'identified' || stage.type === 'winner' ? stage.batch : null;

  return (
    <div className="space-y-3">
      {/* Input field */}
      <div className={`relative rounded-2xl transition-all duration-200 ${cfg.glow} ${shaking ? 'animate-shake' : ''}`}>
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={input}
          onChange={e => { onChange(e.target.value); }}
          onKeyDown={handleKeyDown}
          placeholder="Ticket number…"
          className={`w-full bg-[#1e1f2b] border-2 ${cfg.border} rounded-2xl px-5 py-5 text-3xl font-black text-slate-100 text-center focus:outline-none transition-colors duration-200`}
        />
      </div>

      {/* Stage label */}
      {cfg.label && (
        <p className={`text-center text-sm font-semibold ${cfg.labelColor} transition-all`}>
          {cfg.label}
        </p>
      )}

      {/* Batch card — appears once identified */}
      {batch && !winnerVisible && (
        <div className={`rounded-2xl border px-4 py-3 transition-all duration-300 ${
          stage.type === 'identified' && stage.guaranteed
            ? 'bg-green-900/20 border-green-700/50'
            : stage.type === 'identified' && stage.digitsLeft <= 1
            ? 'bg-orange-900/20 border-orange-700/50'
            : 'bg-[#1e1f2b] border-[#2a2b38]'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-200">{batch.label}</span>
            {batch.prize && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prizeBadgeClass(batch.prize)}`}>
                {prizeEmoji(batch.prize)} {batch.prize}
              </span>
            )}
          </div>
          {batch.type === 'range' && (
            <p className="text-xs text-slate-500 mt-0.5">#{batch.rangeStart} – #{batch.rangeEnd}</p>
          )}
        </div>
      )}

      {/* Winner reveal */}
      {winnerVisible && stage.type === 'winner' && (
        <div className="animate-winner-pop rounded-3xl border border-green-500/40 bg-gradient-to-br from-purple-900/40 to-cyan-900/30 px-4 py-5 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <p className="text-xl font-black text-white">Winner!</p>
          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            #{stage.number}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-200">{stage.batch.label}</span>
            {stage.batch.prize && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${prizeBadgeClass(stage.batch.prize)}`}>
                {prizeEmoji(stage.batch.prize)} {stage.batch.prize}
              </span>
            )}
          </div>
          <button
            onClick={onConfirmWinner}
            className="mt-1 w-full py-3 bg-green-600 hover:bg-green-500 active:scale-95 text-white font-bold rounded-2xl transition cursor-pointer"
          >
            🎟️ Log Winner
          </button>
        </div>
      )}

      {/* Draw / no-match button — shown when no winner state */}
      {!winnerVisible && (
        <button
          onClick={() => {
            if (stage.type === 'winner') { onConfirmWinner(); }
            else if (input.trim())       { onNoMatch(); }
          }}
          disabled={!input.trim()}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold rounded-2xl transition cursor-pointer"
        >
          Draw
        </button>
      )}
    </div>
  );
}
