import { describe, it, expect } from 'vitest';
import { serializeEvents, parseBackup, validateEvent, mergeEvents } from './backup';
import type { Event } from '../types';

function event(over: Partial<Event> = {}): Event {
  return {
    id: 'e1', name: 'UV7 Night', date: '2026-05-31',
    batches: [{ id: 'b1', type: 'range', rangeStart: 100, rangeEnd: 199 }],
    draws: [], createdAt: '2026-05-31T00:00:00', ...over,
  };
}

describe('serializeEvents / parseBackup round-trip', () => {
  it('survives a serialize → parse cycle', () => {
    const events = [event(), event({ id: 'e2', name: 'Second' })];
    const r = parseBackup(serializeEvents(events));
    expect('events' in r && r.events).toHaveLength(2);
    if ('events' in r) expect(r.events[0].name).toBe('UV7 Night');
  });

  it('wraps with a version and timestamp', () => {
    const parsed = JSON.parse(serializeEvents([event()]));
    expect(parsed.version).toBe(1);
    expect(typeof parsed.exportedAt).toBe('string');
  });
});

describe('parseBackup', () => {
  it('rejects non-JSON garbage', () => {
    expect(parseBackup('not json {')).toEqual({ error: expect.any(String) });
  });

  it('rejects JSON that is not a backup or array', () => {
    expect('error' in parseBackup('42')).toBe(true);
    expect('error' in parseBackup('"hello"')).toBe(true);
  });

  it('accepts the wrapped Backup shape', () => {
    const r = parseBackup(JSON.stringify({ version: 1, exportedAt: 'x', events: [event()] }));
    expect('events' in r && r.events).toHaveLength(1);
  });

  it('accepts a bare legacy Event[] array', () => {
    const r = parseBackup(JSON.stringify([event()]));
    expect('events' in r && r.events).toHaveLength(1);
  });

  it('errors when nothing valid is found', () => {
    const r = parseBackup(JSON.stringify([{ junk: true }]));
    expect('error' in r).toBe(true);
  });
});

describe('validateEvent', () => {
  it('passes a well-formed event', () => {
    expect(validateEvent(event())).not.toBeNull();
  });

  it('rejects when core string fields are missing', () => {
    expect(validateEvent({ id: 'e1', name: 'x' })).toBeNull();          // no date
    expect(validateEvent({ name: 'x', date: 'd', batches: [] })).toBeNull(); // no id
    expect(validateEvent(null)).toBeNull();
    expect(validateEvent('nope')).toBeNull();
  });

  it('drops malformed batches but keeps the event', () => {
    const e = validateEvent(event({
      batches: [
        { id: 'ok', type: 'range', rangeStart: 1, rangeEnd: 9 },
        { id: 'bad', type: 'range' },                 // missing range bounds
        { id: 'bad2', type: 'mystery' },              // unknown type
        { id: 'card-ok', type: 'card', number: 7 },
      ] as never,
    }));
    expect(e).not.toBeNull();
    expect(e!.batches.map(b => b.id)).toEqual(['ok', 'card-ok']);
  });

  it('drops malformed draws and defaults missing arrays', () => {
    const e = validateEvent({ id: 'e', name: 'n', date: 'd' }); // no batches/draws
    expect(e!.batches).toEqual([]);
    expect(e!.draws).toEqual([]);
  });
});

describe('mergeEvents', () => {
  it('updates an existing event by id and adds new ones', () => {
    const current = [event({ id: 'e1', name: 'Old' }), event({ id: 'e2', name: 'Keep' })];
    const incoming = [event({ id: 'e1', name: 'New' }), event({ id: 'e3', name: 'Added' })];
    const merged = mergeEvents(current, incoming);
    const byId = Object.fromEntries(merged.map(e => [e.id, e.name]));
    expect(byId).toEqual({ e1: 'New', e2: 'Keep', e3: 'Added' });
  });

  it('never drops events absent from the import (non-destructive)', () => {
    const merged = mergeEvents([event({ id: 'e2' })], [event({ id: 'e1' })]);
    expect(merged.map(e => e.id).sort()).toEqual(['e1', 'e2']);
  });
});
