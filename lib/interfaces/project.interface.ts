export interface Project {
  uid: string;
  name: string;
}

export interface CreateProjectInput {
  name: string;
}

export interface IProjectService {
  getProject(id: string): Promise<Project | null>;
  getAllProjects(): Promise<Project[]>;
  createProject(data: CreateProjectInput): Promise<Project | null>;
  updateProject(id: string, data: Partial<Project>): Promise<Project | null>;
  deleteProject(id: string): Promise<Project | null>;
}
