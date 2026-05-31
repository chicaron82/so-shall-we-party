import { useState } from 'react';
import type { Event } from '../types';
import { EventFormModal } from './EventFormModal';

interface Props {
  events: Event[];
  onCreate: (name: string, date: string, photo?: string) => Event;
  onSelect: (event: Event) => void;
}

export function HomeScreen({ events, onCreate, onSelect }: Props) {
  const [showNew, setShowNew] = useState(false);

  const handleCreate = (name: string, date: string, photo?: string) => {
    const event = onCreate(name, date, photo);
    onSelect(event);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <p className="text-xs font-semibold text-purple-400 tracking-widest uppercase">So Shall We Party</p>
        <h1 className="text-2xl font-bold text-slate-100 mt-1">Events</h1>
      </div>

      {/* Event list */}
      <div className="flex-1 px-4 space-y-3">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <span className="text-4xl">🎟️</span>
            <p className="text-sm text-slate-500">No events yet. Create one to get started.</p>
          </div>
        ) : (
          events.map(event => {
            const dateLabel = new Date(event.date + 'T12:00:00').toLocaleDateString('en-CA', {
              weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
            });
            return (
              <button
                key={event.id}
                onClick={() => onSelect(event)}
                className="w-full text-left rounded-2xl overflow-hidden border border-[#2a2b38] hover:border-purple-700 transition cursor-pointer"
              >
                {event.photo ? (
                  <div className="h-28 overflow-hidden">
                    <img src={event.photo} alt={event.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-br from-purple-900/30 to-cyan-900/20 flex items-center justify-center">
                    <span className="text-3xl">🎉</span>
                  </div>
                )}
                <div className="px-4 py-3 bg-[#16171f]">
                  <p className="font-bold text-slate-100 text-sm">{event.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{dateLabel} · {event.batches.length} batch{event.batches.length !== 1 ? 'es' : ''}</p>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* FAB */}
      <div className="sticky bottom-0 px-5 py-6">
        <button
          onClick={() => setShowNew(true)}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold rounded-2xl transition cursor-pointer shadow-lg shadow-purple-900/40"
        >
          + New Event
        </button>
      </div>

      {showNew && <EventFormModal onSubmit={handleCreate} onClose={() => setShowNew(false)} />}
    </div>
  );
}
