import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProjectsService } from "@/services/projects.service";
import { ICreateProjectData } from "@/types/project.types";
import { toast } from "sonner";
import { queryClient } from "@/components/providers/Providers";

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectsService.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => ProjectsService.getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateProject = () => {
  return useMutation({
    mutationFn: (projectData: ICreateProjectData) => ProjectsService.createProject(projectData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create project");
    },
  });
};

export const useUpdateProject = () => {
  return useMutation({
    mutationFn: ({ projectId, updates }: { projectId: string; updates: Partial<ICreateProjectData> }) =>
      ProjectsService.updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });

      toast.success("Project updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update project");
    },
  });
};

export const useDeleteProject = () => {
  return useMutation({
    mutationFn: (projectId: string) => ProjectsService.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
};
