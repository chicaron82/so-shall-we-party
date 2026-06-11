import { useState } from 'react';
import { useEvents } from './hooks/useEvents';
import { HomeScreen } from './components/HomeScreen';
import { EventScreen } from './components/EventScreen';
import { DrawScreen } from './components/DrawScreen';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { BuildStamp } from './components/BuildStamp';
import type { Event } from './types';

type Screen = 'home' | 'event' | 'draw';

export default function App() {
  const {
    events, createEvent, updateEvent, deleteEvent,
    addBatch, updateBatch, deleteBatch, addDraw, markClaimed, importEvents,
  } = useEvents();
  const [screen, setScreen]           = useState<Screen>('home');
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  const selectEvent = (event: Event) => {
    setActiveEvent(event);
    setScreen('event');
  };

  // Keep activeEvent in sync with events state after batch mutations
  const currentEvent = activeEvent
    ? (events.find(e => e.id === activeEvent.id) ?? activeEvent)
    : null;

  return (
    <div className="max-w-md mx-auto">
      <AppErrorBoundary>
        {screen === 'home' && (
          <HomeScreen
            events={events}
            onCreate={createEvent}
            onSelect={selectEvent}
            onImport={importEvents}
          />
        )}
        {screen === 'event' && currentEvent && (
          <EventScreen
            event={currentEvent}
            onAddBatch={addBatch}
            onUpdateBatch={updateBatch}
            onDeleteBatch={deleteBatch}
            onUpdateEvent={updateEvent}
            onDeleteEvent={deleteEvent}
            onDraw={() => setScreen('draw')}
            onBack={() => setScreen('home')}
          />
        )}
        {screen === 'draw' && currentEvent && (
          <DrawScreen
            event={currentEvent}
            onAddDraw={addDraw}
            onMarkClaimed={markClaimed}
            onBack={() => setScreen('event')}
          />
        )}
      </AppErrorBoundary>
      <BuildStamp />
    </div>
  );
}
