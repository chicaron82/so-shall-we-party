import { describe, it, expect } from 'vitest';
import { batchDisplayName } from '../../src/lib/batchName';
import type { TicketBatch } from '../../src/types';

function b(id: string, prize?: string): TicketBatch {
  return { id, type: 'range', rangeStart: 1, rangeEnd: 10, prize };
}

describe('batchDisplayName', () => {
  it('names a lone prize by the prize alone (no number)', () => {
    const batches = [b('a', 'Grand Prize')];
    expect(batchDisplayName(batches[0], batches)).toBe('Grand Prize');
  });

  it('numbers multiple batches of the same prize in creation order', () => {
    const batches = [b('a', 'Regular'), b('b', 'Regular'), b('c', 'Regular')];
    expect(batchDisplayName(batches[0], batches)).toBe('Regular · Batch 1');
    expect(batchDisplayName(batches[1], batches)).toBe('Regular · Batch 2');
    expect(batchDisplayName(batches[2], batches)).toBe('Regular · Batch 3');
  });

  it('numbers each prize group independently', () => {
    const batches = [b('a', 'Regular'), b('b', 'Grand Prize'), b('c', 'Regular')];
    expect(batchDisplayName(batches[0], batches)).toBe('Regular · Batch 1');
    expect(batchDisplayName(batches[1], batches)).toBe('Grand Prize'); // lone
    expect(batchDisplayName(batches[2], batches)).toBe('Regular · Batch 2');
  });

  it('falls back to "Batch N" for batches with no prize', () => {
    const batches = [b('a'), b('b')];
    expect(batchDisplayName(batches[0], batches)).toBe('Batch 1');
    expect(batchDisplayName(batches[1], batches)).toBe('Batch 2');
  });

  it('keeps unmarked numbering separate from prized batches', () => {
    const batches = [b('a', 'Regular'), b('b'), b('c', 'Regular')];
    expect(batchDisplayName(batches[1], batches)).toBe('Batch 1'); // first unmarked
    expect(batchDisplayName(batches[2], batches)).toBe('Regular · Batch 2');
  });
});
