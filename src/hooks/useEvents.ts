import { useState, useCallback } from 'react';
import { loadEvents, saveEvents } from '../lib/storage';
import type { Event, TicketBatch } from '../types';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>(() => loadEvents());

  const persist = useCallback((next: Event[]) => {
    setEvents(next);
    saveEvents(next);
  }, []);

  const createEvent = useCallback((name: string, date: string, photo?: string): Event => {
    const event: Event = { id: uid(), name, date, photo, batches: [], createdAt: new Date().toISOString() };
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

  return { events, createEvent, deleteEvent, addBatch, deleteBatch };
}
