export interface Community {
  uid: string;
  name: string;
}

export interface CreateCommunityInput {
  name: string;
}

export interface ICommunityService {
  getCommunity(id: string): Promise<Community | null>;
  getAllCommunities(): Promise<Community[]>;
  createCommunity(data: CreateCommunityInput): Promise<Community | null>;
  updateCommunity(id: string, data: Partial<Community>): Promise<Community | null>;
  deleteCommunity(id: string): Promise<Community | null>;
}
