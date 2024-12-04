import React, { createContext, useContext, useState } from 'react';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [isEventsLoaded, setIsEventsLoaded] = useState(false);

  const value = {
    events,
    setEvents,
    allEvents,
    setAllEvents,
    sports,
    setSports,
    isEventsLoaded,
    setIsEventsLoaded
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
} 