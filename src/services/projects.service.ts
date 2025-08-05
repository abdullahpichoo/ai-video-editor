import api from "@/lib/api";
import {
  IProject,
  ICreateProjectData,
  IProjectMongoResponse,
  IFetchProjectsResponse,
  IFetchProjectResponse,
  ICreateProjectResponse,
  IUpdateProjectResponse,
  IDeleteProjectResponse,
} from "@/types/project.types";

export class ProjectsService {
  static async getProjects(): Promise<IProject[]> {
    const response = await api.get<IFetchProjectsResponse>("/projects");
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch projects");
    }

    return result.data.projects.map(this.transformProjectResponse);
  }

  static async getProject(projectId: string): Promise<IProject> {
    const response = await api.get<IFetchProjectResponse>(`/projects/${projectId}`);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch project");
    }

    return this.transformProjectResponse(result.data.project);
  }

  static async createProject(projectData: ICreateProjectData): Promise<IProject> {
    const response = await api.post<ICreateProjectResponse>("/projects", projectData);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to create project");
    }

    return this.transformProjectResponse(result.data.project);
  }

  static async updateProject(projectId: string, updates: Partial<ICreateProjectData>): Promise<IProject> {
    const response = await api.put<IUpdateProjectResponse>(`/projects/${projectId}`, updates);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update project");
    }

    return this.transformProjectResponse(result.data.project);
  }

  static async deleteProject(projectId: string): Promise<void> {
    const response = await api.delete<IDeleteProjectResponse>(`/projects/${projectId}`);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to delete project");
    }
  }

  static transformProjectResponse(mongoProject: IProjectMongoResponse): IProject {
    const { _id, ...projectData } = mongoProject;

    return {
      ...projectData,
      id: _id,
      resolution: projectData.resolution || { width: 1920, height: 1080 },
    };
  }
}
