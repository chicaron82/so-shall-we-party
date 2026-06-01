import type { Event } from '../types';
import { validateEvent } from './backup';

const KEY = 'sswp_events';

export function loadEvents(): Event[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    // Validate on load: a malformed shape would otherwise read as a silent wrong
    // match (lookup's `?? 0` fallbacks) or white-screen the app.
    return raw.map(validateEvent).filter((e): e is Event => e !== null);
  } catch {
    return [];
  }
}

export function saveEvents(events: Event[]): void {
  localStorage.setItem(KEY, JSON.stringify(events));
}
