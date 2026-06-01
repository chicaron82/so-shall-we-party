import { describe, it, expect } from 'vitest';
import { lookupTicket, getDrawStage } from './lookup';
import type { Event, TicketBatch } from '../types';

// ── Builders ──────────────────────────────────────────────────────────────────

// `id` doubles as a human-readable handle in these tests (assertions check batch.id).
function range(id: string, start: number, end: number, prize?: string): TicketBatch {
  return { id, type: 'range', rangeStart: start, rangeEnd: end, prize };
}
function card(id: string, number: number, prize?: string): TicketBatch {
  return { id, type: 'card', number, prize };
}
function event(batches: TicketBatch[]): Event {
  return { id: 'e1', name: 'Test', date: '2026-05-31', batches, draws: [], createdAt: '2026-05-31T00:00:00' };
}

// The canonical example from the build: range 12341–12360, winner 12345.
const yello = range('yello', 12341, 12360, 'Grand Prize');

// ── lookupTicket (post-draw verification) ──────────────────────────────────────

describe('lookupTicket', () => {
  const e = event([yello, card('Golden', 7, 'Golden Ticket')]);

  it('returns not-found for empty or non-numeric input', () => {
    expect(lookupTicket(e, '').found).toBe(false);
    expect(lookupTicket(e, '   ').found).toBe(false);
    expect(lookupTicket(e, 'abc').found).toBe(false);
  });

  it('finds a number inside a range', () => {
    const r = lookupTicket(e, '12345');
    expect(r.found).toBe(true);
    expect(r.batch?.id).toBe('yello');
    expect(r.matchedNumber).toBe(12345);
  });

  it('is inclusive of both range boundaries', () => {
    expect(lookupTicket(e, '12341').found).toBe(true);
    expect(lookupTicket(e, '12360').found).toBe(true);
  });

  it('rejects numbers just outside the range', () => {
    expect(lookupTicket(e, '12340').found).toBe(false);
    expect(lookupTicket(e, '12361').found).toBe(false);
  });

  it('matches a card number exactly and trims whitespace', () => {
    const r = lookupTicket(e, '  7 ');
    expect(r.found).toBe(true);
    expect(r.batch?.id).toBe('Golden');
  });

  it('does not match a near-but-wrong card number', () => {
    expect(lookupTicket(e, '8').found).toBe(false);
  });

  it('picks the correct batch when several exist', () => {
    const multi = event([range('A', 100, 199), range('B', 200, 299)]);
    expect(lookupTicket(multi, '250').batch?.id).toBe('B');
  });
});

// ── getDrawStage — idle / winner ────────────────────────────────────────────────

describe('getDrawStage — basics', () => {
  const e = event([yello]);

  it('is idle for empty input', () => {
    expect(getDrawStage('', e)).toEqual({ type: 'idle' });
    expect(getDrawStage('   ', e)).toEqual({ type: 'idle' });
  });

  it('declares a winner on an exact in-range number', () => {
    const s = getDrawStage('12345', e);
    expect(s.type).toBe('winner');
    if (s.type === 'winner') {
      expect(s.number).toBe(12345);
      expect(s.batch.id).toBe('yello');
    }
  });

  it('declares a winner on a card exact match', () => {
    const s = getDrawStage('7', event([card('Golden', 7)]));
    expect(s.type).toBe('winner');
  });
});

// ── getDrawStage — the progressive walk toward 12345 ────────────────────────────

describe('getDrawStage — progressive reveal (range 12341–12360)', () => {
  const e = event([yello]);

  it('identifies the lone batch from the first matching digit (not guaranteed yet)', () => {
    const s = getDrawStage('1', e);
    expect(s.type).toBe('identified');
    if (s.type === 'identified') {
      expect(s.digitsLeft).toBe(4);
      expect(s.guaranteed).toBe(false);
    }
  });

  it('counts down digitsLeft as the prefix grows', () => {
    const left = (p: string) => {
      const s = getDrawStage(p, e);
      return s.type === 'identified' ? s.digitsLeft : null;
    };
    expect(left('12')).toBe(3);
    expect(left('123')).toBe(2);
    expect(left('1234')).toBe(1);
  });

  it('"1234" is NOT guaranteed — 12340 falls below the start', () => {
    const s = getDrawStage('1234', e);
    expect(s.type).toBe('identified');
    if (s.type === 'identified') expect(s.guaranteed).toBe(false);
  });

  it('"1235" IS guaranteed — 12350–12359 sits fully inside the range', () => {
    const s = getDrawStage('1235', e);
    expect(s.type).toBe('identified');
    if (s.type === 'identified') {
      expect(s.guaranteed).toBe(true);
      expect(s.digitsLeft).toBe(1);
    }
  });

  it('reaches winner at the full number', () => {
    expect(getDrawStage('12345', e).type).toBe('winner');
  });
});

// ── getDrawStage — eliminated / possible ────────────────────────────────────────

describe('getDrawStage — eliminated & possible', () => {
  it('eliminates on the first digit that no batch can start with', () => {
    expect(getDrawStage('9', event([yello])).type).toBe('eliminated');
  });

  it('is "possible" while 2+ batches remain in contention', () => {
    // Two ranges both reachable from prefix "1": 100–199 and 150–199-style overlap
    const e = event([range('A', 1000, 1999), range('B', 1500, 1800)]);
    expect(getDrawStage('1', e).type).toBe('possible');
  });

  it('narrows from possible to identified as the prefix disambiguates', () => {
    const e = event([range('A', 1000, 1099), range('B', 1500, 1599)]);
    expect(getDrawStage('1', e).type).toBe('possible');
    const s = getDrawStage('15', e);
    expect(s.type).toBe('identified');
    if (s.type === 'identified') expect(s.batch.id).toBe('B');
  });
});

// ── getDrawStage — near-miss ────────────────────────────────────────────────────

describe('getDrawStage — near-miss', () => {
  const e = event([yello]); // 12341–12360

  it('flags a complete entry within 5 above the end', () => {
    const s = getDrawStage('12362', e);
    expect(s.type).toBe('near-miss');
    if (s.type === 'near-miss') expect(s.distance).toBe(2);
  });

  it('flags a complete entry within 5 below the start', () => {
    const s = getDrawStage('12339', e);
    expect(s.type).toBe('near-miss');
    if (s.type === 'near-miss') expect(s.distance).toBe(2);
  });

  it('treats exactly 5 away as a near-miss (inclusive)', () => {
    const s = getDrawStage('12365', e);
    expect(s.type).toBe('near-miss');
    if (s.type === 'near-miss') expect(s.distance).toBe(5);
  });

  it('falls back to eliminated at 6 away', () => {
    expect(getDrawStage('12366', e).type).toBe('eliminated');
  });

  it('only fires on a complete-length entry, not a partial prefix', () => {
    // "129" is a 3-digit prefix of a 5-digit range; it must read as eliminated,
    // not near-miss, because we can't judge distance mid-type.
    expect(getDrawStage('129', e).type).toBe('eliminated');
  });

  it('does not apply to card batches (match-or-miss only)', () => {
    expect(getDrawStage('9', event([card('Golden', 7)])).type).toBe('eliminated');
  });
});

// ── getDrawStage — scoping (the prefix-interception fix) ────────────────────────

describe('getDrawStage — batch scoping', () => {
  // Door Prize #122 is a prefix of Booze Wagon #12221–12240.
  const door  = range('Texas Mickey', 122, 122, 'Door Prize');
  const booze = range('liquor', 12221, 12240, 'Booze Wagon');
  const e = event([door, booze]);

  it('unscoped: "122" is intercepted as a Door Prize winner mid-type', () => {
    const s = getDrawStage('122', e);
    expect(s.type).toBe('winner');
    if (s.type === 'winner') expect(s.batch.id).toBe('Texas Mickey');
  });

  it('scoped to the Booze Wagon: "122" reads as "getting closer", not a winner', () => {
    const s = getDrawStage('122', e, booze.id);
    expect(s.type).toBe('identified');
    if (s.type === 'identified') {
      expect(s.batch.id).toBe('liquor');
      expect(s.digitsLeft).toBe(2);
    }
  });

  it('scoped to the Booze Wagon: the full number wins', () => {
    const s = getDrawStage('12221', e, booze.id);
    expect(s.type).toBe('winner');
    if (s.type === 'winner') expect(s.batch.id).toBe('liquor');
  });

  it('scoped to the single-ticket Door Prize: "122" wins cleanly', () => {
    const s = getDrawStage('122', e, door.id);
    expect(s.type).toBe('winner');
    if (s.type === 'winner') expect(s.batch.id).toBe('Texas Mickey');
  });

  it('scoped: a number outside the chosen batch is eliminated, not matched elsewhere', () => {
    // 122 is a valid Door Prize, but scoped to Booze Wagon it must NOT win.
    const s = getDrawStage('999', e, booze.id);
    expect(s.type).toBe('eliminated');
  });
});
