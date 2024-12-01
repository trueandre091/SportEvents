import React, { createContext, useState, useContext, useCallback } from 'react';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (events.length === 0) {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }
  }, [events.length]);

  const fetchSports = useCallback(async () => {
    if (sports.length === 0) {
      try {
        const response = await fetch('/api/events/sports');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSports(data);
      } catch (error) {
        console.error('Error fetching sports:', error);
      }
    }
  }, [sports.length]);

  const value = {
    events,
    setEvents,
    sports,
    setSports,
    isLoading,
    fetchEvents,
    fetchSports
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