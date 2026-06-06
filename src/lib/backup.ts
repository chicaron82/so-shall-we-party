import type { Event, TicketBatch, DrawnTicket } from '../types';

// ── Backup format ─────────────────────────────────────────────────────────────
// Events are the whole app — there is no server. Export/import is the only
// safety net against a cleared browser, a device switch, or private mode.
// The wrapper carries a version so future shape changes can be migrated.

const BACKUP_VERSION = 1;

export interface Backup {
  version: number;
  exportedAt: string;
  events: Event[];
}

export function serializeEvents(events: Event[]): string {
  const backup: Backup = { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), events };
  return JSON.stringify(backup, null, 2);
}

// ── Validation ──────────────────────────────────────────────────────────────
// Reject rather than coerce. A malformed batch left in place would read as a
// silent wrong match (lookup's `?? 0` fallbacks turn a missing range into "0").

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function validateBatch(x: unknown): TicketBatch | null {
  if (!isObj(x)) return null;
  if (typeof x.id !== 'string') return null;
  if (x.type === 'range') {
    if (typeof x.rangeStart !== 'number' || typeof x.rangeEnd !== 'number') return null;
  } else if (x.type === 'card') {
    if (typeof x.number !== 'number') return null;
  } else {
    return null;
  }
  return x as unknown as TicketBatch;
}

function validateDraw(x: unknown): DrawnTicket | null {
  if (!isObj(x)) return null;
  if (typeof x.id !== 'string' || typeof x.number !== 'number' || typeof x.batchId !== 'string') return null;
  return x as unknown as DrawnTicket;
}

/** Lightweight runtime guard. Returns a clean Event or null if the shape is unusable. */
export function validateEvent(x: unknown): Event | null {
  if (!isObj(x)) return null;
  if (typeof x.id !== 'string' || typeof x.name !== 'string' || typeof x.date !== 'string') return null;

  const rawBatches = Array.isArray(x.batches) ? x.batches : [];
  const batches = rawBatches.map(validateBatch).filter((b): b is TicketBatch => b !== null);

  const rawDraws = Array.isArray(x.draws) ? x.draws : [];
  const draws = rawDraws.map(validateDraw).filter((d): d is DrawnTicket => d !== null);

  return { ...(x as unknown as Event), batches, draws };
}

function validateEvents(arr: unknown): Event[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(validateEvent).filter((e): e is Event => e !== null);
}

export type ParseResult = { events: Event[] } | { error: string };

/** Parse a backup blob. Tolerant of both the wrapped Backup shape and a bare Event[]. */
export function parseBackup(raw: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { error: "That doesn't look like valid backup data." };
  }

  // Wrapped shape: { version, exportedAt, events }
  if (isObj(data) && Array.isArray((data as unknown as Backup).events)) {
    const events = validateEvents((data as unknown as Backup).events);
    if (events.length === 0) return { error: 'No valid events found in the backup.' };
    return { events };
  }

  // Legacy / bare array shape
  if (Array.isArray(data)) {
    const events = validateEvents(data);
    if (events.length === 0) return { error: 'No valid events found in the backup.' };
    return { events };
  }

  return { error: "That doesn't look like a So Shall We Party backup." };
}

// ── Merge ─────────────────────────────────────────────────────────────────────

/** Upsert incoming events by id. Existing events absent from the import are kept. */
export function mergeEvents(current: Event[], incoming: Event[]): Event[] {
  const byId = new Map(current.map(e => [e.id, e]));
  for (const e of incoming) byId.set(e.id, e);
  return [...byId.values()];
}
