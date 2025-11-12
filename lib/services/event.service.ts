import { IEventService, Event, CreateEventInput } from "@/lib/interfaces/event.interface";

export class EventService implements IEventService {

  async getEvent(id: string): Promise<Event | null> {
    return null;
  }

  async getAllEvents(): Promise<Event[]> {
    return [];
  }

  async createEvent(data: CreateEventInput): Promise<Event | null> {
    return null;
  }
    
  async updateEvent(id: string, data: Partial<Event>): Promise<Event | null> {
    throw new Error("Method not implemented.");
  }
   
  async deleteEvent(id: string): Promise<Event | null> {
      throw new Error("Method not implemented.");
  }
}
