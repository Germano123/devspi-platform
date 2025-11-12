export interface Contributor {
  uid: string;
  name: string;
}

export interface CreateContributorInput {
  name: string;
}

export interface IContributorService {
  getContributor(id: string): Promise<Contributor | null>;
  getAllContributors(): Promise<Contributor[]>;
  createContributor(data: CreateContributorInput): Promise<Contributor | null>;
  updateContributor(id: string, data: Partial<Contributor>): Promise<Contributor | null>;
  deleteContributor(id: string): Promise<Contributor | null>;
}
