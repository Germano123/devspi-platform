export interface Event {
  uid: string;
  name: string;
}

export interface CreateEventInput {
  name: string;
}

export interface IEventService {
  getEvent(id: string): Promise<Event | null>;
  getAllEvents(): Promise<Event[]>;
  createEvent(data: CreateEventInput): Promise<Event | null>;
  updateEvent(id: string, data: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: string): Promise<Event | null>;
}
