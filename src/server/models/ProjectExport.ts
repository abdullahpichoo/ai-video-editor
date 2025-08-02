import { ObjectId } from 'mongodb';
import { ExportSettings } from './ExportSettings';

export interface ProjectExport {
  _id?: ObjectId;
  exportId: string; // UUID for this export
  userId: string; // References User._id
  projectId: string;
  
  // Export configuration
  settings: ExportSettings;
  
  // Export status
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // Result
  outputAssetId?: string; // Final exported video asset
  fileSize?: number; // in bytes
  downloadUrl?: string; // temporary download URL
  
  // Error handling
  errorMessage?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  expiresAt?: Date; // when download URL expires
}
