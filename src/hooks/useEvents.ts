import { useState, useCallback } from 'react';
import { loadEvents, saveEvents } from '../lib/storage';
import type { DrawnTicket, Event, TicketBatch } from '../types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function normalise(e: Event): Event {
  return { ...e, draws: e.draws ?? [] };
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>(() => loadEvents().map(normalise));

  const persist = useCallback((next: Event[]) => {
    setEvents(next);
    saveEvents(next);
  }, []);

  const createEvent = useCallback((name: string, date: string, photo?: string): Event => {
    const event: Event = { id: uid(), name, date, photo, batches: [], draws: [], createdAt: new Date().toISOString() };
    persist([event, ...events]);
    return event;
  }, [events, persist]);

  const deleteEvent = useCallback((id: string) => {
    persist(events.filter(e => e.id !== id));
  }, [events, persist]);

  const addBatch = useCallback((eventId: string, batch: Omit<TicketBatch, 'id'>) => {
    persist(events.map(e =>
      e.id === eventId
        ? { ...e, batches: [...e.batches, { ...batch, id: uid() }] }
        : e
    ));
  }, [events, persist]);

  const deleteBatch = useCallback((eventId: string, batchId: string) => {
    persist(events.map(e =>
      e.id === eventId
        ? { ...e, batches: e.batches.filter(b => b.id !== batchId) }
        : e
    ));
  }, [events, persist]);

  const addDraw = useCallback((eventId: string, draw: Omit<DrawnTicket, 'id' | 'drawnAt' | 'claimed'>) => {
    const entry: DrawnTicket = { ...draw, id: uid(), drawnAt: new Date().toISOString(), claimed: false };
    persist(events.map(e =>
      e.id === eventId
        ? { ...e, draws: [entry, ...e.draws] }
        : e
    ));
    return entry;
  }, [events, persist]);

  const markClaimed = useCallback((eventId: string, drawId: string, claimed: boolean) => {
    persist(events.map(e =>
      e.id === eventId
        ? { ...e, draws: e.draws.map(d => d.id === drawId ? { ...d, claimed } : d) }
        : e
    ));
  }, [events, persist]);

  return { events, createEvent, deleteEvent, addBatch, deleteBatch, addDraw, markClaimed };
}
