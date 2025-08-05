import { IApiResponse } from "./api-response.types";
import { IAsset } from "./asset.types";

export interface IAIJob {
  jobId: string;
  type: "noise-removal" | "subtitle-generation";
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  projectId: string;
  assetId: string;
  estimatedDuration?: number;
  outputData?: IJobOutputData;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface IJobOutputData {
  // For noise removal jobs
  resultAssetId?: string;
  resultAssetPath?: string;
  resultAsset: IAsset;
  // For subtitle generation jobs
  subtitles?: ISubtitleSegment[];
}

export interface ISubtitleSegment {
  startTime: number;
  endTime: number;
  text: string;
}

export interface IStartAIJobRequest {
  assetId: string;
  projectId: string;
}

// API Response Types
export type IStartNoiseRemovalResponse = IApiResponse<{ job: IAIJob }>;
export type IStartSubtitleGenerationResponse = IApiResponse<{ job: IAIJob }>;
export type IJobStatusResponse = IApiResponse<{ job: IAIJob }>;
export type IUserJobsResponse = IApiResponse<{ jobs: IAIJob[] }>;

// Job filters for getting user jobs
export interface IJobFilters {
  projectId?: string;
  status?: IAIJob["status"];
  type?: IAIJob["type"];
}
