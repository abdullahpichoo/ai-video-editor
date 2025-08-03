import { ObjectId } from 'mongodb';
import { SubtitleItem } from './Subtitle';

export interface AIProcessingJob {
  _id?: ObjectId;
  jobId: string; // UUID for this job
  userId: string; // References User._id
  projectId: string;
  assetId: string; // Media asset being processed
  
  // Job details
  type: 'noise_removal' | 'subtitle_generation';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  // Processing parameters
  parameters: {
    // For noise removal
    noiseReductionLevel?: number; // 0-1
    
    // For subtitle generation
    language?: string; // ISO language code
    generateTimestamps?: boolean;
  };
  
  // Results
  resultAssetId?: string;
  subtitles?: SubtitleItem[];
  
  // External API details
  externalJobId?: string;
  externalProvider: 'openai' | 'elevenlabs' | 'assemblyai' | 'deepgram';
  
  // Progress and error handling
  progress: number; // 0-100
  errorMessage?: string;
  retryCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
