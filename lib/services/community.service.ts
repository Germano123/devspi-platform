import { ICommunityService, Community, CreateCommunityInput } from "@/lib/interfaces/community.interface";

export class CommunityService implements ICommunityService {

  async getCommunity(id: string): Promise<Community | null> {
    return null;
  }

  async getAllCommunities(): Promise<Community[]> {
    return [];
  }

  async createCommunity(data: CreateCommunityInput): Promise<Community | null> {
    return null;
  }
    
  async updateCommunity(id: string, data: Partial<Community>): Promise<Community | null> {
    throw new Error("Method not implemented.");
  }
   
  async deleteCommunity(id: string): Promise<Community | null> {
      throw new Error("Method not implemented.");
  }
}
