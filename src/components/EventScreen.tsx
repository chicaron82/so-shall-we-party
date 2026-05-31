import { useState } from 'react';
import type { Event, TicketBatch } from '../types';
import { BatchFormModal } from './BatchFormModal';
import { EventFormModal } from './EventFormModal';
import { ConfirmDialog } from './ConfirmDialog';
import { prizeBadgeClass, prizeEmoji } from '../lib/prizeStyle';

interface Props {
  event: Event;
  onAddBatch: (eventId: string, batch: Omit<TicketBatch, 'id'>) => void;
  onUpdateBatch: (eventId: string, batchId: string, patch: Omit<TicketBatch, 'id'>) => void;
  onDeleteBatch: (eventId: string, batchId: string) => void;
  onUpdateEvent: (id: string, patch: Partial<Pick<Event, 'name' | 'date' | 'photo'>>) => void;
  onDeleteEvent: (id: string) => void;
  onDraw: () => void;
  onBack: () => void;
}

function batchSummary(b: TicketBatch): string {
  if (b.type === 'range') return `#${b.rangeStart} – #${b.rangeEnd}`;
  const q = b.quantity && b.quantity > 1 ? ` · ${b.quantity} cards` : '';
  return `Card #${b.number}${q}`;
}

export function EventScreen({
  event, onAddBatch, onUpdateBatch, onDeleteBatch, onUpdateEvent, onDeleteEvent, onDraw, onBack,
}: Props) {
  const [showAddBatch, setShowAddBatch]       = useState(false);
  const [editingBatch, setEditingBatch]       = useState<TicketBatch | null>(null);
  const [deletingBatch, setDeletingBatch]     = useState<TicketBatch | null>(null);
  const [showEditEvent, setShowEditEvent]     = useState(false);
  const [confirmDelEvent, setConfirmDelEvent] = useState(false);

  const dateLabel = new Date(event.date + 'T12:00:00').toLocaleDateString('en-CA', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative">
        {event.photo ? (
          <div className="h-48 overflow-hidden">
            <img src={event.photo} alt={event.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] to-transparent" />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-purple-900/40 to-cyan-900/20" />
        )}
        <button
          onClick={onBack}
          className="absolute top-12 left-4 w-9 h-9 flex items-center justify-center bg-black/50 rounded-full text-white cursor-pointer"
        >
          ‹
        </button>
        <button
          onClick={() => setShowEditEvent(true)}
          className="absolute top-12 right-4 h-9 px-3 flex items-center gap-1 bg-black/50 rounded-full text-white text-xs font-semibold cursor-pointer"
        >
          ✏️ Edit
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <h1 className="text-2xl font-bold text-white drop-shadow">{event.name}</h1>
          <p className="text-xs text-slate-300">{dateLabel}</p>
        </div>
      </div>

      {/* Batches */}
      <div className="flex-1 px-4 pt-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ticket Batches</p>
          <button
            onClick={() => setShowAddBatch(true)}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            + Add Batch
          </button>
        </div>

        {event.batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <span className="text-3xl">🎟️</span>
            <p className="text-sm text-slate-500">No batches yet.</p>
          </div>
        ) : (
          event.batches.map(batch => (
            <div
              key={batch.id}
              className="flex items-center justify-between bg-[#16171f] border border-[#2a2b38] rounded-2xl px-4 py-3"
            >
              <button
                onClick={() => setEditingBatch(batch)}
                className="flex-1 text-left cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-100">{batch.label}</p>
                  {batch.prize && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${prizeBadgeClass(batch.prize)}`}>
                      {prizeEmoji(batch.prize)} {batch.prize}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{batchSummary(batch)}</p>
              </button>
              <button
                onClick={() => setDeletingBatch(batch)}
                aria-label={`Delete ${batch.label}`}
                className="text-slate-600 hover:text-red-400 transition text-lg cursor-pointer ml-3 shrink-0"
              >
                ×
              </button>
            </div>
          ))
        )}

        {/* Delete event */}
        <div className="pt-6 pb-2 flex justify-center">
          <button
            onClick={() => setConfirmDelEvent(true)}
            className="text-xs font-medium text-slate-600 hover:text-red-400 transition cursor-pointer"
          >
            Delete this event
          </button>
        </div>
      </div>

      {/* Draw CTA */}
      {event.batches.length > 0 && (
        <div className="sticky bottom-0 px-5 py-6">
          <button
            onClick={onDraw}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 active:scale-95 text-white font-bold rounded-2xl transition cursor-pointer shadow-lg shadow-purple-900/40"
          >
            🎲 Draw Time
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddBatch && (
        <BatchFormModal
          onSubmit={batch => onAddBatch(event.id, batch)}
          onClose={() => setShowAddBatch(false)}
        />
      )}
      {editingBatch && (
        <BatchFormModal
          initial={editingBatch}
          onSubmit={patch => onUpdateBatch(event.id, editingBatch.id, patch)}
          onClose={() => setEditingBatch(null)}
        />
      )}
      {showEditEvent && (
        <EventFormModal
          initial={event}
          onSubmit={(name, date, photo) => onUpdateEvent(event.id, { name, date, photo })}
          onClose={() => setShowEditEvent(false)}
        />
      )}
      {deletingBatch && (
        <ConfirmDialog
          title="Delete batch?"
          message={`"${deletingBatch.label}" (${batchSummary(deletingBatch)}) will be removed.`}
          onConfirm={() => { onDeleteBatch(event.id, deletingBatch.id); setDeletingBatch(null); }}
          onCancel={() => setDeletingBatch(null)}
        />
      )}
      {confirmDelEvent && (
        <ConfirmDialog
          title="Delete event?"
          message={`"${event.name}" and all its batches and draw history will be permanently removed.`}
          confirmLabel="Delete Event"
          onConfirm={() => { onDeleteEvent(event.id); onBack(); }}
          onCancel={() => setConfirmDelEvent(false)}
        />
      )}
    </div>
  );
}
