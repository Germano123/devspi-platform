import { IProjectService, Project, CreateProjectInput } from "@/lib/interfaces/project.interface";

export class ProjectService implements IProjectService {

  async getProject(id: string): Promise<Project | null> {
    return null;
  }

  async getAllProjects(): Promise<Project[]> {
    return [];
  }

  async createProject(data: CreateProjectInput): Promise<Project | null> {
    return null;
  }
    
  async updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
    throw new Error("Method not implemented.");
  }
   
  async deleteProject(id: string): Promise<Project | null> {
      throw new Error("Method not implemented.");
  }
}
