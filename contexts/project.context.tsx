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
import { ProjectService } from "@/lib/services/project.service";
import { IProjectService, Project, CreateProjectInput } from "@/lib/interfaces/project.interface";

interface ProjectContextProps extends IProjectService {
  projects: Project[];
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const useProject = (): ProjectContextProps => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within a ProjectProvider");
  return context;
};

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const projectService = useMemo(() => new ProjectService(), []);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const all = await projectService.getAllProjects();
      setProjects(all);
    } finally {
      setLoading(false);
    }
  }, [projectService]);

  const createProject = useCallback(async (data: CreateProjectInput): Promise<Project | null> => {
    setLoading(true);
    try {
      const project = await projectService.createProject(data);
      fetchProjects();
      return project;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectService]);

  const getProject = useCallback(async (id: string): Promise<Project | null> => {
    setLoading(true);
    try {
      return await projectService.getProject(id);
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectService]);

  const getAllProjects = useCallback(async (): Promise<Project[]> => {
    setLoading(true);
    try {
      return await projectService.getAllProjects();
    } finally {
      setLoading(false);
    }
  }, [projectService]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>): Promise<Project | null> => {
    setLoading(true);
    try {
      const updated = await projectService.updateProject(id, data);
      fetchProjects();
      return updated;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectService]);

  const deleteProject = useCallback(async (id: string): Promise<Project | null> => {
    setLoading(true);
    try {
      const deleted = await projectService.deleteProject(id);
      fetchProjects();
      return deleted;
    } catch(error) {
      console.log(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectService]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        createProject,
        getProject,
        getAllProjects,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

