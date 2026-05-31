export const PRIZE_BADGE: Record<string, { bg: string; text: string; border: string; emoji: string }> = {
  'Regular':       { bg: 'bg-slate-800',    text: 'text-slate-300',  border: 'border-slate-600',  emoji: '🎟️' },
  'Grand Prize':   { bg: 'bg-amber-900/40', text: 'text-amber-300',  border: 'border-amber-600',  emoji: '🏆' },
  'Door Prize':    { bg: 'bg-green-900/40', text: 'text-green-300',  border: 'border-green-700',  emoji: '🚪' },
  'Golden Ticket': { bg: 'bg-yellow-900/40',text: 'text-yellow-300', border: 'border-yellow-500', emoji: '✨' },
  'Booze Wagon':   { bg: 'bg-cyan-900/40',  text: 'text-cyan-300',   border: 'border-cyan-700',   emoji: '🍾' },
  '50/50':         { bg: 'bg-pink-900/40',  text: 'text-pink-300',   border: 'border-pink-700',   emoji: '🎲' },
};

export function prizeBadgeClass(prize: string): string {
  const s = PRIZE_BADGE[prize];
  if (!s) return 'bg-slate-800 text-slate-300 border-slate-600';
  return `${s.bg} ${s.text} ${s.border}`;
}

export function prizeEmoji(prize: string): string {
  return PRIZE_BADGE[prize]?.emoji ?? '🎁';
}
