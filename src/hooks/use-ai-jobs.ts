import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AIJobsService } from "@/services/ai-jobs.service";
import { IStartAIJobRequest, IJobFilters } from "@/types/ai-job.types";
import { toast } from "sonner";

// Query keys
export const aiJobsKeys = {
  all: ["ai-jobs"] as const,
  lists: () => [...aiJobsKeys.all, "list"] as const,
  list: (filters: IJobFilters) => [...aiJobsKeys.lists(), { filters }] as const,
  details: () => [...aiJobsKeys.all, "detail"] as const,
  detail: (id: string) => [...aiJobsKeys.details(), id] as const,
  projectJobs: (projectId: string) => [...aiJobsKeys.all, "project", projectId] as const,
  activeJobs: (projectId?: string) => [...aiJobsKeys.all, "active", projectId || "all"] as const,
};

// Hook to start noise removal job
export const useStartNoiseRemoval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IStartAIJobRequest) => AIJobsService.startNoiseRemoval(request),
    onSuccess: (newJob) => {
      // Invalidate relevant queries to refetch job lists
      queryClient.invalidateQueries({ queryKey: aiJobsKeys.projectJobs(newJob.projectId) });

      toast.success("Noise removal job started successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start noise removal job");
    },
  });
};

// Hook to start subtitle generation job
export const useStartSubtitleGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: IStartAIJobRequest) => AIJobsService.startSubtitleGeneration(request),
    onSuccess: (newJob) => {
      // Invalidate relevant queries to refetch job lists
      queryClient.invalidateQueries({ queryKey: aiJobsKeys.projectJobs(newJob.projectId) });

      toast.success("Subtitle generation job started successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to start subtitle generation job");
    },
  });
};

// Hook to get specific job status with polling
export const useJobStatus = (jobId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: aiJobsKeys.detail(jobId),
    queryFn: () => AIJobsService.getJobStatus(jobId),
    enabled: options?.enabled ?? !!jobId,
    refetchInterval: (query) => {
      // Poll every 5 seconds if job is processing, stop polling if completed/failed
      const jobData = query.state.data;
      return jobData?.status === "processing" ? 5000 : false;
    },
    staleTime: 0, // Always refetch for real-time updates
  });
};

// Hook to get all jobs for a project
export const useProjectJobs = (projectId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: aiJobsKeys.projectJobs(projectId),
    queryFn: () => AIJobsService.getProjectJobs(projectId),
    enabled: (options?.enabled ?? true) && !!projectId,
    staleTime: 0,
    refetchInterval: () => {
      if (!options?.enabled) return false;
      return 5000;
    },
  });
};

// Hook to get only active/processing jobs
export const useActiveJobs = (projectId?: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: aiJobsKeys.activeJobs(projectId),
    queryFn: () => AIJobsService.getActiveJobs(projectId),
    enabled: options?.enabled ?? true,
    refetchInterval: () => {
      // Only poll if enabled and there are active jobs
      if (!options?.enabled) return false;
      return 5000; // Poll every 5 seconds
    },
    staleTime: 0, // Always refetch for real-time updates
  });
};

// Hook to get user jobs with filters
export const useUserJobs = (filters: IJobFilters = {}) => {
  return useQuery({
    queryKey: aiJobsKeys.list(filters),
    queryFn: () => AIJobsService.getUserJobs(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to check if an asset has an active job
export const useAssetHasActiveJob = (assetId: string, projectId?: string, enabled: boolean = true) => {
  const { data: projectJobs = [] } = useProjectJobs(projectId || "", { enabled: enabled && !!projectId });

  // Filter to get only active jobs
  const activeJobs = projectJobs.filter((job) => ["pending", "processing"].includes(job.status));

  return {
    hasActiveJob: activeJobs.some((job) => job.assetId === assetId),
    activeJob: activeJobs.find((job) => job.assetId === assetId),
  };
};
