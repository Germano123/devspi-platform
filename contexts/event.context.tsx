"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { EventService } from "@/lib/services/event.service";
import { IEventService, Event, CreateEventInput } from "@/lib/interfaces/event.interface";

interface EventContextProps extends IEventService {
  events: Event[];
  loading: boolean;
}

const EventContext = createContext<EventContextProps | undefined>(undefined);

export const useEvent = (): EventContextProps => {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used within a EventProvider");
  return context;
};

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const eventService = useMemo(() => new EventService(), []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const all = await eventService.getAllEvents();
      setEvents(all);
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  const createEvent = useCallback(async (data: CreateEventInput): Promise<Event | null> => {
    setLoading(true);
    try {
      const event = await eventService.createEvent(data);
      fetchEvents();
      return event;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  const getEvent = useCallback(async (id: string): Promise<Event | null> => {
    setLoading(true);
    try {
      return await eventService.getEvent(id);
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  const getAllEvents = useCallback(async (): Promise<Event[]> => {
    setLoading(true);
    try {
      return await eventService.getAllEvents();
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  const updateEvent = useCallback(async (id: string, data: Partial<Event>): Promise<Event | null> => {
    setLoading(true);
    try {
      const updated = await eventService.updateEvent(id, data);
      fetchEvents();
      return updated;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  const deleteEvent = useCallback(async (id: string): Promise<Event | null> => {
    setLoading(true);
    try {
      const deleted = await eventService.deleteEvent(id);
      fetchEvents();
      return deleted;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [eventService]);

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        createEvent,
        getEvent,
        getAllEvents,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

