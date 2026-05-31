import type { Event } from '../types';

const KEY = 'sswp_events';

export function loadEvents(): Event[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveEvents(events: Event[]): void {
  localStorage.setItem(KEY, JSON.stringify(events));
}
