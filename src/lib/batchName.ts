import type { TicketBatch } from '../types';

/**
 * Auto display name for a batch — the caller never types an identifier anymore.
 *
 * Numbering is grouped by prize, in creation order:
 *   • multiple of a prize  → "Regular · Batch 2"  (so a winner points at a pile)
 *   • a lone prize         → "Grand Prize"        (no number needed)
 *   • no prize set         → "Batch 1"            (numbered among unmarked batches)
 *
 * `batches` must be the full event batch list (creation order) so the ordinal
 * is stable regardless of which batch we're naming.
 */
export function batchDisplayName(batch: TicketBatch, batches: TicketBatch[]): string {
  const key = batch.prize ?? '';
  const group = batches.filter(b => (b.prize ?? '') === key);
  const ordinal = group.findIndex(b => b.id === batch.id) + 1;

  if (!batch.prize)         return `Batch ${ordinal}`;
  if (group.length === 1)   return batch.prize;
  return `${batch.prize} · Batch ${ordinal}`;
}
