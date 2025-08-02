import { ObjectId } from 'mongodb';

export interface MediaAsset {
  _id?: ObjectId;
  sessionId: string; // Links to user session
  assetId: string; // UUID for this asset
  
  // File information
  originalName: string;
  filename: string; // Stored filename
  fileSize: number; // in bytes
  mimeType: string; // video/mp4, video/webm, image/png, image/jpeg
  
  // Storage information
  storageType: 'database' | 'temp'; // base64 in DB or temp file
  storagePath?: string; // temp file path
  base64Data?: string; // for small files stored in DB
  
  // Media metadata
  duration?: number; // for videos, in seconds
  dimensions?: {
    width: number;
    height: number;
  };
  fps?: number; // for videos
  hasAudio?: boolean; // for videos
  
  // Processing status
  isProcessing: boolean;
  processingError?: string;
  
  // Timestamps
  uploadedAt: Date;
  updatedAt: Date;
}
