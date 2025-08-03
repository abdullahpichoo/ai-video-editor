import { ObjectId } from "mongodb";

export interface MediaAsset {
  _id?: ObjectId;
  userId: string; // References User._id
  assetId: string; // UUID for this asset

  // File information
  originalName: string;
  filename: string; // Stored filename
  fileSize: number; // in bytes
  mimeType: string; // video/mp4, video/webm, image/png, image/jpeg

  // Storage information
  storageType: "database" | "temp" | "local" | "vercel-blob"; // base64 in DB, temp file, local uploads, or Vercel blob
  storagePath: string; // temp file path or blob URL
  base64Data?: string; // for small files stored in DB
  thumbnailPath?: string; // path to generated thumbnail

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
