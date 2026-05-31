import type { Event, LookupResult } from '../types';

export function lookupTicket(event: Event, input: string): LookupResult {
  const num = parseInt(input.trim(), 10);
  if (isNaN(num)) return { found: false };

  for (const batch of event.batches) {
    if (batch.type === 'range') {
      const start = batch.rangeStart ?? 0;
      const end = batch.rangeEnd ?? 0;
      if (num >= start && num <= end) {
        return { found: true, batch, matchedNumber: num };
      }
    } else if (batch.type === 'card') {
      if (batch.number !== undefined && num === batch.number) {
        return { found: true, batch, matchedNumber: num };
      }
    }
  }

  return { found: false };
}
