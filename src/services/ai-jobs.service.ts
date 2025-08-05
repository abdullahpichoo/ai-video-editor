import api from "@/lib/api";
import {
  IAIJob,
  IStartAIJobRequest,
  IStartNoiseRemovalResponse,
  IStartSubtitleGenerationResponse,
  IJobStatusResponse,
  IUserJobsResponse,
  IJobFilters,
} from "@/types/ai-job.types";

export class AIJobsService {
  static async startNoiseRemoval(request: IStartAIJobRequest): Promise<IAIJob> {
    const response = await api.post<IStartNoiseRemovalResponse>("/ai/noise-removal", request);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to start noise removal job");
    }

    return result.data.job;
  }

  static async startSubtitleGeneration(request: IStartAIJobRequest): Promise<IAIJob> {
    const response = await api.post<IStartSubtitleGenerationResponse>("/ai/subtitle-generation", request);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to start subtitle generation job");
    }

    return result.data.job;
  }

  static async getJobStatus(jobId: string): Promise<IAIJob> {
    const response = await api.get<IJobStatusResponse>(`/ai/jobs/${jobId}`);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to get job status");
    }

    return result.data.job;
  }

  static async getUserJobs(filters: IJobFilters = {}): Promise<IAIJob[]> {
    const queryParams = new URLSearchParams();

    if (filters.projectId) queryParams.append("projectId", filters.projectId);
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.type) queryParams.append("type", filters.type);

    const url = `/ai/jobs${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get<IUserJobsResponse>(url);
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to get user jobs");
    }

    return result.data.jobs;
  }

  static async getProjectJobs(projectId: string): Promise<IAIJob[]> {
    return this.getUserJobs({ projectId });
  }

  static async getActiveJobs(projectId?: string): Promise<IAIJob[]> {
    const filters: IJobFilters = { status: "processing" };
    if (projectId) filters.projectId = projectId;
    return this.getUserJobs(filters);
  }
}
