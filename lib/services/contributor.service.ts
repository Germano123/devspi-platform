import { IContributorService, Contributor, CreateContributorInput } from "@/lib/interfaces/contributor.interface";

export class ContributorService implements IContributorService {

  async getContributor(id: string): Promise<Contributor | null> {
    return null;
  }

  async getAllContributors(): Promise<Contributor[]> {
    return [];
  }

  async createContributor(data: CreateContributorInput): Promise<Contributor | null> {
    return null;
  }
    
  async updateContributor(id: string, data: Partial<Contributor>): Promise<Contributor | null> {
    throw new Error("Method not implemented.");
  }
   
  async deleteContributor(id: string): Promise<Contributor | null> {
      throw new Error("Method not implemented.");
  }
}
