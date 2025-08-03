import { TimelineTrack } from "./Timeline";
import { SubtitleItem } from "./Subtitle";
import { ExportSettings } from "./ExportSettings";

// ==================== TYPE UNIONS AND HELPERS ====================
export type CollectionName =
  | "users"
  | "userSessions"
  | "mediaAssets"
  | "videoProjects"
  | "aiProcessingJobs"
  | "projectExports";

export type MediaType = "video" | "image" | "audio";
export type VideoFormat = "mp4" | "webm";
export type ImageFormat = "png" | "jpg" | "jpeg";
export type SupportedMimeType =
  | "video/mp4"
  | "video/webm"
  | "image/png"
  | "image/jpeg";

// ==================== DATABASE OPERATION TYPES ====================
export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface CreateMediaAssetInput {
  userId: string;
  originalName: string;
  filename: string;
  fileSize: number;
  mimeType: SupportedMimeType;
  storageType: "database" | "temp";
  storagePath?: string;
  base64Data?: string;
  duration?: number;
  dimensions?: { width: number; height: number };
  fps?: number;
  hasAudio?: boolean;
}

export interface CreateVideoProjectInput {
  userId: string;
  title: string;
  description?: string;
  timelineSettings: {
    duration: number;
    resolution: { width: number; height: number };
    fps: number;
  };
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  timelineSettings?: {
    duration?: number;
    resolution?: { width: number; height: number };
    fps?: number;
  };
  tracks?: TimelineTrack[];
  subtitles?: SubtitleItem[];
  lastPlaybackPosition?: number;
  exportSettings?: ExportSettings;
}

// ==================== QUERY FILTERS ====================
export interface MediaAssetFilter {
  userId: string;
  mimeType?: SupportedMimeType[];
  isProcessing?: boolean;
  uploadedAfter?: Date;
  uploadedBefore?: Date;
}

export interface VideoProjectFilter {
  userId: string;
  createdAfter?: Date;
  createdBefore?: Date;
  lastOpenedAfter?: Date;
}

export interface AIProcessingJobFilter {
  userId: string;
  projectId?: string;
  type?: ("noise_removal" | "subtitle_generation")[];
  status?: ("pending" | "processing" | "completed" | "failed")[];
  createdAfter?: Date;
}
