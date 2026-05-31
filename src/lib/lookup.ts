import type { Event, LookupResult, TicketBatch } from '../types';

// ── Simple lookup (post-draw verification) ────────────────────────────────────

export function lookupTicket(event: Event, input: string): LookupResult {
  const num = parseInt(input.trim(), 10);
  if (isNaN(num)) return { found: false };

  for (const batch of event.batches) {
    if (batch.type === 'range') {
      const start = batch.rangeStart ?? 0;
      const end = batch.rangeEnd ?? 0;
      if (num >= start && num <= end) return { found: true, batch, matchedNumber: num };
    } else if (batch.type === 'card') {
      if (batch.number !== undefined && num === batch.number) return { found: true, batch, matchedNumber: num };
    }
  }

  return { found: false };
}

// ── Progressive reveal ────────────────────────────────────────────────────────

export type DrawStage =
  | { type: 'idle' }
  | { type: 'eliminated' }
  | { type: 'near-miss'; distance: number }
  | { type: 'possible' }
  | { type: 'identified'; batch: TicketBatch; digitsLeft: number; guaranteed: boolean }
  | { type: 'winner'; batch: TicketBatch; number: number }

function expectedDigits(batch: TicketBatch): number {
  if (batch.type === 'range') {
    return Math.max(String(batch.rangeStart ?? 0).length, String(batch.rangeEnd ?? 0).length);
  }
  return String(batch.number ?? 0).length;
}

function prefixCanMatch(prefix: string, batch: TicketBatch): boolean {
  if (batch.type === 'range') {
    const start = batch.rangeStart ?? 0;
    const end = batch.rangeEnd ?? 0;
    const digits = expectedDigits(batch);
    if (prefix.length > digits) return false;
    const remaining = digits - prefix.length;
    const lo = parseInt(prefix + '0'.repeat(remaining), 10);
    const hi = parseInt(prefix + '9'.repeat(remaining), 10);
    return hi >= start && lo <= end;
  }
  return batch.number !== undefined && String(batch.number).startsWith(prefix);
}

function prefixIsGuaranteed(prefix: string, batch: TicketBatch): boolean {
  if (batch.type !== 'range') return false;
  const start = batch.rangeStart ?? 0;
  const end = batch.rangeEnd ?? 0;
  const digits = expectedDigits(batch);
  if (prefix.length >= digits) return false;
  const remaining = digits - prefix.length;
  const lo = parseInt(prefix + '0'.repeat(remaining), 10);
  const hi = parseInt(prefix + '9'.repeat(remaining), 10);
  return lo >= start && hi <= end;
}

export function getDrawStage(input: string, event: Event): DrawStage {
  const prefix = input.trim();
  if (!prefix) return { type: 'idle' };

  // Winner check first — full number exact match
  const num = parseInt(prefix, 10);
  if (!isNaN(num)) {
    for (const batch of event.batches) {
      if (batch.type === 'range') {
        if (num >= (batch.rangeStart ?? 0) && num <= (batch.rangeEnd ?? 0)) {
          return { type: 'winner', batch, number: num };
        }
      } else if (batch.type === 'card') {
        if (batch.number === num) return { type: 'winner', batch, number: num };
      }
    }
  }

  // Prefix scan
  const candidates = event.batches.filter(b => prefixCanMatch(prefix, b));

  if (candidates.length === 0) {
    // Near-miss: complete number entry within 5 of a range boundary
    if (!isNaN(num)) {
      for (const batch of event.batches) {
        if (batch.type !== 'range') continue;
        if (prefix.length !== expectedDigits(batch)) continue;
        const start = batch.rangeStart ?? 0;
        const end   = batch.rangeEnd   ?? 0;
        const dist  = num < start ? start - num : num > end ? num - end : 0;
        if (dist > 0 && dist <= 5) return { type: 'near-miss', distance: dist };
      }
    }
    return { type: 'eliminated' };
  }
  if (candidates.length > 1)   return { type: 'possible' };

  const batch = candidates[0];
  const digitsLeft = expectedDigits(batch) - prefix.length;
  const guaranteed = prefixIsGuaranteed(prefix, batch);
  return { type: 'identified', batch, digitsLeft, guaranteed };
}
